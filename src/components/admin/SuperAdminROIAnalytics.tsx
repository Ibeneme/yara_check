import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  format,
  startOfMonth,
  startOfQuarter,
  startOfYear,
  subMonths,
  subQuarters,
  subYears,
} from "date-fns";

const SuperAdminROIAnalytics = () => {
  const { data: roiAnalytics, isLoading } = useQuery({
    queryKey: ["roi-analytics"],
    queryFn: async () => {
      const currentDate = new Date();
      const currentMonth = startOfMonth(currentDate);
      const currentQuarter = startOfQuarter(currentDate);
      const currentYear = startOfYear(currentDate);

      const { data: distributions, error: distError } = await supabase
        .from("roi_distributions")
        .select("*")
        .order("created_at", { ascending: false });

      if (distError) throw distError;

      const { data: withdrawals, error: withdrawError } = await supabase
        .from("roi_withdrawal_requests")
        .select("*")
        .order("requested_at", { ascending: false });

      if (withdrawError) throw withdrawError;

      const totalDistributed =
        distributions?.reduce(
          (sum, dist) => sum + parseFloat(dist.amount.toString()),
          0
        ) || 0;

      const totalPaidOut =
        withdrawals
          ?.filter((w) => ["sent", "completed"].includes(w.status))
          .reduce((sum, w) => sum + parseFloat(w.amount.toString()), 0) || 0;

      const totalPending =
        withdrawals
          ?.filter((w) => ["pending", "approved"].includes(w.status))
          .reduce((sum, w) => sum + parseFloat(w.amount.toString()), 0) || 0;

      const monthlyData = [];
      for (let i = 11; i >= 0; i--) {
        const monthStart = startOfMonth(subMonths(currentDate, i));
        const monthEnd = startOfMonth(subMonths(currentDate, i - 1));

        const monthDistributions =
          distributions?.filter((d) => {
            const createdAt = new Date(d.created_at);
            return createdAt >= monthStart && createdAt < monthEnd;
          }) || [];

        const monthTotal = monthDistributions.reduce(
          (sum, dist) => sum + parseFloat(dist.amount.toString()),
          0
        );

        monthlyData.push({
          month: format(monthStart, "MMM yyyy"),
          amount: monthTotal,
          count: monthDistributions.length,
        });
      }

      const quarterlyData = [];
      for (let i = 3; i >= 0; i--) {
        const quarterStart = startOfQuarter(subQuarters(currentDate, i));
        const quarterEnd = startOfQuarter(subQuarters(currentDate, i - 1));

        const quarterDistributions =
          distributions?.filter((d) => {
            const createdAt = new Date(d.created_at);
            return createdAt >= quarterStart && createdAt < quarterEnd;
          }) || [];

        const quarterTotal = quarterDistributions.reduce(
          (sum, dist) => sum + parseFloat(dist.amount.toString()),
          0
        );

        quarterlyData.push({
          quarter: `Q${
            Math.floor(quarterStart.getMonth() / 3) + 1
          } ${quarterStart.getFullYear()}`,
          amount: quarterTotal,
          count: quarterDistributions.length,
        });
      }

      const yearlyData = [];
      for (let i = 2; i >= 0; i--) {
        const yearStart = startOfYear(subYears(currentDate, i));
        const yearEnd = startOfYear(subYears(currentDate, i - 1));

        const yearDistributions =
          distributions?.filter((d) => {
            const createdAt = new Date(d.created_at);
            return createdAt >= yearStart && createdAt < yearEnd;
          }) || [];

        const yearTotal = yearDistributions.reduce(
          (sum, dist) => sum + parseFloat(dist.amount.toString()),
          0
        );

        yearlyData.push({
          year: yearStart.getFullYear().toString(),
          amount: yearTotal,
          count: yearDistributions.length,
        });
      }

      const distributionsByStatus = {
        active: distributions?.filter((d) => d.withdrawal_enabled).length || 0,
        inactive:
          distributions?.filter((d) => !d.withdrawal_enabled).length || 0,
      };

      const withdrawalsByStatus = {
        pending: withdrawals?.filter((w) => w.status === "pending").length || 0,
        approved:
          withdrawals?.filter((w) => w.status === "approved").length || 0,
        sent: withdrawals?.filter((w) => w.status === "sent").length || 0,
        completed:
          withdrawals?.filter((w) => w.status === "completed").length || 0,
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
        currentMonthDistributions:
          distributions?.filter((d) => {
            const createdAt = new Date(d.created_at);
            return createdAt >= currentMonth;
          }).length || 0,
        currentQuarterDistributions:
          distributions?.filter((d) => {
            const createdAt = new Date(d.created_at);
            return createdAt >= currentQuarter;
          }).length || 0,
        currentYearDistributions:
          distributions?.filter((d) => {
            const createdAt = new Date(d.created_at);
            return createdAt >= currentYear;
          }).length || 0,
      };
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-600 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
        <Loader2 className="animate-spin h-8 w-8 text-yaracheck-blue mb-3" />
        <p className="font-medium text-slate-700">Loading ROI analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">
          ROI Analytics Dashboard
        </h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total ROI Distributed
            </CardTitle>
            <DollarSign className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yaracheck-blue">
              ${roiAnalytics?.totalDistributed?.toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {roiAnalytics?.totalDistributions || 0} distributions total
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Paid Out
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              ${roiAnalytics?.totalPaidOut?.toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Completed/sent withdrawals
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Pending Payments
            </CardTitle>
            <Clock className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              ${roiAnalytics?.totalPending?.toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-slate-500 mt-1">Awaiting processing</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Outstanding Balance
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              $
              {(
                (roiAnalytics?.totalDistributed || 0) -
                (roiAnalytics?.totalPaidOut || 0)
              ).toFixed(2)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Total remaining to pay
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Period Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              This Month
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {roiAnalytics?.currentMonthDistributions || 0}
            </div>
            <p className="text-xs text-slate-500 mt-1">ROI distributions</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              This Quarter
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {roiAnalytics?.currentQuarterDistributions || 0}
            </div>
            <p className="text-xs text-slate-500 mt-1">ROI distributions</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              This Year
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {roiAnalytics?.currentYearDistributions || 0}
            </div>
            <p className="text-xs text-slate-500 mt-1">ROI distributions</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">
              Monthly ROI Distributions (Last 12 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={roiAnalytics?.monthlyData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  formatter={(value, name) => [
                    name === "amount" ? `$${value}` : value,
                    name === "amount" ? "Amount" : "Count",
                  ]}
                />
                <Bar dataKey="amount" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">
              Quarterly ROI Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={roiAnalytics?.quarterlyData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="quarter" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip formatter={(value) => [`$${value}`, "Amount"]} />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: "#10b981" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Yearly Comparison */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">
            Yearly ROI Distribution Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={roiAnalytics?.yearlyData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="year" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip
                formatter={(value, name) => [
                  name === "amount" ? `$${value}` : value,
                  name === "amount" ? "Total Amount" : "Total Count",
                ]}
              />
              <Bar dataKey="amount" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdminROIAnalytics;
