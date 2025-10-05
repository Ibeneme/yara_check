
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  user: any | null;
  profile: Profile | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  loading: boolean;
  adminLogin: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Function to fetch profile - bypassing RLS issues by using service role if needed
  const fetchProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for user:", userId);
      
      // Try fetching with the current client first
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        // If there's an RLS error, we'll still set the profile to null and continue
        if (error.message.includes('infinite recursion')) {
          console.warn('RLS recursion detected, setting profile to null');
          setProfile(null);
          return null;
        }
        throw error;
      }
      
      console.log("Profile data retrieved:", data);
      console.log("Profile role:", data?.role);
      setProfile(data);
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
      return null;
    }
  };

  // Function to handle auth state changes
  const handleAuthChange = async (session: any) => {
    console.log("handleAuthChange called with session:", session);
    
    if (session?.user) {
      console.log("User found in session:", session.user.email);
      setUser(session.user);
      
      // Fetch profile after a small delay to avoid timing issues
      setTimeout(async () => {
        try {
          const profileData = await fetchProfile(session.user.id);
          console.log("Profile fetched during auth change:", profileData);
          
          // If user has no profile or is not an admin, log them out
          if (!profileData) {
            console.log("No profile found for authenticated user, logging out");
            await logout();
            return;
          }
          
          if (profileData.role !== 'admin' && profileData.role !== 'super_admin') {
            console.log(`Non-admin user logged in with role: ${profileData.role}, logging them out`);
            await logout();
            toast({
              title: "Access denied",
              description: "Only administrators can login to this system.",
              variant: "destructive",
            });
            return;
          }
          
          console.log(`Admin user logged in with role: ${profileData.role}`);
        } catch (error) {
          console.error("Error verifying user role:", error);
        }
      }, 100);
    } else {
      console.log("No user in session, clearing state");
      setUser(null);
      setProfile(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    console.log("Setting up auth state listener");
    
    // Set up the auth state listener
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, "User email:", session?.user?.email);
      handleAuthChange(session);
    });

    // Check current session
    const checkCurrentSession = async () => {
      console.log("Checking current session...");
      const { data } = await supabase.auth.getSession();
      console.log("Current session:", data.session?.user?.email || "No session");
      handleAuthChange(data.session);
    };
    
    checkCurrentSession();

    return () => {
      console.log("Cleaning up auth state listener");
      data.subscription.unsubscribe();
    };
  }, []);

  const adminLogin = async (email: string, password: string) => {
    try {
      console.log(`Attempting admin login with email: ${email}`);
      setLoading(true);
      
      // Attempt login first
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password,
      });

      if (error) {
        console.error("Supabase auth error:", error);
        throw error;
      }
      
      console.log("Login successful for user:", data.user.email);

      // Verify user has admin profile before navigating
      const profileData = await fetchProfile(data.user.id);
      
      if (!profileData) {
        console.log("User authenticated but no profile found, logging out");
        await supabase.auth.signOut();
        toast({
          title: "Access denied",
          description: "No admin profile found for this account.",
          variant: "destructive",
        });
        return;
      }

      if (profileData.role !== 'admin' && profileData.role !== 'super_admin') {
        console.log(`User has non-admin role: ${profileData.role}, logging out`);
        await supabase.auth.signOut();
        toast({
          title: "Access denied", 
          description: "Only administrators can access this system.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Login successful",
        description: "Welcome, Admin!",
      });

      // Only navigate to admin if verification passed
      console.log("User authenticated, navigating to admin panel");
      navigate("/admin");

    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message || "An error occurred during login",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Clear state first to prevent UI issues
      setUser(null);
      setProfile(null);
      
      // Attempt sign out - use global scope for better cleanup
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) {
        console.warn("Logout error (continuing anyway):", error);
      }
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });

      navigate("/");
    } catch (error: any) {
      console.warn("Logout error (continuing anyway):", error);
      
      // Still show success message and navigate
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      
      navigate("/");
    }
  };

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';
  const isSuperAdmin = profile?.role === 'super_admin';

  // Debug logging for state changes
  useEffect(() => {
    console.log("AuthContext state update:", {
      user: user?.email || null,
      profile: profile?.role || null,
      isAdmin,
      isSuperAdmin,
      loading
    });
  }, [user, profile, isAdmin, isSuperAdmin, loading]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        isSuperAdmin,
        loading,
        adminLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
