import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Trash2,
  FileText,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type TableName =
  | "persons"
  | "devices"
  | "vehicles"
  | "household_items"
  | "personal_belongings"
  | "hacked_accounts"
  | "business_reputation_reports";

const ReportsManagement = () => {
  const [selectedTable, setSelectedTable] = useState<TableName | "all">("all");
  const [verificationNotes, setVerificationNotes] = useState("");
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  const canDelete =
    profile?.role === "super_admin" ||
    (profile?.role === "admin" &&
      (profile?.permissions as any)?.can_delete_reports === true);

  const reportTables = [
    { id: "all", name: "All Reports", statusField: "status" },
    { id: "persons", name: "Missing Persons", statusField: "status" },
    { id: "devices", name: "Stolen Devices", statusField: "status" },
    { id: "vehicles", name: "Stolen Vehicles", statusField: "status" },
    { id: "household_items", name: "Household Items", statusField: "status" },
    {
      id: "personal_belongings",
      name: "Personal Belongings",
      statusField: "status",
    },
    { id: "hacked_accounts", name: "Hacked Accounts", statusField: "status" },
    {
      id: "business_reputation_reports",
      name: "Business Reputation",
      statusField: "status",
    },
  ];

  const { data: reports, isLoading } = useQuery({
    queryKey: ["admin-reports", selectedTable],
    queryFn: async () => {
      if (selectedTable === "all") {
        const allReports = [];

        for (const table of reportTables.slice(1)) {
          try {
            const { data, error } = await supabase
              .from(table.id as TableName)
              .select("*")
              .order("report_date", { ascending: false });

            if (data && !error) {
              const reportsWithType = data.map((report) => ({
                ...report,
                table_type: table.id,
                table_name: table.name,
              }));
              allReports.push(...reportsWithType);
            }
          } catch (err) {
            console.error(`Error fetching ${table.id}:`, err);
          }
        }

        return allReports.sort(
          (a, b) =>
            new Date(b.report_date).getTime() -
            new Date(a.report_date).getTime()
        );
      } else {
        const { data, error } = await supabase
          .from(selectedTable as TableName)
          .select("*")
          .order("report_date", { ascending: false });

        if (error) throw error;
        return (
          data?.map((report) => ({
            ...report,
            table_type: selectedTable,
            table_name: reportTables.find((t) => t.id === selectedTable)?.name,
          })) || []
        );
      }
    },
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({
      id,
      visible,
      tableType,
    }: {
      id: string;
      visible: boolean;
      tableType: string;
    }) => {
      const targetTable = tableType === "all" ? selectedTable : tableType;
      const { error } = await supabase
        .from(targetTable as TableName)
        .update({ visible })
        .eq("id", id);

      if (error) throw error;
      return { id, visible };
    },
    onMutate: async ({ id, visible }) => {
      await queryClient.cancelQueries({
        queryKey: ["admin-reports", selectedTable],
      });
      const previousReports = queryClient.getQueryData([
        "admin-reports",
        selectedTable,
      ]);

      queryClient.setQueryData(["admin-reports", selectedTable], (old: any) => {
        if (!old) return old;
        return old.map((report: any) =>
          report.id === id ? { ...report, visible } : report
        );
      });

      return { previousReports };
    },
    onError: (error, variables, context) => {
      if (context?.previousReports) {
        queryClient.setQueryData(
          ["admin-reports", selectedTable],
          context.previousReports
        );
      }
      console.error("Error updating visibility:", error);
      toast.error("Failed to update visibility");
    },
    onSuccess: (data) => {
      toast.success(`Report ${data.visible ? "shown" : "hidden"} successfully`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-reports", selectedTable],
      });
    },
  });

  const verifyBusinessReputationMutation = useMutation({
    mutationFn: async ({
      id,
      action,
      notes,
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
          verified_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-reports", selectedTable],
      });
      toast.success("Business reputation report verified successfully");
      setVerificationNotes("");
    },
    onError: (error) => {
      console.error("Error verifying report:", error);
      toast.error("Failed to verify report");
    },
  });

  const deleteReportMutation = useMutation({
    mutationFn: async ({
      id,
      tableType,
    }: {
      id: string;
      tableType: string;
    }) => {
      const targetTable = tableType === "all" ? selectedTable : tableType;
      const { error } = await supabase
        .from(targetTable as TableName)
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { id, tableType: targetTable };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-reports", selectedTable],
      });
      toast.success("Report deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting report:", error);
      toast.error("Failed to delete report");
    },
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        variant: "secondary" as const,
        icon: AlertTriangle,
        text: "Pending",
        color: "bg-amber-100 text-amber-800 border-amber-200",
      },
      verified: {
        variant: "default" as const,
        icon: CheckCircle,
        text: "Verified",
        color: "bg-emerald-100 text-emerald-800 border-emerald-200",
      },
      found: {
        variant: "default" as const,
        icon: CheckCircle,
        text: "Found",
        color: "bg-emerald-100 text-emerald-800 border-emerald-200",
      },
      missing: {
        variant: "destructive" as const,
        icon: AlertTriangle,
        text: "Missing",
        color: "bg-rose-100 text-rose-800 border-rose-200",
      },
      rejected: {
        variant: "destructive" as const,
        icon: XCircle,
        text: "Rejected",
        color: "bg-rose-100 text-rose-800 border-rose-200",
      },
      pending_verification: {
        variant: "secondary" as const,
        icon: AlertTriangle,
        text: "Awaiting Verification",
        color: "bg-amber-100 text-amber-800 border-amber-200",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}
      >
        <Icon className="h-3 w-3 shrink-0" />
        <span>{config.text}</span>
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Loading reports list...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header section with distinct sleek styling */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-2xl border shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              Reports Management
            </h2>
          </div>
          <p className="text-sm text-muted-foreground pl-11">
            Monitor, verify status, and manage access visibility for all filed
            reports.
          </p>
        </div>

        <div className="w-full md:w-72">
          <Select
            value={selectedTable}
            onValueChange={(value: string) =>
              setSelectedTable(value as TableName | "all")
            }
          >
            <SelectTrigger className="h-11 bg-background border-input shadow-sm">
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent className="max-h-80">
              {reportTables.map((table) => (
                <SelectItem key={table.id} value={table.id} className="py-2.5">
                  {table.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reports List Grid */}
      <div className="grid gap-4">
        {reports?.map((report: any) => {
          const reportTitle =
            report.name ||
            report.reported_person_name ||
            `${report.type || ""} ${report.brand || ""}`.trim() ||
            "Untitled Report";

          return (
            <Card
              key={report.id}
              className="group overflow-hidden border transition-all duration-200 hover:shadow-md hover:border-primary/40 bg-card"
            >
              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                  {/* Left Column: Info */}
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold tracking-tight text-foreground truncate max-w-md">
                        {reportTitle}
                      </h3>
                      {getStatusBadge(report.status)}

                      {selectedTable === "all" && (
                        <Badge
                          variant="outline"
                          className="font-normal text-xs bg-muted/50"
                        >
                          {report.table_name}
                        </Badge>
                      )}

                      <Badge
                        variant={report.visible ? "default" : "secondary"}
                        className={`text-xs gap-1 font-normal ${
                          report.visible
                            ? "bg-primary/10 text-primary hover:bg-primary/20 border-transparent"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {report.visible ? (
                          <>
                            <Eye className="h-3 w-3 shrink-0" />
                            <span>Public</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3 w-3 shrink-0" />
                            <span>Hidden</span>
                          </>
                        )}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>
                        Reporter:{" "}
                        <strong className="text-foreground font-medium">
                          {report.reporter_name || "Anonymous"}
                        </strong>{" "}
                        ({report.reporter_email || "No email"})
                      </span>
                      <span>•</span>
                      <span>
                        Filed on:{" "}
                        <strong className="text-foreground font-medium">
                          {new Date(report.report_date).toLocaleDateString(
                            undefined,
                            { year: "numeric", month: "short", day: "numeric" }
                          )}
                        </strong>
                      </span>
                    </div>

                    {report.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 bg-muted/30 p-3 rounded-xl border border-border/50">
                        {report.description}
                      </p>
                    )}
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex flex-wrap items-center gap-2.5 pt-4 xl:pt-0 border-t xl:border-t-0 border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        toggleVisibilityMutation.mutate({
                          id: report.id,
                          visible: !report.visible,
                          tableType: report.table_type || selectedTable,
                        })
                      }
                      disabled={toggleVisibilityMutation.isPending}
                      className="h-9 px-3.5 gap-1.5 shadow-sm"
                    >
                      {report.visible ? (
                        <>
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                          <span>Hide</span>
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 text-muted-foreground" />
                          <span>Show</span>
                        </>
                      )}
                    </Button>

                    {selectedTable === "business_reputation_reports" &&
                      report.status === "pending_verification" && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="default"
                              size="sm"
                              className="h-9 px-4 gap-1.5 shadow-sm bg-amber-600 hover:bg-amber-700 text-white"
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span>Verify Report</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-xl p-6">
                            <DialogHeader>
                              <DialogTitle className="text-xl font-bold">
                                Verify Business Reputation Report
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-2">
                              <div className="bg-muted/50 p-4 rounded-xl border space-y-2 text-sm">
                                <h4 className="font-semibold text-foreground mb-3 text-xs tracking-wider uppercase text-muted-foreground">
                                  Submission Details
                                </h4>
                                <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                                  <div>
                                    <span className="text-muted-foreground">
                                      Person:
                                    </span>{" "}
                                    <span className="font-medium">
                                      {report.reported_person_name}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">
                                      Contact:
                                    </span>{" "}
                                    <span className="font-medium">
                                      {report.reported_person_contact}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">
                                      Business:
                                    </span>{" "}
                                    <span className="font-medium">
                                      {report.business_type}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">
                                      Amount:
                                    </span>{" "}
                                    <span className="font-medium">
                                      {report.transaction_amount}
                                    </span>
                                  </div>
                                </div>
                                <div className="pt-2 border-t mt-2">
                                  <span className="text-muted-foreground block text-xs mb-1">
                                    Description:
                                  </span>
                                  <p className="text-foreground bg-background p-2.5 rounded-lg border text-xs">
                                    {report.description}
                                  </p>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                  Verification Notes
                                </label>
                                <Textarea
                                  placeholder="Provide internal notes explaining why this was approved or rejected..."
                                  value={verificationNotes}
                                  onChange={(e) =>
                                    setVerificationNotes(e.target.value)
                                  }
                                  rows={3}
                                  className="resize-none"
                                />
                              </div>

                              <div className="flex gap-3 pt-2">
                                <Button
                                  onClick={() =>
                                    verifyBusinessReputationMutation.mutate({
                                      id: report.id,
                                      action: "verified",
                                      notes: verificationNotes,
                                    })
                                  }
                                  disabled={
                                    verifyBusinessReputationMutation.isPending
                                  }
                                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  <span>Approve & Publish</span>
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() =>
                                    verifyBusinessReputationMutation.mutate({
                                      id: report.id,
                                      action: "rejected",
                                      notes: verificationNotes,
                                    })
                                  }
                                  disabled={
                                    verifyBusinessReputationMutation.isPending
                                  }
                                  className="flex-1 gap-2"
                                >
                                  <XCircle className="h-4 w-4" />
                                  <span>Reject</span>
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}

                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (
                            window.confirm(
                              "Are you sure you want to delete this report? This action cannot be undone."
                            )
                          ) {
                            deleteReportMutation.mutate({
                              id: report.id,
                              tableType: report.table_type || selectedTable,
                            });
                          }
                        }}
                        disabled={deleteReportMutation.isPending}
                        className="h-9 px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only sm:not-sr-only sm:ml-1.5">
                          Delete
                        </span>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {reports?.length === 0 && (
        <Card className="border-dashed bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-3 bg-muted rounded-full text-muted-foreground mb-3">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg text-foreground">
              No reports found
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-1">
              There are currently no reports available under the selected
              category:{" "}
              <strong className="text-foreground">
                {reportTables.find((t) => t.id === selectedTable)?.name}
              </strong>
              .
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReportsManagement;
