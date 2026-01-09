import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WEBHOOK_URL = 'https://n8n.chatfood.fr/webhook/inscrit';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    // Vérifier si les notifications d'inscription sont activées
    const { data: setting } = await supabaseAdmin
      .from('system_settings')
      .select('setting_value')
      .eq('setting_key', 'email_notifications_signup')
      .single();

    const notificationsEnabled = setting?.setting_value === true;

    if (!notificationsEnabled) {
      console.log('Signup notifications are disabled');
      return new Response(
        JSON.stringify({ success: true, sent: false, reason: 'Notifications disabled' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Récupérer les données de l'utilisateur depuis le body
    const { userId, email, firstName, lastName, plan, role, createdBy } = await req.json();

    if (!userId || !email) {
      throw new Error('Missing required fields: userId and email');
    }

    // Préparer le payload pour n8n
    const payload = {
      user_id: userId,
      email: email,
      first_name: firstName || '',
      last_name: lastName || '',
      plan: plan || 'starter',
      role: role || 'user',
      created_at: new Date().toISOString(),
      created_by: createdBy || 'self-registration'
    };

    console.log('Sending signup notification to webhook:', payload);

    // Envoyer le webhook
    const webhookResponse = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!webhookResponse.ok) {
      console.error('Webhook failed:', await webhookResponse.text());
      throw new Error(`Webhook failed with status ${webhookResponse.status}`);
    }

    console.log('Signup notification sent successfully');

    return new Response(
      JSON.stringify({ success: true, sent: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error in notify-signup:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
