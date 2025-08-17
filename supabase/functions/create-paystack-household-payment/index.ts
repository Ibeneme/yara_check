import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, reportData, trackingCode } = await req.json();
    console.log("Creating Paystack household payment:", { amount, trackingCode });

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
      throw new Error("Paystack configuration missing");
    }

    // Generate payment reference
    const paymentReference = `PAYSTACK_HOUSEHOLD_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Save transaction to database
    const { error: transactionError } = await supabaseClient
      .from('transactions')
      .insert({
        user_id: user?.id,
        amount,
        currency: 'NGN',
        payment_provider: 'paystack',
        payment_reference: paymentReference,
        report_type: 'household',
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
      reference: paymentReference,
      amount: amount * 100, // Paystack expects amount in kobo
      currency: "NGN",
      email: user?.email || reportData.reporter_email || "guest@example.com",
      callback_url: `${req.headers.get("origin")}/payment-success-paystack?reference=${paymentReference}`,
      metadata: {
        custom_fields: [
          {
            display_name: "Report Type",
            variable_name: "report_type",
            value: "Household Item"
          },
          {
            display_name: "Item",
            variable_name: "item_description", 
            value: `${reportData.brand} ${reportData.model}`
          }
        ]
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

    const paystackData = await paystackResponse.json();
    console.log("Paystack response:", paystackData);

    if (paystackData.status) {
      return new Response(
        JSON.stringify({ 
          url: paystackData.data.authorization_url,
          reference: paymentReference
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else {
      throw new Error(paystackData.message || "Failed to create Paystack payment");
    }

  } catch (error) {
    console.error("Paystack household payment error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});