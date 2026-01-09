import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fonction réutilisable pour supprimer toutes les données d'un utilisateur
async function deleteUserData(
  supabaseAdmin: ReturnType<typeof createClient>,
  userId: string
): Promise<{ success: boolean; errors: string[]; deletedCounts: Record<string, number> }> {
  const errors: string[] = [];
  const deletedCounts: Record<string, number> = {};

  console.log(`Starting data deletion for user: ${userId}`);

  // 1. Supprimer chatbot_menu_choices (dépend de chatbot_menus)
  try {
    const { data: menus } = await supabaseAdmin
      .from('chatbot_menus')
      .select('id')
      .eq('user_id', userId);

    if (menus && menus.length > 0) {
      const menuIds = menus.map((m: { id: string }) => m.id);
      const { error, count } = await supabaseAdmin
        .from('chatbot_menu_choices')
        .delete()
        .in('menu_id', menuIds);
      if (error) errors.push(`chatbot_menu_choices: ${error.message}`);
      else deletedCounts['chatbot_menu_choices'] = count || 0;
    }
  } catch (e) {
    errors.push(`chatbot_menu_choices: ${String(e)}`);
  }

  // 2. Supprimer ticket_messages et ticket_reviews (dépendent de support_tickets)
  try {
    const { data: tickets } = await supabaseAdmin
      .from('support_tickets')
      .select('id')
      .eq('user_id', userId);

    if (tickets && tickets.length > 0) {
      const ticketIds = tickets.map((t: { id: string }) => t.id);
      
      // Supprimer ticket_reviews d'abord
      const { error: reviewError, count: reviewCount } = await supabaseAdmin
        .from('ticket_reviews')
        .delete()
        .in('ticket_id', ticketIds);
      if (reviewError) errors.push(`ticket_reviews: ${reviewError.message}`);
      else deletedCounts['ticket_reviews'] = reviewCount || 0;

      // Puis ticket_messages
      const { error: msgError, count: msgCount } = await supabaseAdmin
        .from('ticket_messages')
        .delete()
        .in('ticket_id', ticketIds);
      if (msgError) errors.push(`ticket_messages: ${msgError.message}`);
      else deletedCounts['ticket_messages'] = msgCount || 0;
    }
  } catch (e) {
    errors.push(`ticket related: ${String(e)}`);
  }

  // 3. Supprimer les tables principales avec user_id (ordre important pour les FK)
  const tablesToDelete = [
    'support_tickets',
    'order_reviews',
    'chatbot_menus',
    'chatbot_messages',
    'chatbot_orders',
    'chatbot_reservations',
    'customers',
    'addons',
    'products',
    'dashboard_configurations',
    'dashboard_metric_values',
    'whatsapp_integrations',
    'restaurant_settings',
    'user_subscriptions',
    'user_roles',
    'profiles'
  ];

  for (const table of tablesToDelete) {
    try {
      const { error, count } = await supabaseAdmin
        .from(table)
        .delete()
        .eq('user_id', userId);
      
      if (error) {
        errors.push(`${table}: ${error.message}`);
      } else {
        deletedCounts[table] = count || 0;
        console.log(`Deleted ${count || 0} rows from ${table}`);
      }
    } catch (e) {
      errors.push(`${table}: ${String(e)}`);
    }
  }

  console.log(`Data deletion completed for user: ${userId}`, {
    success: errors.length === 0,
    errors,
    deletedCounts
  });

  return { 
    success: errors.length === 0, 
    errors,
    deletedCounts
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Vérifier l'authentification
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Vérifier la confirmation
    const { confirmation } = await req.json();
    if (confirmation !== 'SUPPRIMER') {
      return new Response(JSON.stringify({ error: 'Confirmation required. Please type SUPPRIMER' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`User ${user.email} is deleting their own account`);

    // Récupérer l'email pour le log avant suppression
    const userEmail = user.email;
    const userId = user.id;

    // Nettoyer toutes les données de l'utilisateur
    const { success, errors, deletedCounts } = await deleteUserData(supabaseAdmin, userId);

    if (!success) {
      console.warn('Some data cleanup errors:', errors);
      // Continuer quand même avec la suppression
    }

    // Supprimer l'utilisateur de auth.users
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error('Error deleting auth user:', deleteError);
      return new Response(JSON.stringify({ error: deleteError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Log dans admin_actions (l'utilisateur s'est auto-supprimé)
    await supabaseAdmin.from('admin_actions').insert({
      admin_id: userId, // L'utilisateur lui-même
      admin_email: userEmail || 'unknown',
      action_type: 'user_self_deleted',
      target_user_id: userId,
      target_user_email: userEmail,
      details: { 
        deletedCounts,
        errors: errors.length > 0 ? errors : undefined
      }
    });

    console.log(`User account ${userEmail} successfully deleted`);

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Account deleted successfully',
      deletedCounts
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in user-delete-account:', error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
