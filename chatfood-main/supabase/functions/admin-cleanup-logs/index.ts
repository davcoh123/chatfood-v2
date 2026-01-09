import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseAdmin.auth.getUser(token);

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify admin role from user_roles table
    const { data: userRole, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError || userRole?.role !== 'admin') {
      console.error('Admin verification failed:', roleError);
      return new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Count records before cleanup
    const { count: loginAttemptsBefore } = await supabaseAdmin
      .from('login_attempts')
      .select('*', { count: 'exact', head: true });

    const { count: securityBlocksBefore } = await supabaseAdmin
      .from('security_blocks')
      .select('*', { count: 'exact', head: true });

    // Call cleanup function
    const { error: cleanupError } = await supabaseAdmin.rpc('cleanup_old_security_records');

    if (cleanupError) {
      console.error('Error cleaning up logs:', cleanupError);
      return new Response(JSON.stringify({ error: cleanupError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Count records after cleanup
    const { count: loginAttemptsAfter } = await supabaseAdmin
      .from('login_attempts')
      .select('*', { count: 'exact', head: true });

    const { count: securityBlocksAfter } = await supabaseAdmin
      .from('security_blocks')
      .select('*', { count: 'exact', head: true });

    const stats = {
      login_attempts_deleted: (loginAttemptsBefore || 0) - (loginAttemptsAfter || 0),
      security_blocks_deleted: (securityBlocksBefore || 0) - (securityBlocksAfter || 0),
    };

    // Log admin action
    await supabaseAdmin.from('admin_actions').insert({
      admin_id: user.id,
      admin_email: user.email,
      action_type: 'logs_cleaned',
      details: stats
    });

    console.log('Logs cleaned successfully:', stats);

    return new Response(JSON.stringify({ success: true, stats }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in admin-cleanup-logs:', error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
