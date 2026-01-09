import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getUser(token);
    if (claimsError || !claimsData?.user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.user.id;

    // Get restaurant settings
    const { data: settings, error: settingsError } = await supabase
      .from("restaurant_settings")
      .select("stripe_account_id, stripe_onboarding_status, stripe_charges_enabled, stripe_payouts_enabled, payments_enabled, platform_fee_percent")
      .eq("user_id", userId)
      .single();

    if (settingsError || !settings) {
      return new Response(
        JSON.stringify({ error: "Restaurant settings not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!settings.stripe_account_id) {
      return new Response(
        JSON.stringify({
          success: true,
          connected: false,
          onboarding_status: "not_started",
          charges_enabled: false,
          payouts_enabled: false,
          payments_enabled: false,
          platform_fee_percent: settings.platform_fee_percent,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2023-10-16",
    });

    // Retrieve account from Stripe
    const account = await stripe.accounts.retrieve(settings.stripe_account_id);

    // Determine onboarding status
    let onboardingStatus = "pending";
    if (account.charges_enabled && account.payouts_enabled) {
      onboardingStatus = "complete";
    } else if (account.details_submitted) {
      onboardingStatus = "pending_verification";
    }

    // Update database if status changed
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (
      onboardingStatus !== settings.stripe_onboarding_status ||
      account.charges_enabled !== settings.stripe_charges_enabled ||
      account.payouts_enabled !== settings.stripe_payouts_enabled
    ) {
      await supabaseAdmin
        .from("restaurant_settings")
        .update({
          stripe_onboarding_status: onboardingStatus,
          stripe_charges_enabled: account.charges_enabled,
          stripe_payouts_enabled: account.payouts_enabled,
          stripe_onboarded_at: onboardingStatus === "complete" ? new Date().toISOString() : null,
        })
        .eq("user_id", userId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        connected: true,
        account_id: settings.stripe_account_id,
        onboarding_status: onboardingStatus,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        details_submitted: account.details_submitted,
        payments_enabled: settings.payments_enabled,
        platform_fee_percent: settings.platform_fee_percent,
        requirements: account.requirements,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error getting Stripe account status:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
