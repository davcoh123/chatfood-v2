import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify the user is authenticated and is an admin
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is admin using the user_roles table
    const { data: userRole, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError || !userRole || userRole.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    // Parse request body
    const { user_id, new_plan } = await req.json();

    if (!user_id || !new_plan) {
      throw new Error('Missing required fields: user_id and new_plan');
    }

    // Validate plan
    const validPlans = ['starter', 'pro', 'premium'];
    if (!validPlans.includes(new_plan)) {
      throw new Error('Invalid plan. Must be starter, pro, or premium');
    }

    // Create admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get target user's email for logging
    const { data: targetProfile } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('user_id', user_id)
      .single();

    // Update the subscription plan
    const { error: updateError } = await supabaseAdmin
      .from('user_subscriptions')
      .update({ 
        plan: new_plan,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user_id);

    if (updateError) {
      console.error('Error updating subscription:', updateError);
      throw new Error('Failed to update subscription plan');
    }

    // Get admin's email
    const { data: adminProfile } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('user_id', user.id)
      .single();

    // Log the admin action
    await supabaseAdmin.from('admin_actions').insert({
      admin_id: user.id,
      admin_email: adminProfile?.email || 'unknown',
      target_user_id: user_id,
      target_user_email: targetProfile?.email || 'unknown',
      action_type: 'subscription_change',
      details: {
        new_plan: new_plan
      }
    });

    console.log(`Subscription updated successfully for user ${user_id} to ${new_plan}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Subscription plan updated successfully',
        new_plan: new_plan
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in admin-update-subscription:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
