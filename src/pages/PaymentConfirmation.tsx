import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Copy, ArrowRight, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getReportByTrackingCode } from "@/utils/supabaseStorage";

const PaymentConfirmation = () => {
  const [searchParams] = useSearchParams();
  const [copied, setCopied] = useState(false);
  const [reportDetails, setReportDetails] = useState<any>(null);
  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const trackingCode = searchParams.get('code');

  useEffect(() => {
    const setupReportDetails = async () => {
      if (!trackingCode) {
        setLoading(false);
        return;
      }

      console.log("[PAYMENT-CONFIRMATION] Setting up report details for tracking code:", trackingCode);
      
      try {
        // Get report data from database using tracking code
        const reportData = await getReportByTrackingCode(trackingCode);
        
        if (reportData) {
          setReportDetails({
            type: reportData.reportType,
            trackingCode: trackingCode,
            timestamp: reportData.report_date || reportData.created_at,
            data: reportData
          });
        }
        
        // Get transaction data
        const { data: transactionData } = await supabase
          .from('transactions')
          .select('*')
          .eq('tracking_code', trackingCode)
          .maybeSingle();
        
        if (transactionData) {
          setTransaction(transactionData);
        }
        
        // Clean up localStorage
        localStorage.removeItem('lastReportType');
        localStorage.removeItem('lastTrackingCode');
        
      } catch (error) {
        console.error("[PAYMENT-CONFIRMATION] Error fetching report details:", error);
        // Fallback to localStorage if database lookup fails
        const reportType = localStorage.getItem('lastReportType') || 'unknown';
        setReportDetails({
          type: reportType,
          trackingCode: trackingCode,
          timestamp: new Date().toISOString()
        });
      } finally {
        setLoading(false);
      }
    };

    setupReportDetails();
  }, [trackingCode]);

  const copyToClipboard = () => {
    if (trackingCode) {
      navigator.clipboard.writeText(trackingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!trackingCode) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto py-12">
          <div className="max-w-md mx-auto text-center">
            <Card>
              <CardContent className="p-8">
                <h1 className="text-2xl font-bold text-red-600 mb-4">
                  Payment Confirmation Error
                </h1>
                <p className="text-gray-600 mb-6">
                  Payment successful but no tracking code found. Please contact support for assistance with your order details.
                </p>
                <Button asChild>
                  <Link to="/support">Contact Support</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardContent className="p-8 text-center">
              {loading ? (
                <>
                  <Loader2 className="h-16 w-16 mx-auto text-blue-600 animate-spin mb-4" />
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Loading Your Confirmation...
                  </h1>
                  <p className="text-gray-600">
                    Please wait while we retrieve your payment and report details.
                  </p>
                </>
              ) : (
                <>
                  <div className="flex justify-center mb-6">
                    <div className="rounded-full bg-green-100 p-4">
                      <CheckCircle className="h-16 w-16 text-green-600" />
                    </div>
                  </div>
                  
                  <h1 className="text-3xl font-bold text-green-700 mb-4">
                    Payment Successful!
                  </h1>
                  
                  <p className="text-gray-600 mb-8">
                    Your payment was successful and your report has been submitted. Your unique tracking code is:
                  </p>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                    <h2 className="text-lg font-semibold text-blue-800 mb-3">
                      Your Tracking Code
                    </h2>
                    <div className="flex items-center justify-center gap-3">
                      <div className="bg-white text-blue-700 text-xl font-mono font-bold py-3 px-6 rounded-md border border-blue-300 break-all">
                        {trackingCode}
                      </div>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={copyToClipboard}
                        className="shrink-0"
                      >
                        {copied ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <Copy className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                    <p className="text-blue-600 text-sm mt-3">
                      Save this code safely - you'll need it to track your report
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="text-left bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-800 mb-2">Transaction Details</h3>
                      <div className="text-sm text-gray-600 space-y-1 mb-4">
                        {reportDetails && (
                          <>
                            <p>• Report Type: <span className="capitalize font-medium">{reportDetails.type}</span></p>
                            <p>• Submitted: {new Date(reportDetails.timestamp).toLocaleString()}</p>
                          </>
                        )}
                        {transaction && (
                          <>
                            <p>• Payment Method: <span className="capitalize font-medium">{transaction.payment_provider}</span></p>
                            <p>• Amount: <span className="font-medium">${(transaction.amount / 100).toFixed(2)} {transaction.currency.toUpperCase()}</span></p>
                            <p>• Payment Status: <span className="text-green-600 font-medium">Confirmed</span></p>
                          </>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-2">What's Next?</h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Your report is now active in our database</li>
                        <li>• People can search and verify items using our system</li>
                        <li>• You'll be notified of any updates or tips</li>
                        <li>• Use your tracking code to manage your report</li>
                      </ul>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button asChild className="flex-1">
                        <Link to="/my-reports" className="flex items-center justify-center gap-2">
                          View My Reports
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="flex-1">
                        <Link to="/">Return Home</Link>
                      </Button>
                    </div>
                  </div>
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

export default PaymentConfirmation;