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
    console.log("Creating Flutterwave vehicle payment:", { amount, trackingCode });

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

    // Generate payment reference
    const paymentReference = `FLW_VEHICLE_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Save transaction to database
    const { error: transactionError } = await supabaseClient
      .from('transactions')
      .insert({
        user_id: user?.id,
        amount,
        currency: 'NGN',
        payment_provider: 'flutterwave',
        payment_reference: paymentReference,
        report_type: 'vehicle',
        report_data: reportData,
        tracking_code: trackingCode,
        status: 'pending'
      });

    if (transactionError) {
      console.error("Transaction insert error:", transactionError);
      throw new Error("Failed to create transaction record");
    }

    // Create Flutterwave payment
    const flutterwavePayload = {
      tx_ref: paymentReference,
      amount: (amount / 100) * 1500, // Convert USD cents to NGN (1 USD = ~1500 NGN)
      currency: "NGN",
      redirect_url: `${req.headers.get("origin")}/payment-success-flutterwave?tx_ref=${paymentReference}`,
      customer: {
        email: user?.email || reportData.reporter_email || "guest@example.com",
        name: reportData.reporter_name || "Guest User",
        phonenumber: reportData.reporter_phone || ""
      },
      customizations: {
        title: "Stolen Vehicle Report",
        description: `Payment for stolen vehicle report - ${reportData.brand} ${reportData.model}`,
        logo: ""
      }
    };

    console.log("Flutterwave payload:", flutterwavePayload);

    const flutterwaveResponse = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("FLUTTERWAVE_SECRET_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(flutterwavePayload),
    });

    const flutterwaveData = await flutterwaveResponse.json();
    console.log("Flutterwave response:", flutterwaveData);

    if (flutterwaveData.status === "success") {
      return new Response(
        JSON.stringify({ 
          url: flutterwaveData.data.link,
          reference: paymentReference
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else {
      throw new Error(flutterwaveData.message || "Failed to create Flutterwave payment");
    }

  } catch (error) {
    console.error("Flutterwave vehicle payment error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});