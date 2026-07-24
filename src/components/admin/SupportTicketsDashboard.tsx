import React, { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Trash2,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface SupportTicket {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "closed";
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  resolution_notes?: string;
}

const SupportTicketsDashboard = () => {
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    null
  );
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [newStatus, setNewStatus] = useState<string>("");
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  const canDelete =
    profile?.role === "super_admin" ||
    (profile?.role === "admin" &&
      (profile?.permissions as any)?.can_delete_support_tickets === true);

  const { data: tickets, isLoading } = useQuery({
    queryKey: ["support-tickets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as SupportTicket[];
    },
    refetchInterval: 30000,
  });

  const updateTicketStatus = async (
    ticketId: string,
    status: string,
    notes?: string
  ) => {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === "resolved" || status === "closed") {
        updateData.resolved_at = new Date().toISOString();
        if (notes) {
          updateData.resolution_notes = notes;
        }
      }

      const { error } = await supabase
        .from("support_tickets")
        .update(updateData)
        .eq("id", ticketId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
      toast({
        title: "Ticket updated",
        description: `Ticket has been marked as ${status}`,
      });

      setSelectedTicket(null);
      setResolutionNotes("");
      setNewStatus("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update ticket",
        variant: "destructive",
      });
    }
  };

  const deleteTicketMutation = useMutation({
    mutationFn: async (ticketId: string) => {
      const { error } = await supabase
        .from("support_tickets")
        .delete()
        .eq("id", ticketId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
      toast({
        title: "Ticket deleted",
        description: "Support ticket has been permanently deleted",
      });
      setSelectedTicket(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete ticket",
        variant: "destructive",
      });
    },
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "high":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "medium":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "low":
        return "bg-muted text-muted-foreground border-border";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "in_progress":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "resolved":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "closed":
        return "bg-muted text-muted-foreground border-border";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Loading support tickets...
        </p>
      </div>
    );
  }

  if (selectedTicket) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-2xl border shadow-sm">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setSelectedTicket(null)}
              className="h-9 shadow-sm"
            >
              ← Back to Tickets
            </Button>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                {selectedTicket.subject}
              </h2>
              <p className="text-xs text-muted-foreground">
                From:{" "}
                <span className="font-medium text-foreground">
                  {selectedTicket.name}
                </span>{" "}
                ({selectedTicket.email})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              className={`text-xs border px-2.5 py-0.5 uppercase ${getPriorityColor(
                selectedTicket.priority
              )}`}
            >
              {selectedTicket.priority}
            </Badge>
            <Badge
              className={`text-xs border px-2.5 py-0.5 uppercase ${getStatusColor(
                selectedTicket.status
              )}`}
            >
              {selectedTicket.status.replace("_", " ")}
            </Badge>
          </div>
        </div>

        <Card className="border shadow-sm bg-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Ticket Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-2">
                Message Content:
              </h4>
              <p className="text-sm text-foreground whitespace-pre-wrap bg-muted/40 p-4 rounded-xl border leading-relaxed">
                {selectedTicket.message}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {selectedTicket.phone && (
                <div>
                  <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Phone Number:
                  </h4>
                  <p className="text-sm font-medium text-foreground">
                    {selectedTicket.phone}
                  </p>
                </div>
              )}
              <div>
                <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Created Timestamp:
                </h4>
                <p className="text-sm text-foreground">
                  {format(
                    new Date(selectedTicket.created_at),
                    "MMM dd, yyyy 'at' HH:mm"
                  )}
                </p>
              </div>
            </div>

            {selectedTicket.resolution_notes && (
              <div className="pt-2">
                <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-2">
                  Resolution Notes:
                </h4>
                <p className="text-sm text-foreground whitespace-pre-wrap bg-emerald-50/50 p-4 rounded-xl border border-emerald-200/60">
                  {selectedTicket.resolution_notes}
                </p>
              </div>
            )}

            {selectedTicket.status !== "resolved" &&
              selectedTicket.status !== "closed" && (
                <div className="border-t pt-6 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Update Status:
                    </label>
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger className="h-11 bg-background shadow-sm">
                        <SelectValue placeholder="Select new status option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(newStatus === "resolved" || newStatus === "closed") && (
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        Resolution Notes:
                      </label>
                      <Textarea
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                        placeholder="Enter resolution details and final remarks..."
                        rows={3}
                        className="bg-background shadow-sm resize-none"
                      />
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button
                      onClick={() =>
                        updateTicketStatus(
                          selectedTicket.id,
                          newStatus,
                          resolutionNotes
                        )
                      }
                      disabled={!newStatus}
                      className="flex-1 h-11 shadow-sm"
                    >
                      Update Ticket Status
                    </Button>
                    {canDelete && (
                      <Button
                        variant="destructive"
                        onClick={() => {
                          if (
                            window.confirm(
                              "Are you sure you want to delete this ticket? This action cannot be undone."
                            )
                          ) {
                            deleteTicketMutation.mutate(selectedTicket.id);
                          }
                        }}
                        disabled={deleteTicketMutation.isPending}
                        className="h-11 px-5 shadow-sm"
                      >
                        <Trash2 className="h-4 w-4 mr-1.5 shrink-0" />
                        Delete Ticket
                      </Button>
                    )}
                  </div>
                </div>
              )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="bg-card p-6 rounded-2xl border shadow-sm flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-xl text-primary">
          <FileText className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Support Tickets</h2>
          <p className="text-sm text-muted-foreground">
            Manage customer support inquiries, tracking statuses, and issue
            resolution workflows.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border shadow-sm bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-rose-100 text-rose-800 rounded-xl">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Open Tickets
                </p>
                <p className="text-2xl font-bold tracking-tight text-foreground mt-0.5">
                  {tickets?.filter((t) => t.status === "open").length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 text-amber-800 rounded-xl">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  In Progress
                </p>
                <p className="text-2xl font-bold tracking-tight text-foreground mt-0.5">
                  {tickets?.filter((t) => t.status === "in_progress").length ||
                    0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Resolved
                </p>
                <p className="text-2xl font-bold tracking-tight text-foreground mt-0.5">
                  {tickets?.filter((t) => t.status === "resolved").length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 text-primary rounded-xl">
                <User className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Total Tickets
                </p>
                <p className="text-2xl font-bold tracking-tight text-foreground mt-0.5">
                  {tickets?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border shadow-sm bg-card">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-lg font-semibold">
            All Support Requests
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {tickets && tickets.length > 0 ? (
                tickets.map((ticket) => (
                  <Card
                    key={ticket.id}
                    className="p-5 border hover:border-primary/50 cursor-pointer transition-all duration-200 hover:shadow-md bg-card"
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-semibold text-base text-foreground truncate max-w-md">
                            {ticket.subject}
                          </h4>
                          <Badge
                            className={`text-[10px] border px-2 py-0.5 uppercase ${getPriorityColor(
                              ticket.priority
                            )}`}
                          >
                            {ticket.priority}
                          </Badge>
                          <Badge
                            className={`text-[10px] border px-2 py-0.5 uppercase ${getStatusColor(
                              ticket.status
                            )}`}
                          >
                            {ticket.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          From:{" "}
                          <span className="font-medium text-foreground">
                            {ticket.name}
                          </span>{" "}
                          ({ticket.email})
                        </p>
                        <p className="text-sm text-foreground/80 line-clamp-2 leading-relaxed">
                          {ticket.message}
                        </p>
                        <p className="text-[11px] text-muted-foreground font-mono">
                          {format(
                            new Date(ticket.created_at),
                            "MMM dd, yyyy 'at' HH:mm"
                          )}
                        </p>
                      </div>

                      <div
                        className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTicket(ticket)}
                          className="h-9 px-3.5 shadow-sm"
                        >
                          View Details
                        </Button>
                        {canDelete && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              if (
                                window.confirm(
                                  "Are you sure you want to delete this ticket? This action cannot be undone."
                                )
                              ) {
                                deleteTicketMutation.mutate(ticket.id);
                              }
                            }}
                            disabled={deleteTicketMutation.isPending}
                            className="h-9 px-3 shadow-sm"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only sm:not-sr-only sm:ml-1.5">
                              Delete
                            </span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-20 text-muted-foreground">
                  <div className="p-3 bg-muted rounded-full w-fit mx-auto mb-3">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="font-semibold text-base text-foreground">
                    No support tickets found
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    New user inquiries will appear here automatically.
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportTicketsDashboard;
