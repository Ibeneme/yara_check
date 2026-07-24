import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart3,
  Users,
  Settings,
  LogOut,
  Shield,
  FileText,
  TrendingUp,
  MessageCircle,
  Package,
} from "lucide-react";
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
    if (loading) return;

    if (!user) {
      navigate("/verify");
      return;
    }

    if (profile && isAdmin) {
      setAdminProfile(profile);
      setIsLoading(false);
      return;
    }

    const fetchAdminProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select(
            `
            *,
            country:countries(name),
            province:provinces(name)
          `
          )
          .eq("id", user.id)
          .maybeSingle();

        if (error) {
          if (error.message.includes("infinite recursion")) {
            setAdminProfile({
              id: user.id,
              email: user.email,
              role: "admin",
              admin_role: "super_admin",
              first_name: "Admin",
              last_name: "User",
            });
          } else {
            setError("Failed to load admin profile");
          }
        } else {
          if (data && (data.role === "admin" || data.role === "super_admin")) {
            setAdminProfile(data);
          } else {
            navigate("/verify");
            return;
          }
        }
      } catch (err) {
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

  // Shared tab-pill style — active tab reads as a stamped case tab, same
  // logic as the header nav, just in a dense grid.
  const tabClass = (tab: string) =>
    `flex flex-shrink-0 sm:flex-shrink snap-start w-[94px] sm:w-auto flex-col items-center justify-center gap-1 sm:gap-1.5 h-auto py-2.5 sm:py-3 px-1.5 sm:px-2 text-[11px] sm:text-xs font-medium leading-tight rounded-lg transition-colors font-sans ${
      activeTab === tab
        ? "bg-[#0B1220] text-[#F1F0EC] hover:bg-[#0B1220] hover:brightness-110"
        : "text-[#0B1220]/70 hover:bg-[#0B1220]/[0.05]"
    }`;

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F1F0EC] font-sans overflow-x-hidden">
        <Header />
        <main className="flex-1 yaracheck-container py-8 flex items-center justify-center">
          <div className="text-center px-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0B1220] mx-auto mb-4"></div>
            <p className="text-[#0B1220]/60">Loading admin panel...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F1F0EC] font-sans overflow-x-hidden">
        <Header />
        <main className="flex-1 yaracheck-container py-8 flex items-center justify-center">
          <div className="text-center px-4">
            <p className="text-[#B3261E] mb-4">{error}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                onClick={() => window.location.reload()}
                className="bg-[#FF5A36] hover:brightness-95 text-white font-sans font-semibold"
              >
                Retry
              </Button>
              <Button
                onClick={() => navigate("/verify")}
                variant="outline"
                className="border-[#0B1220]/20 text-[#0B1220]/70 hover:bg-[#0B1220]/[0.05]"
              >
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
      <div className="min-h-screen flex flex-col bg-[#F1F0EC] font-sans overflow-x-hidden">
        <Header />
        <main className="flex-1 yaracheck-container py-8 flex items-center justify-center">
          <div className="text-center px-4">
            <p className="text-[#B3261E] mb-4">
              Access denied. Admin profile not found.
            </p>
            <Button
              onClick={() => navigate("/verify")}
              className="mt-4 bg-[#FF5A36] hover:brightness-95 text-white font-sans font-semibold"
            >
              Return to Login
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isSuper =
    adminProfile?.role === "super_admin" ||
    adminProfile?.admin_role === "super_admin";
  const isShareholder = adminProfile?.admin_role === "shareholder";
  const isInvestor = adminProfile?.admin_role === "investor";
  const adminRoleDisplay =
    adminProfile?.admin_role?.replace("_", " ").toUpperCase() || "ADMIN";

  const canViewAnalytics =
    isSuper || adminProfile?.permissions?.can_view_analytics;
  const canViewReports = isSuper || adminProfile?.permissions?.can_view_reports;
  const canManageReports =
    isSuper || adminProfile?.permissions?.can_manage_reports;
  const canViewStolenItems =
    isSuper || adminProfile?.permissions?.can_view_stolen_items;
  const canRespondToLiveChat =
    isSuper || adminProfile?.permissions?.can_respond_to_live_chat;
  const canViewSupportTickets =
    isSuper || adminProfile?.permissions?.can_view_support_tickets;
  const canViewAnonymousMessages =
    isSuper ||
    (adminProfile?.permissions &&
      typeof adminProfile.permissions === "object" &&
      adminProfile.permissions !== null &&
      (adminProfile.permissions as any).can_view_anonymous_messages === true);
  const canViewAssets =
    isSuper ||
    adminProfile?.admin_role === "shareholder" ||
    adminProfile?.permissions?.can_view_assets;

  return (
    <div className="min-h-screen flex flex-col bg-[#F1F0EC] font-sans overflow-x-hidden w-full">
      <Header />
      <main className="flex-1 yaracheck-container py-6 md:py-8 px-3 sm:px-6 lg:px-8 w-full max-w-full overflow-x-hidden">
        <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 w-full min-w-0">
          {/* Header Section with Responsive Layout */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 sm:p-6 rounded-xl border border-[#0B1220]/10 shadow-sm w-full min-w-0 overflow-hidden">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-semibold text-[#0B1220] flex items-center gap-2 font-sans truncate">
                <Shield className="h-7 w-7 sm:h-8 sm:w-8 text-[#0B1220] flex-shrink-0" />
                <span className="truncate">Admin Panel</span>
              </h1>
              <p className="text-sm sm:text-base text-[#0B1220]/60 mt-1 truncate">
                Welcome, {adminProfile?.first_name || "Admin"}{" "}
                {adminProfile?.last_name || "User"}{" "}
                <span className="font-['IBM_Plex_Mono'] text-xs uppercase tracking-wider text-[#0B1220]/50">
                  ({adminRoleDisplay})
                </span>
              </p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center justify-center gap-2 w-full sm:w-auto border-[#0B1220]/20 text-[#0B1220]/70 hover:bg-[#0B1220]/[0.05] shrink-0"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span>Logout</span>
            </Button>
          </div>

          <div className="space-y-6 w-full min-w-0">
            {/* Responsive Navigation Grid */}
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-1.5 -mx-2 px-2 py-2 sm:mx-0 sm:px-3 sm:py-3 sm:overflow-visible sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 sm:gap-2 bg-white rounded-xl border border-[#0B1220]/10 shadow-sm w-full max-w-full">
              <Button
                variant={activeTab === "dashboard" ? "default" : "ghost"}
                onClick={() => setActiveTab("dashboard")}
                className={tabClass("dashboard")}
              >
                <BarChart3 className="h-4 w-4 shrink-0" />
                <span className="text-center truncate">Dashboard</span>
              </Button>

              {canViewAnalytics && (
                <Button
                  variant={activeTab === "analytics" ? "default" : "ghost"}
                  onClick={() => setActiveTab("analytics")}
                  className={tabClass("analytics")}
                >
                  <TrendingUp className="h-4 w-4 shrink-0" />
                  <span className="text-center truncate">Analytics</span>
                </Button>
              )}

              {(canViewReports || canManageReports) && (
                <Button
                  variant={
                    activeTab === "reports-management" ? "default" : "ghost"
                  }
                  onClick={() => setActiveTab("reports-management")}
                  className={tabClass("reports-management")}
                >
                  <FileText className="h-4 w-4 shrink-0" />
                  <span className="text-center truncate">Reports</span>
                </Button>
              )}

              {canViewStolenItems && (
                <Button
                  variant={activeTab === "stolen-items" ? "default" : "ghost"}
                  onClick={() => setActiveTab("stolen-items")}
                  className={tabClass("stolen-items")}
                >
                  <FileText className="h-4 w-4 shrink-0" />
                  <span className="text-center truncate">Stolen Items</span>
                </Button>
              )}

              {isSuper && (
                <Button
                  variant={activeTab === "create-admin" ? "default" : "ghost"}
                  onClick={() => setActiveTab("create-admin")}
                  className={tabClass("create-admin")}
                >
                  <Users className="h-4 w-4 shrink-0" />
                  <span className="text-center truncate">Create Admin</span>
                </Button>
              )}

              {isSuper && (
                <Button
                  variant={activeTab === "manage-admins" ? "default" : "ghost"}
                  onClick={() => setActiveTab("manage-admins")}
                  className={tabClass("manage-admins")}
                >
                  <Shield className="h-4 w-4 shrink-0" />
                  <span className="text-center truncate">Sub Admins</span>
                </Button>
              )}

              {isSuper && (
                <Button
                  variant={activeTab === "roi" ? "default" : "ghost"}
                  onClick={() => setActiveTab("roi")}
                  className={tabClass("roi")}
                >
                  <TrendingUp className="h-4 w-4 shrink-0" />
                  <span className="text-center truncate">ROI Management</span>
                </Button>
              )}

              {canRespondToLiveChat && (
                <Button
                  variant={activeTab === "livechat" ? "default" : "ghost"}
                  onClick={() => setActiveTab("livechat")}
                  className={`${tabClass("livechat")} relative`}
                >
                  <MessageCircle className="h-4 w-4 shrink-0" />
                  <span className="text-center truncate">Live Chat</span>
                  <div
                    className="absolute -top-1 -right-1 w-3 h-3 bg-[#B3261E] rounded-full animate-pulse"
                    style={{ display: "none" }}
                    id="chat-notification"
                  />
                </Button>
              )}

              {canViewSupportTickets && (
                <Button
                  variant={
                    activeTab === "support-tickets" ? "default" : "ghost"
                  }
                  onClick={() => setActiveTab("support-tickets")}
                  className={tabClass("support-tickets")}
                >
                  <FileText className="h-4 w-4 shrink-0" />
                  <span className="text-center truncate">Support Tickets</span>
                </Button>
              )}

              {canViewAnonymousMessages && (
                <Button
                  variant={
                    activeTab === "anonymous-messages" ? "default" : "ghost"
                  }
                  onClick={() => setActiveTab("anonymous-messages")}
                  className={tabClass("anonymous-messages")}
                >
                  <MessageCircle className="h-4 w-4 shrink-0" />
                  <span className="text-center truncate">
                    Anonymous Messages
                  </span>
                </Button>
              )}

              {canViewAssets && (
                <Button
                  variant={activeTab === "assets" ? "default" : "ghost"}
                  onClick={() => setActiveTab("assets")}
                  className={tabClass("assets")}
                >
                  <Package className="h-4 w-4 shrink-0" />
                  <span className="text-center truncate">Company Assets</span>
                </Button>
              )}

              <Button
                variant={activeTab === "settings" ? "default" : "ghost"}
                onClick={() => setActiveTab("settings")}
                className={tabClass("settings")}
              >
                <Settings className="h-4 w-4 shrink-0" />
                <span className="text-center truncate">Settings</span>
              </Button>
            </div>

            {/* Tab Panels */}
            <div className="w-full overflow-hidden min-w-0">
              {activeTab === "dashboard" &&
                ((isShareholder || isInvestor) && !canViewAssets ? (
                  <ShareholderDashboard />
                ) : (
                  <AdminDashboard isSuper={isSuper} />
                ))}

              {activeTab === "analytics" && canViewAnalytics && (
                <AnalyticsDashboard />
              )}

              {activeTab === "reports-management" &&
                (canViewReports || canManageReports) && <ReportsManagement />}

              {activeTab === "stolen-items" && canViewStolenItems && (
                <StolenItemsDashboard isSuper={isSuper} />
              )}

              {activeTab === "create-admin" && isSuper && <CreateAdminForm />}

              {activeTab === "manage-admins" && isSuper && (
                <div className="space-y-6 w-full min-w-0">
                  <AdminManagement />
                  <AdminPermissionsForm />
                </div>
              )}

              {activeTab === "roi" && isSuper && (
                <div className="space-y-6 w-full min-w-0">
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

              {activeTab === "anonymous-messages" &&
                canViewAnonymousMessages && <AnonymousMessagesDashboard />}

              {activeTab === "assets" && canViewAssets && <AssetsDashboard />}

              {activeTab === "settings" && (
                <div className="space-y-6 w-full min-w-0">
                  <PasswordChangeForm />

                  <Card className="border-[#0B1220]/10 w-full overflow-hidden">
                    <CardHeader className="border-b border-[#0B1220]/10">
                      <CardTitle className="font-sans font-semibold text-[#0B1220]">
                        Profile Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-hidden">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-[#0B1220]/70 font-sans min-w-0">
                        <div className="break-words">
                          <strong className="text-[#0B1220]">Name:</strong>{" "}
                          {adminProfile?.first_name || "Admin"}{" "}
                          {adminProfile?.last_name || "User"}
                        </div>
                        <div className="break-words">
                          <strong className="text-[#0B1220]">Email:</strong>{" "}
                          <span className="font-['IBM_Plex_Mono'] break-all">
                            {adminProfile?.email || user?.email}
                          </span>
                        </div>
                        <div className="break-words">
                          <strong className="text-[#0B1220]">Role:</strong>{" "}
                          <span className="font-['IBM_Plex_Mono'] text-xs uppercase tracking-wider">
                            {adminRoleDisplay}
                          </span>
                        </div>
                        <div className="break-words">
                          <strong className="text-[#0B1220]">Country:</strong>{" "}
                          {adminProfile?.country?.name || "Not assigned"}
                        </div>
                        {adminProfile?.province && (
                          <div className="break-words">
                            <strong className="text-[#0B1220]">
                              Province:
                            </strong>{" "}
                            {adminProfile.province.name}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminPanel;
