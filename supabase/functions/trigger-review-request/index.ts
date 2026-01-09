import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const N8N_WEBHOOK_URL = 'https://n8n.chatfood.fr/webhook/avis-client15616';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { order_id } = await req.json();

    if (!order_id) {
      console.error('Missing order_id');
      return new Response(
        JSON.stringify({ error: 'Missing order_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Triggering review request for order: ${order_id}`);

    // Récupérer les infos de la commande
    const { data: order, error: orderError } = await supabase
      .from('chatbot_orders')
      .select('id, phone, name, price_total, user_id')
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      console.error('Order not found:', orderError);
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Récupérer les paramètres du restaurant
    const { data: settings, error: settingsError } = await supabase
      .from('restaurant_settings')
      .select(`
        phone_number_id,
        whatsapp_access_token,
        customer_reviews_enabled,
        customer_reviews_message,
        customer_reviews_delay_hours,
        restaurant_name
      `)
      .eq('user_id', order.user_id)
      .single();

    if (settingsError || !settings) {
      console.error('Restaurant settings not found:', settingsError);
      return new Response(
        JSON.stringify({ error: 'Restaurant settings not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Récupérer le numéro de téléphone du restaurant depuis whatsapp_integrations
    const { data: whatsappIntegration } = await supabase
      .from('whatsapp_integrations')
      .select('display_phone_number')
      .eq('user_id', order.user_id)
      .single();

    // Vérifier que les avis sont activés
    if (!settings.customer_reviews_enabled) {
      console.log('Customer reviews are disabled for this restaurant');
      return new Response(
        JSON.stringify({ success: false, reason: 'Customer reviews disabled' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier les credentials WhatsApp
    if (!settings.phone_number_id || !settings.whatsapp_access_token) {
      console.error('WhatsApp credentials not configured');
      return new Response(
        JSON.stringify({ error: 'WhatsApp credentials not configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Préparer le payload pour n8n
    const payload = {
      order_id: order.id,
      customer_phone: order.phone,
      customer_name: order.name || 'Client',
      user_id: order.user_id,
      phone_number_id: settings.phone_number_id,
      restaurant_phone: whatsappIntegration?.display_phone_number || null,
      whatsapp_access_token: settings.whatsapp_access_token,
      review_message: settings.customer_reviews_message || 'Comment avez-vous trouvé votre commande ?',
      delay_hours: settings.customer_reviews_delay_hours || 2,
      order_total: order.price_total,
      restaurant_name: settings.restaurant_name || 'Le restaurant'
    };

    console.log('Sending payload to n8n:', { ...payload, whatsapp_access_token: '[REDACTED]' });

    // Appeler le webhook n8n
    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error('n8n webhook error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to trigger n8n webhook', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const n8nResult = await n8nResponse.json();
    console.log('n8n webhook response:', n8nResult);

    return new Response(
      JSON.stringify({ success: true, n8n_response: n8nResult }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in trigger-review-request:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
