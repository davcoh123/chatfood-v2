import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Password strength validation
function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins 8 caractères' };
  }
  
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[@$!%*?&#+\-=<>{}[\]|~^.,;:_°]/.test(password);
  
  if (!hasLowercase || !hasUppercase || !hasNumber || !hasSpecialChar) {
    return { 
      valid: false, 
      message: 'Le mot de passe doit contenir au moins: 1 minuscule, 1 majuscule, 1 chiffre et 1 caractère spécial' 
    };
  }
  
  return { valid: true };
}

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

    // Verify admin role using user_roles table
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

    const { email, password, first_name, last_name, role, plan } = await req.json();

    // Validate password strength
    const strengthCheck = validatePasswordStrength(password);
    if (!strengthCheck.valid) {
      return new Response(JSON.stringify({ error: strengthCheck.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create user in auth
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { first_name, last_name }
    });

    if (createError) {
      console.error('Error creating user:', createError);
      return new Response(JSON.stringify({ error: createError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update profile with first/last name
    await supabaseAdmin
      .from('profiles')
      .update({ first_name, last_name })
      .eq('user_id', newUser.user.id);

    // Update role in user_roles table
    await supabaseAdmin
      .from('user_roles')
      .update({ role: role || 'user' })
      .eq('user_id', newUser.user.id);

    // Update plan in user_subscriptions table
    await supabaseAdmin
      .from('user_subscriptions')
      .update({ plan: plan || 'starter' })
      .eq('user_id', newUser.user.id);

    // Log admin action
    await supabaseAdmin.from('admin_actions').insert({
      admin_id: user.id,
      admin_email: user.email,
      action_type: 'user_created',
      target_user_id: newUser.user.id,
      target_user_email: email,
      details: { role, plan, first_name, last_name }
    });

    console.log('User created successfully:', email);

    // Send signup notification webhook (non-blocking)
    try {
      await supabaseAdmin.functions.invoke('notify-signup', {
        body: {
          userId: newUser.user.id,
          email: email,
          firstName: first_name,
          lastName: last_name,
          plan: plan || 'starter',
          role: role || 'user',
          createdBy: 'admin'
        }
      });
    } catch (notifyError) {
      console.error('Error sending signup notification:', notifyError);
      // Don't fail the user creation if webhook fails
    }

    return new Response(JSON.stringify({ success: true, user: newUser.user }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in admin-create-user:', error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
