import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PaymentSuccessFlutterwave = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'success' | 'failed' | 'pending'>('pending');
  const [trackingCode, setTrackingCode] = useState<string>('');
  const [reportType, setReportType] = useState<string>('');
  const [transactionDetails, setTransactionDetails] = useState<any>(null);

  const txRef = searchParams.get('tx_ref');

  useEffect(() => {
    if (txRef) {
      verifyPayment();
    }
  }, [txRef]);

  const verifyPayment = async () => {
    try {
      console.log("Verifying Flutterwave payment:", txRef);

      // Verify payment through edge function
      const { data, error } = await supabase.functions.invoke('verify-flutterwave-payment', {
        body: { txRef }
      });

      if (error) {
        console.error("Verification function error:", error);
        throw new Error(error.message || "Failed to verify payment");
      }

      if (data.success) {
        setTrackingCode(data.trackingCode);
        setReportType(data.reportType);
        setTransactionDetails(data.transactionDetails);
        setVerificationStatus('success');
        toast.success("Payment successful! Your report has been submitted.");
      } else {
        setVerificationStatus('failed');
        toast.error(data.error || "Payment verification failed");
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      setVerificationStatus('failed');
      toast.error("Payment verification failed");
    } finally {
      setIsVerifying(false);
    }
  };


  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <h2 className="text-xl font-semibold text-center">Verifying Payment</h2>
              <p className="text-muted-foreground text-center">
                Please wait while we verify your payment with Flutterwave...
              </p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                {verificationStatus === 'success' ? (
                  <CheckCircle className="h-16 w-16 text-green-500" />
                ) : (
                  <AlertCircle className="h-16 w-16 text-red-500" />
                )}
              </div>
              <CardTitle className="text-2xl">
                {verificationStatus === 'success' ? 'Payment Successful!' : 'Payment Failed'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {verificationStatus === 'success' ? (
                <div className="text-center space-y-4">
                  <p className="text-lg text-muted-foreground">
                    Your payment has been processed successfully via Flutterwave.
                  </p>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                      Report Submitted Successfully
                    </h3>
                    <p className="text-green-700 dark:text-green-300">
                      Your {reportType} report has been submitted and is being processed.
                    </p>
                    
                    {/* Transaction Details */}
                    <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded border">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Transaction Details</h4>
                      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <p>• Report Type: <span className="capitalize font-medium">{reportType}</span></p>
                        <p>• Date & Time Submitted: {new Date().toLocaleString()}</p>
                        <p>• Payment Method: <span className="font-medium">Flutterwave</span></p>
                        {transactionDetails && (
                          <>
                            <p>• Amount Paid: <span className="font-medium">${(transactionDetails.amount / 100).toFixed(2)} {transactionDetails.currency?.toUpperCase()}</span></p>
                            <p>• Payment Status: <span className="text-green-600 font-medium">Confirmed</span></p>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded border">
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
                    <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        ⚠️ <strong>Important:</strong> Keep this tracking code safe! You'll need it to track your report status and make any updates.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button 
                     onClick={() => {
                       // Try to close window and redirect parent, or navigate if in same window
                       if (window.opener) {
                         window.opener.location.href = `/payment-confirmation?code=${trackingCode}`;
                         window.close();
                       } else {
                         navigate(`/payment-confirmation?code=${trackingCode}`);
                       }
                     }} 
                     className="w-full"
                     size="lg"
                   >
                     View Tracking Code
                   </Button>
                   <Button 
                     onClick={() => {
                       if (window.opener) {
                         window.opener.location.href = '/verify';
                         window.close();
                       } else {
                         navigate('/verify');
                       }
                     }} 
                     variant="outline" 
                     className="w-full"
                     size="lg"
                   >
                     Track Your Report
                   </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <p className="text-lg text-muted-foreground">
                    There was an issue processing your payment. Please try again.
                  </p>
                  
                  <div className="space-y-3">
                    <Button 
                      onClick={() => navigate('/')} 
                      className="w-full"
                      size="lg"
                    >
                      Try Again
                    </Button>
                    <Button 
                      onClick={() => navigate('/support')} 
                      variant="outline" 
                      className="w-full"
                      size="lg"
                    >
                      Contact Support
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentSuccessFlutterwave;