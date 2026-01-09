import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Non autorisé' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Vérifier que l'appelant est admin
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user: caller }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !caller) {
      return new Response(
        JSON.stringify({ error: 'Non autorisé' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier le rôle admin
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', caller.id)
      .single();

    if (roleError || roleData?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Accès refusé - Administrateur requis' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { token_id, user_id } = await req.json();

    // Révoquer un token spécifique ou tous les tokens d'un utilisateur
    if (token_id) {
      const { error: updateError } = await supabaseAdmin
        .from('admin_impersonation_tokens')
        .update({ revoked: true, revoked_at: new Date().toISOString() })
        .eq('token', token_id);

      if (updateError) {
        console.error('Error revoking token:', updateError);
        return new Response(
          JSON.stringify({ error: 'Erreur lors de la révocation' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Logger l'action
      await supabaseAdmin.from('admin_actions').insert({
        admin_id: caller.id,
        admin_email: caller.email || '',
        action_type: 'revoke_login_link',
        details: { token_id }
      });

      console.log(`Token ${token_id} revoked by ${caller.email}`);

    } else if (user_id) {
      // Révoquer tous les tokens actifs d'un utilisateur
      const { data: revokedTokens, error: updateError } = await supabaseAdmin
        .from('admin_impersonation_tokens')
        .update({ revoked: true, revoked_at: new Date().toISOString() })
        .eq('target_user_id', user_id)
        .eq('revoked', false)
        .eq('used', false)
        .select('token');

      if (updateError) {
        console.error('Error revoking tokens:', updateError);
        return new Response(
          JSON.stringify({ error: 'Erreur lors de la révocation' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Logger l'action
      await supabaseAdmin.from('admin_actions').insert({
        admin_id: caller.id,
        admin_email: caller.email || '',
        action_type: 'revoke_all_login_links',
        target_user_id: user_id,
        details: { revoked_count: revokedTokens?.length || 0 }
      });

      console.log(`${revokedTokens?.length || 0} tokens revoked for user ${user_id} by ${caller.email}`);

      return new Response(
        JSON.stringify({ 
          message: `${revokedTokens?.length || 0} lien(s) révoqué(s)` 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: 'token_id ou user_id requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ message: 'Lien révoqué avec succès' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error revoking login link:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur serveur' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
