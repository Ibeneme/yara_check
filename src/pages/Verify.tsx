
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
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Shield, Key, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const loginFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

const Verify = () => {
  const navigate = useNavigate();
  const { user, isAdmin, profile, loading, adminLogin } = useAuth();
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
      <div className="container max-w-md mx-auto py-12 px-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, show redirecting message
  if (user) {
    return (
      <div className="container max-w-md mx-auto py-12 px-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Redirecting to admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold text-center mb-2">
        Administrator Access
      </h1>
      <p className="text-center text-gray-600 mb-8">
        This area is restricted to authorized personnel only
      </p>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-center mb-6">
          <div className="bg-padiman-lightBlue p-3 rounded-full">
            <Shield className="h-8 w-8 text-padiman-blue" />
          </div>
        </div>

        {loginError && (
          <Alert className="mb-4 bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">Login Error</AlertTitle>
            <AlertDescription className="text-red-700">
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="admin@example.com" 
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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full bg-padiman-blue hover:bg-padiman-darkBlue"
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

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-center text-gray-600">
            For reporting lost or found items, no login is required. 
            <Button 
              variant="link" 
              onClick={() => navigate("/")} 
              className="pl-1 text-padiman-blue"
            >
              Return to homepage
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Verify;
