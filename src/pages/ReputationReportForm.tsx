
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { UserCheck } from "lucide-react";
import { calculatePrice, formatPrice, formatFreePrice } from "@/utils/dynamicPricing";
import PaymentMethodSelector from "@/components/PaymentMethodSelector";

const formSchema = z.object({
  reported_person_name: z.string().min(2, "Name must be at least 2 characters"),
  reported_person_contact: z.string().min(1, "Contact information is required"),
  business_type: z.string().min(1, "Business type is required"),
  transaction_date: z.string().min(1, "Transaction date is required"),
  transaction_amount: z.string().min(1, "Transaction amount is required"),
  reputation_status: z.string().min(1, "Reputation status is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  evidence: z.string().optional(),
  reporter_name: z.string().min(2, "Your name is required"),
  reporter_email: z.string().email("Valid email is required"),
  reporter_phone: z.string().min(1, "Phone number is required"),
  reporter_address: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const ReputationReportForm = () => {
  const navigate = useNavigate();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showPaymentSelector, setShowPaymentSelector] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reported_person_name: "",
      reported_person_contact: "",
      business_type: "",
      transaction_date: "",
      transaction_amount: "",
      reputation_status: "",
      description: "",
      evidence: "",
      reporter_name: "",
      reporter_email: "",
      reporter_phone: "",
      reporter_address: "",
    },
  });

  const price = calculatePrice({ reportType: 'reputation' });

  const handlePaymentMethod = async (method: 'stripe' | 'paystack' | 'flutterwave') => {
    setIsProcessingPayment(true);
    try {
      const functionName = method === 'stripe' 
        ? 'create-vehicle-payment' 
        : method === 'paystack' 
        ? 'create-paystack-reputation-payment'
        : 'create-flutterwave-reputation-payment';
      
      const reportData = form.getValues();
      const trackingCode = crypto.randomUUID();
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { 
          amount: price, 
          reportData,
          trackingCode 
        }
      });

      if (error) throw error;

      if (data?.url) {
        // Save reputation report to database immediately (but with pending_verification status)
        try {
          const formData = form.getValues();
          const { data: reportData, error: reportError } = await supabase
            .from('business_reputation_reports')
            .insert({
              reported_person_name: formData.reported_person_name,
              reported_person_contact: formData.reported_person_contact,
              business_type: formData.business_type,
              transaction_date: formData.transaction_date,
              transaction_amount: formData.transaction_amount,
              reputation_status: formData.reputation_status,
              description: formData.description,
              evidence: formData.evidence,
              reporter_name: formData.reporter_name,
              reporter_email: formData.reporter_email,
              reporter_phone: formData.reporter_phone,
              reporter_address: formData.reporter_address,
              status: 'pending_verification',
              visible: false // Will remain false until super admin verifies
            })
            .select()
            .single();

          if (reportError) throw reportError;

          // Store tracking code for payment success page
          localStorage.setItem('trackingCode', reportData.id);
          
          window.open(data.url, '_blank');
          toast.success("Payment window opened. Complete payment to proceed with reputation report verification.");
          setShowPaymentSelector(false);
        } catch (error) {
          console.error('Error saving reputation report:', error);
          toast.error("Error saving report data");
          return;
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error("Payment processing failed. Please try again.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleFreeSubmission = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const trackingCode = crypto.randomUUID();

      const { error } = await supabase
        .from('business_reputation_reports')
        .insert({
          reported_person_name: data.reported_person_name,
          reported_person_contact: data.reported_person_contact,
          business_type: data.business_type,
          transaction_date: data.transaction_date,
          transaction_amount: data.transaction_amount,
          reputation_status: data.reputation_status,
          description: data.description,
          evidence: data.evidence,
          reporter_name: data.reporter_name,
          reporter_email: data.reporter_email,
          reporter_phone: data.reporter_phone,
          reporter_address: data.reporter_address,
          tracking_code: trackingCode,
          status: 'pending_verification'
        });

      if (!error) {
        toast.success("Business reputation report submitted successfully!");
        navigate("/report-confirmation", { 
          state: { 
            trackingCode, 
            reportType: 'reputation'
          }
        });
      } else {
        toast.error("Failed to submit report. Please try again.");
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    const confirmPayment = window.confirm(
      `This business reputation report requires a ${formatPrice(price)} fee. The report will be verified before going live. Would you like to proceed with payment?`
    );
    
    if (confirmPayment) {
      setShowPaymentSelector(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="yaracheck-container py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-yaracheck-blue">
                <UserCheck className="h-6 w-6" />
                Report Business Reputation
              </CardTitle>
              <p className="text-sm text-gray-600">
                Report your business experience with someone. All reports are verified before going live.
              </p>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="border-b pb-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">
                      About the Person
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="reported_person_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter person's full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="reported_person_contact"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Info</FormLabel>
                            <FormControl>
                              <Input placeholder="Phone number or email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="border-b pb-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">
                      Business Transaction Details
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <FormField
                        control={form.control}
                        name="business_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type of Business</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select business type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="retail">Retail/Sales</SelectItem>
                                <SelectItem value="service">Service Provider</SelectItem>
                                <SelectItem value="rental">Rental/Lease</SelectItem>
                                <SelectItem value="lending">Money Lending</SelectItem>
                                <SelectItem value="online">Online Transaction</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="transaction_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Transaction Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="transaction_amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Transaction Amount</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., $500 or $250,000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="reputation_status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your Experience</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Rate their honesty" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="honest">Honest & Trustworthy</SelectItem>
                                <SelectItem value="dishonest">Dishonest & Untrustworthy</SelectItem>
                                <SelectItem value="mixed">Mixed Experience</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Detailed Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your business experience with this person in detail. Include what happened, how they handled the transaction, etc."
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="evidence"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Supporting Evidence (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any receipts, messages, or other evidence you can provide"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">
                      Your Information (Required)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="reporter_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="reporter_email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Your email address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <FormField
                        control={form.control}
                        name="reporter_phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="Your phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="reporter_address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your Address (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Your address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h4 className="font-semibold text-yellow-800 mb-2">Important Notice</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• This report will be verified by our team before going live</li>
                      <li>• The reported person will be contacted for their response</li>
                      <li>• False reports may result in legal action</li>
                      <li>• Payment is required to prevent spam and ensure serious reports</li>
                    </ul>
                  </div>

                  <div className="flex flex-col gap-4 pt-6">
                    <Button
                      type="button"
                      onClick={async () => {
                        const formData = form.getValues();
                        await handleFreeSubmission(formData);
                      }}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting Report...
                        </>
                      ) : (
                        "Submit For Free"
                      )}
                    </Button>
                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate("/submit-report")}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-yaracheck-blue hover:bg-yaracheck-darkBlue"
                        disabled={isSubmitting || isProcessingPayment}
                      >
                        {isProcessingPayment ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Processing Payment...
                          </>
                        ) : (
                          <>Submit Report (Free <span className="line-through text-gray-400">{formatFreePrice(price)}</span>)</>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
      
      {showPaymentSelector && (
        <PaymentMethodSelector
          amount={price}
          onSelectMethod={handlePaymentMethod}
          onCancel={() => setShowPaymentSelector(false)}
          isProcessing={isProcessingPayment}
        />
      )}
    </div>
  );
};

export default ReputationReportForm;
