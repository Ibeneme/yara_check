import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Loader2,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";

interface UserSignupFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

const UserSignupForm = ({
  onSuccess,
  onSwitchToLogin,
}: UserSignupFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
    address: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(
      "🚀 [Signup] Form submission started with email:",
      formData.email
    );

    if (formData.password !== formData.confirmPassword) {
      console.warn("⚠️ [Signup] Validation error: Passwords do not match.");
      toast({
        title: "Password mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      console.warn("⚠️ [Signup] Validation error: Password too short.");
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      console.log(
        "🛠️ [Signup] Calling supabase.auth.signUp with redirect URL:",
        redirectUrl
      );

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
            address: formData.address,
          },
        },
      });

      if (error) {
        console.error(
          "❌ [Signup] Supabase auth.signUp returned an error:",
          error
        );
        throw error;
      }

      if (
        data?.user &&
        data.user.identities &&
        data.user.identities.length === 0
      ) {
        throw new Error("User already registered");
      }

      console.log(
        "✅ [Signup] supabase.auth.signUp succeeded. User data received:",
        data
      );

      setIsSuccessModalOpen(true);

      toast({
        title: "Verification email sent",
        description:
          "Please check your inbox and click the link to verify your account.",
      });

      onSuccess?.();
    } catch (error: any) {
      console.error(
        "💥 [Signup] Caught error in handleSubmit catch block:",
        error
      );

      const errorMessage = error.message || "";
      const isAlreadyRegistered =
        errorMessage.toLowerCase().includes("already registered") ||
        errorMessage.toLowerCase().includes("already exists");

      toast({
        title: isAlreadyRegistered ? "Account already exists" : "Signup failed",
        description: isAlreadyRegistered
          ? "An account with this email already exists. Please sign in instead."
          : errorMessage || "An error occurred during signup",
        variant: "destructive",
      });

      if (isAlreadyRegistered && onSwitchToLogin) {
        setTimeout(() => {
          onSwitchToLogin();
        }, 1500);
      }
    } finally {
      setIsLoading(false);
      console.log("🏁 [Signup] Form submission process completed.");
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto relative overflow-hidden bg-white p-2 rounded-3xl border border-[#0B1220]/5 shadow-sm">
      {/* Success Modal Overlay */}
      {isSuccessModalOpen && (
        <div className="absolute inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-200">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Check Your Email!
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
            We've sent a verification link to{" "}
            <span className="font-semibold text-gray-800 dark:text-gray-100">
              {formData.email}
            </span>
            . Please check your inbox and click the link to verify your account
            before signing in.
          </p>
          <Button
            onClick={onSwitchToLogin}
            className="w-full bg-[#0B1220] hover:bg-[#FF5A36] text-white rounded-xl py-6 font-semibold transition-colors duration-300"
          >
            Proceed to Sign In
          </Button>
        </div>
      )}

      <CardHeader>
        <CardTitle className="text-center font-display text-xl">
          Create Account
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label
              htmlFor="email"
              className="font-mono text-xs uppercase tracking-wider text-[#0B1220]/60"
            >
              Email
            </Label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0B1220]/40" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="pl-10 rounded-xl bg-[#F8F8F7] border-[#0B1220]/10 py-3 font-mono text-sm"
                required
              />
            </div>
          </div>

          <div>
            <Label
              htmlFor="fullName"
              className="font-mono text-xs uppercase tracking-wider text-[#0B1220]/60"
            >
              Full Name
            </Label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0B1220]/40" />
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                className="pl-10 rounded-xl bg-[#F8F8F7] border-[#0B1220]/10 py-3 text-sm"
                required
              />
            </div>
          </div>

          <div>
            <Label
              htmlFor="phone"
              className="font-mono text-xs uppercase tracking-wider text-[#0B1220]/60"
            >
              Phone (Optional)
            </Label>
            <div className="relative mt-1">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0B1220]/40" />
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="pl-10 rounded-xl bg-[#F8F8F7] border-[#0B1220]/10 py-3 text-sm"
              />
            </div>
          </div>

          <div>
            <Label
              htmlFor="address"
              className="font-mono text-xs uppercase tracking-wider text-[#0B1220]/60"
            >
              Address (Optional)
            </Label>
            <div className="relative mt-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0B1220]/40" />
              <Input
                id="address"
                type="text"
                placeholder="Enter your address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="pl-10 rounded-xl bg-[#F8F8F7] border-[#0B1220]/10 py-3 text-sm"
              />
            </div>
          </div>

          <div>
            <Label
              htmlFor="password"
              className="font-mono text-xs uppercase tracking-wider text-[#0B1220]/60"
            >
              Password
            </Label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0B1220]/40" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="pl-10 pr-10 rounded-xl bg-[#F8F8F7] border-[#0B1220]/10 py-3"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0B1220]/50 hover:text-[#0B1220] focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <Label
              htmlFor="confirmPassword"
              className="font-mono text-xs uppercase tracking-wider text-[#0B1220]/60"
            >
              Confirm Password
            </Label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0B1220]/40" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className="pl-10 pr-10 rounded-xl bg-[#F8F8F7] border-[#0B1220]/10 py-3"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0B1220]/50 hover:text-[#0B1220] focus:outline-none"
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#0B1220] hover:bg-[#FF5A36] text-white rounded-xl py-6 font-semibold transition-colors duration-300 mt-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-sm text-[#0B1220]/70 hover:text-[#0B1220] underline"
            >
              Already have an account? Sign in
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default UserSignupForm;
