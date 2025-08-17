import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { savePersonToSupabase } from "@/utils/supabaseStorage";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";

// Generate UUID format tracking code (same format as report IDs)
const generateTrackingCode = () => {
  // Generate a UUID v4 format tracking code
  const code = crypto.randomUUID();
  console.log("[PAYSTACK-SUCCESS] Generated tracking code:", code);
  return code;
};

const PaymentSuccessPaystack = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [trackingCode, setTrackingCode] = useState<string | null>(null);

  useEffect(() => {
    const processPaymentSuccess = async () => {
      console.log("[PAYSTACK-SUCCESS] Payment confirmation handler triggered");
      
      const reference = searchParams.get('reference');
      const trxref = searchParams.get('trxref');
      const paymentReference = reference || trxref;
      
      console.log("[PAYSTACK-SUCCESS] Payment reference received:", paymentReference);
      
      if (!paymentReference) {
        console.error("[PAYSTACK-SUCCESS] No payment reference found");
        toast.error("Invalid payment reference");
        navigate('/submit-report');
        return;
      }

      try {
        console.log("[PAYSTACK-SUCCESS] Verifying payment with Paystack:", paymentReference);
        
        // Use the verify-paystack-payment edge function instead of localStorage
        const { data, error } = await supabase.functions.invoke('verify-paystack-payment', {
          body: { reference: paymentReference }
        });

        if (error) {
          console.error("Paystack verification error:", error);
          toast.error(error.message || "Payment verification failed");
          setIsProcessing(false);
          return;
        }

        if (data.success) {
          console.log("[PAYSTACK-SUCCESS] Payment verified successfully");
          setTrackingCode(data.trackingCode);
          
          // Clean up any pending reports from localStorage
          localStorage.removeItem('pendingPersonReport');
          localStorage.removeItem('pendingDeviceReport');
          localStorage.removeItem('pendingVehicleReport');
          localStorage.removeItem('pendingHouseholdReport');
          localStorage.removeItem('pendingPersonalReport');
          localStorage.removeItem('pendingAccountReport');
          localStorage.removeItem('pendingReputationReport');
          localStorage.removeItem('trackingCode');
          
          toast.success("Payment successful! Report submitted.");
          
          // Try to close window and redirect parent, or navigate if in same window
          if (window.opener) {
            // If opened as popup, close and redirect parent
            window.opener.location.href = `/payment-confirmation?code=${data.trackingCode}`;
            window.close();
          } else {
            // If in same window, navigate directly
            navigate(`/payment-confirmation?code=${data.trackingCode}`);
          }
        } else {
          console.error("[PAYSTACK-SUCCESS] Payment verification failed:", data.error);
          toast.error(data.error || "Payment verification failed");
          setIsProcessing(false);
        }
      } catch (error) {
        console.error('[PAYSTACK-SUCCESS] Error processing payment:', error);
        console.error('[PAYSTACK-SUCCESS] Error details:', {
          message: error.message,
          stack: error.stack,
          paymentReference
        });
        // Use Paystack verification instead
        await verifyPaystackPayment(paymentReference);
      } finally {
        setIsProcessing(false);
      }
    };

    processPaymentSuccess();
  }, [searchParams, navigate]);

  const verifyPaystackPayment = async (reference: string) => {
    try {
      console.log("[PAYSTACK-SUCCESS] Verifying payment with Paystack:", reference);
      
      const { data, error } = await supabase.functions.invoke('verify-paystack-payment', {
        body: { reference }
      });

      if (error) {
        console.error("Paystack verification error:", error);
        throw new Error(error.message || "Failed to verify payment");
      }

      if (data.success) {
        setTrackingCode(data.trackingCode);
        localStorage.setItem('lastTrackingCode', data.trackingCode);
        localStorage.setItem('lastReportType', data.reportType);
        
        toast.success("Payment verified! Your report has been submitted.");
        
        // Try to close window and redirect parent, or navigate if in same window
        if (window.opener) {
          // If opened as popup, close and redirect parent
          window.opener.location.href = `/payment-confirmation?code=${data.trackingCode}`;
          window.close();
        } else {
          // If in same window, navigate directly
          navigate(`/payment-confirmation?code=${data.trackingCode}`);
        }
      } else {
        throw new Error(data.error || "Payment verification failed");
      }
    } catch (error: any) {
      console.error("[PAYSTACK-SUCCESS] Verification error:", error);
      toast.error("Payment verification failed. Please contact support.");
      navigate('/support');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto py-12">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              {isProcessing ? (
                <>
                  <Loader2 className="h-16 w-16 mx-auto text-blue-600 animate-spin mb-4" />
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Processing Your Report
                  </h1>
                  <p className="text-gray-600 mb-4">
                    Paystack payment successful! We're now submitting your report...
                  </p>
                  <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                      ⏳ <strong>Please wait:</strong> Do not close this page while your report is being processed.
                    </p>
                  </div>
                </>
              ) : (
                  <>
                    <CheckCircle className="h-16 w-16 mx-auto text-green-600 mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      Payment Successful!
                    </h1>
                    <p className="text-gray-600 mb-4">
                      Your payment has been processed successfully via Paystack.
                    </p>
                    
                    {trackingCode && (
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
                        <h3 className="font-semibold text-green-800 mb-2">
                          Report Submitted Successfully
                        </h3>
                        <p className="text-green-700 mb-3">
                          Your report has been submitted and is being processed.
                        </p>
                        <div className="bg-white p-3 rounded border mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium">Tracking Code:</p>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                navigator.clipboard.writeText(trackingCode);
                                toast.success("Tracking code copied to clipboard!");
                              }}
                            >
                              Copy
                            </Button>
                          </div>
                          <p className="text-lg font-mono text-primary">{trackingCode}</p>
                        </div>
                        <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                          <p className="text-sm text-yellow-800">
                            ⚠️ <strong>Important:</strong> Keep this tracking code safe! You'll need it to track your report status and make any updates.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <p className="text-gray-600">
                      Redirecting to confirmation page...
                    </p>
                  </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PaymentSuccessPaystack;