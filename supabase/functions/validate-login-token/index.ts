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
    const { token } = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Rechercher le token
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('admin_impersonation_tokens')
      .select('*')
      .eq('token', token)
      .single();

    if (tokenError || !tokenData) {
      console.log('Token not found:', token);
      return new Response(
        JSON.stringify({ error: 'Token invalide' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier si le token est expiré
    if (new Date(tokenData.expires_at) < new Date()) {
      console.log('Token expired:', token);
      return new Response(
        JSON.stringify({ error: 'Token expiré' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier si le token est révoqué
    if (tokenData.revoked) {
      console.log('Token revoked:', token);
      return new Response(
        JSON.stringify({ error: 'Token révoqué' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier si le token a déjà été utilisé ET est à usage unique
    const isSingleUse = tokenData.single_use !== false; // Par défaut true si non défini
    if (tokenData.used && isSingleUse) {
      console.log('Token already used (single_use):', token);
      return new Response(
        JSON.stringify({ error: 'Token déjà utilisé' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Générer un magic link pour l'utilisateur cible
    const { data: magicLinkData, error: magicLinkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: tokenData.target_user_email,
    });

    if (magicLinkError || !magicLinkData) {
      console.error('Error generating magic link:', magicLinkError);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la génération du lien' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Marquer le token comme utilisé SEULEMENT si c'est un token à usage unique
    if (isSingleUse) {
      const { error: updateError } = await supabaseAdmin
        .from('admin_impersonation_tokens')
        .update({ used: true, used_at: new Date().toISOString() })
        .eq('id', tokenData.id);

      if (updateError) {
        console.error('Error marking token as used:', updateError);
      }
    }

    console.log(`Token validated for ${tokenData.target_user_email}, magic link generated, single_use: ${isSingleUse}`);

    return new Response(
      JSON.stringify({ 
        hashed_token: magicLinkData.properties.hashed_token,
        email: tokenData.target_user_email 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error validating token:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur serveur' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
