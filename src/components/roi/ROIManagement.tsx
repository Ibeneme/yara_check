import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CalendarIcon, TrendingUp, Users, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const ROIManagement = () => {
  const [amount, setAmount] = useState("");
  const [percentage, setPercentage] = useState("");
  const [periodType, setPeriodType] = useState<"monthly" | "quarterly" | "yearly">("monthly");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [selectedShareholder, setSelectedShareholder] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const queryClient = useQueryClient();

  // Fetch shareholders
  const { data: shareholders } = useQuery({
    queryKey: ['shareholders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, admin_role')
        .eq('admin_role', 'shareholder')
        .eq('is_active', true);
      
      if (error) {
        console.error('Error fetching shareholders:', error);
        return [];
      }
      return data || [];
    },
  });

  // Fetch ROI distributions
  const { data: distributions, isLoading } = useQuery({
    queryKey: ['roi-distributions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roi_distributions')
        .select(`
          *,
          shareholder:profiles!roi_distributions_shareholder_id_fkey(first_name, last_name, email)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch withdrawal requests
  const { data: withdrawalRequests } = useQuery({
    queryKey: ['withdrawal-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roi_withdrawal_requests')
        .select(`
          *,
          shareholder:profiles!roi_withdrawal_requests_shareholder_id_fkey(first_name, last_name, email),
          distribution:roi_distributions(amount, percentage, period_type)
        `)
        .eq('status', 'pending')
        .order('requested_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const createDistribution = async () => {
    if (!amount || !percentage || !startDate || !endDate || !selectedShareholder) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields including selecting a shareholder",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const { error } = await supabase
        .from('roi_distributions')
        .insert({
          amount: parseFloat(amount),
          percentage: parseFloat(percentage),
          period_type: periodType,
          period_start: startDate.toISOString().split('T')[0],
          period_end: endDate.toISOString().split('T')[0],
          shareholder_id: selectedShareholder,
          notes: notes || null,
        });

      if (error) throw error;

      toast({
        title: "ROI Distribution Created",
        description: "The ROI distribution has been created successfully",
      });

      // Reset form
      setAmount("");
      setPercentage("");
      setStartDate(undefined);
      setEndDate(undefined);
      setSelectedShareholder("");
      setNotes("");

      queryClient.invalidateQueries({ queryKey: ['roi-distributions'] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create ROI distribution",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const toggleWithdrawalEnabled = async (distributionId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('roi_distributions')
        .update({ withdrawal_enabled: !currentStatus })
        .eq('id', distributionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Withdrawal ${!currentStatus ? 'enabled' : 'disabled'} for this distribution`,
      });

      queryClient.invalidateQueries({ queryKey: ['roi-distributions'] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update withdrawal status",
        variant: "destructive",
      });
    }
  };

  const deleteDistribution = async (distributionId: string) => {
    try {
      // First delete any related withdrawal requests
      await supabase
        .from('roi_withdrawal_requests')
        .delete()
        .eq('distribution_id', distributionId);

      // Then delete the distribution
      const { error } = await supabase
        .from('roi_distributions')
        .delete()
        .eq('id', distributionId);

      if (error) throw error;

      toast({
        title: "Distribution Deleted",
        description: "The ROI distribution and all related requests have been deleted",
      });

      queryClient.invalidateQueries({ queryKey: ['roi-distributions'] });
      queryClient.invalidateQueries({ queryKey: ['withdrawal-requests'] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete distribution",
        variant: "destructive",
      });
    }
  };

  const processWithdrawalRequest = async (requestId: string, newStatus: 'approved' | 'sent' | 'completed') => {
    try {
      const updateData: any = {
        status: newStatus,
        processed_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('roi_withdrawal_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Withdrawal request ${newStatus}`,
      });

      queryClient.invalidateQueries({ queryKey: ['withdrawal-requests'] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to process withdrawal request",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading ROI management...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Summary Cards with More Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Distributions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{distributions?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active: {distributions?.filter(d => d.withdrawal_enabled).length || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Distributed</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${distributions?.reduce((sum, dist) => sum + parseFloat(dist.amount.toString()), 0).toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">
              All time total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{withdrawalRequests?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {distributions?.filter(d => {
                const createdAt = new Date(d.created_at);
                const now = new Date();
                return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
              }).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              New distributions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Create New Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Create ROI Distribution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Shareholder *</label>
              <Select value={selectedShareholder} onValueChange={setSelectedShareholder}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a shareholder" />
                </SelectTrigger>
                <SelectContent>
                  {shareholders?.map((shareholder) => (
                    <SelectItem key={shareholder.id} value={shareholder.id}>
                      {shareholder.first_name} {shareholder.last_name} ({shareholder.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Period Type</label>
              <Select value={periodType} onValueChange={(value: any) => setPeriodType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Amount ($) *</label>
              <Input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1000.00"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Percentage (%) *</label>
              <Input
                type="number"
                step="0.01"
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                placeholder="5.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="text-sm font-medium">End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Notes</label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes about this distribution"
            />
          </div>

          <Button onClick={createDistribution} disabled={isCreating} className="w-full">
            {isCreating ? "Creating..." : "Create Distribution"}
          </Button>
        </CardContent>
      </Card>

      {/* Existing Distributions */}
      <Card>
        <CardHeader>
          <CardTitle>ROI Distributions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {distributions?.map((distribution) => (
              <div key={distribution.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">${distribution.amount} ({distribution.percentage}%)</h4>
                    <p className="text-sm text-muted-foreground">
                      {distribution.period_type} - {distribution.period_start} to {distribution.period_end}
                    </p>
                    <p className="text-sm font-medium text-blue-600">
                      For: {distribution.shareholder?.first_name} {distribution.shareholder?.last_name} ({distribution.shareholder?.email})
                    </p>
                    {distribution.notes && (
                      <p className="text-sm text-gray-600 mt-1">Notes: {distribution.notes}</p>
                    )}
                  </div>
                  <div className="space-x-2">
                    <Button
                      variant={distribution.withdrawal_enabled ? "destructive" : "default"}
                      size="sm"
                      onClick={() => toggleWithdrawalEnabled(distribution.id, distribution.withdrawal_enabled)}
                    >
                      {distribution.withdrawal_enabled ? "Disable Withdrawal" : "Enable Withdrawal"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteDistribution(distribution.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Withdrawal Requests */}
      {withdrawalRequests && withdrawalRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Withdrawal Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {withdrawalRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">
                        {request.shareholder?.first_name} {request.shareholder?.last_name}
                      </h4>
                      <p className="text-sm text-muted-foreground">{request.shareholder?.email}</p>
                      <p className="font-medium">${request.amount}</p>
                      <p className="text-xs text-muted-foreground">
                        Requested: {format(new Date(request.requested_at), "PPP")}
                      </p>
                    </div>
                    <div className="space-x-2">
                      <Button
                        size="sm"
                        onClick={() => processWithdrawalRequest(request.id, 'approved')}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => processWithdrawalRequest(request.id, 'sent')}
                      >
                        Mark as Sent
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ROIManagement;
