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

    // Verify admin role (using authoritative user_roles table)
    const { data: userRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (userRole?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { user_id, action, reason } = await req.json();

    // Get target user info
    const { data: targetProfile } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('user_id', user_id)
      .single();

    if (action === 'block') {
      // Block user
      const { error: blockError } = await supabaseAdmin
        .from('security_blocks')
        .insert({
          email: targetProfile?.email,
          block_type: 'account',
          blocked_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
          reason: reason || 'Blocked by administrator'
        });

      if (blockError) {
        console.error('Error blocking user:', blockError);
        return new Response(JSON.stringify({ error: blockError.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Log admin action
      await supabaseAdmin.from('admin_actions').insert({
        admin_id: user.id,
        admin_email: user.email,
        action_type: 'user_blocked',
        target_user_id: user_id,
        target_user_email: targetProfile?.email,
        details: { reason }
      });

      // Send security notification webhook (non-blocking)
      try {
        await supabaseAdmin.functions.invoke('notify-security', {
          body: {
            eventType: 'admin_block',
            email: targetProfile?.email,
            ipAddress: null,
            blockType: 'account',
            blockedUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            reason: reason || 'Blocked by administrator',
            failedAttempts: 0,
            triggeredBy: user.email
          }
        });
      } catch (notifyError) {
        console.error('Error sending security notification:', notifyError);
        // Don't fail the block action if webhook fails
      }

      console.log(`User security block action completed`);
    } else {
      // Unblock user
      const { error: unblockError } = await supabaseAdmin
        .from('security_blocks')
        .delete()
        .eq('email', targetProfile?.email);

      if (unblockError) {
        console.error('Error unblocking user:', unblockError);
        return new Response(JSON.stringify({ error: unblockError.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Log admin action
      await supabaseAdmin.from('admin_actions').insert({
        admin_id: user.id,
        admin_email: user.email,
        action_type: 'user_unblocked',
        target_user_id: user_id,
        target_user_email: targetProfile?.email,
        details: {}
      });

      // Send security notification webhook (non-blocking)
      try {
        await supabaseAdmin.functions.invoke('notify-security', {
          body: {
            eventType: 'admin_unblock',
            email: targetProfile?.email,
            ipAddress: null,
            blockType: 'account',
            blockedUntil: null,
            reason: 'Unblocked by administrator',
            failedAttempts: 0,
            triggeredBy: user.email
          }
        });
      } catch (notifyError) {
        console.error('Error sending security notification:', notifyError);
        // Don't fail the unblock action if webhook fails
      }

      console.log(`User security unblock action completed`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in admin-toggle-block:', error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
