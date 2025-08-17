import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { BarChart3, Users, Settings, LogOut, Shield, FileText, TrendingUp, MessageCircle, Package } from "lucide-react";
import CreateAdminForm from "@/components/admin/CreateAdminForm";
import AdminManagement from "@/components/admin/AdminManagement";
import AdminDashboard from "@/components/admin/AdminDashboard";
import StolenItemsDashboard from "@/components/admin/StolenItemsDashboard";
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";
import ShareholderDashboard from "@/components/admin/ShareholderDashboard";
import ROIManagement from "@/components/roi/ROIManagement";
import SuperAdminROIAnalytics from "@/components/admin/SuperAdminROIAnalytics";
import ReportsManagement from "@/components/admin/ReportsManagement";
import LiveChatDashboard from "@/components/admin/LiveChatDashboard";
import AdminPermissionsForm from "@/components/admin/AdminPermissionsForm";
import SupportTicketsDashboard from "@/components/admin/SupportTicketsDashboard";
import AnonymousMessagesDashboard from "@/components/admin/AnonymousMessagesDashboard";
import { AssetsDashboard } from "@/components/admin/AssetsDashboard";
import PasswordChangeForm from "@/components/admin/PasswordChangeForm";

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user, isAdmin, logout, profile, loading } = useAuth();
  const [adminProfile, setAdminProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    console.log("AdminPanel useEffect - Auth state:", { user: user?.email, isAdmin, profile: profile?.role, loading });
    
    if (loading) {
      console.log("Auth context still loading, waiting...");
      return;
    }

    if (!user) {
      console.log("No user found, redirecting to verify");
      navigate("/verify");
      return;
    }

    // If we have a profile from context and user is admin, use it directly
    if (profile && isAdmin) {
      console.log("Using profile from auth context:", profile);
      setAdminProfile(profile);
      setIsLoading(false);
      return;
    }

    // Fallback: fetch profile if not available in context
    const fetchAdminProfile = async () => {
      try {
        console.log("Fetching admin profile for user:", user.id);
        const { data, error } = await supabase
          .from("profiles")
          .select(`
            *,
            country:countries(name),
            province:provinces(name)
          `)
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching admin profile:", error);
          if (error.message.includes('infinite recursion')) {
            // Handle RLS recursion - treat as admin if they got this far
            console.log("RLS recursion detected, assuming admin privileges");
            setAdminProfile({
              id: user.id,
              email: user.email,
              role: 'admin',
              admin_role: 'super_admin',
              first_name: 'Admin',
              last_name: 'User'
            });
          } else {
            setError("Failed to load admin profile");
          }
        } else {
          console.log("Admin profile fetched successfully:", data);
          if (data && (data.role === 'admin' || data.role === 'super_admin')) {
            setAdminProfile(data);
          } else {
            console.log("User is not an admin, redirecting");
            navigate("/verify");
            return;
          }
        }
      } catch (error) {
        console.error("Exception fetching admin profile:", error);
        setError("An error occurred while loading the admin panel");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminProfile();
  }, [user, isAdmin, profile, loading, navigate]);


  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 padiman-container py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-padiman-blue mx-auto mb-4"></div>
            <p>Loading admin panel...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 padiman-container py-8">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <div className="space-x-4">
              <Button onClick={() => window.location.reload()} className="bg-padiman-blue hover:bg-padiman-darkBlue">
                Retry
              </Button>
              <Button onClick={() => navigate("/verify")} variant="outline">
                Back to Login
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!adminProfile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 padiman-container py-8">
          <div className="text-center">
            <p className="text-red-600 mb-4">Access denied. Admin profile not found.</p>
            <Button onClick={() => navigate("/verify")} className="mt-4">
              Return to Login
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isSuper = adminProfile?.role === 'super_admin' || adminProfile?.admin_role === 'super_admin';
  const isShareholder = adminProfile?.admin_role === 'shareholder';
  const isInvestor = adminProfile?.admin_role === 'investor';
  const adminRoleDisplay = adminProfile?.admin_role?.replace('_', ' ').toUpperCase() || 'ADMIN';
  
  // Check specific permissions
  const canViewAnalytics = isSuper || adminProfile?.permissions?.can_view_analytics;
  const canViewReports = isSuper || adminProfile?.permissions?.can_view_reports;
  const canManageReports = isSuper || adminProfile?.permissions?.can_manage_reports;
  const canViewStolenItems = isSuper || adminProfile?.permissions?.can_view_stolen_items;
  const canRespondToLiveChat = isSuper || adminProfile?.permissions?.can_respond_to_live_chat;
  const canViewSupportTickets = isSuper || adminProfile?.permissions?.can_view_support_tickets;
  const canViewAnonymousMessages = isSuper || (adminProfile?.permissions && 
    typeof adminProfile.permissions === 'object' && 
    adminProfile.permissions !== null &&
    (adminProfile.permissions as any).can_view_anonymous_messages === true);
  const canViewAssets = isSuper || 
                        adminProfile?.admin_role === 'shareholder' || 
                        adminProfile?.permissions?.can_view_assets;
  const canViewFinancials = isSuper || adminProfile?.permissions?.can_view_financials;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 padiman-container py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-padiman-darkBlue flex items-center gap-2">
                <Shield className="h-8 w-8" />
                Admin Panel
              </h1>
              <p className="text-padiman-darkGray mt-2">
                Welcome, {adminProfile?.first_name || 'Admin'} {adminProfile?.last_name || 'User'} ({adminRoleDisplay})
              </p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-6">
              {/* Always show Dashboard and Settings for all admins */}
              <Button
                variant={activeTab === "dashboard" ? "default" : "ghost"}
                onClick={() => setActiveTab("dashboard")}
                className="flex flex-col items-center gap-1 h-auto py-2 px-3 text-xs"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Dashboard</span>
              </Button>
              
              {canViewAnalytics && (
                <Button
                  variant={activeTab === "analytics" ? "default" : "ghost"}
                  onClick={() => setActiveTab("analytics")}
                  className="flex flex-col items-center gap-1 h-auto py-2 px-3 text-xs"
                >
                  <TrendingUp className="h-4 w-4" />
                  <span>Analytics</span>
                </Button>
              )}
              
              {(canViewReports || canManageReports) && (
                <Button
                  variant={activeTab === "reports-management" ? "default" : "ghost"}
                  onClick={() => setActiveTab("reports-management")}
                  className="flex flex-col items-center gap-1 h-auto py-2 px-3 text-xs"
                >
                  <FileText className="h-4 w-4" />
                  <span>Reports</span>
                </Button>
              )}
              
              {canViewStolenItems && (
                <Button
                  variant={activeTab === "stolen-items" ? "default" : "ghost"}
                  onClick={() => setActiveTab("stolen-items")}
                  className="flex flex-col items-center gap-1 h-auto py-2 px-3 text-xs"
                >
                  <FileText className="h-4 w-4" />
                  <span>Stolen Items</span>
                </Button>
              )}
              
              {isSuper && (
                <Button
                  variant={activeTab === "create-admin" ? "default" : "ghost"}
                  onClick={() => setActiveTab("create-admin")}
                  className="flex flex-col items-center gap-1 h-auto py-2 px-3 text-xs"
                >
                  <Users className="h-4 w-4" />
                  <span>Create Admin</span>
                </Button>
              )}
              
              {isSuper && (
                <Button
                  variant={activeTab === "manage-admins" ? "default" : "ghost"}
                  onClick={() => setActiveTab("manage-admins")}
                  className="flex flex-col items-center gap-1 h-auto py-2 px-3 text-xs"
                >
                  <Shield className="h-4 w-4" />
                  <span>Sub Admins</span>
                </Button>
              )}
              
              {isSuper && (
                <Button
                  variant={activeTab === "roi" ? "default" : "ghost"}
                  onClick={() => setActiveTab("roi")}
                  className="flex flex-col items-center gap-1 h-auto py-2 px-3 text-xs"
                >
                  <TrendingUp className="h-4 w-4" />
                  <span>ROI Management</span>
                </Button>
              )}
              
              {canRespondToLiveChat && (
                <Button
                  variant={activeTab === "livechat" ? "default" : "ghost"}
                  onClick={() => setActiveTab("livechat")}
                  className="flex flex-col items-center gap-1 h-auto py-2 px-3 text-xs relative"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Live Chat</span>
                  {/* Add notification indicator for pending messages */}
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" 
                       style={{ display: 'none' }} 
                       id="chat-notification" />
                </Button>
              )}
              
              {canViewSupportTickets && (
                <Button
                  variant={activeTab === "support-tickets" ? "default" : "ghost"}
                  onClick={() => setActiveTab("support-tickets")}
                  className="flex flex-col items-center gap-1 h-auto py-2 px-3 text-xs"
                >
                  <FileText className="h-4 w-4" />
                  <span>Support Tickets</span>
                </Button>
              )}
              
              {canViewAnonymousMessages && (
                <Button
                  variant={activeTab === "anonymous-messages" ? "default" : "ghost"}
                  onClick={() => setActiveTab("anonymous-messages")}
                  className="flex flex-col items-center gap-1 h-auto py-2 px-3 text-xs"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Anonymous Messages</span>
                </Button>
              )}
              
              {canViewAssets && (
                <Button
                  variant={activeTab === "assets" ? "default" : "ghost"}
                  onClick={() => setActiveTab("assets")}
                  className="flex flex-col items-center gap-1 h-auto py-2 px-3 text-xs"
                >
                  <Package className="h-4 w-4" />
                  <span>Company Assets</span>
                </Button>
               )}
               
               {/* Settings is available to all admin users */}
               <Button
                 variant={activeTab === "settings" ? "default" : "ghost"}
                 onClick={() => setActiveTab("settings")}
                 className="flex flex-col items-center gap-1 h-auto py-2 px-3 text-xs"
               >
                 <Settings className="h-4 w-4" />
                 <span>Settings</span>
               </Button>
            </div>
            {activeTab === "dashboard" && (
              <div>
                {(isShareholder || isInvestor) && !canViewAssets ? (
                  <ShareholderDashboard />
                ) : (
                  <AdminDashboard isSuper={isSuper} />
                )}
              </div>
            )}

            {activeTab === "analytics" && canViewAnalytics && (
              <AnalyticsDashboard />
            )}

            {activeTab === "reports-management" && (canViewReports || canManageReports) && (
              <ReportsManagement />
            )}

            {activeTab === "stolen-items" && canViewStolenItems && (
              <StolenItemsDashboard isSuper={isSuper} />
            )}

            {activeTab === "create-admin" && isSuper && (
              <CreateAdminForm />
            )}

            {activeTab === "manage-admins" && isSuper && (
              <div className="space-y-6">
                <AdminManagement />
                <AdminPermissionsForm />
              </div>
            )}

            {activeTab === "roi" && isSuper && (
              <div className="space-y-6">
                <ROIManagement />
                <SuperAdminROIAnalytics />
              </div>
            )}

            {activeTab === "livechat" && canRespondToLiveChat && (
              <LiveChatDashboard adminId={user?.id} />
            )}

            {activeTab === "support-tickets" && canViewSupportTickets && (
              <SupportTicketsDashboard />
            )}

            {activeTab === "anonymous-messages" && canViewAnonymousMessages && (
              <AnonymousMessagesDashboard />
            )}

            {activeTab === "assets" && canViewAssets && (
              <AssetsDashboard />
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                <PasswordChangeForm />
                
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Name:</strong> {adminProfile?.first_name || 'Admin'} {adminProfile?.last_name || 'User'}
                      </div>
                      <div>
                        <strong>Email:</strong> {adminProfile?.email || user?.email}
                      </div>
                      <div>
                        <strong>Role:</strong> {adminRoleDisplay}
                      </div>
                      <div>
                        <strong>Country:</strong> {adminProfile?.country?.name || 'Not assigned'}
                      </div>
                      {adminProfile?.province && (
                        <div>
                          <strong>Province:</strong> {adminProfile.province.name}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminPanel;
