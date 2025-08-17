import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Clock, CheckCircle, AlertCircle, User } from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

interface SupportTicket {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  resolution_notes?: string;
}

const SupportTicketsDashboard = () => {
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [newStatus, setNewStatus] = useState<string>("");
  const queryClient = useQueryClient();

  // Fetch all support tickets
  const { data: tickets, isLoading } = useQuery({
    queryKey: ['support-tickets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as SupportTicket[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const updateTicketStatus = async (ticketId: string, status: string, notes?: string) => {
    try {
      const updateData: any = { 
        status,
        updated_at: new Date().toISOString()
      };
      
      if (status === 'resolved' || status === 'closed') {
        updateData.resolved_at = new Date().toISOString();
        if (notes) {
          updateData.resolution_notes = notes;
        }
      }

      const { error } = await supabase
        .from('support_tickets')
        .update(updateData)
        .eq('id', ticketId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'destructive';
      case 'in_progress': return 'default';
      case 'resolved': return 'secondary';
      case 'closed': return 'outline';
      default: return 'default';
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Loading support tickets...</p>
      </div>
    );
  }

  if (selectedTicket) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => setSelectedTicket(null)}
            >
              ← Back to Tickets
            </Button>
            <div>
              <h2 className="text-2xl font-bold">{selectedTicket.subject}</h2>
              <p className="text-muted-foreground">From: {selectedTicket.name} ({selectedTicket.email})</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant={getPriorityColor(selectedTicket.priority)}>
              {selectedTicket.priority.toUpperCase()}
            </Badge>
            <Badge variant={getStatusColor(selectedTicket.status)}>
              {selectedTicket.status.toUpperCase()}
            </Badge>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Ticket Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Message:</h4>
              <p className="text-gray-700 whitespace-pre-wrap">{selectedTicket.message}</p>
            </div>
            
            {selectedTicket.phone && (
              <div>
                <h4 className="font-semibold mb-2">Phone:</h4>
                <p>{selectedTicket.phone}</p>
              </div>
            )}
            
            <div>
              <h4 className="font-semibold mb-2">Created:</h4>
              <p>{format(new Date(selectedTicket.created_at), "MMM dd, yyyy 'at' HH:mm")}</p>
            </div>
            
            {selectedTicket.resolution_notes && (
              <div>
                <h4 className="font-semibold mb-2">Resolution Notes:</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedTicket.resolution_notes}</p>
              </div>
            )}
            
            {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
              <div className="border-t pt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Update Status:</label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select new status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {(newStatus === 'resolved' || newStatus === 'closed') && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Resolution Notes:</label>
                    <Textarea
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Enter resolution details..."
                      rows={3}
                    />
                  </div>
                )}
                
                <Button 
                  onClick={() => updateTicketStatus(selectedTicket.id, newStatus, resolutionNotes)}
                  disabled={!newStatus}
                  className="w-full"
                >
                  Update Ticket
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <FileText className="h-8 w-8 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">Support Tickets</h2>
          <p className="text-muted-foreground">Manage customer support requests</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <AlertCircle className="h-10 w-10 text-red-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Open</p>
                <p className="text-2xl font-bold">{tickets?.filter(t => t.status === 'open').length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Clock className="h-10 w-10 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{tickets?.filter(t => t.status === 'in_progress').length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <CheckCircle className="h-10 w-10 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold">{tickets?.filter(t => t.status === 'resolved').length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <User className="h-10 w-10 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{tickets?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {tickets && tickets.length > 0 ? (
                tickets.map((ticket) => (
                  <Card key={ticket.id} className="p-4 hover:bg-accent/50 cursor-pointer transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold">{ticket.subject}</h4>
                          <Badge variant={getPriorityColor(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                          <Badge variant={getStatusColor(ticket.status)}>
                            {ticket.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          From: {ticket.name} ({ticket.email})
                        </p>
                        <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                          {ticket.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(ticket.created_at), "MMM dd, yyyy 'at' HH:mm")}
                        </p>
                      </div>
                      
                      <div className="ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTicket(ticket)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No support tickets yet</p>
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