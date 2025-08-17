
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
import { Shield } from "lucide-react";
import { calculatePrice, formatPrice } from "@/utils/dynamicPricing";
import PaymentMethodSelector from "@/components/PaymentMethodSelector";

const formSchema = z.object({
  account_type: z.string().min(1, "Account type is required"),
  account_identifier: z.string().min(1, "Account identifier is required"),
  date_compromised: z.string().min(1, "Date compromised is required"),
  description: z.string().min(1, "Description is required"),
  contact: z.string().min(1, "Contact information is required"),
  reporter_name: z.string().min(1, "Reporter name is required"),
  reporter_email: z.string().email("Valid email is required").min(1, "Reporter email is required"),
  reporter_phone: z.string().min(1, "Reporter phone is required"),
  reporter_address: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const AccountReportForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showPaymentSelector, setShowPaymentSelector] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      account_type: "",
      account_identifier: "",
      date_compromised: "",
      description: "",
      contact: "",
      reporter_name: "",
      reporter_email: "",
      reporter_phone: "",
      reporter_address: "",
    },
  });

  const price = calculatePrice({ reportType: 'account' });

  const handlePaymentMethod = async (method: 'stripe' | 'paystack' | 'flutterwave') => {
    setIsProcessingPayment(true);
    try {
      const functionName = method === 'stripe' 
        ? 'create-vehicle-payment' 
        : method === 'paystack' 
        ? 'create-paystack-account-payment'
        : 'create-flutterwave-account-payment';
      
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
        // Store form data in localStorage to retrieve after payment
        localStorage.setItem('pendingAccountReport', JSON.stringify(form.getValues()));
        
        window.open(data.url, '_blank');
        toast.success("Payment window opened. Complete payment to proceed with account report.");
        setShowPaymentSelector(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error("Payment processing failed. Please try again.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      console.log("Submitting account data:", data);
      
      const { data: accountData, error } = await supabase
        .from('hacked_accounts')
        .insert([{
          account_type: data.account_type,
          account_identifier: data.account_identifier,
          date_compromised: data.date_compromised,
          description: data.description,
          contact: data.contact,
          reporter_name: data.reporter_name,
          reporter_email: data.reporter_email,
          reporter_phone: data.reporter_phone,
          reporter_address: data.reporter_address,
        }])
        .select()
        .single();

      if (error) throw error;

      console.log("Account report saved successfully:", accountData);
      
      toast.success("Account report submitted successfully!");
      navigate("/report-confirmation", { 
        state: { 
          reportId: accountData.id,
          reportType: 'account'
        } 
      });
    } catch (error: any) {
      console.error("Error submitting account report:", error);
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
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
                <Shield className="h-6 w-6" />
                Report Hacked Account
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="account_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select account type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="email">Email Account</SelectItem>
                            <SelectItem value="facebook">Facebook</SelectItem>
                            <SelectItem value="instagram">Instagram</SelectItem>
                            <SelectItem value="twitter">Twitter/X</SelectItem>
                            <SelectItem value="tiktok">TikTok</SelectItem>
                            <SelectItem value="linkedin">LinkedIn</SelectItem>
                            <SelectItem value="whatsapp">WhatsApp</SelectItem>
                            <SelectItem value="telegram">Telegram</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="account_identifier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Identifier</FormLabel>
                        <FormControl>
                          <Input placeholder="Email address, username, or phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="date_compromised"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date Compromised</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description of Compromise *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe what happened - unauthorized posts, changed passwords, suspicious activity, etc."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Information</FormLabel>
                        <FormControl>
                          <Input placeholder="Phone number or email for contact" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">
                      Reporter Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="reporter_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Reporter Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Your name" {...field} />
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
                            <FormLabel>Reporter Email *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Your email" {...field} />
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
                            <FormLabel>Reporter Phone *</FormLabel>
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
                            <FormLabel>Reporter Address</FormLabel>
                            <FormControl>
                              <Input placeholder="Your address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/submit-report")}
                      className="flex-1"
                    >
                      Back
                    </Button>
                     <Button
                      type="button"
                      onClick={() => setShowPaymentSelector(true)}
                      className="flex-1 bg-yaracheck-blue hover:bg-yaracheck-darkBlue"
                      disabled={isSubmitting || isProcessingPayment}
                    >
                      {isProcessingPayment ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing Payment...
                        </>
                       ) : (
                         `Proceed to Payment (${formatPrice(price)})`
                       )}
                    </Button>
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

export default AccountReportForm;
