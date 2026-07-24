import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StolenItemsDashboard from "./StolenItemsDashboard";
import CountryStats from "./CountryStats";
import ShareholderDashboard from "./ShareholderDashboard";
import FinancialDashboard from "../reports/FinancialDashboard";
import ROIManagement from "../roi/ROIManagement";
import AdminManagement from "./AdminManagement";
import { AssetsDashboard } from "./AssetsDashboard";
import AnonymousMessagesDashboard from "./AnonymousMessagesDashboard";
import {
  BarChart3,
  Globe,
  DollarSign,
  FileText,
  Users,
  Package,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface AdminDashboardProps {
  isSuper: boolean;
}

const AdminDashboard = ({ isSuper }: AdminDashboardProps) => {
  const { profile } = useAuth();

  const permissions = profile?.permissions as any;
  const canViewAssets =
    isSuper ||
    profile?.admin_role === "shareholder" ||
    permissions?.can_view_assets;
  const canViewReports = isSuper || permissions?.can_view_reports;

  if (
    profile?.admin_role === ("shareholder" as any) &&
    !permissions?.can_view_assets
  ) {
    return <ShareholderDashboard />;
  }

  const showCountriesTab = isSuper || profile?.admin_role === "director";

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Admin Dashboard
        </h1>
      </div>

      <Tabs
        defaultValue={canViewReports ? "reports" : "analytics"}
        className="space-y-6"
      >
        <div className="w-full overflow-x-auto pb-2">
          <TabsList className="inline-flex h-auto min-h-10 items-center justify-start sm:justify-center rounded-xl bg-slate-100 p-1.5 text-slate-700 w-full sm:w-auto flex-wrap gap-1">
            {canViewReports && (
              <TabsTrigger
                value="reports"
                className="flex items-center gap-2 py-2 px-3 text-xs sm:text-sm font-medium rounded-lg"
              >
                <FileText className="h-4 w-4" />
                <span>Reports</span>
              </TabsTrigger>
            )}
            <TabsTrigger
              value="analytics"
              className="flex items-center gap-2 py-2 px-3 text-xs sm:text-sm font-medium rounded-lg"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
            {showCountriesTab && (
              <TabsTrigger
                value="countries"
                className="flex items-center gap-2 py-2 px-3 text-xs sm:text-sm font-medium rounded-lg"
              >
                <Globe className="h-4 w-4" />
                <span>Countries</span>
              </TabsTrigger>
            )}
            <TabsTrigger
              value="financials"
              className="flex items-center gap-2 py-2 px-3 text-xs sm:text-sm font-medium rounded-lg"
            >
              <DollarSign className="h-4 w-4" />
              <span>Financials</span>
            </TabsTrigger>
            {canViewAssets && (
              <TabsTrigger
                value="assets"
                className="flex items-center gap-2 py-2 px-3 text-xs sm:text-sm font-medium rounded-lg"
              >
                <Package className="h-4 w-4" />
                <span>Assets</span>
              </TabsTrigger>
            )}
            {isSuper && (
              <TabsTrigger
                value="management"
                className="flex items-center gap-2 py-2 px-3 text-xs sm:text-sm font-medium rounded-lg"
              >
                <Users className="h-4 w-4" />
                <span>Management</span>
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        {canViewReports && (
          <TabsContent value="reports" className="space-y-6">
            <StolenItemsDashboard isSuper={isSuper} />
            {(isSuper ||
              profile?.admin_role === "director" ||
              (profile?.permissions as any)?.can_view_anonymous_messages) && (
              <div className="mt-8 space-y-4">
                <h2 className="text-lg sm:text-xl font-semibold text-slate-800">
                  Anonymous Messages
                </h2>
                <AnonymousMessagesDashboard />
              </div>
            )}
          </TabsContent>
        )}

        {showCountriesTab && (
          <TabsContent value="countries">
            <CountryStats adminProfile={profile} />
          </TabsContent>
        )}

        <TabsContent value="financials">
          {isSuper ? (
            <div className="space-y-6">
              <FinancialDashboard canViewFinancials={true} />
              <ROIManagement />
            </div>
          ) : (
            <FinancialDashboard
              canViewFinancials={
                (profile?.admin_role as any) === "shareholder" ||
                (permissions as any)?.can_view_financials
              }
            />
          )}
        </TabsContent>

        {canViewAssets && (
          <TabsContent value="assets">
            <AssetsDashboard />
          </TabsContent>
        )}

        {isSuper && (
          <TabsContent value="management">
            <AdminManagement />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
