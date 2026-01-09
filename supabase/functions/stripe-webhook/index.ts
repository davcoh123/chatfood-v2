import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2023-10-16",
    });

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response(
        JSON.stringify({ error: "Missing stripe-signature header" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.text();
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    console.log("Processing Stripe event:", event.type);

    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata.order_id;

        if (orderId) {
          // Get the charge to extract fee info
          const charges = await stripe.charges.list({ payment_intent: paymentIntent.id, limit: 1 });
          const charge = charges.data[0];
          const stripeFee = charge?.balance_transaction
            ? (await stripe.balanceTransactions.retrieve(charge.balance_transaction as string)).fee / 100
            : null;

          await supabaseAdmin
            .from("chatbot_orders")
            .update({
              payment_status: "paid",
              status: "pending",
              paid_at: new Date().toISOString(),
              payment_method: paymentIntent.payment_method_types?.[0] || "card",
              stripe_fee: stripeFee,
            })
            .eq("id", orderId);

          console.log(`Order ${orderId} marked as paid`);
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata.order_id;

        if (orderId) {
          await supabaseAdmin
            .from("chatbot_orders")
            .update({
              payment_status: "failed",
              status: "cancelled",
            })
            .eq("id", orderId);

          console.log(`Order ${orderId} payment failed`);
        }
        break;
      }

      case "payment_intent.canceled": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata.order_id;

        if (orderId) {
          await supabaseAdmin
            .from("chatbot_orders")
            .update({
              payment_status: "cancelled",
              status: "cancelled",
            })
            .eq("id", orderId);

          console.log(`Order ${orderId} payment cancelled`);
        }
        break;
      }

      case "account.updated": {
        const account = event.data.object as Stripe.Account;

        // Find restaurant by stripe_account_id
        const { data: restaurant } = await supabaseAdmin
          .from("restaurant_settings")
          .select("user_id")
          .eq("stripe_account_id", account.id)
          .single();

        if (restaurant) {
          let onboardingStatus = "pending";
          if (account.charges_enabled && account.payouts_enabled) {
            onboardingStatus = "complete";
          } else if (account.details_submitted) {
            onboardingStatus = "pending_verification";
          }

          await supabaseAdmin
            .from("restaurant_settings")
            .update({
              stripe_onboarding_status: onboardingStatus,
              stripe_charges_enabled: account.charges_enabled,
              stripe_payouts_enabled: account.payouts_enabled,
              stripe_onboarded_at: onboardingStatus === "complete" ? new Date().toISOString() : null,
            })
            .eq("stripe_account_id", account.id);

          console.log(`Account ${account.id} updated: charges=${account.charges_enabled}, payouts=${account.payouts_enabled}`);
        }
        break;
      }

      case "account.application.deauthorized": {
        const application = event.data.object as any;
        const accountId = application.account;

        if (accountId) {
          await supabaseAdmin
            .from("restaurant_settings")
            .update({
              stripe_account_id: null,
              stripe_onboarding_status: "not_started",
              stripe_charges_enabled: false,
              stripe_payouts_enabled: false,
              stripe_onboarded_at: null,
              payments_enabled: false,
            })
            .eq("stripe_account_id", accountId);

          console.log(`Account ${accountId} deauthorized and disconnected`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
