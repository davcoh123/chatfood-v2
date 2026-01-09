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
    const userEmail = claimsData.user.email;

    // Get restaurant settings
    const { data: settings, error: settingsError } = await supabase
      .from("restaurant_settings")
      .select("stripe_account_id, restaurant_name")
      .eq("user_id", userId)
      .single();

    if (settingsError) {
      return new Response(
        JSON.stringify({ error: "Restaurant settings not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2023-10-16",
    });

    let accountId = settings.stripe_account_id;

    // Create Stripe Express account if not exists
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        country: "FR",
        email: userEmail,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_profile: {
          name: settings.restaurant_name || "Restaurant",
          mcc: "5812", // Eating places, restaurants
        },
        metadata: {
          user_id: userId,
        },
      });

      accountId = account.id;

      // Save account ID to database
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      await supabaseAdmin
        .from("restaurant_settings")
        .update({
          stripe_account_id: accountId,
          stripe_onboarding_status: "pending",
        })
        .eq("user_id", userId);
    }

    // Parse request body for return URLs
    const body = await req.json().catch(() => ({}));
    const baseUrl = body.base_url || "https://dcwfgxbwpecnjbhrhrib.lovableproject.com";

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${baseUrl}/dashboard/payments?refresh=true`,
      return_url: `${baseUrl}/dashboard/payments?success=true`,
      type: "account_onboarding",
    });

    return new Response(
      JSON.stringify({
        success: true,
        account_id: accountId,
        onboarding_url: accountLink.url,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error creating Stripe account:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
