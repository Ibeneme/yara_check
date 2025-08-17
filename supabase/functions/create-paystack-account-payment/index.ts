import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
    const { amount, reportData, trackingCode } = await req.json();
    console.log("Creating Paystack account payment:", { amount, trackingCode });

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    // Get Paystack secret key
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackSecretKey) {
      console.error("PAYSTACK_SECRET_KEY not found in environment variables");
      throw new Error("Paystack configuration missing");
    }

    // Generate payment reference
    const paymentReference = `PAYSTACK_ACCOUNT_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Save transaction to database
    const { error: transactionError } = await supabaseClient
      .from('transactions')
      .insert({
        user_id: user?.id,
        amount,
        currency: 'NGN',
        payment_provider: 'paystack',
        payment_reference: paymentReference,
        report_type: 'account',
        report_data: reportData,
        tracking_code: trackingCode,
        status: 'pending'
      });

    if (transactionError) {
      console.error("Transaction insert error:", transactionError);
      throw new Error("Failed to create transaction record");
    }

    // Create Paystack payment
    const paystackPayload = {
      email: user?.email || reportData.reporter_email || "guest@example.com",
      amount: (amount / 100) * 1500 * 100, // Convert USD cents to NGN kobo (1 USD = ~1500 NGN)
      currency: "NGN",
      reference: paymentReference,
      callback_url: `${req.headers.get("origin")}/payment-success-paystack?reference=${paymentReference}`,
      metadata: {
        service: 'yaracheck_account_report',
        report_type: 'account',
        tracking_code: trackingCode
      }
    };

    console.log("Paystack payload:", paystackPayload);

    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paystackPayload),
    });

    if (!paystackResponse.ok) {
      const errorData = await paystackResponse.text();
      console.error("Paystack API error:", errorData);
      throw new Error("Failed to initialize Paystack payment");
    }

    const paystackData = await paystackResponse.json();
    
    if (!paystackData.status) {
      console.error("Paystack initialization failed:", paystackData.message);
      throw new Error(paystackData.message || "Payment initialization failed");
    }

    console.log("Paystack account payment initialized:", paystackData.data.reference);

    return new Response(JSON.stringify({ 
      url: paystackData.data.authorization_url,
      reference: paymentReference
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Paystack account payment error:", error);
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