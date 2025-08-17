
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
import { BarChart3, Globe, DollarSign, FileText, Users, Package } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface AdminDashboardProps {
  isSuper: boolean;
}

const AdminDashboard = ({ isSuper }: AdminDashboardProps) => {
  const { profile } = useAuth();

  // Check permissions
  const permissions = profile?.permissions as any;
  const canViewAssets = isSuper || 
                        profile?.admin_role === 'shareholder' || 
                        permissions?.can_view_assets;
  const canViewReports = isSuper || permissions?.can_view_reports;
  
  
  // Shareholders with asset permissions should see the full admin dashboard
  // Only redirect to ShareholderDashboard if they DON'T have asset permissions
  if (profile?.admin_role === 'shareholder' as any && !permissions?.can_view_assets) {
    console.log('Redirecting shareholder without asset permissions to ShareholderDashboard');
    return <ShareholderDashboard />;
  }

  // Determine if the user should see the Countries tab
  const showCountriesTab = isSuper || profile?.admin_role === 'director';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
      </div>

      <Tabs defaultValue={canViewReports ? "reports" : "analytics"} className="space-y-4">
        <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
          {canViewReports && (
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Reports
            </TabsTrigger>
          )}
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          {showCountriesTab && (
            <TabsTrigger value="countries" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Countries
            </TabsTrigger>
          )}
          <TabsTrigger value="financials" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Financials
          </TabsTrigger>
          {canViewAssets && (
            <TabsTrigger value="assets" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Assets
            </TabsTrigger>
          )}
          {isSuper && (
            <TabsTrigger value="management" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Management
            </TabsTrigger>
          )}
        </TabsList>

        {canViewReports && (
          <TabsContent value="reports">
            <div className="space-y-6">
              <StolenItemsDashboard isSuper={isSuper} />
              {(isSuper || profile?.admin_role === 'director' || (profile?.permissions as any)?.can_view_anonymous_messages) && (
                <div className="mt-8">
                  <h2 className="text-xl font-semibold mb-4">Anonymous Messages</h2>
                  <AnonymousMessagesDashboard />
                </div>
              )}
            </div>
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
            <FinancialDashboard canViewFinancials={(profile?.admin_role as any) === 'shareholder' || (permissions as any)?.can_view_financials} />
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
