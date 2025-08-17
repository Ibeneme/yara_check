import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldAlert, MessageCircle, Mail } from "lucide-react";

interface HiddenReportMessageProps {
  searchTerm: string;
  reportType?: string;
}

const HiddenReportMessage: React.FC<HiddenReportMessageProps> = ({ searchTerm, reportType }) => {
  return (
    <Card className="border-orange-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-700">
          <ShieldAlert className="h-5 w-5" />
          Report Found - Administrative Review
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-orange-200 bg-orange-50">
          <ShieldAlert className="h-4 w-4" />
          <AlertDescription className="text-orange-800">
            We found a report matching "{searchTerm}" in our database. However, this report is currently 
            under administrative review and cannot be displayed publicly at this time.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <p className="text-gray-700">
            This could be due to:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li>Ongoing investigation by law enforcement</li>
            <li>Privacy protection measures</li>
            <li>Administrative verification process</li>
            <li>Legal compliance requirements</li>
          </ul>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Need More Information?</h4>
          <p className="text-blue-800 text-sm mb-3">
            If you have legitimate interest in this case or information to share, please contact our administrative team:
          </p>
          
          <div className="space-y-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start"
              onClick={() => {
                // Create a unique session ID for the chat
                const sessionId = `hidden-report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                window.location.href = `/support?openChat=true&sessionId=${sessionId}&context=hidden-report&searchTerm=${encodeURIComponent(searchTerm)}`;
              }}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Contact Support via Live Chat
            </Button>
            
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-700 mb-2">Email us directly:</p>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <button
                  onClick={() => navigator.clipboard.writeText('info@yaracheck.com')}
                  className="text-blue-600 hover:text-blue-800 underline text-sm"
                  title="Click to copy email address"
                >
                  info@yaracheck.com
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-500 border-t pt-3">
          <p>
            Reference ID: {searchTerm} | Report Type: {reportType || 'Unknown'} | 
            Status: Administrative Review
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default HiddenReportMessage;