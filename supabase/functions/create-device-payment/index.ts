import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Device payment function called");
    
    // Get Stripe secret key
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      console.error("STRIPE_SECRET_KEY not found in environment variables");
      throw new Error("Stripe configuration missing");
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Get request body
    const { amount = 150 } = await req.json(); // Default to $1.50 in cents
    console.log("Processing device payment for amount:", amount);

    // Create checkout session with card payments (most reliable globally)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'YaraCheck Device Report Submission',
              description: 'Fee for submitting a device report to YaraCheck verification system',
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/submit-report/device`,
      metadata: {
        service: 'yaracheck_device_report',
        amount: amount.toString(),
        report_type: 'device',
      },
      // Enhanced settings for better global acceptance
      payment_intent_data: {
        setup_future_usage: 'off_session',
        statement_descriptor: 'YARACHECK RPT',
      },
      // Disable automatic tax calculation which can cause issues
      automatic_tax: { enabled: false },
      // Make billing address optional to reduce friction
      billing_address_collection: 'auto',
      // Make phone number optional
      phone_number_collection: { enabled: false },
      // Customer email collection
      customer_email: req.headers.get("x-customer-email") || undefined,
      // Enhanced fraud prevention
      customer_creation: 'if_required',
    });

    console.log("Device checkout session created:", session.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Device payment processing error:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Payment processing failed. Please try again." 
      }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});