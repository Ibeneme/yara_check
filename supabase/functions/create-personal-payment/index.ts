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
    console.log("Personal payment function called");
    
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
    const { amount = 250 } = await req.json(); // Default to $2.50 in cents
    console.log("Processing personal payment for amount:", amount);

    // Create checkout session with card payments (most reliable globally)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'YaraCheck Personal Report Submission',
              description: 'Fee for submitting a personal belongings report to YaraCheck verification system',
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/submit-report/personal`,
      metadata: {
        service: 'yaracheck_personal_report',
        amount: amount.toString(),
        report_type: 'personal',
      },
      // Enhanced settings for better global acceptance
      payment_intent_data: {
        setup_future_usage: 'off_session',
        statement_descriptor: 'YARACHECK RPT',
      },
      // Enable automatic tax calculation
      automatic_tax: { enabled: false },
      // Billing address collection for better fraud prevention
      billing_address_collection: 'required',
      // Phone number collection for verification
      phone_number_collection: { enabled: true },
      // Customer email collection
      customer_email: req.headers.get("x-customer-email") || undefined,
      // Enhanced fraud prevention
      customer_creation: 'always',
    });

    console.log("Personal checkout session created:", session.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Personal payment processing error:", error);
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