
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, Calendar, Phone } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface AnonymousMessagesProps {
  reportId: string;
  reportType: 'person' | 'device' | 'vehicle';
  showForReporter?: boolean;
}

const AnonymousMessages = ({ reportId, reportType, showForReporter = false }: AnonymousMessagesProps) => {
  const { isAdmin, user } = useAuth();
  
  // Check if user has permission to view anonymous messages
  const { data: userProfile } = useQuery({
    queryKey: ["user-profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("permissions, role, admin_role")
        .eq("id", user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && !showForReporter
  });

  const canViewMessages = showForReporter || 
    isAdmin || 
    (userProfile?.role === 'super_admin') ||
    (userProfile?.admin_role === 'director') ||
    (userProfile?.permissions && 
     typeof userProfile.permissions === 'object' && 
     userProfile.permissions !== null &&
     (userProfile.permissions as any).can_view_anonymous_messages === true);

  const { data: messages, isLoading } = useQuery({
    queryKey: ["anonymous-messages", reportId, showForReporter],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("anonymous_messages")
        .select("*")
        .eq("report_id", reportId)
        .eq("report_type", reportType)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: showForReporter || canViewMessages,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Anonymous Messages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Loading messages...</p>
        </CardContent>
      </Card>
    );
  }

  // Don't show the component if not authorized
  if (!showForReporter && !canViewMessages) {
    return null;
  }

  if (!messages || messages.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Anonymous Messages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No messages yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Anonymous Messages ({messages.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="border-l-4 border-blue-500 pl-4 py-2">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(message.created_at).toLocaleString()}</span>
                {message.sender_contact && (
                  <>
                    <Phone className="h-4 w-4 ml-2" />
                    <span>{message.sender_contact}</span>
                  </>
                )}
              </div>
              <p className="text-gray-800">{message.message}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AnonymousMessages;
