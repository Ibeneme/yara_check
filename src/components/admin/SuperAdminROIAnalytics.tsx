import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { DollarSign, TrendingUp, Users, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { format, startOfMonth, startOfQuarter, startOfYear, subMonths, subQuarters, subYears } from "date-fns";

const SuperAdminROIAnalytics = () => {
  // Fetch comprehensive ROI analytics
  const { data: roiAnalytics, isLoading } = useQuery({
    queryKey: ['roi-analytics'],
    queryFn: async () => {
      const currentDate = new Date();
      const currentMonth = startOfMonth(currentDate);
      const currentQuarter = startOfQuarter(currentDate);
      const currentYear = startOfYear(currentDate);

      // Fetch all distributions
      const { data: distributions, error: distError } = await supabase
        .from('roi_distributions')
        .select('*')
        .order('created_at', { ascending: false });

      if (distError) throw distError;

      // Fetch all withdrawal requests
      const { data: withdrawals, error: withdrawError } = await supabase
        .from('roi_withdrawal_requests')
        .select('*')
        .order('requested_at', { ascending: false });

      if (withdrawError) throw withdrawError;

      // Calculate totals
      const totalDistributed = distributions?.reduce((sum, dist) => sum + parseFloat(dist.amount.toString()), 0) || 0;
      
      const totalPaidOut = withdrawals?.filter(w => ['sent', 'completed'].includes(w.status))
        .reduce((sum, w) => sum + parseFloat(w.amount.toString()), 0) || 0;
      
      const totalPending = withdrawals?.filter(w => ['pending', 'approved'].includes(w.status))
        .reduce((sum, w) => sum + parseFloat(w.amount.toString()), 0) || 0;

      // Monthly distribution data for the last 12 months
      const monthlyData = [];
      for (let i = 11; i >= 0; i--) {
        const monthStart = startOfMonth(subMonths(currentDate, i));
        const monthEnd = startOfMonth(subMonths(currentDate, i - 1));
        
        const monthDistributions = distributions?.filter(d => {
          const createdAt = new Date(d.created_at);
          return createdAt >= monthStart && createdAt < monthEnd;
        }) || [];
        
        const monthTotal = monthDistributions.reduce((sum, dist) => sum + parseFloat(dist.amount.toString()), 0);
        
        monthlyData.push({
          month: format(monthStart, 'MMM yyyy'),
          amount: monthTotal,
          count: monthDistributions.length
        });
      }

      // Quarterly data for the last 4 quarters
      const quarterlyData = [];
      for (let i = 3; i >= 0; i--) {
        const quarterStart = startOfQuarter(subQuarters(currentDate, i));
        const quarterEnd = startOfQuarter(subQuarters(currentDate, i - 1));
        
        const quarterDistributions = distributions?.filter(d => {
          const createdAt = new Date(d.created_at);
          return createdAt >= quarterStart && createdAt < quarterEnd;
        }) || [];
        
        const quarterTotal = quarterDistributions.reduce((sum, dist) => sum + parseFloat(dist.amount.toString()), 0);
        
        quarterlyData.push({
          quarter: `Q${Math.floor((quarterStart.getMonth() / 3)) + 1} ${quarterStart.getFullYear()}`,
          amount: quarterTotal,
          count: quarterDistributions.length
        });
      }

      // Yearly data for the last 3 years
      const yearlyData = [];
      for (let i = 2; i >= 0; i--) {
        const yearStart = startOfYear(subYears(currentDate, i));
        const yearEnd = startOfYear(subYears(currentDate, i - 1));
        
        const yearDistributions = distributions?.filter(d => {
          const createdAt = new Date(d.created_at);
          return createdAt >= yearStart && createdAt < yearEnd;
        }) || [];
        
        const yearTotal = yearDistributions.reduce((sum, dist) => sum + parseFloat(dist.amount.toString()), 0);
        
        yearlyData.push({
          year: yearStart.getFullYear().toString(),
          amount: yearTotal,
          count: yearDistributions.length
        });
      }

      // Distribution by status
      const distributionsByStatus = {
        active: distributions?.filter(d => d.withdrawal_enabled).length || 0,
        inactive: distributions?.filter(d => !d.withdrawal_enabled).length || 0,
      };

      // Withdrawal status breakdown
      const withdrawalsByStatus = {
        pending: withdrawals?.filter(w => w.status === 'pending').length || 0,
        approved: withdrawals?.filter(w => w.status === 'approved').length || 0,
        sent: withdrawals?.filter(w => w.status === 'sent').length || 0,
        completed: withdrawals?.filter(w => w.status === 'completed').length || 0,
      };

      return {
        totalDistributed,
        totalPaidOut,
        totalPending,
        totalDistributions: distributions?.length || 0,
        totalWithdrawals: withdrawals?.length || 0,
        monthlyData,
        quarterlyData,
        yearlyData,
        distributionsByStatus,
        withdrawalsByStatus,
        currentMonthDistributions: distributions?.filter(d => {
          const createdAt = new Date(d.created_at);
          return createdAt >= currentMonth;
        }).length || 0,
        currentQuarterDistributions: distributions?.filter(d => {
          const createdAt = new Date(d.created_at);
          return createdAt >= currentQuarter;
        }).length || 0,
        currentYearDistributions: distributions?.filter(d => {
          const createdAt = new Date(d.created_at);
          return createdAt >= currentYear;
        }).length || 0,
      };
    },
  });

  if (isLoading) {
    return <div className="p-6">Loading ROI analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">ROI Analytics Dashboard</h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total ROI Distributed</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${roiAnalytics?.totalDistributed?.toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">
              {roiAnalytics?.totalDistributions || 0} distributions total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid Out</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${roiAnalytics?.totalPaidOut?.toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">
              Completed/sent withdrawals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ${roiAnalytics?.totalPending?.toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${((roiAnalytics?.totalDistributed || 0) - (roiAnalytics?.totalPaidOut || 0)).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total remaining to pay
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Period Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roiAnalytics?.currentMonthDistributions || 0}</div>
            <p className="text-xs text-muted-foreground">
              ROI distributions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Quarter</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roiAnalytics?.currentQuarterDistributions || 0}</div>
            <p className="text-xs text-muted-foreground">
              ROI distributions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Year</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roiAnalytics?.currentYearDistributions || 0}</div>
            <p className="text-xs text-muted-foreground">
              ROI distributions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly ROI Distributions (Last 12 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={roiAnalytics?.monthlyData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value, name) => [
                  name === 'amount' ? `$${value}` : value,
                  name === 'amount' ? 'Amount' : 'Count'
                ]} />
                <Bar dataKey="amount" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quarterly ROI Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={roiAnalytics?.quarterlyData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Yearly Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Yearly ROI Distribution Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={roiAnalytics?.yearlyData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip formatter={(value, name) => [
                name === 'amount' ? `$${value}` : value,
                name === 'amount' ? 'Total Amount' : 'Total Count'
              ]} />
              <Bar dataKey="amount" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdminROIAnalytics;