import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WEBHOOK_URL = 'https://n8n.chatfood.fr/webhook/securite';

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

    // Vérifier si les alertes de sécurité sont activées
    const { data: setting } = await supabaseAdmin
      .from('system_settings')
      .select('setting_value')
      .eq('setting_key', 'email_notifications_security')
      .single();

    const notificationsEnabled = setting?.setting_value === true;

    if (!notificationsEnabled) {
      console.log('Security notifications are disabled');
      return new Response(
        JSON.stringify({ success: true, sent: false, reason: 'Notifications disabled' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Récupérer les données de l'événement depuis le body
    const { 
      eventType, 
      email, 
      ipAddress, 
      blockType, 
      blockedUntil, 
      reason, 
      failedAttempts,
      maxAttempts,
      blockDurationMinutes,
      triggeredBy,
      userAgent
    } = await req.json();

    if (!eventType) {
      throw new Error('Missing required field: eventType');
    }

    // Préparer le payload pour n8n
    const payload = {
      event_type: eventType,
      email: email || null,
      ip_address: ipAddress || null,
      block_type: blockType || null,
      blocked_until: blockedUntil || null,
      reason: reason || 'Security event',
      failed_attempts: failedAttempts || 0,
      max_attempts: maxAttempts || null,
      block_duration_minutes: blockDurationMinutes || null,
      triggered_by: triggeredBy || 'system',
      user_agent: userAgent || null,
      timestamp: new Date().toISOString()
    };

    console.log('Sending security notification to webhook:', payload);

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

    console.log('Security notification sent successfully');

    return new Response(
      JSON.stringify({ success: true, sent: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error in notify-security:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
