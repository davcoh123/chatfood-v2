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

    const { user_id } = await req.json();

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id est requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Admin ${caller.email} requesting WhatsApp re-registration for user ${user_id}`);

    // Récupérer l'intégration WhatsApp de l'utilisateur
    const { data: integration, error: integrationError } = await supabaseAdmin
      .from('whatsapp_integrations')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (integrationError || !integration) {
      console.error('Integration not found:', integrationError);
      return new Response(
        JSON.stringify({ error: 'Aucune intégration WhatsApp trouvée pour cet utilisateur' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!integration.access_token || !integration.phone_number_id || !integration.waba_id) {
      return new Response(
        JSON.stringify({ error: 'Données WhatsApp incomplètes (access_token, phone_number_id ou waba_id manquant)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found integration for phone_number_id: ${integration.phone_number_id}, waba_id: ${integration.waba_id}`);

    // Récupérer le System User Token ChatFood
    const systemToken = Deno.env.get('CHATFOOD_SYSTEM_TOKEN');
    if (!systemToken) {
      console.error('CHATFOOD_SYSTEM_TOKEN not configured');
      return new Response(
        JSON.stringify({ error: 'Configuration serveur incomplète (CHATFOOD_SYSTEM_TOKEN)' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Using ChatFood System User Token for registration');

    // ÉTAPE 1 : S'abonner au WABA pour les webhooks (avec System Token)
    const subscribeUrl = `https://graph.facebook.com/v24.0/${integration.waba_id}/subscribed_apps`;
    console.log(`Subscribing to WABA: ${integration.waba_id}`);
    
    const subscribeResponse = await fetch(subscribeUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${systemToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'subscribed_fields=messages',
    });

    const subscribeResult = await subscribeResponse.json();
    console.log(`WABA subscription result:`, subscribeResult);

    if (!subscribeResponse.ok) {
      console.warn('WABA subscription warning (non-blocking):', subscribeResult);
    }

    // Toujours générer un nouveau PIN (on va le configurer chez Meta)
    const newPin = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`Generated new PIN for registration: ${newPin}`);

    // ÉTAPE 2 : D'abord configurer le PIN chez Meta (POST /{phone_number_id})
    const setPinUrl = `https://graph.facebook.com/v24.0/${integration.phone_number_id}`;
    console.log(`Setting PIN on Meta: ${setPinUrl}`);
    
    const setPinResponse = await fetch(setPinUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${systemToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pin: newPin }),
    });

    const setPinResult = await setPinResponse.json();
    console.log(`Set PIN result:`, setPinResult);

    if (!setPinResponse.ok) {
      console.warn('Set PIN warning (non-blocking):', setPinResult);
      // Continuer quand même, le PIN peut être déjà configuré ou l'API peut retourner une erreur bénigne
    } else {
      console.log('✅ PIN configured on Meta');
    }

    // ÉTAPE 3 : Maintenant enregistrer le numéro avec le même PIN
    const registerUrl = `https://graph.facebook.com/v24.0/${integration.phone_number_id}/register`;
    console.log(`Calling Meta API: ${registerUrl}`);
    
    const registerResponse = await fetch(registerUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${systemToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        pin: newPin,
      }),
    });

    const registerResult = await registerResponse.json();
    console.log(`Meta API response status: ${registerResponse.status}`, registerResult);

    if (!registerResponse.ok) {
      let errorMessage = registerResult.error?.message || 'Erreur lors de l\'enregistrement auprès de Meta';
      const errorCode = registerResult.error?.code;
      
      // Messages d'erreur explicites selon le code
      if (errorCode === 133005) {
        errorMessage = 'PIN WhatsApp non concordant. Ce numéro a un PIN 2FA différent chez Meta. Réinitialisez-le dans Meta Business Manager.';
      } else if (errorCode === 100) {
        errorMessage = 'Compte WhatsApp Business non approuvé ou en attente de validation chez Meta.';
      }
      
      console.error('Meta API error:', registerResult);
      
      // Mettre à jour le statut avec l'erreur
      await supabaseAdmin
        .from('whatsapp_integrations')
        .update({ 
          registration_status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', integration.id);

      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          details: registerResult.error
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Succès - Mettre à jour la DB (toujours sauvegarder le nouveau PIN)
    const updateData: Record<string, string> = { 
      registration_status: 'registered',
      registration_pin: newPin,
      updated_at: new Date().toISOString()
    };
    
    const { error: updateError } = await supabaseAdmin
      .from('whatsapp_integrations')
      .update(updateData)
      .eq('id', integration.id);

    if (updateError) {
      console.error('Error updating integration:', updateError);
    }

    // Logger l'action admin
    await supabaseAdmin.from('admin_actions').insert({
      admin_id: caller.id,
      admin_email: caller.email || '',
      action_type: 'whatsapp_register',
      target_user_id: user_id,
      details: { 
        phone_number_id: integration.phone_number_id,
        result: 'success'
      }
    });

    console.log(`WhatsApp registration successful for user ${user_id}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Numéro WhatsApp enregistré avec succès',
        phone_number_id: integration.phone_number_id
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in admin-register-whatsapp:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur serveur' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
