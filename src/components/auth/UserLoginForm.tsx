import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import UserSignupForm from "./UserSignupForm";
import TrackingCodeSearch from "@/components/reports/TrackingCodeSearch";

const UserLoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  const { user, profile } = useAuth();
  const useNavigateHook = useNavigate();

  React.useEffect(() => {
    if (user && profile) {
      if (profile.admin_role) {
        useNavigateHook("/admin");
      } else {
        useNavigateHook("/my-reports");
      }
    }
  }, [user, profile, useNavigateHook]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const { error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        if (error.message.toLowerCase().includes("email not confirmed")) {
          toast({
            title: "Email verification required",
            description:
              "Please check your inbox and click the link to verify your email before signing in.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        throw error;
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in",
      });
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F1F0EC] text-[#0B1220] font-sans">
      <main className="flex-grow flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] bg-white/70 border border-[#0B1220]/10 rounded-full px-4 py-1.5 inline-block mb-4">
              User Portal
            </span>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight mb-2">
              YaraCheck Access Center
            </h1>
            <p className="text-[#0B1220]/70 text-base">
              Sign in to track your reports or search for missing items
            </p>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 bg-white/80 border border-[#0B1220]/5 p-1 rounded-2xl shadow-sm mb-6">
              <TabsTrigger value="login" className="rounded-xl font-medium">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="signup" className="rounded-xl font-medium">
                Sign Up
              </TabsTrigger>
              <TabsTrigger value="track" className="rounded-xl font-medium">
                Track Report
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-0">
              <Card className="w-full max-w-md mx-auto bg-white p-2 rounded-3xl border border-[#0B1220]/5 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-center font-display text-xl">
                    Sign In
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-5">
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
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 rounded-xl bg-[#F8F8F7] border-[#0B1220]/10 py-3 font-mono text-sm"
                          required
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
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-10 rounded-xl bg-[#F8F8F7] border-[#0B1220]/10 py-3"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0B1220]/50 hover:text-[#0B1220] focus:outline-none"
                        >
                          {showPassword ? (
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
                          Signing In...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="signup" className="mt-0">
              <UserSignupForm onSwitchToLogin={() => setActiveTab("login")} />
            </TabsContent>

            <TabsContent value="track" className="mt-0">
              <TrackingCodeSearch />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default UserLoginForm;
