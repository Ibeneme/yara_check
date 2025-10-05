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
import { User, Upload, X } from "lucide-react";
import { calculatePrice, formatPrice, formatFreePrice } from "@/utils/dynamicPricing";
import { savePersonToSupabase, uploadImageToStorage } from "@/utils/supabaseStorage";
import PaymentMethodSelector from "@/components/PaymentMethodSelector";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  age: z.string().min(1, "Age is required"),
  gender: z.string().min(1, "Gender is required"),
  physical_attributes: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  date_missing: z.string().min(1, "Date missing is required"),
  description: z.string().optional(),
  contact: z.string().min(1, "Contact information is required"),
  reporter_name: z.string().min(1, "Reporter name is required"),
  reporter_email: z.string().email("Valid email is required").min(1, "Reporter email is required"),
  reporter_phone: z.string().min(1, "Reporter phone is required"),
  reporter_address: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const PersonReportForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showPaymentSelector, setShowPaymentSelector] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      age: "",
      gender: "",
      physical_attributes: "",
      location: "",
      date_missing: "",
      description: "",
      contact: "",
      reporter_name: "",
      reporter_email: "",
      reporter_phone: "",
      reporter_address: "",
    },
  });

  const watchedAge = form.watch("age");
  const price = calculatePrice({ 
    reportType: 'person', 
    age: parseInt(watchedAge) || undefined 
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("Image size must be less than 5MB");
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select a valid image file");
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

  const generateTrackingCode = () => {
    return `PC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  };

  const handleFreeSubmission = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const personData = {
        name: data.name,
        age: data.age,
        gender: data.gender,
        description: data.description || "",
        outfit: data.physical_attributes || "",
        location: data.location,
        dateMissing: data.date_missing,
        contact: data.contact,
        photoUrl: null,
      };

      console.log("Submitting person report:", { 
        personData, 
        hasImage: !!uploadedImage,
        imageDetails: uploadedImage ? {
          name: uploadedImage.name,
          size: uploadedImage.size,
          type: uploadedImage.type
        } : null
      });
      
      // Generate UUID tracking code for consistency  
      const trackingCode = crypto.randomUUID();
      const savedPerson = await savePersonToSupabase(personData, uploadedImage || undefined, trackingCode);
      
      if (savedPerson) {
        localStorage.setItem('lastTrackingCode', trackingCode);
        localStorage.setItem('lastReportType', 'person');
        
        toast.success("Person report submitted successfully!");
        navigate("/report-confirmation", { 
          state: { 
            trackingCode, 
            reportType: 'person',
            reportData: savedPerson
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

  const handleStripePayment = async (data: FormData) => {
    setIsProcessingPayment(true);
    try {
      const { data: paymentData, error } = await supabase.functions.invoke('create-person-payment', {
        body: { amount: price }
      });

      if (error) throw error;

      if (paymentData?.url) {
        // Save complete report data including image for payment success processing
        const reportData = {
          ...data,
          image: uploadedImage ? {
            data: await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.readAsDataURL(uploadedImage);
            }),
            name: uploadedImage.name,
            type: uploadedImage.type
          } : null
        };
        
        localStorage.setItem('pendingPersonReport', JSON.stringify(reportData));
        window.open(paymentData.url, '_blank');
        toast.success("Payment window opened. Complete payment to proceed with person report.");
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error("Payment processing failed. Please try again.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handlePaystackPayment = async (data: FormData) => {
    setIsProcessingPayment(true);
    try {
      // Generate tracking code for the transaction
      const trackingCode = crypto.randomUUID();
      
      // Upload image first if present
      let imageUrl = null;
      if (uploadedImage) {
        console.log("Uploading image before payment...");
        imageUrl = await uploadImageToStorage(uploadedImage, 'persons');
        console.log("Image upload result:", imageUrl);
      }
      
      // Prepare report data with image URL
      const reportData = {
        ...data,
        reporter_email: data.reporter_email || data.contact,
        reporter_name: data.reporter_name || data.name,
        reporter_phone: data.reporter_phone || data.contact,
        reporter_address: data.reporter_address || data.location,
        image_url: imageUrl
      };

      const { data: paymentData, error } = await supabase.functions.invoke('create-paystack-person-payment', {
        body: { 
          amount: price,
          reportData: reportData,
          trackingCode: trackingCode
        }
      });

      if (error) throw error;

      if (paymentData?.url) {
        // Save complete report data for payment success processing
        const completePaystackReportData = {
          ...data,
          trackingCode: trackingCode,
          image_url: imageUrl
        };
        
        localStorage.setItem('pendingPersonReport', JSON.stringify(completePaystackReportData));
        window.open(paymentData.url, '_blank');
        toast.success("Payment window opened. Complete payment to proceed with person report.");
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error("Payment processing failed. Please try again.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleFlutterwavePayment = async (data: FormData) => {
    setIsProcessingPayment(true);
    try {
      // Generate tracking code for the transaction
      const trackingCode = crypto.randomUUID();
      
      // Upload image first if present
      let imageUrl = null;
      if (uploadedImage) {
        console.log("Uploading image before payment...");
        imageUrl = await uploadImageToStorage(uploadedImage, 'persons');
        console.log("Image upload result:", imageUrl);
      }
      
      // Prepare report data with image URL
      const reportData = {
        ...data,
        reporter_email: data.reporter_email || data.contact,
        reporter_name: data.reporter_name || data.name,
        reporter_phone: data.reporter_phone || data.contact,
        reporter_address: data.reporter_address || data.location,
        image_url: imageUrl
      };

      const { data: paymentData, error } = await supabase.functions.invoke('create-flutterwave-person-payment', {
        body: { 
          amount: price,
          reportData: reportData,
          trackingCode: trackingCode
        }
      });

      if (error) throw error;

      if (paymentData?.url) {
        // Save complete report data for payment success processing
        const completeReportData = {
          ...data,
          trackingCode: trackingCode,
          image_url: imageUrl
        };
        
        localStorage.setItem('pendingPersonReport', JSON.stringify(completeReportData));
        window.open(paymentData.url, '_blank');
        toast.success("Payment window opened. Complete payment to proceed with person report.");
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error("Payment processing failed. Please try again.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handlePaymentMethodSelect = async (method: 'stripe' | 'paystack' | 'flutterwave', data: FormData) => {
    if (method === 'stripe') {
      await handleStripePayment(data);
    } else if (method === 'paystack') {
      await handlePaystackPayment(data);
    } else if (method === 'flutterwave') {
      await handleFlutterwavePayment(data);
    }
  };

  const onSubmit = async (data: FormData) => {
    const age = parseInt(data.age);
    
    if (price === 0) {
      const priceMessage = "This report is free of charge for children ages 1-7.";
      const confirmSubmission = window.confirm(
        `${priceMessage} Would you like to proceed with submitting this report?`
      );
      
      if (confirmSubmission) {
        await handleFreeSubmission(data);
      }
    } else {
      const priceMessage = `This report requires a ${formatPrice(price)} fee to help maintain our verification systems.`;
      const confirmPayment = window.confirm(
        `${priceMessage} Would you like to proceed with payment?`
      );
      
      if (confirmPayment) {
        setShowPaymentSelector(true);
      }
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
                <User className="h-6 w-6" />
                Report Missing Person
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
                        <label htmlFor="person-image-upload" className="cursor-pointer block">
                          <div className="text-center">
                            <Upload className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600 mb-2">
                              Click to upload a photo of the missing person
                            </p>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, WebP up to 5MB
                            </p>
                          </div>
                        </label>
                      )}
                      <input
                        id="person-image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Enter age" 
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                          {watchedAge && (
                            <p className="text-xs text-gray-600">
                              Report fee: Free <span className="line-through text-gray-400">{formatFreePrice(price)}</span>
                            </p>
                          )}
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Known Location</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter last known location" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="date_missing"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date Missing</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="physical_attributes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Physical Attributes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Height, weight, hair color, distinguishing marks, etc."
                            {...field}
                          />
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
                        <FormLabel>Additional Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any additional information that might help"
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
                      Reporter Information (Optional)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="reporter_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Reporter Name</FormLabel>
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
                            <FormLabel>Reporter Email</FormLabel>
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
                            <FormLabel>Reporter Phone</FormLabel>
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
                      onClick={() => {
                        if (price === 0) {
                          const formData = form.getValues();
                          handleFreeSubmission(formData);
                        } else {
                          const formData = form.getValues();
                          handleFreeSubmission(formData);  
                        }
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
                        ) : isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Submitting Report...
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
          onSelectMethod={(method) => {
            setShowPaymentSelector(false);
            const formData = form.getValues();
            handlePaymentMethodSelect(method, formData);
          }}
          onCancel={() => setShowPaymentSelector(false)}
          isProcessing={isProcessingPayment}
        />
      )}
    </div>
  );
};

export default PersonReportForm;
