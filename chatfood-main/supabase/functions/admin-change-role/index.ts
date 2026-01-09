import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    if (!authHeader) {
      console.error('No authorization header');
      return new Response(
        JSON.stringify({ error: 'Non autorisé' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the JWT and get the user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      console.error('User verification failed:', userError);
      return new Response(
        JSON.stringify({ error: 'Utilisateur non authentifié' }),
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
        JSON.stringify({ error: 'Accès refusé : droits administrateur requis' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the request body
    const { user_id: targetUserId, new_role: newRole } = await req.json();

    // Validate inputs
    if (!targetUserId || !newRole || !['admin', 'user'].includes(newRole)) {
      return new Response(
        JSON.stringify({ error: 'Paramètres invalides' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prevent admins from demoting themselves
    if (targetUserId === user.id && newRole === 'user') {
      return new Response(
        JSON.stringify({ error: 'Vous ne pouvez pas retirer vos propres droits administrateur' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get target user's current profile for email
    const { data: targetProfile, error: targetError } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('user_id', targetUserId)
      .single();

    if (targetError || !targetProfile) {
      console.error('Target user not found:', targetError);
      return new Response(
        JSON.stringify({ error: 'Utilisateur cible introuvable' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get target user's current role from user_roles table
    const { data: targetRole, error: targetRoleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', targetUserId)
      .single();

    if (targetRoleError || !targetRole) {
      console.error('Target user role not found:', targetRoleError);
      return new Response(
        JSON.stringify({ error: 'Rôle utilisateur introuvable' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const oldRole = targetRole.role;

    // Update the user's role in user_roles table using service role key
    const { error: updateError } = await supabaseAdmin
      .from('user_roles')
      .update({ role: newRole })
      .eq('user_id', targetUserId);

    if (updateError) {
      console.error('Failed to update role:', updateError);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la mise à jour du rôle' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get admin profile for logging
    const { data: adminProfile } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('user_id', user.id)
      .single();

    // Log the action to admin_actions table
    await supabaseAdmin.from('admin_actions').insert({
      admin_id: user.id,
      admin_email: adminProfile?.email || user.email || 'unknown',
      action_type: 'role_change',
      target_user_id: targetUserId,
      target_user_email: targetProfile.email,
      details: {
        old_role: oldRole,
        new_role: newRole,
        timestamp: new Date().toISOString()
      }
    });

    console.log(`Role change completed: ${oldRole} -> ${newRole}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Rôle modifié avec succès de ${oldRole} à ${newRole}` 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur interne du serveur' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
