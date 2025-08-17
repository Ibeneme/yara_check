import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { DollarSign, TrendingUp, FileText, Calendar, Lock } from "lucide-react";

interface FinancialDashboardProps {
  canViewFinancials?: boolean;
}

const FinancialDashboard = ({ canViewFinancials = false }: FinancialDashboardProps) => {
  const { data: financialData, isLoading } = useQuery({
    queryKey: ["financial-records"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financial_records")
        .select("*")
        .order("record_date", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: canViewFinancials,
  });

  const { data: currentStats } = useQuery({
    queryKey: ["current-month-stats"],
    queryFn: async () => {
      const currentMonth = new Date().toISOString().slice(0, 7);
      
      const [personsResult, devicesResult, vehiclesResult] = await Promise.all([
        supabase.from("persons").select("id", { count: "exact" }).gte("report_date", `${currentMonth}-01`),
        supabase.from("devices").select("id", { count: "exact" }).gte("report_date", `${currentMonth}-01`),
        supabase.from("vehicles").select("id", { count: "exact" }).gte("report_date", `${currentMonth}-01`),
      ]);

      return {
        totalReports: (personsResult.count || 0) + (devicesResult.count || 0) + (vehiclesResult.count || 0),
        personsReports: personsResult.count || 0,
        devicesReports: devicesResult.count || 0,
        vehiclesReports: vehiclesResult.count || 0,
      };
    },
    enabled: canViewFinancials,
  });

  if (!canViewFinancials) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Financial Dashboard - Access Restricted
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Lock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">You don't have permission to view financial data.</p>
            <p className="text-sm text-gray-400 mt-2">Only Super Admins and Shareholders can access financial reports.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
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

  const totalRevenue = financialData?.reduce((sum, record) => sum + Number(record.revenue), 0) || 0;
  const totalReports = financialData?.reduce((sum, record) => sum + (record.report_count || 0), 0) || 0;
  const averageRevenuePerReport = totalReports > 0 ? totalRevenue / totalReports : 0;
  const currentMonthRevenue = financialData?.[financialData.length - 1]?.revenue || 0;

  const chartData = financialData?.map(record => ({
    date: new Date(record.record_date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    revenue: Number(record.revenue),
    reports: record.report_count || 0,
  })) || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Across all time periods
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${Number(currentMonthRevenue).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {currentStats?.totalReports || 0} reports this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReports}</div>
            <p className="text-xs text-muted-foreground">
              All submitted reports
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Revenue/Report</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${averageRevenuePerReport.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Per report submitted
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reports by Month</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="reports" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {currentStats && (
        <Card>
          <CardHeader>
            <CardTitle>Current Month Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{currentStats.personsReports}</div>
                <div className="text-sm text-blue-800">Missing Persons</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{currentStats.devicesReports}</div>
                <div className="text-sm text-green-800">Stolen Devices</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{currentStats.vehiclesReports}</div>
                <div className="text-sm text-purple-800">Stolen Vehicles</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FinancialDashboard;
