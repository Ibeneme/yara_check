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
import PaymentMethodSelector from "@/components/PaymentMethodSelector";
import { supabase } from "@/integrations/supabase/client";
import { Car, Upload, X } from "lucide-react";
import { calculatePrice, formatPrice } from "@/utils/dynamicPricing";
import { saveVehicleToSupabase } from "@/utils/supabaseStorage";

const formSchema = z.object({
  type: z.string().min(1, "Vehicle type is required"),
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  year: z.number().min(1900, "Year must be valid").max(new Date().getFullYear() + 1),
  color: z.string().min(1, "Color is required"),
  chassis: z.string().min(1, "Chassis/VIN number is required"),
  location: z.string().min(1, "Location is required"),
  description: z.string().optional(),
  contact: z.string().min(1, "Contact information is required"),
  reporter_name: z.string().min(1, "Reporter name is required"),
  reporter_email: z.string().email("Valid email is required").min(1, "Reporter email is required"),
  reporter_phone: z.string().min(1, "Reporter phone is required"),
  reporter_address: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const VehicleReportForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showPaymentSelector, setShowPaymentSelector] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "",
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      color: "",
      chassis: "",
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
  const price = calculatePrice({ 
    reportType: 'vehicle', 
    year: watchedYear 
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("Image size must be less than 5MB");
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

  const handlePayment = async (paymentMethod: 'stripe' | 'paystack' | 'flutterwave' = 'stripe') => {
    setIsProcessingPayment(true);
    try {
      const functionName = paymentMethod === 'stripe' 
        ? 'create-vehicle-payment'
        : paymentMethod === 'paystack' 
        ? 'create-paystack-vehicle-payment'
        : 'create-flutterwave-vehicle-payment';
      const reportData = {
        ...form.getValues(),
        year: form.getValues().year || new Date().getFullYear()
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

      if (data?.url || data?.link) {
        const paymentUrl = data.url || data.link;
        
        // For Flutterwave, handle the redirect differently
        if (paymentMethod === 'flutterwave') {
          window.location.href = paymentUrl;
        } else {
          // Store form data and image in localStorage to retrieve after payment
          const formDataWithImage = {
            ...form.getValues(),
            image: uploadedImage ? {
              name: uploadedImage.name,
              size: uploadedImage.size,
              type: uploadedImage.type,
              data: imagePreview
            } : null
          };
          
          localStorage.setItem('pendingVehicleReport', JSON.stringify(formDataWithImage));
          window.open(paymentUrl, '_blank');
        }
        
        const paymentProvider = paymentMethod === 'flutterwave' ? 'Flutterwave' : paymentMethod === 'paystack' ? 'Paystack' : 'Stripe';
        toast.success(`${paymentProvider} payment window opened. Complete payment to proceed with vehicle report.`);
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
      const vehicleData = {
        type: data.type,
        chassis: data.chassis,
        brand: data.brand,
        model: data.model,
        color: data.color,
        year: data.year.toString(),
        location: data.location,
        description: data.description || "",
        contact: data.contact,
      };

      console.log("Submitting vehicle report:", { vehicleData, hasImage: !!uploadedImage });
      
      // Generate UUID tracking code for consistency
      const trackingCode = crypto.randomUUID();
      const savedVehicle = await saveVehicleToSupabase(vehicleData, uploadedImage || undefined, trackingCode);
      
      if (savedVehicle) {
        localStorage.setItem('lastTrackingCode', trackingCode);
        localStorage.setItem('lastReportType', 'vehicle');
        
        toast.success("Vehicle report submitted successfully!");
        navigate("/report-confirmation", { 
          state: { 
            trackingCode, 
            reportType: 'vehicle',
            reportData: savedVehicle
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
    if (price === 0) {
      await handleFreeSubmission(data);
    } else {
      // Show payment method selector
      setShowPaymentSelector(true);
    }
  };

  const handlePaymentMethodSelect = async (method: 'stripe' | 'paystack' | 'flutterwave') => {
    setShowPaymentSelector(false);
    await handlePayment(method);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="yaracheck-container py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-yaracheck-blue">
                <Car className="h-6 w-6" />
                Report Stolen Vehicle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Image Upload Section */}
                  <div className="space-y-4">
                    <FormLabel>Vehicle Photo (Optional)</FormLabel>
                    <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4">
                      {imagePreview ? (
                        <div className="relative">
                          <img 
                            src={imagePreview} 
                            alt="Vehicle preview" 
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
                        <label htmlFor="vehicle-image-upload" className="cursor-pointer block">
                          <div className="text-center">
                            <Upload className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600 mb-2">
                              Click to upload a photo of the stolen vehicle
                            </p>
                            <p className="text-xs text-gray-500">
                              PNG, JPG up to 5MB
                            </p>
                          </div>
                        </label>
                      )}
                      <input
                        id="vehicle-image-upload"
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
                        <FormLabel>Vehicle Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select vehicle type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="car">Car</SelectItem>
                            <SelectItem value="motorcycle">Motorcycle</SelectItem>
                            <SelectItem value="truck">Truck</SelectItem>
                            <SelectItem value="van">Van</SelectItem>
                            <SelectItem value="bus">Bus</SelectItem>
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
                          <FormLabel>Brand</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Toyota, Honda, BMW" {...field} />
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
                          <FormLabel>Model</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Camry, Civic, X5" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="year"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Year</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="e.g., 2020" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || new Date().getFullYear())}
                            />
                          </FormControl>
                          <FormMessage />
                          {watchedYear && (
                            <p className="text-xs text-gray-600">
                              Report fee: {formatPrice(price)}
                            </p>
                          )}
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color</FormLabel>
                          <FormControl>
                            <Input placeholder="Vehicle color" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="chassis"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chassis/VIN Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter chassis or VIN number" {...field} />
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
                        <FormLabel>Location Where Stolen</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter location where vehicle was stolen" {...field} />
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
                            placeholder="Any additional details about the vehicle or theft"
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
                        price === 0 ? "Submit Report (Free)" : `Proceed to Payment (${formatPrice(price)})`
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>

      {showPaymentSelector && (
        <PaymentMethodSelector
          amount={price}
          onSelectMethod={handlePaymentMethodSelect}
          onCancel={() => setShowPaymentSelector(false)}
          isProcessing={isProcessingPayment}
        />
      )}
      
      <Footer />
    </div>
  );
};

export default VehicleReportForm;
