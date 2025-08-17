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
    const { reference } = await req.json();
    console.log("Verifying Paystack payment:", reference);

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get Paystack secret key
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackSecretKey) {
      throw new Error("Paystack configuration missing");
    }

    // Verify payment with Paystack
    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
    });

    const paystackData = await paystackResponse.json();
    console.log("Paystack verification response:", paystackData);

    if (paystackData.status && paystackData.data.status === "success") {
      // Get transaction from our database
      const { data: transaction, error: transactionError } = await supabaseClient
        .from('transactions')
        .select('*')
        .eq('payment_reference', reference)
        .single();

      if (transactionError || !transaction) {
        console.error("Transaction not found:", transactionError);
        return new Response(
          JSON.stringify({ success: false, error: "Transaction not found. Please contact support with your payment reference." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }

      // Update transaction status to paid
      const { error: updateError } = await supabaseClient
        .from('transactions')
        .update({ 
          status: 'paid',
          paid_at: new Date().toISOString()
        })
        .eq('payment_reference', reference);

      if (updateError) {
        console.error("Transaction update error:", updateError);
        throw new Error("Failed to update transaction");
      }

      // Save report to appropriate table
      const reportData = transaction.report_data;
      const reportTrackingCode = transaction.tracking_code;
      let insertResult;

      switch (transaction.report_type) {
        case 'person':
          const personData = {
            name: reportData.name,
            age: reportData.age,
            gender: reportData.gender,
            physical_attributes: reportData.physical_attributes || reportData.outfit || '',
            description: reportData.description || '',
            location: reportData.location,
            date_missing: reportData.date_missing || reportData.dateMissing,
            contact: reportData.contact,
            reporter_name: reportData.reporter_name,
            reporter_email: reportData.reporter_email,
            reporter_phone: reportData.reporter_phone,
            reporter_address: reportData.reporter_address,
            tracking_code: reportTrackingCode,
            image_url: reportData.image_url || null,
            status: 'missing'
          };
          insertResult = await supabaseClient.from('persons').insert(personData);
          break;
        case 'device':
          const deviceData = {
            type: reportData.type,
            brand: reportData.brand,
            model: reportData.model,
            color: reportData.color,
            imei: reportData.imei,
            location: reportData.location,
            description: reportData.description || '',
            contact: reportData.contact,
            reporter_name: reportData.reporter_name,
            reporter_email: reportData.reporter_email,
            reporter_phone: reportData.reporter_phone,
            reporter_address: reportData.reporter_address,
            tracking_code: reportTrackingCode,
            image_url: reportData.image_url || null,
            status: 'pending'
          };
          insertResult = await supabaseClient.from('devices').insert(deviceData);
          break;
        case 'vehicle':
          const vehicleData = {
            type: reportData.type,
            brand: reportData.brand,
            model: reportData.model,
            year: reportData.year,
            color: reportData.color,
            chassis: reportData.chassis,
            location: reportData.location,
            description: reportData.description || '',
            contact: reportData.contact,
            reporter_name: reportData.reporter_name,
            reporter_email: reportData.reporter_email,
            reporter_phone: reportData.reporter_phone,
            reporter_address: reportData.reporter_address,
            tracking_code: reportTrackingCode,
            image_url: reportData.image_url || null,
            status: 'pending'
          };
          insertResult = await supabaseClient.from('vehicles').insert(vehicleData);
          break;
        case 'household':
          const householdData = {
            type: reportData.type,
            brand: reportData.brand,
            model: reportData.model,
            year: reportData.year,
            color: reportData.color,
            imei: reportData.imei,
            location: reportData.location,
            description: reportData.description || '',
            contact: reportData.contact,
            reporter_name: reportData.reporter_name,
            reporter_email: reportData.reporter_email,
            reporter_phone: reportData.reporter_phone,
            reporter_address: reportData.reporter_address,
            tracking_code: reportTrackingCode,
            image_url: reportData.image_url || null,
            status: 'pending'
          };
          insertResult = await supabaseClient.from('household_items').insert(householdData);
          break;
        case 'personal':
          const personalData = {
            type: reportData.type,
            brand: reportData.brand,
            model: reportData.model,
            year: reportData.year,
            color: reportData.color,
            imei: reportData.imei,
            location: reportData.location,
            description: reportData.description || '',
            contact: reportData.contact,
            reporter_name: reportData.reporter_name,
            reporter_email: reportData.reporter_email,
            reporter_phone: reportData.reporter_phone,
            reporter_address: reportData.reporter_address,
            tracking_code: reportTrackingCode,
            image_url: reportData.image_url || null,
            status: 'pending'
          };
          insertResult = await supabaseClient.from('personal_belongings').insert(personalData);
          break;
        case 'account':
          const accountData = {
            account_type: reportData.account_type,
            account_identifier: reportData.account_identifier,
            date_compromised: reportData.date_compromised,
            description: reportData.description,
            contact: reportData.contact,
            reporter_name: reportData.reporter_name,
            reporter_email: reportData.reporter_email,
            reporter_phone: reportData.reporter_phone,
            reporter_address: reportData.reporter_address,
            tracking_code: reportTrackingCode,
            image_url: reportData.image_url || null,
            status: 'pending'
          };
          insertResult = await supabaseClient.from('hacked_accounts').insert(accountData);
          break;
        case 'reputation':
          const reputationData = {
            reported_person_name: reportData.reported_person_name,
            reported_person_contact: reportData.reported_person_contact,
            business_type: reportData.business_type,
            transaction_date: reportData.transaction_date,
            transaction_amount: reportData.transaction_amount,
            reputation_status: reportData.reputation_status,
            description: reportData.description,
            evidence: reportData.evidence || '',
            reporter_name: reportData.reporter_name,
            reporter_email: reportData.reporter_email,
            reporter_phone: reportData.reporter_phone,
            reporter_address: reportData.reporter_address,
            tracking_code: reportTrackingCode,
            status: 'pending_verification'
          };
          insertResult = await supabaseClient.from('business_reputation_reports').insert(reputationData);
          break;
        default:
          console.log("Unknown report type, transaction updated but no report saved");
      }

      if (insertResult?.error && transaction.report_type !== 'unknown') {
        console.error("Report insert error:", insertResult.error);
        throw new Error("Failed to save report");
      }

      console.log("Report saved successfully:", reportTrackingCode);

      return new Response(
        JSON.stringify({ 
          success: true,
          trackingCode: reportTrackingCode,
          reportType: transaction.report_type
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else {
      throw new Error("Payment verification failed");
    }

  } catch (error) {
    console.error("Paystack verification error:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});