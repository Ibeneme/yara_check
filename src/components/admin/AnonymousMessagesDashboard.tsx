import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, Search, Calendar, Phone, Filter, Eye } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ReportDetails from "../reports/ReportDetails";

const AnonymousMessagesDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedMessage, setSelectedMessage] = useState<any>(null);

  const { data: messages, isLoading, refetch } = useQuery({
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
        query = query.or(`message.ilike.%${searchTerm}%,sender_contact.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Enrich with actual report data
      const enrichedMessages = await Promise.all(
        (data || []).map(async (message) => {
          try {
            const tableName = message.report_type === 'person' ? 'persons' : 
                            message.report_type === 'device' ? 'devices' : 'vehicles';
            
            const { data: reportData } = await supabase
              .from(tableName)
              .select('*')
              .eq('id', message.report_id)
              .single();

            return {
              ...message,
              report_details: reportData
            };
          } catch (error) {
            console.error("Error fetching report details:", error);
            return {
              ...message,
              report_details: null
            };
          }
        })
      );

      return enrichedMessages;
    },
  });

  const getReportTitle = (message: any) => {
    if (!message.report_details) return "Unknown Report";
    
    switch (message.report_type) {
      case 'person':
        return message.report_details.name || "Unknown Person";
      case 'device':
        return `${message.report_details.brand || ''} ${message.report_details.model || ''}`.trim() || "Unknown Device";
      case 'vehicle':
        return `${message.report_details.brand || ''} ${message.report_details.model || ''}`.trim() || "Unknown Vehicle";
      default:
        return "Unknown Report";
    }
  };

  const getReportTypeBadge = (type: string) => {
    const colors = {
      person: "bg-blue-100 text-blue-800 border-blue-200",
      device: "bg-green-100 text-green-800 border-green-200",
      vehicle: "bg-purple-100 text-purple-800 border-purple-200"
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading anonymous messages...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Anonymous Messages Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search messages or contact info..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="person">Missing Persons</SelectItem>
                  <SelectItem value="device">Stolen Devices</SelectItem>
                  <SelectItem value="vehicle">Stolen Vehicles</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => refetch()} variant="outline">
                Refresh
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {messages && messages.length > 0 ? (
              messages.map((message) => (
                <Card key={message.id} className="border-l-4 border-yaracheck-blue">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">
                            {getReportTitle(message)}
                          </h3>
                          <Badge className={getReportTypeBadge(message.report_type)}>
                            {message.report_type.charAt(0).toUpperCase() + message.report_type.slice(1)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{format(new Date(message.created_at), "MMM dd, yyyy 'at' HH:mm")}</span>
                          </div>
                          {message.sender_contact && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              <span>{message.sender_contact}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-gray-800 mb-3">{message.message}</p>
                        <div className="text-xs text-gray-500">
                          <span className="font-medium">Report ID:</span> {message.report_id}
                        </div>
                      </div>
                      <div className="ml-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View Report
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Report Details</DialogTitle>
                            </DialogHeader>
                            <ReportDetails 
                              reportId={message.report_id} 
                              reportType={message.report_type as 'person' | 'device' | 'vehicle'} 
                            />
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No anonymous messages found.</p>
                {(searchTerm || filterType !== "all") && (
                  <p className="text-sm mt-2">Try adjusting your search or filter criteria.</p>
                )}
              </div>
            )}
          </div>

          {messages && messages.length > 0 && (
            <div className="mt-6 pt-4 border-t">
              <p className="text-sm text-gray-500 text-center">
                Showing {messages.length} anonymous message{messages.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnonymousMessagesDashboard;