
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
import { Shield, Upload, X } from "lucide-react";
import { calculatePrice, formatPrice, formatFreePrice } from "@/utils/dynamicPricing";
import PaymentMethodSelector from "@/components/PaymentMethodSelector";
import { uploadImageToStorage } from "@/utils/supabaseStorage";

const formSchema = z.object({
  account_type: z.string().min(1, "Account type is required"),
  account_identifier: z.string().min(1, "Account identifier is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  suspected_account_contact: z.string().optional(),
  contact: z.string().min(1, "Contact information is required"),
  reporter_name: z.string().min(1, "Reporter name is required"),
  reporter_email: z.string().email("Valid email is required").min(1, "Reporter email is required"),
  reporter_phone: z.string().min(1, "Reporter phone is required"),
  reporter_address: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const AccountReportForm = () => {
  const navigate = useNavigate();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showPaymentSelector, setShowPaymentSelector] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedScreenshot, setUploadedScreenshot] = useState<File | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      account_type: "",
      account_identifier: "",
      description: "",
      suspected_account_contact: "",
      contact: "",
      reporter_name: "",
      reporter_email: "",
      reporter_phone: "",
      reporter_address: "",
    },
  });

  const price = calculatePrice({ reportType: 'account' });

  const handleScreenshotUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("File size must be less than 5MB");
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error("Please upload an image file");
        return;
      }
      setUploadedScreenshot(file);
      toast.success("Screenshot uploaded successfully");
    }
  };

  const removeScreenshot = () => {
    setUploadedScreenshot(null);
    const input = document.getElementById('screenshot-upload') as HTMLInputElement;
    if (input) input.value = '';
  };

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
        // Save scam report to database (with pending verification status)
        try {
          const formData = form.getValues();
          let screenshotUrl = null;
          
          if (uploadedScreenshot) {
            screenshotUrl = await uploadImageToStorage(uploadedScreenshot, 'scam-reports');
          }
          
          const { data: reportData, error: reportError } = await supabase
            .from('hacked_accounts')
            .insert({
              account_type: formData.account_type,
              account_identifier: formData.account_identifier,
              description: formData.description,
              contact: formData.contact,
              reporter_name: formData.reporter_name,
              reporter_email: formData.reporter_email,
              reporter_phone: formData.reporter_phone,
              reporter_address: formData.reporter_address,
              status: 'pending_verification', // Will remain pending until verified
              visible: false, // Will remain false until super admin verifies
              image_url: screenshotUrl,
              date_compromised: new Date().toISOString().split('T')[0] // Today's date as default
            })
            .select()
            .single();

          if (reportError) throw reportError;

          // Store tracking code for payment success page
          localStorage.setItem('trackingCode', reportData.id);
          
          window.open(data.url, '_blank');
          toast.success("Payment window opened. Complete payment to proceed with scam account verification.");
          setShowPaymentSelector(false);
        } catch (error) {
          console.error('Error saving scam report:', error);
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
      
      let imageUrl = null;
      if (uploadedScreenshot) {
        const fileName = `account-reports/${Date.now()}-${uploadedScreenshot.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('reports')
          .upload(fileName, uploadedScreenshot);
        
        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('reports')
            .getPublicUrl(fileName);
          imageUrl = urlData.publicUrl;
        }
      }

      const { error } = await supabase
        .from('hacked_accounts')
        .insert({
          account_type: data.account_type,
          account_identifier: data.account_identifier,
          description: data.description,
          image_url: imageUrl,
          contact: data.suspected_account_contact || '',
          reporter_name: data.reporter_name,
          reporter_email: data.reporter_email,
          reporter_phone: data.reporter_phone,
          tracking_code: trackingCode,
          date_compromised: new Date().toISOString().split('T')[0], // Required field
          status: 'pending'
        });

      if (!error) {
        toast.success("Account report submitted successfully!");
        navigate("/report-confirmation", { 
          state: { 
            trackingCode, 
            reportType: 'account'
          }
        });
      }
    } catch (error) {
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    const confirmPayment = window.confirm(
      `This scam account report requires a ${formatPrice(price)} fee. The report will be verified before going live. Would you like to proceed with payment?`
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
                <Shield className="h-6 w-6" />
                Report Scam Email/Social Media Account
              </CardTitle>
              <p className="text-sm text-gray-600">
                Flag suspected scam accounts. All reports are verified before going live.
              </p>
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
                        <FormLabel>Account Identifier *</FormLabel>
                        <FormControl>
                          <Input placeholder="Email address, username, or phone number" {...field} />
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
                        <FormLabel>Description of Suspected Scam Message/Call *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the suspected scam message, call, or activity in detail. What did they ask for? What promises did they make?"
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Screenshot Upload Section */}
                  <div className="space-y-2">
                    <FormLabel>Screenshot of Message (Optional)</FormLabel>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      {uploadedScreenshot ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-center gap-2 text-green-600">
                            <Upload className="h-5 w-5" />
                            <span className="text-sm font-medium">{uploadedScreenshot.name}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={removeScreenshot}
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500">
                            File size: {(uploadedScreenshot.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      ) : (
                        <label htmlFor="screenshot-upload" className="cursor-pointer block">
                          <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600 mb-1">
                            Click to upload screenshot
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, JPEG up to 5MB
                          </p>
                        </label>
                      )}
                      <input
                        id="screenshot-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleScreenshotUpload}
                      />
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="suspected_account_contact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Any Other Contact Info of Suspected Account Holder (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Phone number, alternative email, social media profiles, etc." {...field} />
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
                        <FormLabel>Your Contact Information *</FormLabel>
                        <FormControl>
                          <Input placeholder="Your phone number or email for contact" {...field} />
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
                              <FormLabel>Your Name *</FormLabel>
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
                              <FormLabel>Your Email *</FormLabel>
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
                              <FormLabel>Your Phone *</FormLabel>
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
                      <li>• The suspected account holder will be contacted for their response</li>
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
                        disabled={isProcessingPayment}
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

export default AccountReportForm;
