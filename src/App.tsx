import React, { useEffect } from "react";
import "./i18n";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Verify from "./pages/Verify";
import ItemVerification from "./pages/ItemVerification";
import SubmitReport from "./pages/SubmitReport";
import ReportConfirmation from "./pages/ReportConfirmation";
import PaymentConfirmation from "./pages/PaymentConfirmation";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentSuccessPaystack from "./pages/PaymentSuccessPaystack";
import PaymentSuccessFlutterwave from "./pages/PaymentSuccessFlutterwave";
import MyReports from "./pages/MyReports";
import Support from "./pages/Support";
import AdminPanel from "./pages/AdminPanel";
import PersonReportForm from "./pages/PersonReportForm";
import DeviceReportForm from "./pages/DeviceReportForm";
import VehicleReportForm from "./pages/VehicleReportForm";
import AccountReportForm from "./pages/AccountReportForm";
import ReputationReportForm from "./pages/ReputationReportForm";
import HouseholdReportForm from "./pages/HouseholdReportForm";
import PersonalReportForm from "./pages/PersonalReportForm";
import PetReportForm from "./pages/PetReportForm";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookiePolicy from "./pages/CookiePolicy";
import { AuthProvider } from "./contexts/AuthContext";
import UserAuth from "./pages/UserAuth";
import ContactSupport from "./pages/ContactSupport";
import Header from "./components/Header";
import Footer from "./components/Footer";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// ScrollToTop helper component to reset scroll position on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [pathname]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <Header />
          <div className="w-full overflow-x-hidden flex flex-col bg-[#F1F0EC] text-[#0B1220] selection:bg-[#0B1220] selection:text-[#F1F0EC]">
            <Toaster />
            <Sonner />
            <div className="w-full flex-1 flex flex-col min-w-0 pt-[90px]">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/verify-item" element={<ItemVerification />} />
                <Route path="/admin-login" element={<Verify />} />
                <Route path="/verify" element={<Verify />} />
                <Route path="/user-auth" element={<UserAuth />} />
                <Route path="/submit-report" element={<SubmitReport />} />
                <Route
                  path="/submit-report/person"
                  element={<PersonReportForm />}
                />
                <Route
                  path="/submit-report/device"
                  element={<DeviceReportForm />}
                />
                <Route
                  path="/submit-report/household"
                  element={<HouseholdReportForm />}
                />
                <Route
                  path="/submit-report/personal"
                  element={<PersonalReportForm />}
                />
                <Route
                  path="/submit-report/vehicle"
                  element={<VehicleReportForm />}
                />
                <Route
                  path="/submit-report/account"
                  element={<AccountReportForm />}
                />
                <Route
                  path="/submit-report/reputation"
                  element={<ReputationReportForm />}
                />
                <Route path="/submit-report/pet" element={<PetReportForm />} />
                <Route
                  path="/report-confirmation"
                  element={<ReportConfirmation />}
                />
                <Route path="/confirmation" element={<PaymentConfirmation />} />
                <Route
                  path="/payment-confirmation"
                  element={<PaymentConfirmation />}
                />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route
                  path="/payment-success-paystack"
                  element={<PaymentSuccessPaystack />}
                />
                <Route
                  path="/payment-success-flutterwave"
                  element={<PaymentSuccessFlutterwave />}
                />
                <Route path="/my-reports" element={<MyReports />} />
                <Route path="/support" element={<Support />} />
                <Route path="/contact-support" element={<ContactSupport />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/cookies" element={<CookiePolicy />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Footer />
          </div>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
