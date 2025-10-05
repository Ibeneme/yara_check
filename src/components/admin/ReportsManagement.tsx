import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff, CheckCircle, XCircle, AlertTriangle, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type TableName = "persons" | "devices" | "vehicles" | "household_items" | "personal_belongings" | "hacked_accounts" | "business_reputation_reports";

const ReportsManagement = () => {
  const [selectedTable, setSelectedTable] = useState<TableName | "all">("all");
  const [verificationNotes, setVerificationNotes] = useState("");
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  
  // Check if user has delete permissions
  const canDelete = profile?.role === 'super_admin' || 
    (profile?.role === 'admin' && (profile?.permissions as any)?.can_delete_reports === true);

  const reportTables = [
    { id: "all", name: "All Reports", statusField: "status" },
    { id: "persons", name: "Missing Persons", statusField: "status" },
    { id: "devices", name: "Stolen Devices", statusField: "status" },
    { id: "vehicles", name: "Stolen Vehicles", statusField: "status" },
    { id: "household_items", name: "Household Items", statusField: "status" },
    { id: "personal_belongings", name: "Personal Belongings", statusField: "status" },
    { id: "hacked_accounts", name: "Hacked Accounts", statusField: "status" },
    { id: "business_reputation_reports", name: "Business Reputation", statusField: "status" },
  ];

  const { data: reports, isLoading } = useQuery({
    queryKey: ["admin-reports", selectedTable],
    queryFn: async () => {
      if (selectedTable === "all") {
        // Fetch all reports from all tables
        const allReports = [];
        
        for (const table of reportTables.slice(1)) { // Skip "all" option
          try {
            const { data, error } = await supabase
              .from(table.id as TableName)
              .select("*")
              .order("report_date", { ascending: false });
            
            if (data && !error) {
              // Add table type to each report
              const reportsWithType = data.map(report => ({
                ...report,
                table_type: table.id,
                table_name: table.name
              }));
              allReports.push(...reportsWithType);
            }
          } catch (err) {
            console.error(`Error fetching ${table.id}:`, err);
          }
        }
        
        // Sort all reports by report_date
        return allReports.sort((a, b) => 
          new Date(b.report_date).getTime() - new Date(a.report_date).getTime()
        );
      } else {
        const { data, error } = await supabase
          .from(selectedTable as TableName)
          .select("*")
          .order("report_date", { ascending: false });
        
        if (error) throw error;
        return data?.map(report => ({
          ...report,
          table_type: selectedTable,
          table_name: reportTables.find(t => t.id === selectedTable)?.name
        })) || [];
      }
    },
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({ id, visible, tableType }: { id: string; visible: boolean; tableType: string }) => {
      const targetTable = tableType === "all" ? selectedTable : tableType;
      const { error } = await supabase
        .from(targetTable as TableName)
        .update({ visible })
        .eq("id", id);
      
      if (error) throw error;
      return { id, visible };
    },
    onMutate: async ({ id, visible }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["admin-reports", selectedTable] });
      
      // Snapshot previous value
      const previousReports = queryClient.getQueryData(["admin-reports", selectedTable]);
      
      // Optimistically update
      queryClient.setQueryData(["admin-reports", selectedTable], (old: any) => {
        if (!old) return old;
        return old.map((report: any) => 
          report.id === id ? { ...report, visible } : report
        );
      });
      
      return { previousReports };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousReports) {
        queryClient.setQueryData(["admin-reports", selectedTable], context.previousReports);
      }
      console.error("Error updating visibility:", error);
      toast.error("Failed to update visibility");
    },
    onSuccess: (data) => {
      toast.success(`Report ${data.visible ? 'shown' : 'hidden'} successfully`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reports", selectedTable] });
    },
  });

  const verifyBusinessReputationMutation = useMutation({
    mutationFn: async ({ 
      id, 
      action, 
      notes 
    }: { 
      id: string; 
      action: "verified" | "rejected"; 
      notes: string;
    }) => {
      const { error } = await supabase
        .from("business_reputation_reports")
        .update({ 
          status: action,
          visible: action === "verified",
          verification_notes: notes,
          verified_at: new Date().toISOString(),
          verified_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reports", selectedTable] });
      toast.success("Business reputation report verified successfully");
      setVerificationNotes("");
    },
    onError: (error) => {
      console.error("Error verifying report:", error);
      toast.error("Failed to verify report");
    },
  });

  const deleteReportMutation = useMutation({
    mutationFn: async ({ id, tableType }: { id: string; tableType: string }) => {
      const targetTable = tableType === "all" ? selectedTable : tableType;
      const { error } = await supabase
        .from(targetTable as TableName)
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      return { id, tableType: targetTable };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-reports", selectedTable] });
      toast.success("Report deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting report:", error);
      toast.error("Failed to delete report");
    },
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, icon: AlertTriangle, text: "Pending" },
      verified: { variant: "default" as const, icon: CheckCircle, text: "Verified" },
      found: { variant: "default" as const, icon: CheckCircle, text: "Found" },
      missing: { variant: "destructive" as const, icon: AlertTriangle, text: "Missing" },
      rejected: { variant: "destructive" as const, icon: XCircle, text: "Rejected" },
      pending_verification: { variant: "secondary" as const, icon: AlertTriangle, text: "Awaiting Verification" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Reports Management</h2>
        <Select value={selectedTable} onValueChange={(value: string) => setSelectedTable(value as TableName | "all")}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select report type" />
          </SelectTrigger>
          <SelectContent>
            {reportTables.map((table) => (
              <SelectItem key={table.id} value={table.id}>
                {table.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {reports?.map((report: any) => (
          <Card key={report.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold">
                    {report.name || report.reported_person_name || `${report.type} - ${report.brand}` || "Report"}
                  </h3>
                  {getStatusBadge(report.status)}
                  {selectedTable === "all" && (
                    <Badge variant="outline">
                      {report.table_name}
                    </Badge>
                  )}
                  <Badge variant={report.visible ? "default" : "secondary"}>
                    {report.visible ? (
                      <>
                        <Eye className="h-3 w-3 mr-1" />
                        Public
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3 w-3 mr-1" />
                        Hidden
                      </>
                    )}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Reporter: {report.reporter_name} ({report.reporter_email})
                </p>
                <p className="text-sm text-gray-500">
                  Reported: {new Date(report.report_date).toLocaleDateString()}
                </p>
                {report.description && (
                  <p className="text-sm text-gray-700 mt-2 line-clamp-2">{report.description}</p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {/* Visibility Toggle */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleVisibilityMutation.mutate({
                    id: report.id,
                    visible: !report.visible,
                    tableType: report.table_type || selectedTable
                  })}
                  disabled={toggleVisibilityMutation.isPending}
                >
                  {report.visible ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-1" />
                      Hide
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-1" />
                      Show
                    </>
                  )}
                </Button>

                {/* Business Reputation Verification */}
                {selectedTable === "business_reputation_reports" && report.status === "pending_verification" && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        Verify
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Verify Business Reputation Report</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-semibold mb-2">Report Details</h4>
                          <p><strong>Reported Person:</strong> {report.reported_person_name}</p>
                          <p><strong>Contact:</strong> {report.reported_person_contact}</p>
                          <p><strong>Business Type:</strong> {report.business_type}</p>
                          <p><strong>Transaction Date:</strong> {report.transaction_date}</p>
                          <p><strong>Amount:</strong> {report.transaction_amount}</p>
                          <p><strong>Experience:</strong> {report.reputation_status}</p>
                          <p className="mt-2"><strong>Description:</strong></p>
                          <p className="text-sm">{report.description}</p>
                          {report.evidence && (
                            <>
                              <p className="mt-2"><strong>Evidence:</strong></p>
                              <p className="text-sm">{report.evidence}</p>
                            </>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Verification Notes
                          </label>
                          <Textarea
                            placeholder="Add your verification notes here..."
                            value={verificationNotes}
                            onChange={(e) => setVerificationNotes(e.target.value)}
                            rows={4}
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => verifyBusinessReputationMutation.mutate({
                              id: report.id,
                              action: "verified",
                              notes: verificationNotes
                            })}
                            disabled={verifyBusinessReputationMutation.isPending}
                            className="flex-1"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve & Publish
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => verifyBusinessReputationMutation.mutate({
                              id: report.id,
                              action: "rejected",
                              notes: verificationNotes
                            })}
                            disabled={verifyBusinessReputationMutation.isPending}
                            className="flex-1"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}

                {/* Delete Button */}
                {canDelete && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this report? This action cannot be undone.")) {
                        deleteReportMutation.mutate({
                          id: report.id,
                          tableType: report.table_type || selectedTable
                        });
                      }
                    }}
                    disabled={deleteReportMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {reports?.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No reports found for {reportTables.find(t => t.id === selectedTable)?.name}</p>
        </div>
      )}
    </div>
  );
};

export default ReportsManagement;