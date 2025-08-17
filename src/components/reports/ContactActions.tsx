
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Phone, MessageSquare, Shield, Building2 } from "lucide-react";

interface ContactActionsProps {
  reportId: string;
  reportType: 'person' | 'device' | 'vehicle' | 'household' | 'personal';
  reportData: any;
}

const ContactActions = ({ reportId, reportType, reportData }: ContactActionsProps) => {
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [isPoliceDialogOpen, setIsPoliceDialogOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [senderContact, setSenderContact] = useState("");
  const [isSubmittingMessage, setIsSubmittingMessage] = useState(false);

  const policeNumbers = [
    { country: "Nigeria", emergency: "112", nonEmergency: "112" },
    { country: "United States", emergency: "911", nonEmergency: "N/A" },
    { country: "United Kingdom", emergency: "999", nonEmergency: "101" },
    { country: "Canada", emergency: "911", nonEmergency: "N/A" },
    { country: "Australia", emergency: "000", nonEmergency: "N/A" },
    { country: "South Africa", emergency: "10111", nonEmergency: "10111" },
    { country: "Kenya", emergency: "999 or 112", nonEmergency: "999 or 112" },
    { country: "Ghana", emergency: "112 or 191", nonEmergency: "112 or 191" },
    { country: "Egypt", emergency: "122 and 112", nonEmergency: "122 and 112" },
    { country: "India", emergency: "100", nonEmergency: "100" },
    { country: "Germany", emergency: "110", nonEmergency: "110" },
    { country: "France", emergency: "17", nonEmergency: "17" },
    { country: "Brazil", emergency: "190", nonEmergency: "190" },
  ];

  const handleContactPolice = async () => {
    try {
      await supabase.from("contact_logs").insert({
        report_id: reportId,
        report_type: reportType,
        contact_type: 'police',
        contacted_by: 'anonymous'
      });

      setIsPoliceDialogOpen(true);
    } catch (error) {
      console.error("Error logging police contact:", error);
    }
  };

  const handleContactOwner = async () => {
    try {
      await supabase.from("contact_logs").insert({
        report_id: reportId,
        report_type: reportType,
        contact_type: 'owner',
        contacted_by: 'anonymous'
      });

      toast({
        title: "Owner Contact",
        description: `Contact: ${reportData.contact}`,
      });
    } catch (error) {
      console.error("Error logging owner contact:", error);
    }
  };

  const handleContactYaraCheck = async () => {
    try {
      await supabase.from("contact_logs").insert({
        report_id: reportId,
        report_type: reportType,
        contact_type: 'yaracheck',
        contacted_by: 'anonymous'
      });

      toast({
        title: "YaraCheck Contact",
        description: "Email: report@yaracheck.com | Phone: +2347047906867 | Address: 5, Military Lane, Port Harcourt",
        duration: 8000,
      });
    } catch (error) {
      console.error("Error logging YaraCheck contact:", error);
    }
  };

  const handleSubmitMessage = async () => {
    if (!message.trim()) {
      toast({
        title: "Message required",
        description: "Please enter a message",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingMessage(true);
    try {
      const { error } = await supabase.from("anonymous_messages").insert({
        report_id: reportId,
        report_type: reportType,
        message: message.trim(),
        sender_contact: senderContact.trim() || null
      });

      if (error) throw error;

      toast({
        title: "Message sent",
        description: "Your anonymous message has been sent to the report owner",
      });

      setMessage("");
      setSenderContact("");
      setIsMessageDialogOpen(false);
    } catch (error: any) {
      console.error("Error submitting message:", error);
      toast({
        title: "Failed to send message",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingMessage(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Contact & Report Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <Dialog open={isPoliceDialogOpen} onOpenChange={setIsPoliceDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={handleContactPolice}
                  variant="outline"
                  className="flex items-center gap-2 border-red-500 text-red-600 hover:bg-red-50"
                >
                  <Shield className="h-4 w-4" />
                  Contact Police
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Police Emergency Numbers by Country</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  {policeNumbers.map((police, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{police.country}</span>
                      <div className="text-right">
                        <div className="text-sm text-red-600 font-semibold">
                          Emergency: {police.emergency}
                        </div>
                        {police.nonEmergency !== "N/A" && (
                          <div className="text-sm text-gray-600">
                            Non-Emergency: {police.nonEmergency}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>

            <Button
              onClick={handleContactOwner}
              variant="outline"
              className="flex items-center gap-2 border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              <Phone className="h-4 w-4" />
              Contact Owner
            </Button>

            <Button
              onClick={handleContactYaraCheck}
              variant="outline"
              className="flex items-center gap-2 border-green-500 text-green-600 hover:bg-green-50"
            >
              <Building2 className="h-4 w-4" />
              Contact YaraCheck
            </Button>

            <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 border-purple-500 text-purple-600 hover:bg-purple-50"
                >
                  <MessageSquare className="h-4 w-4" />
                  Send Message
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Send Anonymous Message</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2">
                      Message *
                    </label>
                    <Textarea
                      id="message"
                      placeholder="Enter your message to the report owner..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <div>
                    <label htmlFor="contact" className="block text-sm font-medium mb-2">
                      Your Contact (Optional)
                    </label>
                    <Input
                      id="contact"
                      placeholder="Phone or email (optional)"
                      value={senderContact}
                      onChange={(e) => setSenderContact(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Providing contact info allows the owner to reach you if needed
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSubmitMessage}
                      disabled={isSubmittingMessage}
                      className="flex-1"
                    >
                      {isSubmittingMessage ? "Sending..." : "Send Message"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsMessageDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactActions;
