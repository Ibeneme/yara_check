import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { TrendingUp, Users, FileText, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const AnalyticsDashboard = () => {
  const { profile } = useAuth();

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["analytics", profile?.id],
    queryFn: async () => {
      const [
        personsResult,
        devicesResult,
        vehiclesResult,
        householdResult,
        personalResult,
        hackedAccountsResult,
        reputationResult,
      ] = await Promise.all([
        supabase.from("persons").select("id, status, report_date, country_id"),
        supabase.from("devices").select("id, status, report_date, country_id"),
        supabase.from("vehicles").select("id, status, report_date, country_id"),
        supabase
          .from("household_items")
          .select("id, status, report_date, country_id"),
        supabase
          .from("personal_belongings")
          .select("id, status, report_date, country_id"),
        supabase
          .from("hacked_accounts")
          .select("id, status, report_date, country_id"),
        supabase
          .from("business_reputation_reports")
          .select("id, status, report_date, country_id"),
      ]);

      const persons = personsResult.data || [];
      const devices = devicesResult.data || [];
      const vehicles = vehiclesResult.data || [];
      const household = householdResult.data || [];
      const personal = personalResult.data || [];
      const hackedAccounts = hackedAccountsResult.data || [];
      const reputation = reputationResult.data || [];

      const totalReports =
        persons.length +
        devices.length +
        vehicles.length +
        household.length +
        personal.length +
        hackedAccounts.length +
        reputation.length;
      const foundItems = [
        ...persons,
        ...devices,
        ...vehicles,
        ...household,
        ...personal,
        ...hackedAccounts,
        ...reputation,
      ].filter(
        (item) => item.status === "found" || item.status === "verified"
      ).length;

      const statusCounts = {
        missing: persons.filter((p) => p.status === "missing").length,
        pending: [
          ...devices,
          ...vehicles,
          ...household,
          ...personal,
          ...hackedAccounts,
          ...reputation,
        ].filter(
          (item) =>
            item.status === "pending" || item.status === "pending_verification"
        ).length,
        found: foundItems,
        verified: [
          ...devices,
          ...vehicles,
          ...household,
          ...personal,
          ...hackedAccounts,
          ...reputation,
        ].filter((item) => item.status === "verified").length,
      };

      const typeData = [
        { name: "Missing Persons", value: persons.length, color: "#ef4444" },
        { name: "Stolen Devices", value: devices.length, color: "#3b82f6" },
        { name: "Stolen Vehicles", value: vehicles.length, color: "#10b981" },
        { name: "Household Items", value: household.length, color: "#f59e0b" },
        {
          name: "Personal Belongings",
          value: personal.length,
          color: "#8b5cf6",
        },
        {
          name: "Hacked Accounts",
          value: hackedAccounts.length,
          color: "#ef4444",
        },
        {
          name: "Business Reputation",
          value: reputation.length,
          color: "#f97316",
        },
      ];

      const monthlyData = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        const monthReports = [
          ...persons,
          ...devices,
          ...vehicles,
          ...household,
          ...personal,
          ...hackedAccounts,
          ...reputation,
        ].filter((item) => {
          const reportDate = new Date(item.report_date);
          return reportDate >= monthStart && reportDate <= monthEnd;
        });

        monthlyData.push({
          month: date.toLocaleDateString("en-US", {
            month: "short",
            year: "2-digit",
          }),
          reports: monthReports.length,
          persons: monthReports.filter((r) =>
            persons.some((p) => p.id === r.id)
          ).length,
          devices: monthReports.filter((r) =>
            devices.some((d) => d.id === r.id)
          ).length,
          vehicles: monthReports.filter((r) =>
            vehicles.some((v) => v.id === r.id)
          ).length,
          household: monthReports.filter((r) =>
            household.some((h) => h.id === r.id)
          ).length,
          personal: monthReports.filter((r) =>
            personal.some((p) => p.id === r.id)
          ).length,
          hackedAccounts: monthReports.filter((r) =>
            hackedAccounts.some((h) => h.id === r.id)
          ).length,
          reputation: monthReports.filter((r) =>
            reputation.some((r2) => r2.id === r.id)
          ).length,
        });
      }

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentReports = [
        ...persons,
        ...devices,
        ...vehicles,
        ...household,
        ...personal,
        ...hackedAccounts,
        ...reputation,
      ].filter((item) => new Date(item.report_date) >= sevenDaysAgo).length;

      return {
        totals: {
          totalReports,
          persons: persons.length,
          devices: devices.length,
          vehicles: vehicles.length,
          household: household.length,
          personal: personal.length,
          hackedAccounts: hackedAccounts.length,
          reputation: reputation.length,
          foundItems,
          recentReports,
        },
        statusCounts,
        typeData,
        monthlyData,
      };
    },
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yaracheck-blue mx-auto mb-4"></div>
        <p className="text-slate-600">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="flex items-center p-6">
            <FileText className="h-8 w-8 text-blue-600 shrink-0" />
            <div className="ml-4 min-w-0">
              <p className="text-sm font-medium text-slate-600">
                Total Reports
              </p>
              <p className="text-2xl font-bold text-slate-900 truncate">
                {analytics?.totals.totalReports || 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-red-600 shrink-0" />
            <div className="ml-4 min-w-0">
              <p className="text-sm font-medium text-slate-600">
                Missing Persons
              </p>
              <p className="text-2xl font-bold text-slate-900 truncate">
                {analytics?.totals.persons || 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="flex items-center p-6">
            <TrendingUp className="h-8 w-8 text-green-600 shrink-0" />
            <div className="ml-4 min-w-0">
              <p className="text-sm font-medium text-slate-600">Items Found</p>
              <p className="text-2xl font-bold text-slate-900 truncate">
                {analytics?.totals.foundItems || 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="flex items-center p-6">
            <Calendar className="h-8 w-8 text-purple-600 shrink-0" />
            <div className="ml-4 min-w-0">
              <p className="text-sm font-medium text-slate-600">This Week</p>
              <p className="text-2xl font-bold text-slate-900 truncate">
                {analytics?.totals.recentReports || 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">
              Reports by Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics?.typeData || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics?.typeData?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">
              Monthly Report Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics?.monthlyData || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="reports"
                    stroke="#3b82f6"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bar Chart Card */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">
            Monthly Breakdown by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[350px] sm:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.monthlyData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip />
                <Bar
                  dataKey="persons"
                  stackId={1}
                  fill="#ef4444"
                  name="Missing Persons"
                />
                <Bar
                  dataKey="devices"
                  stackId={1}
                  fill="#3b82f6"
                  name="Stolen Devices"
                />
                <Bar
                  dataKey="vehicles"
                  stackId={1}
                  fill="#10b981"
                  name="Stolen Vehicles"
                />
                <Bar
                  dataKey="household"
                  stackId={1}
                  fill="#f59e0b"
                  name="Household Items"
                />
                <Bar
                  dataKey="personal"
                  stackId={1}
                  fill="#8b5cf6"
                  name="Personal Belongings"
                />
                <Bar
                  dataKey="hackedAccounts"
                  stackId={1}
                  fill="#ef4444"
                  name="Hacked Accounts"
                />
                <Bar
                  dataKey="reputation"
                  stackId={1}
                  fill="#f97316"
                  name="Business Reputation"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
