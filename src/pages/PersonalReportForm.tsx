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
import { Briefcase, Upload, X } from "lucide-react";
import { calculatePrice, formatPrice, formatFreePrice } from "@/utils/dynamicPricing";
import { saveDeviceToSupabase, uploadImageToStorage, savePersonalToSupabase } from "@/utils/supabaseStorage";
import PaymentMethodSelector from "@/components/PaymentMethodSelector";

const formSchema = z.object({
  type: z.string().min(1, "Item type is required"),
  brand: z.string().min(1, "Brand/Description is required"),
  model: z.string().min(1, "Model/Description is required"),
  color: z.string().min(1, "Color is required"),
  imei: z.string().min(1, "Serial number/Identifier is required"),
  year: z.string().min(1, "Year is required"),
  location: z.string().min(1, "Location is required"),
  description: z.string().min(1, "Description is required"),
  contact: z.string().min(1, "Contact information is required"),
  reporter_name: z.string().min(1, "Reporter name is required"),
  reporter_email: z.string().email("Valid email is required").min(1, "Reporter email is required"),
  reporter_phone: z.string().min(1, "Reporter phone is required"),
  reporter_address: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const PersonalReportForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showPaymentSelector, setShowPaymentSelector] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "",
      brand: "",
      model: "",
      color: "",
      imei: "",
      year: "",
      location: "",
      description: "",
      contact: "",
      reporter_name: "",
      reporter_email: "",
      reporter_phone: "",
      reporter_address: "",
    },
  });

  const watchedYear = form.watch("year");
  const watchedType = form.watch("type");
  
  const price = calculatePrice({ 
    reportType: 'device', // Use device pricing logic
    deviceType: watchedType,
    year: parseInt(watchedYear) || new Date().getFullYear()
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should not exceed 5MB");
        return;
      }
      
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setUploadedImage(null);
    setImagePreview(null);
  };

  const handlePaymentMethod = async (method: 'stripe' | 'paystack' | 'flutterwave') => {
    setIsProcessingPayment(true);
    try {
      const functionName = method === 'stripe' 
        ? 'create-device-payment' 
        : method === 'paystack' 
        ? 'create-paystack-personal-payment'
        : 'create-flutterwave-personal-payment';
      
      const reportData = {
        ...form.getValues(),
        year: parseInt(form.getValues().year) || new Date().getFullYear()
      };
      
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
        // Save personal report to database immediately after payment processing
        try {
          const formData = form.getValues();
          const { data: reportData, error: reportError } = await supabase
            .from('personal_belongings')
            .insert({
              type: formData.type,
              brand: formData.brand,
              model: formData.model,
              color: formData.color,
              imei: formData.imei,
              year: parseInt(formData.year),
              location: formData.location,
              description: formData.description,
              contact: formData.contact,
              reporter_name: formData.reporter_name,
              reporter_email: formData.reporter_email,
              reporter_phone: formData.reporter_phone,
              reporter_address: formData.reporter_address,
              status: 'pending',
              visible: true
            })
            .select()
            .single();

          if (reportError) throw reportError;

          // Store tracking code for payment success page
          localStorage.setItem('trackingCode', reportData.id);
        } catch (error) {
          console.error('Error saving personal report:', error);
          toast.error("Error saving report data");
          return;
        }
        
        window.open(data.url, '_blank');
        toast.success("Payment window opened. Complete payment to proceed with personal belongings report.");
        setShowPaymentSelector(false);
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
      const personalData = {
        type: data.type,
        brand: data.brand,
        model: data.model,
        color: data.color,
        imei: data.imei,
        year: parseInt(data.year),
        location: data.location,
        description: data.description || "",
        contact: data.contact,
        reporter_name: data.reporter_name,
        reporter_email: data.reporter_email,
        reporter_phone: data.reporter_phone,
        reporter_address: data.reporter_address,
      };

      console.log("Submitting personal belongings report:", { personalData, hasImage: !!uploadedImage });
      
      // Generate UUID tracking code for consistency
      const trackingCode = crypto.randomUUID();
      
      const savedReport = await savePersonalToSupabase(personalData, uploadedImage || undefined, trackingCode);
      
      if (savedReport) {
        localStorage.setItem('lastTrackingCode', trackingCode);
        localStorage.setItem('lastReportType', 'personal');
        
        toast.success("Personal belongings report submitted successfully!");
        navigate("/report-confirmation", { 
          state: { 
            trackingCode, 
            reportType: 'personal',
            reportData: savedReport
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
      `This personal belongings report requires a ${formatPrice(price)} fee. Would you like to proceed with payment?`
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
                <Briefcase className="h-6 w-6" />
                Report Stolen Personal Belongings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Image Upload Section */}
                  <div className="space-y-4">
                    <FormLabel>Photo (Optional)</FormLabel>
                    <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4">
                      {imagePreview ? (
                        <div className="relative">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <label htmlFor="personal-image-upload" className="cursor-pointer block">
                          <div className="text-center">
                            <Upload className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600 mb-2">
                              Click to upload a photo of the stolen personal item
                            </p>
                            <p className="text-xs text-gray-500">
                              PNG, JPG up to 5MB
                            </p>
                          </div>
                        </label>
                      )}
                      <input
                        id="personal-image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Item Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select item type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="jewelry">Jewelry</SelectItem>
                            <SelectItem value="watch">Watch</SelectItem>
                            <SelectItem value="bag">Bag/Purse</SelectItem>
                            <SelectItem value="wallet">Wallet</SelectItem>
                            <SelectItem value="clothing">Clothing</SelectItem>
                            <SelectItem value="shoes">Shoes</SelectItem>
                            <SelectItem value="accessory">Accessory</SelectItem>
                            <SelectItem value="glasses">Glasses/Sunglasses</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="brand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand/Description *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Rolex, Gucci, or description" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Model/Type *</FormLabel>
                          <FormControl>
                            <Input placeholder="Model name or item type" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Gold, Black, Silver" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="year"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Year of Purchase *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="e.g., 2020" 
                              min="1950" 
                              max={new Date().getFullYear()} 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="imei"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Serial Number/Identifier *</FormLabel>
                        <FormControl>
                          <Input placeholder="Serial number, engraving, or unique identifier" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location Where Stolen *</FormLabel>
                        <FormControl>
                          <Input placeholder="City, address or general area" {...field} />
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
                        <FormLabel>Description *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Additional details about the item and theft incident"
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
                        <FormLabel>Contact Information *</FormLabel>
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

export default PersonalReportForm;