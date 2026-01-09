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

    const { user_id, user_email, single_use = true } = await req.json();

    if (!user_id || !user_email) {
      return new Response(
        JSON.stringify({ error: 'user_id et user_email sont requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Générer un token unique
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    // Stocker le token
    const { error: insertError } = await supabaseAdmin
      .from('admin_impersonation_tokens')
      .insert({
        token,
        target_user_id: user_id,
        target_user_email: user_email,
        created_by: caller.id,
        created_by_email: caller.email,
        expires_at: expiresAt.toISOString(),
        single_use,
      });

    if (insertError) {
      console.error('Error inserting token:', insertError);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la création du token' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Logger l'action admin
    await supabaseAdmin.from('admin_actions').insert({
      admin_id: caller.id,
      admin_email: caller.email || '',
      action_type: 'generate_login_link',
      target_user_id: user_id,
      target_user_email: user_email,
      details: { expires_at: expiresAt.toISOString(), single_use }
    });

    // Toujours utiliser le domaine de production pour les liens de connexion
    // (évite les problèmes quand l'admin génère depuis un preview Lovable)
    const siteUrl = 'https://chatfood.fr';
    const loginUrl = `${siteUrl}/magic-login?token=${token}`;

    console.log(`Login link generated for ${user_email} by ${caller.email}, expires at ${expiresAt.toISOString()}, single_use: ${single_use}, url: ${loginUrl}`);

    return new Response(
      JSON.stringify({ 
        url: loginUrl, 
        expires_at: expiresAt.toISOString(),
        token_id: token,
        single_use
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating login link:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur serveur' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
