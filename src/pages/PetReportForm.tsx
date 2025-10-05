import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Upload, X } from "lucide-react";
import {
  calculatePrice,
  formatPrice,
  formatFreePrice,
} from "@/utils/dynamicPricing";
import { uploadImageToStorage } from "@/utils/supabaseStorage";
import PaymentMethodSelector from "@/components/PaymentMethodSelector";
import ContactInfoSection from "@/components/ContactInfoSection";

const formSchema = z.object({
  petName: z.string().min(1, "Pet name is required"),
  petType: z.string().min(1, "Pet type is required"),
  breed: z.string().optional(),
  age: z.string().optional(),
  color: z.string().min(1, "Pet color is required"),
  size: z.string().min(1, "Pet size is required"),
  lastSeenLocation: z.string().min(1, "Last seen location is required"),
  dateMissing: z.string().min(1, "Date missing is required"),
  description: z
    .string()
    .min(10, "Please provide a detailed description (at least 10 characters)"),
  submitterName: z.string().min(1, "Your name is required"),
  submitterEmail: z.string().email("Valid email is required"),
  submitterPhone: z.string().min(1, "Phone number is required"),
  reward: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const PetReportForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showPaymentSelector, setShowPaymentSelector] = useState(false);

  // Standard price for pet reports
  const price = 300; // $3.00

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      petName: "",
      petType: "",
      breed: "",
      age: "",
      color: "",
      size: "",
      lastSeenLocation: "",
      dateMissing: "",
      description: "",
      submitterName: "",
      submitterEmail: "",
      submitterPhone: "",
      reward: "",
    },
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("Image size must be less than 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
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

  const handleStripePayment = async (data: FormData) => {
    setIsProcessingPayment(true);
    try {
      const { data: paymentData, error } = await supabase.functions.invoke(
        "create-pet-payment",
        {
          body: { amount: price },
        }
      );

      if (error) throw error;

      if (paymentData?.url) {
        // Save complete report data including image for payment success processing
        const reportData = {
          ...data,
          image: uploadedImage
            ? {
                data: await new Promise<string>((resolve) => {
                  const reader = new FileReader();
                  reader.onload = () => resolve(reader.result as string);
                  reader.readAsDataURL(uploadedImage);
                }),
                name: uploadedImage.name,
                type: uploadedImage.type,
              }
            : null,
        };

        localStorage.setItem("pendingPetReport", JSON.stringify(reportData));
        window.open(paymentData.url, "_blank");
        toast.success(
          "Payment window opened. Complete payment to proceed with pet report."
        );
      }
    } catch (error) {
      console.error("Payment error:", error);
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
        imageUrl = await uploadImageToStorage(uploadedImage, "pets");
        console.log("Image upload result:", imageUrl);
      }

      // Prepare report data with image URL
      const reportData = {
        ...data,
        image_url: imageUrl,
      };

      const { data: paymentData, error } = await supabase.functions.invoke(
        "create-paystack-pet-payment",
        {
          body: {
            amount: price,
            reportData: reportData,
            trackingCode: trackingCode,
          },
        }
      );

      if (error) throw error;

      if (paymentData?.url) {
        // Save complete report data for payment success processing
        const completePaystackReportData = {
          ...data,
          trackingCode: trackingCode,
          image_url: imageUrl,
        };

        localStorage.setItem(
          "pendingPetReport",
          JSON.stringify(completePaystackReportData)
        );
        window.open(paymentData.url, "_blank");
        toast.success(
          "Payment window opened. Complete payment to proceed with pet report."
        );
      }
    } catch (error) {
      console.error("Payment error:", error);
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
        imageUrl = await uploadImageToStorage(uploadedImage, "pets");
        console.log("Image upload result:", imageUrl);
      }

      // Prepare report data with image URL
      const reportData = {
        ...data,
        image_url: imageUrl,
      };

      const { data: paymentData, error } = await supabase.functions.invoke(
        "create-flutterwave-pet-payment",
        {
          body: {
            amount: price,
            reportData: reportData,
            trackingCode: trackingCode,
          },
        }
      );

      if (error) throw error;

      if (paymentData?.url) {
        // Save complete report data for payment success processing
        const completeReportData = {
          ...data,
          trackingCode: trackingCode,
          image_url: imageUrl,
        };

        localStorage.setItem(
          "pendingPetReport",
          JSON.stringify(completeReportData)
        );
        window.open(paymentData.url, "_blank");
        toast.success(
          "Payment window opened. Complete payment to proceed with pet report."
        );
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment processing failed. Please try again.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handlePaymentMethodSelect = async (
    method: "stripe" | "paystack" | "flutterwave",
    data: FormData
  ) => {
    if (method === "stripe") {
      await handleStripePayment(data);
    } else if (method === "paystack") {
      await handlePaystackPayment(data);
    } else if (method === "flutterwave") {
      await handleFlutterwavePayment(data);
    }
  };

  const handleFreeSubmission = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const trackingCode = crypto.randomUUID();

      // Upload image if available
      let imageUrl = null;
      if (uploadedImage) {
        const fileName = `pet-reports/${Date.now()}-${uploadedImage.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("reports")
          .upload(fileName, uploadedImage);

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from("reports")
            .getPublicUrl(fileName);
          imageUrl = urlData.publicUrl;
        }
      }

      // Save to pets table
      const { error } = await (supabase as any).from("pets").insert({
        name: data.petName,
        type: data.petType,
        breed: data.breed,
        age: data.age,
        color: data.color,
        size: data.size,
        last_seen_location: data.lastSeenLocation,
        date_missing: data.dateMissing,
        description: data.description,
        submitter_name: data.submitterName,
        submitter_email: data.submitterEmail,
        submitter_phone: data.submitterPhone,
        reward: data.reward,
        image_url: imageUrl,
        tracking_code: trackingCode,
        status: "missing",
      });

      if (!error) {
        toast.success("Pet report submitted successfully!");
        navigate("/report-confirmation", {
          state: {
            trackingCode,
            reportType: "pet",
          },
        });
      } else {
        toast.error("Failed to submit report. Please try again.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    const priceMessage = `This report requires a ${formatPrice(
      price
    )} fee to help maintain our verification systems.`;
    const confirmPayment = window.confirm(
      `${priceMessage} Would you like to proceed with payment?`
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
                <Heart className="h-6 w-6" />
                Report Missing Pet
              </CardTitle>
              <p className="text-gray-600">
                Help us reunite you with your beloved companion. Please provide
                as much detail as possible.
              </p>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {/* Pet Photo Upload */}
                  <div className="space-y-4">
                    <FormLabel>Pet Photo *</FormLabel>
                    <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4">
                      {imagePreview ? (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Pet preview"
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
                        <label
                          htmlFor="pet-image-upload"
                          className="cursor-pointer block"
                        >
                          <div className="text-center">
                            <Upload className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600 mb-2">
                              Click to upload a clear photo of your pet
                            </p>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, WebP up to 5MB
                            </p>
                          </div>
                        </label>
                      )}
                      <input
                        id="pet-image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Pet Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-yaracheck-blue">
                      Pet Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="petName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pet Name *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter pet's name"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="petType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pet Type *</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select pet type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="dog">Dog</SelectItem>
                                <SelectItem value="cat">Cat</SelectItem>
                                <SelectItem value="bird">Bird</SelectItem>
                                <SelectItem value="rabbit">Rabbit</SelectItem>
                                <SelectItem value="hamster">Hamster</SelectItem>
                                <SelectItem value="guinea-pig">
                                  Guinea Pig
                                </SelectItem>
                                <SelectItem value="reptile">Reptile</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="breed"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Breed</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., Golden Retriever, Persian"
                                {...field}
                              />
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
                                placeholder="e.g., 2 years, 6 months"
                                {...field}
                              />
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
                              <Input
                                placeholder="e.g., Brown and white, Black"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="size"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Size *</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select size" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="small">
                                  Small (under 25 lbs)
                                </SelectItem>
                                <SelectItem value="medium">
                                  Medium (25-60 lbs)
                                </SelectItem>
                                <SelectItem value="large">
                                  Large (60-90 lbs)
                                </SelectItem>
                                <SelectItem value="extra-large">
                                  Extra Large (over 90 lbs)
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Location Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-yaracheck-blue">
                      Location & Date
                    </h3>

                    <FormField
                      control={form.control}
                      name="lastSeenLocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Seen Location *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Street address, park, neighborhood"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dateMissing"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date Missing *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Detailed Description *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Please provide any additional details about your pet's appearance, behavior, distinctive markings, collar/tags, etc."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Reward */}
                  <FormField
                    control={form.control}
                    name="reward"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reward Offered (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., $500 reward for safe return"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Contact Information */}
                  <ContactInfoSection control={form.control} />

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
                        ) : isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Submitting Report...
                          </>
                        ) : (
                          <>
                            Submit Report (Free{" "}
                            <span className="line-through text-gray-400">
                              {formatFreePrice(price)}
                            </span>
                            )
                          </>
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

export default PetReportForm;
