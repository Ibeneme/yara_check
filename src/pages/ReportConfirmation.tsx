import { Link, useSearchParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Copy, AlertTriangle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState } from "react";

const ReportConfirmation = () => {
  const [copied, setCopied] = useState(false);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  
  // Get the tracking code from URL parameters or location state - use consistent ID
  const trackingCode = searchParams.get('trackingCode') || 
                      location.state?.reportId || 
                      location.state?.trackingCode ||
                      localStorage.getItem('lastTrackingCode');
  
  // If no tracking code is available, show an error message
  if (!trackingCode) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow bg-gray-50">
          <div className="padiman-container py-12">
            <div className="max-w-2xl mx-auto text-center">
              <div className="flex justify-center mb-8">
                <div className="rounded-full bg-red-100 p-4">
                  <AlertTriangle className="h-16 w-16 text-red-600" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-red-700 mb-4">
                No Tracking Code Found
              </h1>
              <p className="text-padiman-darkGray mb-8">
                Unable to find your report tracking code. Please try submitting your report again.
              </p>
              <Button asChild className="bg-padiman-blue hover:bg-padiman-darkBlue">
                <Link to="/submit-report">Submit New Report</Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(trackingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow bg-gray-50">
        <div className="padiman-container py-12">
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-center mb-8">
              <div className="rounded-full bg-green-100 p-4">
                <Check className="h-16 w-16 text-green-600" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-center mb-2 text-green-700">
              Report Submitted Successfully!
            </h1>
            <p className="text-center text-padiman-darkGray mb-8">
              Your report has been received and is now live in our database.
            </p>

            <Card className="shadow-md mb-8">
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <h2 className="text-lg font-medium mb-2">Your Tracking Code</h2>
                  <div className="flex items-center justify-center">
                    <div className="bg-padiman-lightBlue text-padiman-blue text-lg font-mono font-bold py-3 px-6 rounded-md break-all">
                      {trackingCode}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={copyToClipboard}
                      className="ml-2"
                    >
                      {copied ? (
                        <Check className="h-5 w-5 text-green-600" />
                      ) : (
                        <Copy className="h-5 w-5" />
                      )}
                      <span className="sr-only">Copy to clipboard</span>
                    </Button>
                  </div>
                  <p className="text-sm text-padiman-darkGray mt-2">
                    Save this code. You'll need it to track and update your report.
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    This tracking code is unique and permanent for this report.
                  </p>
                </div>

                <div className="border-t pt-6 space-y-6">
                  <div>
                    <h3 className="font-medium mb-2">What Happens Next?</h3>
                    <ul className="space-y-2 text-sm text-padiman-darkGray">
                      <li className="flex">
                        <span className="mr-2">1.</span>
                        <span>Your report is now publicly searchable in our database.</span>
                      </li>
                      <li className="flex">
                        <span className="mr-2">2.</span>
                        <span>Anyone who attempts to verify the reported item will see your report details.</span>
                      </li>
                      <li className="flex">
                        <span className="mr-2">3.</span>
                        <span>You'll receive notifications when someone comments on your report or submits a tip.</span>
                      </li>
                      <li className="flex">
                        <span className="mr-2">4.</span>
                        <span>You can use your tracking code to view updates and manage your report.</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                    <Button asChild className="bg-padiman-blue hover:bg-padiman-darkBlue">
                      <Link to="/my-reports">Go to My Reports</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link to="/">Return to Home</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
              <h3 className="font-semibold text-amber-800 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-amber-600" />
                Important Note
              </h3>
              <p className="mt-2 text-amber-700">
                If you have any updates or recover your item, please update or close your report
                promptly to avoid false flags in our system.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ReportConfirmation;
