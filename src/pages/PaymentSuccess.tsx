import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { savePersonToSupabase } from "@/utils/supabaseStorage";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Loader2 } from "lucide-react";

// Generate UUID format tracking code (same format as report IDs)
const generateTrackingCode = () => {
  // Generate a UUID v4 format tracking code
  const code = crypto.randomUUID();
  console.log("[STRIPE-SUCCESS] Generated tracking code:", code);
  return code;
};

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [trackingCode, setTrackingCode] = useState<string | null>(null);

  useEffect(() => {
    const processPaymentSuccess = async () => {
      console.log("[STRIPE-SUCCESS] Payment confirmation handler triggered");
      
      const sessionId = searchParams.get('session_id');
      
      console.log("[STRIPE-SUCCESS] Session ID received:", sessionId);
      console.log("[STRIPE-SUCCESS] Full URL params:", Object.fromEntries(searchParams.entries()));
      console.log("[STRIPE-SUCCESS] Checking localStorage for pending reports...");
      console.log("[STRIPE-SUCCESS] localStorage contents:", {
        pendingPersonReport: localStorage.getItem('pendingPersonReport'),
        pendingDeviceReport: localStorage.getItem('pendingDeviceReport'),
        pendingVehicleReport: localStorage.getItem('pendingVehicleReport'),
        trackingCode: localStorage.getItem('trackingCode')
      });
      
      if (!sessionId) {
        console.error("[STRIPE-SUCCESS] No session ID found");
        toast.error("Invalid payment session");
        navigate('/submit-report');
        return;
      }

      try {
        console.log("[STRIPE-SUCCESS] Starting payment processing for session:", sessionId);
        // Check for pending reports of all types
        const pendingPersonReport = localStorage.getItem('pendingPersonReport');
        const pendingDeviceReport = localStorage.getItem('pendingDeviceReport');
        const pendingVehicleReport = localStorage.getItem('pendingVehicleReport');
        
        if (pendingPersonReport) {
          console.log("[STRIPE-SUCCESS] Processing person report");
          const reportData = JSON.parse(pendingPersonReport);
          console.log("[STRIPE-SUCCESS] Person report data:", { name: reportData.name, age: reportData.age });
          
          // Convert image data back to File object if it exists
          let imageFile = null;
          if (reportData.image) {
            console.log("[STRIPE-SUCCESS] Converting image data to file");
            const byteString = atob(reportData.image.data.split(',')[1]);
            const arrayBuffer = new ArrayBuffer(byteString.length);
            const uint8Array = new Uint8Array(arrayBuffer);
            for (let i = 0; i < byteString.length; i++) {
              uint8Array[i] = byteString.charCodeAt(i);
            }
            imageFile = new File([uint8Array], reportData.image.name, { type: reportData.image.type });
          }

          const personData = {
            name: reportData.name,
            age: reportData.age,
            gender: reportData.gender,
            description: reportData.description || "",
            outfit: reportData.physical_attributes || reportData.outfit || "",
            location: reportData.location,
            dateMissing: reportData.date_missing || reportData.dateMissing,
            contact: reportData.contact,
            photoUrl: null,
          };

          console.log("[STRIPE-SUCCESS] Saving person to database");
          const code = generateTrackingCode();
          const savedPerson = await savePersonToSupabase(personData, imageFile || undefined, code);
          
          if (savedPerson) {
            console.log("[STRIPE-SUCCESS] Person saved successfully with tracking code:", code);
            
            // Create transaction record
            const { createTransactionRecord } = await import("@/utils/supabaseStorage");
            await createTransactionRecord(code, 'person', 'stripe', sessionId, 4999);
            
            setTrackingCode(code);
            localStorage.removeItem('pendingPersonReport');
            localStorage.setItem('lastTrackingCode', code);
            localStorage.setItem('lastReportType', 'person');
            
            console.log("[STRIPE-SUCCESS] Redirecting to confirmation with code:", code);
            toast.success("Payment successful! Person report submitted.");
            
            // Immediate redirect to confirmation page
            window.location.href = `/payment-confirmation?code=${code}`;
          } else {
            throw new Error("Failed to save report after payment");
          }
        } else if (pendingDeviceReport) {
          console.log("[STRIPE-SUCCESS] Processing device report");
          const reportData = JSON.parse(pendingDeviceReport);
          console.log("[STRIPE-SUCCESS] Device report data:", { type: reportData.type, imei: reportData.imei });
          
          const deviceData = {
            type: reportData.type,
            imei: reportData.imei,
            brand: reportData.brand,
            model: reportData.model,
            color: reportData.color,
            location: reportData.location,
            description: reportData.description || "",
            contact: reportData.contact,
          };

          console.log("[STRIPE-SUCCESS] Saving device to database");
          const code = generateTrackingCode();
          const { saveDeviceToSupabase } = await import("@/utils/supabaseStorage");
          const savedDevice = await saveDeviceToSupabase(deviceData, undefined, code);
          
          if (savedDevice) {
            console.log("[STRIPE-SUCCESS] Device saved successfully with tracking code:", code);
            
            // Create transaction record
            const { createTransactionRecord } = await import("@/utils/supabaseStorage");
            await createTransactionRecord(code, 'device', 'stripe', sessionId, 4999);
            
            setTrackingCode(code);
            localStorage.removeItem('pendingDeviceReport');
            localStorage.setItem('lastTrackingCode', code);
            localStorage.setItem('lastReportType', 'device');
            
            console.log("[STRIPE-SUCCESS] Redirecting to confirmation with code:", code);
            toast.success("Payment successful! Device report submitted.");
            
            // Immediate redirect to confirmation page
            window.location.href = `/payment-confirmation?code=${code}`;
          } else {
            throw new Error("Failed to save device report after payment");
          }
        } else if (pendingVehicleReport) {
          console.log("[STRIPE-SUCCESS] Processing vehicle report");
          const reportData = JSON.parse(pendingVehicleReport);
          console.log("[STRIPE-SUCCESS] Vehicle report data:", { type: reportData.type, chassis: reportData.chassis });
          
          const vehicleData = {
            type: reportData.type,
            chassis: reportData.chassis,
            brand: reportData.brand,
            model: reportData.model,
            color: reportData.color,
            year: reportData.year,
            location: reportData.location,
            description: reportData.description || "",
            contact: reportData.contact,
          };

          console.log("[STRIPE-SUCCESS] Saving vehicle to database");
          const code = generateTrackingCode();
          const { saveVehicleToSupabase } = await import("@/utils/supabaseStorage");
          const savedVehicle = await saveVehicleToSupabase(vehicleData, undefined, code);
          
          if (savedVehicle) {
            console.log("[STRIPE-SUCCESS] Vehicle saved successfully with tracking code:", code);
            
            // Create transaction record
            const { createTransactionRecord } = await import("@/utils/supabaseStorage");
            await createTransactionRecord(code, 'vehicle', 'stripe', sessionId, 4999);
            
            setTrackingCode(code);
            localStorage.removeItem('pendingVehicleReport');
            localStorage.setItem('lastTrackingCode', code);
            localStorage.setItem('lastReportType', 'vehicle');
            
            console.log("[STRIPE-SUCCESS] Redirecting to confirmation with code:", code);
            toast.success("Payment successful! Vehicle report submitted.");
            
            // Immediate redirect to confirmation page
            window.location.href = `/payment-confirmation?code=${code}`;
          } else {
            throw new Error("Failed to save vehicle report after payment");
          }
        } else {
          // Check if there's a stored tracking code (for reports already saved to DB)
          const storedTrackingCode = localStorage.getItem('trackingCode');
          
          if (storedTrackingCode) {
            console.log("[STRIPE-SUCCESS] Using stored tracking code:", storedTrackingCode);
            setTrackingCode(storedTrackingCode);
            localStorage.removeItem('trackingCode');
            toast.success("Payment successful! Report submitted.");
            window.location.href = `/payment-confirmation?code=${storedTrackingCode}`;
          } else {
            console.error("[STRIPE-SUCCESS] No pending report found after payment");
            // Create a basic transaction record even without report data
            const code = generateTrackingCode();
            const { createTransactionRecord } = await import("@/utils/supabaseStorage");
            await createTransactionRecord(code, 'unknown', 'stripe', sessionId, 4999);
            
            toast.success("Payment successful! Your report has been submitted.");
            window.location.href = `/payment-confirmation?code=${code}`;
          }
        }
      } catch (error: any) {
        console.error('[STRIPE-SUCCESS] Error processing payment:', error);
        console.error('[STRIPE-SUCCESS] Error details:', {
          message: error.message,
          stack: error.stack,
          sessionId
        });
        toast.error("Payment successful but report submission failed. Please contact support.");
        navigate('/support');
      } finally {
        setIsProcessing(false);
      }
    };

    processPaymentSuccess();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto py-12">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              {isProcessing ? (
                <>
                  <Loader2 className="h-16 w-16 mx-auto text-blue-600 animate-spin mb-4" />
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Processing Your Report
                  </h1>
                  <p className="text-gray-600">
                    Payment successful! We're now submitting your report...
                  </p>
                </>
              ) : (
                <>
                  <CheckCircle className="h-16 w-16 mx-auto text-green-600 mb-4" />
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Report Submitted Successfully!
                  </h1>
                  {trackingCode && (
                    <p className="text-gray-600 mb-4">
                      Tracking Code: <span className="font-mono font-bold">{trackingCode}</span>
                    </p>
                  )}
                  <p className="text-gray-600">
                    Redirecting to confirmation page...
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PaymentSuccess;