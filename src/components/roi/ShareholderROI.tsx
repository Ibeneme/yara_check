import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, TrendingUp, Calendar, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

const ShareholderROI = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  // Fetch available distributions for current shareholder
  const { data: distributions, isLoading } = useQuery({
    queryKey: ['shareholder-distributions', profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roi_distributions')
        .select('*')
        .or(`shareholder_id.is.null,shareholder_id.eq.${profile?.id}`)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching distributions:', error);
        throw error;
      }
      console.log('Fetched distributions:', data);
      return data;
    },
    enabled: !!profile?.id && profile?.admin_role === 'shareholder',
  });

  // Fetch user's withdrawal requests
  const { data: myRequests } = useQuery({
    queryKey: ['my-withdrawal-requests', profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roi_withdrawal_requests')
        .select(`
          *,
          distribution:roi_distributions(amount, percentage, period_type, period_start, period_end)
        `)
        .eq('shareholder_id', profile?.id)
        .order('requested_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching withdrawal requests:', error);
        throw error;
      }
      console.log('Fetched withdrawal requests:', data);
      return data;
    },
    enabled: !!profile?.id && profile?.admin_role === 'shareholder',
  });

  // Fetch ROI history for current shareholder (for viewing only)
  const { data: roiHistory } = useQuery({
    queryKey: ['roi-history', profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roi_distributions')
        .select('*')
        .or(`shareholder_id.is.null,shareholder_id.eq.${profile?.id}`)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching ROI history:', error);
        throw error;
      }
      console.log('Fetched ROI history:', data);
      return data;
    },
    enabled: !!profile?.id && profile?.admin_role === 'shareholder',
  });

  const requestWithdrawal = async (distributionId: string, amount: number) => {
    try {
      const { error } = await supabase
        .from('roi_withdrawal_requests')
        .insert({
          distribution_id: distributionId,
          shareholder_id: profile?.id,
          amount: amount,
        });

      if (error) throw error;

      toast({
        title: "Withdrawal Request Submitted",
        description: "Your withdrawal request has been submitted for admin approval",
      });

      queryClient.invalidateQueries({ queryKey: ['my-withdrawal-requests'] });
      queryClient.invalidateQueries({ queryKey: ['shareholder-distributions'] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit withdrawal request",
        variant: "destructive",
      });
    }
  };

  // Check if user already has a request for a distribution
  const hasRequestForDistribution = (distributionId: string) => {
    return myRequests?.some(req => 
      req.distribution_id === distributionId && 
      ['pending', 'approved', 'sent'].includes(req.status)
    );
  };

  // Get request status for a distribution
  const getRequestStatus = (distributionId: string) => {
    return myRequests?.find(req => req.distribution_id === distributionId)?.status;
  };

  if (isLoading) {
    return <div className="p-6">Loading ROI information...</div>;
  }

  // Calculate total earned from all distributions available to this shareholder
  const totalEarned = distributions?.reduce((sum, dist) => sum + parseFloat(dist.amount.toString()), 0) || 0;

  // Calculate pending withdrawals (requested but not yet sent)
  const pendingAmount = myRequests?.filter(req => ['pending', 'approved'].includes(req.status))
    .reduce((sum, req) => sum + parseFloat(req.amount.toString()), 0) || 0;

  // Calculate total received (sent/completed)
  const totalReceived = myRequests?.filter(req => ['sent', 'completed'].includes(req.status))
    .reduce((sum, req) => sum + parseFloat(req.amount.toString()), 0) || 0;

  // Available to withdraw
  const availableToWithdraw = distributions?.filter(d => 
    d.withdrawal_enabled && !hasRequestForDistribution(d.id)
  ).reduce((sum, dist) => sum + parseFloat(dist.amount.toString()), 0) || 0;

  return (
    <div className="space-y-6">
      {/* ROI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total ROI Distributed</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${totalEarned.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              All distributions to you
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Funds Received</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalReceived.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Sent/completed withdrawals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Withdrawals</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ${pendingAmount.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting admin processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available to Withdraw</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              ${availableToWithdraw.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Ready for withdrawal
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Available Withdrawals */}
      {distributions && distributions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Available ROI Distributions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {distributions.filter(d => d.withdrawal_enabled).map((distribution) => {
                const hasRequest = hasRequestForDistribution(distribution.id);
                const requestStatus = getRequestStatus(distribution.id);
                
                return (
                  <div key={distribution.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">
                          ${distribution.amount} ({distribution.percentage}% ROI)
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {distribution.period_type} - {distribution.period_start} to {distribution.period_end}
                        </p>
                       <p className="text-xs text-muted-foreground">
                         Created: {format(new Date(distribution.created_at), "PPP")}
                       </p>
                       {distribution.distributed_by && (
                         <p className="text-xs text-muted-foreground">
                           Distributed by Super Admin: {format(new Date(distribution.created_at), "PPP")}
                         </p>
                       )}
                        {distribution.notes && (
                          <p className="text-xs text-muted-foreground italic">
                            Note: {distribution.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        {hasRequest ? (
                          <Badge variant={
                            requestStatus === 'completed' ? 'default' :
                            requestStatus === 'sent' ? 'secondary' :
                            requestStatus === 'approved' ? 'outline' : 'destructive'
                          }>
                            {requestStatus === 'completed' ? 'Disbursed' :
                             requestStatus === 'sent' ? 'Funds Sent' :
                             requestStatus === 'approved' ? 'Approved' : 'Pending'}
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => requestWithdrawal(distribution.id, distribution.amount)}
                          >
                            Withdraw ROI
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {distributions.filter(d => d.withdrawal_enabled).length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No withdrawable ROI distributions available at this time.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ROI History */}
      <Card>
        <CardHeader>
          <CardTitle>ROI Distribution History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {roiHistory && roiHistory.length > 0 ? (
              roiHistory.map((distribution) => (
                <div key={distribution.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">
                        ${distribution.amount} ({distribution.percentage}% ROI)
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {distribution.period_type} - {distribution.period_start} to {distribution.period_end}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Distributed: {format(new Date(distribution.created_at), "PPP")}
                      </p>
                      {distribution.distributed_by && (
                        <p className="text-xs text-muted-foreground">
                          Sent by Super Admin: {format(new Date(distribution.created_at), "PPP")}
                        </p>
                      )}
                      {distribution.notes && (
                        <p className="text-xs text-muted-foreground italic">
                          Note: {distribution.notes}
                        </p>
                      )}
                    </div>
                    <Badge variant={distribution.withdrawal_enabled ? "default" : "secondary"}>
                      {distribution.withdrawal_enabled ? "Active" : "Closed"}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No ROI distribution history available.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* My Withdrawal History */}
      {myRequests && myRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>My Withdrawal History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">${request.amount}</h4>
                      <p className="text-sm text-muted-foreground">
                        {request.distribution?.period_type} ROI ({request.distribution?.percentage}%)
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Requested: {format(new Date(request.requested_at), "PPP")}
                      </p>
                      {request.processed_at && (
                        <p className="text-xs text-muted-foreground">
                          Processed: {format(new Date(request.processed_at), "PPP")}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={
                        request.status === 'completed' ? 'default' :
                        request.status === 'sent' ? 'secondary' :
                        request.status === 'approved' ? 'outline' : 'destructive'
                      }>
                        {request.status === 'completed' ? 'Disbursed' :
                         request.status === 'sent' ? 'Funds Sent' :
                         request.status === 'approved' ? 'Approved' : 'Pending'}
                      </Badge>
                      {request.status === 'completed' && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
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

export default ShareholderROI;