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
    const body = await req.json();
    const { restaurant_slug, order_items, customer_name, customer_phone, order_type, pickup_time, note } = body;

    if (!restaurant_slug || !order_items || !customer_phone) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: restaurant_slug, order_items, customer_phone" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get restaurant settings by slug
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from("restaurant_settings")
      .select("user_id, stripe_account_id, stripe_charges_enabled, payments_enabled, platform_fee_percent, currency, restaurant_name")
      .eq("slug", restaurant_slug)
      .single();

    if (settingsError || !settings) {
      return new Response(
        JSON.stringify({ error: "Restaurant not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!settings.payments_enabled || !settings.stripe_charges_enabled || !settings.stripe_account_id) {
      return new Response(
        JSON.stringify({ error: "Online payments are not enabled for this restaurant" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate total amount
    let totalAmount = 0;
    const orderItemsForDb = order_items.map((item: any) => {
      const itemTotal = item.unit_price * item.quantity;
      let addonsTotal = 0;
      if (item.addons && Array.isArray(item.addons)) {
        addonsTotal = item.addons.reduce((sum: number, addon: any) => sum + (addon.price * (addon.quantity || 1)), 0);
      }
      totalAmount += itemTotal + addonsTotal;
      return item;
    });

    // Convert to cents
    const totalCents = Math.round(totalAmount * 100);
    const platformFeePercent = settings.platform_fee_percent || 5;
    const platformFeeCents = Math.round(totalCents * (platformFeePercent / 100));

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2023-10-16",
    });

    // Create PaymentIntent with destination charge
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: settings.currency?.toLowerCase() || "eur",
      transfer_data: {
        destination: settings.stripe_account_id,
      },
      application_fee_amount: platformFeeCents,
      metadata: {
        restaurant_slug,
        restaurant_id: settings.user_id,
        customer_name: customer_name || "",
        customer_phone,
      },
    });

    // Create order in database
    const { data: order, error: orderError } = await supabaseAdmin
      .from("chatbot_orders")
      .insert({
        user_id: settings.user_id,
        name: customer_name || null,
        phone: customer_phone,
        commande_item: orderItemsForDb,
        price_total: totalAmount,
        commande_type: order_type || "pickup",
        horaire_recup: pickup_time || null,
        note: note || null,
        status: "pending_payment",
        payment_intent_id: paymentIntent.id,
        payment_status: "pending",
        platform_fee: platformFeeCents / 100,
      })
      .select("id")
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      // Cancel the payment intent if order creation fails
      await stripe.paymentIntents.cancel(paymentIntent.id);
      return new Response(
        JSON.stringify({ error: "Failed to create order" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update PaymentIntent metadata with order ID
    await stripe.paymentIntents.update(paymentIntent.id, {
      metadata: {
        ...paymentIntent.metadata,
        order_id: order.id,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id,
        order_id: order.id,
        amount: totalAmount,
        currency: settings.currency?.toLowerCase() || "eur",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error creating checkout:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
