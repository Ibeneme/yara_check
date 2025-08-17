import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { FileText, Globe, Calendar, TrendingUp } from "lucide-react";

const ShareholderReportsSection = () => {
  // Fetch real-time reports data (no demo data)
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["shareholder-reports-analytics"],
    queryFn: async () => {
      const currentDate = new Date();
      const startOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
      const startOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const startOfYear = new Date(currentDate.getFullYear(), 0, 1);

      // Get reports count by time periods (all report types)
      const [dailyReports, weeklyReports, monthlyReports, yearlyReports] = await Promise.all([
        // Daily reports
        Promise.all([
          supabase.from("persons").select("id", { count: "exact" }).gte("report_date", startOfDay.toISOString()),
          supabase.from("devices").select("id", { count: "exact" }).gte("report_date", startOfDay.toISOString()),
          supabase.from("vehicles").select("id", { count: "exact" }).gte("report_date", startOfDay.toISOString()),
          supabase.from("household_items").select("id", { count: "exact" }).gte("report_date", startOfDay.toISOString()),
          supabase.from("personal_belongings").select("id", { count: "exact" }).gte("report_date", startOfDay.toISOString()),
          supabase.from("hacked_accounts").select("id", { count: "exact" }).gte("report_date", startOfDay.toISOString()),
          supabase.from("business_reputation_reports").select("id", { count: "exact" }).gte("report_date", startOfDay.toISOString()),
        ]),
        // Weekly reports
        Promise.all([
          supabase.from("persons").select("id", { count: "exact" }).gte("report_date", startOfWeek.toISOString()),
          supabase.from("devices").select("id", { count: "exact" }).gte("report_date", startOfWeek.toISOString()),
          supabase.from("vehicles").select("id", { count: "exact" }).gte("report_date", startOfWeek.toISOString()),
          supabase.from("household_items").select("id", { count: "exact" }).gte("report_date", startOfWeek.toISOString()),
          supabase.from("personal_belongings").select("id", { count: "exact" }).gte("report_date", startOfWeek.toISOString()),
          supabase.from("hacked_accounts").select("id", { count: "exact" }).gte("report_date", startOfWeek.toISOString()),
          supabase.from("business_reputation_reports").select("id", { count: "exact" }).gte("report_date", startOfWeek.toISOString()),
        ]),
        // Monthly reports
        Promise.all([
          supabase.from("persons").select("id", { count: "exact" }).gte("report_date", startOfMonth.toISOString()),
          supabase.from("devices").select("id", { count: "exact" }).gte("report_date", startOfMonth.toISOString()),
          supabase.from("vehicles").select("id", { count: "exact" }).gte("report_date", startOfMonth.toISOString()),
          supabase.from("household_items").select("id", { count: "exact" }).gte("report_date", startOfMonth.toISOString()),
          supabase.from("personal_belongings").select("id", { count: "exact" }).gte("report_date", startOfMonth.toISOString()),
          supabase.from("hacked_accounts").select("id", { count: "exact" }).gte("report_date", startOfMonth.toISOString()),
          supabase.from("business_reputation_reports").select("id", { count: "exact" }).gte("report_date", startOfMonth.toISOString()),
        ]),
        // Yearly reports
        Promise.all([
          supabase.from("persons").select("id", { count: "exact" }).gte("report_date", startOfYear.toISOString()),
          supabase.from("devices").select("id", { count: "exact" }).gte("report_date", startOfYear.toISOString()),
          supabase.from("vehicles").select("id", { count: "exact" }).gte("report_date", startOfYear.toISOString()),
          supabase.from("household_items").select("id", { count: "exact" }).gte("report_date", startOfYear.toISOString()),
          supabase.from("personal_belongings").select("id", { count: "exact" }).gte("report_date", startOfYear.toISOString()),
          supabase.from("hacked_accounts").select("id", { count: "exact" }).gte("report_date", startOfYear.toISOString()),
          supabase.from("business_reputation_reports").select("id", { count: "exact" }).gte("report_date", startOfYear.toISOString()),
        ]),
      ]);

      // Get reports by country (all report types)
      const [personsCountry, devicesCountry, vehiclesCountry, householdCountry, personalCountry, hackedAccountsCountry, reputationCountry] = await Promise.all([
        supabase.from("persons").select("country_id, countries(name)").not("country_id", "is", null),
        supabase.from("devices").select("country_id, countries(name)").not("country_id", "is", null),
        supabase.from("vehicles").select("country_id, countries(name)").not("country_id", "is", null),
        supabase.from("household_items").select("country_id, countries(name)").not("country_id", "is", null),
        supabase.from("personal_belongings").select("country_id, countries(name)").not("country_id", "is", null),
        supabase.from("hacked_accounts").select("country_id, countries(name)").not("country_id", "is", null),
        supabase.from("business_reputation_reports").select("country_id, countries(name)").not("country_id", "is", null),
      ]);

      // Calculate totals (all report types)
      const daily = dailyReports.reduce((sum, result) => sum + (result.count || 0), 0);
      const weekly = weeklyReports.reduce((sum, result) => sum + (result.count || 0), 0);
      const monthly = monthlyReports.reduce((sum, result) => sum + (result.count || 0), 0);
      const yearly = yearlyReports.reduce((sum, result) => sum + (result.count || 0), 0);

      // Process country data (all report types)
      const countryStats = new Map();
      [...(personsCountry.data || []), ...(devicesCountry.data || []), ...(vehiclesCountry.data || []), 
       ...(householdCountry.data || []), ...(personalCountry.data || []), ...(hackedAccountsCountry.data || []), 
       ...(reputationCountry.data || [])]
        .forEach((item: any) => {
          const countryName = item.countries?.name || 'Unknown';
          countryStats.set(countryName, (countryStats.get(countryName) || 0) + 1);
        });

      const countryData = Array.from(countryStats.entries()).map(([name, count]) => ({
        name,
        count,
        revenue: count * 8 // $8 per report
      }));

      return {
        daily,
        weekly,
        monthly,
        yearly,
        totalRevenue: yearly * 8, // $8 per report
        countryData,
        reportTypes: [
          { name: 'Missing Persons', count: yearlyReports[0].count || 0 },
          { name: 'Stolen Devices', count: yearlyReports[1].count || 0 },
          { name: 'Stolen Vehicles', count: yearlyReports[2].count || 0 },
          { name: 'Household Items', count: yearlyReports[3].count || 0 },
          { name: 'Personal Belongings', count: yearlyReports[4].count || 0 },
          { name: 'Hacked Accounts', count: yearlyReports[5].count || 0 },
          { name: 'Business Reputation', count: yearlyReports[6].count || 0 },
        ]
      };
    },
  });
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Reports Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Reports Analytics</h2>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Reports</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.daily || 0}</div>
            <p className="text-xs text-muted-foreground">
              ${(analyticsData?.daily || 0) * 8} revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.weekly || 0}</div>
            <p className="text-xs text-muted-foreground">
              ${(analyticsData?.weekly || 0) * 8} revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.monthly || 0}</div>
            <p className="text-xs text-muted-foreground">
              ${(analyticsData?.monthly || 0) * 8} revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Year</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.yearly || 0}</div>
            <p className="text-xs text-muted-foreground">
              ${analyticsData?.totalRevenue || 0} total revenue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Reports by Country
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData?.countryData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value, name) => [value, name === 'count' ? 'Reports' : 'Revenue ($)']} />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Report Types Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData?.reportTypes || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analyticsData?.reportTypes?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Country */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Country</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData?.countryData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShareholderReportsSection;