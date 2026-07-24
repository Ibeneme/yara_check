import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Shield, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const loginFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

const Verify = () => {
  const navigate = useNavigate();
  const { user, loading, adminLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  
  // Simple navigation check - if user exists and we're not loading, go to admin
  useEffect(() => {
    if (user && !loading) {
      console.log("User authenticated, navigating to admin panel");
      navigate("/admin");
    }
  }, [user, loading, navigate]);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onLoginSubmit = async (data: LoginFormValues) => {
    setLoginError("");
    setIsLoading(true);
    try {
      console.log(`Attempting admin login with email: ${data.email}`);
      await adminLogin(data.email, data.password);
    } catch (error: any) {
      console.error("Authentication error:", error);
      setLoginError(error.message || "An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while auth context is still loading
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center bg-[#F1F0EC] py-16">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#FF5A36]" />
            <p className="font-mono text-xs uppercase tracking-widest text-[#0B1220]/60">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // If user is authenticated, show redirecting message
  if (user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center bg-[#F1F0EC] py-16">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#FF5A36]" />
            <p className="font-mono text-xs uppercase tracking-widest text-[#0B1220]/60">Redirecting to admin panel...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow bg-[#F1F0EC] text-[#0B1220] font-sans pb-24">
        {/* HERO SECTION / HEADER */}
        <section className="relative overflow-hidden noise pt-16 pb-8">
          <div className="absolute inset-0 -z-0 opacity-40">
            <div
              className="diamond w-64 h-64 -top-10 left-[15%]"
              style={
                { "--d1": "#CFE0FF", "--d2": "#9FC1FF" } as React.CSSProperties
              }
            />
            <div
              className="diamond w-48 h-48 top-10 right-[20%]"
              style={
                { "--d1": "#FFD9CC", "--d2": "#FFB199" } as React.CSSProperties
              }
            />
          </div>

          <div className="relative max-w-md mx-auto px-6 text-center">
            <div className="w-16 h-16 rounded-3xl bg-[#CFE0FF] flex items-center justify-center mx-auto mb-6 shadow-sm border border-[#0B1220]/5">
              <Shield className="h-8 w-8 text-[#2158D9]" />
            </div>

            <span className="font-mono text-[11px] uppercase tracking-[0.2em] bg-white/70 border border-[#0B1220]/10 rounded-full px-4 py-1.5 inline-block mb-4">
              Restricted Access
            </span>

            <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight mb-3">
              Administrator Access
            </h1>
            <p className="text-[#0B1220]/70 text-base">
              This area is restricted to authorized personnel only.
            </p>
          </div>
        </section>

        {/* LOGIN FORM CONTAINER */}
        <section className="max-w-md mx-auto px-6 relative z-10">
          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-[#0B1220]/5 shadow-sm">
            {loginError && (
              <Alert className="mb-6 bg-[#FFE9E2] border-[#FF5A36]/20 rounded-2xl p-4">
                <AlertCircle className="h-4 w-4 text-[#FF5A36]" />
                <AlertTitle className="font-semibold text-[#FF5A36] ml-2">Login Error</AlertTitle>
                <AlertDescription className="text-sm text-[#0B1220]/75 mt-1">
                  {loginError}
                </AlertDescription>
              </Alert>
            )}
            
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono text-xs uppercase tracking-wider text-[#0B1220]/60">Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="admin@example.com" 
                          className="rounded-xl bg-[#F8F8F7] border-[#0B1220]/10 py-3 font-mono text-sm"
                          {...field} 
                          onChange={(e) => field.onChange(e.target.value.trim().toLowerCase())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono text-xs uppercase tracking-wider text-[#0B1220]/60">Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          className="rounded-xl bg-[#F8F8F7] border-[#0B1220]/10 py-3"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-[#0B1220] hover:bg-[#FF5A36] text-white rounded-xl py-6 font-semibold transition-colors duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : "Admin Login"}
                </Button>
              </form>
            </Form>

            <div className="mt-8 pt-6 border-t border-[#0B1220]/5 text-center">
              <p className="text-sm text-[#0B1220]/60">
                For reporting lost or found items, no login is required.{" "}
                <Button 
                  variant="link" 
                  onClick={() => navigate("/")} 
                  className="p-0 h-auto font-semibold text-[#FF5A36] hover:underline"
                >
                  Return to homepage
                </Button>
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Verify;
