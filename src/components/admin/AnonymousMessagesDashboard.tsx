import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import {
  MessageSquare,
  Search,
  Calendar,
  Phone,
  Filter,
  Eye,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ReportDetails from "../reports/ReportDetails";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const AnonymousMessagesDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  const canDelete =
    profile?.role === "super_admin" ||
    (profile?.role === "admin" &&
      (profile?.permissions as any)?.can_delete_anonymous_messages === true);

  const {
    data: messages,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["anonymous-messages-dashboard", searchTerm, filterType],
    queryFn: async () => {
      let query = supabase
        .from("anonymous_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (filterType !== "all") {
        query = query.eq("report_type", filterType);
      }

      if (searchTerm) {
        query = query.or(
          `message.ilike.%${searchTerm}%,sender_contact.ilike.%${searchTerm}%`
        );
      }

      const { data, error } = await query;

      if (error) throw error;

      const enrichedMessages = await Promise.all(
        (data || []).map(async (message) => {
          try {
            const tableName =
              message.report_type === "person"
                ? "persons"
                : message.report_type === "device"
                ? "devices"
                : "vehicles";

            const { data: reportData } = await supabase
              .from(tableName)
              .select("*")
              .eq("id", message.report_id)
              .single();

            return {
              ...message,
              report_details: reportData,
            };
          } catch (error) {
            console.error("Error fetching report details:", error);
            return {
              ...message,
              report_details: null,
            };
          }
        })
      );

      return enrichedMessages;
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from("anonymous_messages")
        .delete()
        .eq("id", messageId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["anonymous-messages-dashboard"],
      });
      toast.success("Anonymous message deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete message");
    },
  });

  const getReportTitle = (message: any) => {
    if (!message.report_details) return "Unknown Report";

    switch (message.report_type) {
      case "person":
        return message.report_details.name || "Unknown Person";
      case "device":
        return (
          `${message.report_details.brand || ""} ${
            message.report_details.model || ""
          }`.trim() || "Unknown Device"
        );
      case "vehicle":
        return (
          `${message.report_details.brand || ""} ${
            message.report_details.model || ""
          }`.trim() || "Unknown Vehicle"
        );
      default:
        return "Unknown Report";
    }
  };

  const getReportTypeBadge = (type: string) => {
    const colors = {
      person: "bg-blue-100 text-blue-800 border-blue-200",
      device: "bg-emerald-100 text-emerald-800 border-emerald-200",
      vehicle: "bg-purple-100 text-purple-800 border-purple-200",
    };
    return (
      colors[type as keyof typeof colors] ||
      "bg-muted text-muted-foreground border-border"
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading anonymous messages...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header section */}
      <div className="bg-card p-6 rounded-2xl border shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Anonymous Messages Dashboard</h2>
              <p className="text-sm text-muted-foreground">
                Manage tips and secure messages submitted for various active reports.
              </p>
            </div>
          </div>
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="h-10 self-start md:self-auto shadow-sm"
          >
            Refresh List
          </Button>
        </div>

        {/* Filter controls */}
        <div className="flex flex-col sm:flex-row gap-4 pt-2 border-t">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search content or contact info..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 bg-background shadow-sm"
            />
          </div>
          <div className="w-full sm:w-60">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="h-11 bg-background shadow-sm">
                <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Report Types</SelectItem>
                <SelectItem value="person">Missing Persons</SelectItem>
                <SelectItem value="device">Stolen Devices</SelectItem>
                <SelectItem value="vehicle">Stolen Vehicles</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="grid gap-4">
        {messages && messages.length > 0 ? (
          messages.map((message) => (
            <Card
              key={message.id}
              className="group overflow-hidden border-l-4 border-l-primary transition-all duration-200 hover:shadow-md bg-card"
            >
              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  
                  {/* Left Column Content */}
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold tracking-tight text-foreground truncate max-w-md">
                        {getReportTitle(message)}
                      </h3>
                      <Badge
                        className={`${getReportTypeBadge(
                          message.report_type
                        )} border px-2.5 py-0.5 text-xs font-medium`}
                      >
                        {message.report_type.charAt(0).toUpperCase() +
                          message.report_type.slice(1)}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span>
                          {format(
                            new Date(message.created_at),
                            "MMM dd, yyyy 'at' HH:mm"
                          )}
                        </span>
                      </div>
                      {message.sender_contact && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="font-medium text-foreground">{message.sender_contact}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-foreground bg-muted/40 p-4 rounded-xl border border-border/50 leading-relaxed whitespace-pre-wrap">
                      {message.message}
                    </p>

                    <div className="text-[11px] text-muted-foreground font-mono">
                      <span className="font-medium text-muted-foreground">Report ID:</span> {message.report_id}
                    </div>
                  </div>

                  {/* Right Column Actions */}
                  <div className="flex items-center gap-2 pt-4 lg:pt-0 border-t lg:border-t-0 border-border">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 px-3.5 gap-1.5 shadow-sm"
                        >
                          <Eye className="h-4 w-4 text-muted-foreground" />
                          <span>View Report</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto p-6">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-bold">
                            Associated Report Details
                          </DialogTitle>
                        </DialogHeader>
                        <div className="pt-2">
                          <ReportDetails
                            reportId={message.report_id}
                            reportType={
                              message.report_type as
                                | "person"
                                | "device"
                                | "vehicle"
                            }
                          />
                        </div>
                      </DialogContent>
                    </Dialog>

                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (
                            window.confirm(
                              "Are you sure you want to delete this message? This action cannot be undone."
                            )
                          ) {
                            deleteMessageMutation.mutate(message.id);
                          }
                        }}
                        disabled={deleteMessageMutation.isPending}
                        className="h-9 px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only sm:not-sr-only sm:ml-1.5">Delete</span>
                      </Button>
                    )}
                  </div>

                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-dashed bg-muted/20">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-3 bg-muted rounded-full text-muted-foreground mb-3">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg text-foreground">No anonymous messages found</h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-1">
                {(searchTerm || filterType !== "all")
                  ? "Try clearing or modifying your search and filter criteria."
                  : "There are currently no anonymous messages submitted in the system."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {messages && messages.length > 0 && (
        <div className="pt-2 text-center">
          <p className="text-xs text-muted-foreground font-medium">
            Showing {messages.length} secure message{messages.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  );
};

export default AnonymousMessagesDashboard;