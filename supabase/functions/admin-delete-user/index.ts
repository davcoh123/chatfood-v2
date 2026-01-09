import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0?deps=@supabase/auth-js@2.62.0';

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

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    console.log('Auth header present:', !!authHeader);
    console.log('Auth header value:', authHeader?.substring(0, 20) + '...');
    
    if (!authHeader) {
      console.error('No authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the JWT and get the user
    const token = authHeader.replace('Bearer ', '');
    console.log('Token length:', token.length);
    console.log('Token preview:', token.substring(0, 30) + '...');
    
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      console.error('User verification failed:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if the user is an admin (using authoritative user_roles table)
    const { data: userRole, error: userRoleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (userRoleError || !userRole || userRole.role !== 'admin') {
      console.error('Admin verification failed:', userRoleError);
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the request body
    const { user_id: targetUserId } = await req.json();

    // Prevent self-deletion
    if (targetUserId === user.id) {
      return new Response(
        JSON.stringify({ error: 'Cannot delete your own account' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get target user info for logging
    const { data: targetProfile } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('user_id', targetUserId)
      .single();

    const targetEmail = targetProfile?.email;

    // Nettoyer toutes les données de l'utilisateur avant suppression
    console.log(`Cleaning up all data for user: ${targetUserId}`);
    const { success, errors, deletedCounts } = await deleteUserData(supabaseAdmin, targetUserId);

    if (!success) {
      console.warn('Some data cleanup errors:', errors);
      // Continuer quand même avec la suppression de auth
    }

    // Delete user from auth.users
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);

    if (deleteError) {
      console.error('Error deleting user:', deleteError);
      return new Response(
        JSON.stringify({ error: deleteError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log admin action with cleanup details
    await supabaseAdmin.from('admin_actions').insert({
      admin_id: user.id,
      admin_email: user.email,
      action_type: 'user_deleted',
      target_user_id: targetUserId,
      target_user_email: targetEmail,
      details: { 
        deletedCounts,
        cleanupErrors: errors.length > 0 ? errors : undefined
      }
    });

    console.log(`User account deletion completed`);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in admin-delete-user:', error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
