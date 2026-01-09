import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract IP from various headers (in order of preference)
    // X-Forwarded-For can contain multiple IPs (client, proxy1, proxy2...)
    // We want the first one (the original client)
    const forwardedFor = req.headers.get('X-Forwarded-For');
    const realIp = req.headers.get('X-Real-IP');
    const cfConnectingIp = req.headers.get('CF-Connecting-IP');
    
    let clientIp = 'unknown';
    
    if (forwardedFor) {
      // Take the first IP from the comma-separated list
      clientIp = forwardedFor.split(',')[0].trim();
    } else if (cfConnectingIp) {
      // Cloudflare's connecting IP
      clientIp = cfConnectingIp;
    } else if (realIp) {
      // Nginx/other proxies
      clientIp = realIp;
    }
    
    console.log(`Client IP extracted: ${clientIp.substring(0, 8)}...`);

    return new Response(JSON.stringify({ ip: clientIp }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in auth-get-client-ip:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to extract IP address',
        ip: 'unknown' 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
