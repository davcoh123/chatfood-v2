import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ========================================
// CONFIGURATION
// ========================================
const META_CONFIG = {
  APP_ID: '793709276646237',
  API_VERSION: 'v24.0',
  GRAPH_URL: 'https://graph.facebook.com',
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ========================================
// TYPES
// ========================================
interface ExchangeRequest {
  code: string;
  waba_id: string;      // OBLIGATOIRE - fourni par le postMessage WA_EMBEDDED_SIGNUP
  phone_number_id: string; // OBLIGATOIRE - fourni par le postMessage WA_EMBEDDED_SIGNUP
}

interface MetaTokenResponse {
  access_token: string;
  token_type: string;
}

interface MetaErrorResponse {
  error: {
    message: string;
    type: string;
    code: number;
  };
}

interface PhoneDetails {
  id: string;
  display_phone_number?: string;
  verified_name?: string;
  quality_rating?: string;
}

// ========================================
// EDGE FUNCTION
// ========================================
Deno.serve(async (req) => {
  // Gestion CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[exchange-meta-token] Début du traitement');

    // ----------------------------------------
    // 1. Récupérer le secret CLIENT_SECRET
    // ----------------------------------------
    const clientSecret = Deno.env.get('META_CLIENT_SECRET');
    if (!clientSecret) {
      console.error('[exchange-meta-token] META_CLIENT_SECRET non configuré');
      throw new Error('Configuration serveur incomplète (META_CLIENT_SECRET)');
    }

    // ----------------------------------------
    // 2. Vérifier l'authentification utilisateur
    // ----------------------------------------
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Non authentifié');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('[exchange-meta-token] Erreur auth:', authError);
      throw new Error('Non authentifié');
    }

    console.log(`[exchange-meta-token] Utilisateur: ${user.id}`);

    // ----------------------------------------
    // 3. Parser le body de la requête
    //    waba_id et phone_number_id sont OBLIGATOIRES (fournis par postMessage Meta)
    // ----------------------------------------
    const body: ExchangeRequest = await req.json();
    const { code, waba_id, phone_number_id } = body;

    if (!code) {
      throw new Error('Code d\'autorisation manquant');
    }

    if (!waba_id || !phone_number_id) {
      console.error('[exchange-meta-token] WABA ID ou Phone Number ID manquant dans la requête');
      throw new Error('WABA ID et Phone Number ID sont obligatoires (fournis par le signup Meta)');
    }

    console.log('[exchange-meta-token] Code reçu, WABA:', waba_id, 'Phone:', phone_number_id);

    // ----------------------------------------
    // 4. Échanger le code contre un token permanent
    //    (Appel serveur-à-serveur vers Meta - DOC OFFICIELLE : POST avec JSON body)
    // ----------------------------------------
    const tokenUrl = `${META_CONFIG.GRAPH_URL}/${META_CONFIG.API_VERSION}/oauth/access_token`;

    console.log('[exchange-meta-token] Appel API Meta pour échange de token (POST)');

    // Selon la doc officielle, utiliser POST avec body JSON
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: META_CONFIG.APP_ID,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code: code,
        // Note: redirect_uri peut être omis si non utilisé dans le flow
      }),
    });

    const tokenData = await tokenResponse.json();
    console.log('[exchange-meta-token] Token response status:', tokenResponse.status);

    if (!tokenResponse.ok || tokenData.error) {
      const errorMsg = (tokenData as MetaErrorResponse).error?.message || 'Erreur inconnue';
      console.error('[exchange-meta-token] Erreur Meta API:', JSON.stringify(tokenData, null, 2));
      throw new Error(`Meta API: ${errorMsg}`);
    }

    const { access_token } = tokenData as MetaTokenResponse;
    console.log('[exchange-meta-token] Token obtenu avec succès');

    // ----------------------------------------
    // 5. Récupérer les détails du numéro de téléphone
    //    On utilise les IDs fournis par le frontend (via postMessage de Meta)
    // ----------------------------------------
    let display_phone_number = '';
    let verified_name = '';

    console.log('[exchange-meta-token] Récupération des détails du numéro...');
    
    try {
      const phoneDetailsUrl = `${META_CONFIG.GRAPH_URL}/${META_CONFIG.API_VERSION}/${phone_number_id}?fields=display_phone_number,verified_name,quality_rating&access_token=${access_token}`;
      const phoneDetailsResponse = await fetch(phoneDetailsUrl);
      const phoneDetails: PhoneDetails | MetaErrorResponse = await phoneDetailsResponse.json();
      
      console.log('[exchange-meta-token] Phone details:', JSON.stringify(phoneDetails, null, 2));
      
      if (!('error' in phoneDetails)) {
        display_phone_number = phoneDetails.display_phone_number || '';
        verified_name = phoneDetails.verified_name || '';
        console.log('[exchange-meta-token] Numéro:', display_phone_number, 'Nom vérifié:', verified_name);
      } else {
        console.warn('[exchange-meta-token] Impossible de récupérer les détails du numéro:', phoneDetails.error.message);
      }
    } catch (phoneError) {
      console.warn('[exchange-meta-token] Erreur récupération détails numéro:', phoneError);
      // Continue quand même, ces infos ne sont pas critiques
    }

    // ----------------------------------------
    // 6. Abonner l'application au WABA pour recevoir les webhooks
    // ----------------------------------------
    try {
      const subscribeUrl = `${META_CONFIG.GRAPH_URL}/${META_CONFIG.API_VERSION}/${waba_id}/subscribed_apps`;
      console.log('[exchange-meta-token] Abonnement webhooks au WABA:', waba_id);
      
      const subscribeResponse = await fetch(subscribeUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'subscribed_fields=messages',
      });
      
      const subscribeData = await subscribeResponse.json();
      console.log('[exchange-meta-token] Webhook subscription result:', JSON.stringify(subscribeData, null, 2));
      
      if (!subscribeResponse.ok) {
        console.warn('[exchange-meta-token] Webhook subscription warning:', subscribeData);
        // Non-bloquant, on continue
      }
    } catch (subscribeError) {
      console.warn('[exchange-meta-token] Webhook subscription error (non-critical):', subscribeError);
    }

    // ----------------------------------------
    // 7. Enregistrer le numéro de téléphone auprès de WhatsApp Cloud API
    //    C'est cette étape qui fait passer le statut de "En attente" à "Actif"
    //    IMPORTANT: On utilise le System User Token ChatFood pour cette opération
    //    IMPORTANT: On configure d'abord le PIN chez Meta, PUIS on appelle /register
    // ----------------------------------------
    const generatePin = (): string => {
      return Math.floor(100000 + Math.random() * 900000).toString();
    };

    const registrationPin = generatePin();
    let registrationStatus = 'pending';

    // Récupérer le System User Token ChatFood
    const systemToken = Deno.env.get('CHATFOOD_SYSTEM_TOKEN');
    
    if (!systemToken) {
      console.warn('[exchange-meta-token] CHATFOOD_SYSTEM_TOKEN non configuré - registration sera en pending');
    } else {
      try {
        // ÉTAPE 7a: D'abord configurer le PIN chez Meta (POST /{phone_number_id})
        const setPinUrl = `${META_CONFIG.GRAPH_URL}/${META_CONFIG.API_VERSION}/${phone_number_id}`;
        console.log('[exchange-meta-token] Configuration du PIN 2FA chez Meta...');
        
        const setPinResponse = await fetch(setPinUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${systemToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ pin: registrationPin }),
        });

        const setPinData = await setPinResponse.json();
        console.log('[exchange-meta-token] Set PIN result:', JSON.stringify(setPinData, null, 2));

        if (!setPinResponse.ok) {
          console.warn('[exchange-meta-token] Set PIN warning (non-blocking):', setPinData);
          // Continuer quand même, le PIN peut être déjà configuré
        } else {
          console.log('[exchange-meta-token] ✅ PIN configuré chez Meta');
        }

        // ÉTAPE 7b: Maintenant enregistrer avec le même PIN
        const registerUrl = `${META_CONFIG.GRAPH_URL}/${META_CONFIG.API_VERSION}/${phone_number_id}/register`;
        console.log('[exchange-meta-token] Enregistrement du numéro avec System User Token ChatFood...');
        
        const registerResponse = await fetch(registerUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${systemToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            pin: registrationPin,
          }),
        });

        const registerData = await registerResponse.json();
        console.log('[exchange-meta-token] Register result:', JSON.stringify(registerData, null, 2));

        if (registerResponse.ok && registerData.success) {
          registrationStatus = 'registered';
          console.log('[exchange-meta-token] ✅ Numéro enregistré avec succès');
        } else {
          console.warn('[exchange-meta-token] ⚠️ Registration warning:', registerData);
          // Le numéro peut être déjà enregistré
          if (registerData.error?.code === 137000 || registerData.error?.message?.includes('already registered')) {
            registrationStatus = 'already_registered';
            console.log('[exchange-meta-token] Numéro déjà enregistré');
          }
        }
      } catch (registerError) {
        console.warn('[exchange-meta-token] Registration error (non-critical):', registerError);
        // On continue quand même, l'enregistrement peut être refait plus tard
      }
    }

    // ----------------------------------------
    // 8. Sauvegarder dans Supabase
    // ----------------------------------------
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Insérer ou mettre à jour l'intégration
    const { data: integration, error: insertError } = await supabaseAdmin
      .from('whatsapp_integrations')
      .upsert({
        user_id: user.id,
        waba_id,
        phone_number_id,
        access_token,
        status: 'active',
        display_phone_number: display_phone_number || null,
        verified_name: verified_name || null,
        registration_pin: registrationPin,
        registration_status: registrationStatus,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,waba_id',
      })
      .select()
      .single();

    if (insertError) {
      console.error('[exchange-meta-token] Erreur insertion DB:', insertError);
      throw new Error('Erreur lors de la sauvegarde');
    }

    console.log('[exchange-meta-token] Intégration sauvegardée:', integration.id, 'Registration status:', registrationStatus);

    // ----------------------------------------
    // 9. Mettre à jour restaurant_settings avec les IDs
    // ----------------------------------------
    const { error: updateError } = await supabaseAdmin
      .from('restaurant_settings')
      .update({
        phone_number_id,
        whatsapp_business_id: waba_id,
        whatsapp_access_token: access_token,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.warn('[exchange-meta-token] Erreur update restaurant_settings:', updateError);
      // Non-bloquant, on continue
    } else {
      console.log('[exchange-meta-token] restaurant_settings mis à jour');
    }

    // ----------------------------------------
    // 10. Retourner le succès
    // ----------------------------------------
    return new Response(
      JSON.stringify({
        success: true,
        waba_id,
        phone_number_id,
        display_phone_number,
        verified_name,
        registration_status: registrationStatus,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error('[exchange-meta-token] Erreur:', errorMessage);
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
