import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

// API Key for webhook authentication (must be set in Supabase secrets)
const CHATBOT_API_KEY = Deno.env.get('CHATBOT_API_KEY');

// Simple in-memory rate limiter
const rateLimiter = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(identifier: string, maxRequests: number = 60, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimiter.get(identifier);
  
  // Clean up old entries periodically
  if (rateLimiter.size > 10000) {
    for (const [key, value] of rateLimiter.entries()) {
      if (now > value.resetAt) {
        rateLimiter.delete(key);
      }
    }
  }
  
  if (!record || now > record.resetAt) {
    rateLimiter.set(identifier, { count: 1, resetAt: now + windowMs });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count++;
  return true;
}

// Input validation helpers
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PHONE_REGEX = /^\+?[0-9]{7,15}$/;
const CATEGORY_REGEX = /^[a-zA-Z0-9À-ÿ\s_-]{1,100}$/;

function validateUUID(value: string): boolean {
  return UUID_REGEX.test(value);
}

function validatePhone(value: string): boolean {
  return PHONE_REGEX.test(value.replace(/\s/g, ''));
}

function validateCategory(value: string): boolean {
  return CATEGORY_REGEX.test(value);
}

function sanitizeForQuery(value: string): string {
  // Remove any characters that could be used for SQL injection
  return value.replace(/['"();%\\]/g, '');
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting - check by IP or API key
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('cf-connecting-ip') || 
                     'unknown';
    
    if (!checkRateLimit(clientIp, 120, 60000)) { // 120 requests per minute
      console.warn(`Rate limit exceeded for IP: ${clientIp}`);
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '60' } }
      );
    }

    // Validate API key
    const apiKey = req.headers.get('x-api-key');
    if (!apiKey || apiKey !== CHATBOT_API_KEY) {
      console.error('Invalid or missing API key');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body = await req.json();
    const { action, params } = body;

    if (!action) {
      return new Response(
        JSON.stringify({ error: 'Missing action parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role for full access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let result;

    switch (action) {
      case 'get_catalog': {
        const { user_id } = params;
        if (!user_id || !validateUUID(user_id)) {
          return new Response(
            JSON.stringify({ error: 'Invalid or missing user_id parameter' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('user_id', user_id)
          .eq('is_active', true)
          .order('category')
          .order('sort_order');
        
        if (error) throw error;
        result = data;
        break;
      }

      case 'get_customer_history': {
        const { user_id, phone } = params;
        if (!user_id || !validateUUID(user_id)) {
          return new Response(
            JSON.stringify({ error: 'Invalid or missing user_id parameter' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        if (!phone || !validatePhone(phone)) {
          return new Response(
            JSON.stringify({ error: 'Invalid or missing phone parameter' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get customer info
        const { data: customer, error: customerError } = await supabase
          .from('customers')
          .select('*')
          .eq('user_id', user_id)
          .eq('phone', phone)
          .single();

        // Get recent orders
        const { data: orders, error: ordersError } = await supabase
          .from('chatbot_orders')
          .select('*')
          .eq('user_id', user_id)
          .eq('phone', phone)
          .order('heure_de_commande', { ascending: false })
          .limit(10);

        // Get recent messages
        const { data: messages, error: messagesError } = await supabase
          .from('chatbot_messages')
          .select('*')
          .eq('user_id', user_id)
          .or(`from_number.eq.${phone},to_number.eq.${phone}`)
          .order('created_at', { ascending: false })
          .limit(20);

        result = {
          customer: customer || null,
          orders: orders || [],
          messages: messages || []
        };
        break;
      }

      case 'get_addons': {
        const { user_id, product_id, category } = params;
        if (!user_id || !validateUUID(user_id)) {
          return new Response(
            JSON.stringify({ error: 'Invalid or missing user_id parameter' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Validate product_id if provided (must be UUID)
        if (product_id && !validateUUID(product_id)) {
          return new Response(
            JSON.stringify({ error: 'Invalid product_id format - must be a valid UUID' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Validate category if provided (alphanumeric only)
        if (category && !validateCategory(category)) {
          return new Response(
            JSON.stringify({ error: 'Invalid category format - must be alphanumeric' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        let query = supabase
          .from('addons')
          .select('*')
          .eq('user_id', user_id)
          .eq('is_active', true);

        // Filter by applies_to_type using safe parameterized queries
        if (product_id) {
          // Use contains operator with properly escaped value
          query = query.or(`applies_to_type.eq.global,and(applies_to_type.eq.product,applies_to_value.cs.{"${product_id}"})`);
        } else if (category) {
          // Sanitize category before use
          const safeCategory = sanitizeForQuery(category);
          query = query.or(`applies_to_type.eq.global,and(applies_to_type.eq.category,applies_to_value.eq.${safeCategory})`);
        } else {
          query = query.eq('applies_to_type', 'global');
        }

        const { data, error } = await query.order('sort_order');
        if (error) throw error;
        result = data;
        break;
      }

      case 'get_menus': {
        const { user_id } = params;
        if (!user_id || !validateUUID(user_id)) {
          return new Response(
            JSON.stringify({ error: 'Invalid or missing user_id parameter' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: menus, error: menusError } = await supabase
          .from('chatbot_menus')
          .select('*')
          .eq('user_id', user_id)
          .eq('is_active', true);

        if (menusError) throw menusError;

        // Get choices for each menu
        const menuIds = menus?.map(m => m.id) || [];
        const { data: choices, error: choicesError } = await supabase
          .from('chatbot_menu_choices')
          .select('*')
          .in('menu_id', menuIds)
          .order('choice_index');

        if (choicesError) throw choicesError;

        // Combine menus with their choices
        result = menus?.map(menu => ({
          ...menu,
          choices: choices?.filter(c => c.menu_id === menu.id) || []
        }));
        break;
      }

      case 'create_order': {
        const { user_id, phone, name, items, note, commande_type, horaire_recup, price_total } = params;
        if (!user_id || !validateUUID(user_id)) {
          return new Response(
            JSON.stringify({ error: 'Invalid or missing user_id parameter' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        if (!phone || !validatePhone(phone)) {
          return new Response(
            JSON.stringify({ error: 'Invalid or missing phone parameter' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        if (!items) {
          return new Response(
            JSON.stringify({ error: 'Missing items parameter' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data, error } = await supabase
          .from('chatbot_orders')
          .insert({
            user_id,
            phone,
            name: name || null,
            commande_item: items,
            note: note || null,
            commande_type: commande_type || 'scheduled_takeaway',
            horaire_recup: horaire_recup || null,
            price_total: price_total || 0,
            status: 'pending'
          })
          .select()
          .single();

        if (error) throw error;

        // Update customer stats
        await supabase
          .from('customers')
          .upsert({
            user_id,
            phone,
            name: name || null,
            last_interaction_at: new Date().toISOString(),
            total_orders: 1,
            total_spent: price_total || 0
          }, {
            onConflict: 'user_id,phone',
            ignoreDuplicates: false
          });

        result = data;
        break;
      }

      case 'log_message': {
        const { user_id, message_id, from_number, to_number, body, message_type, customer_name } = params;
        if (!user_id || !validateUUID(user_id)) {
          return new Response(
            JSON.stringify({ error: 'Invalid or missing user_id parameter' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        if (!message_id) {
          return new Response(
            JSON.stringify({ error: 'Missing message_id parameter' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        if (!from_number || !validatePhone(from_number)) {
          return new Response(
            JSON.stringify({ error: 'Invalid or missing from_number parameter' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        if (!to_number || !validatePhone(to_number)) {
          return new Response(
            JSON.stringify({ error: 'Invalid or missing to_number parameter' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data, error } = await supabase
          .from('chatbot_messages')
          .insert({
            id: message_id,
            user_id,
            from_number,
            to_number,
            body: body || null,
            message_type: message_type || 'text',
            customer_name: customer_name || null,
            status: 'sent'
          })
          .select()
          .single();

        if (error) throw error;

        // Log analytics event
        await supabase
          .from('analytics_events')
          .insert({
            user_id,
            event_type: 'message_received',
            message_id,
            event_data: { from_number, to_number, message_type }
          });

        result = data;
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    console.log(`Chatbot API - Action: ${action} - Success`);
    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Chatbot API Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
