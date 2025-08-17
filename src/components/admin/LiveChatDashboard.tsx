import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, Users, Clock, Trash2, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import LiveChat from "@/components/chat/LiveChat";

interface ChatSession {
  session_id: string;
  user_email: string;
  user_name: string;
  latest_message: string;
  latest_message_time: string;
  message_count: number;
  has_admin_reply: boolean;
  status: string;
  resolved_by?: string;
  resolved_at?: string;
}

const LiveChatDashboard = ({ adminId }: { adminId?: string }) => {
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [selectedSessionData, setSelectedSessionData] = useState<ChatSession | null>(null);
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  
  // Check if current user is super admin
  const isSuper = profile?.role === 'super_admin' || profile?.admin_role === 'super_admin';

  // Fetch all chat sessions
  const { data: sessions, isLoading } = useQuery({
    queryKey: ['admin-chat-sessions'],
    queryFn: async () => {
      const { data: rawData, error } = await supabase
        .from('live_chat_messages')
        .select(`
          *,
          resolved_admin:profiles!live_chat_messages_resolved_by_fkey(first_name, last_name),
          responding_admin:profiles!live_chat_messages_admin_id_fkey(first_name, last_name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      // Group by session_id and get session summaries
      const sessionMap = new Map<string, ChatSession>();
      
      rawData.forEach((message) => {
        const existing = sessionMap.get(message.session_id);
        if (!existing || new Date(message.created_at) > new Date(existing.latest_message_time)) {
          const sessionStatus = rawData.find(m => m.session_id === message.session_id && m.status === 'resolved')?.status || 'active';
          const resolvedMessage = rawData.find(m => m.session_id === message.session_id && m.resolved_by);
          
          sessionMap.set(message.session_id, {
            session_id: message.session_id,
            user_email: message.user_email,
            user_name: message.user_name || 'Anonymous User',
            latest_message: message.message,
            latest_message_time: message.created_at,
            message_count: rawData.filter(m => m.session_id === message.session_id).length,
            has_admin_reply: rawData.some(m => m.session_id === message.session_id && m.is_admin_reply),
            status: sessionStatus,
            resolved_by: resolvedMessage?.resolved_admin?.first_name ? 
              `${resolvedMessage.resolved_admin.first_name} ${resolvedMessage.resolved_admin.last_name}`.trim() : 
              undefined,
            resolved_at: resolvedMessage?.resolved_at
          });
        }
      });

      return {
        sessions: Array.from(sessionMap.values())
          .sort((a, b) => new Date(b.latest_message_time).getTime() - new Date(a.latest_message_time).getTime()),
        rawData
      };
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const deleteSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('live_chat_messages')
        .delete()
        .eq('session_id', sessionId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['admin-chat-sessions'] });
      toast({
        title: "Session deleted",
        description: "Chat session has been deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete session",
        variant: "destructive",
      });
    }
  };

  const resolveSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('live_chat_messages')
        .update({
          status: 'resolved',
          resolved_by: adminId,
          resolved_at: new Date().toISOString()
        })
        .eq('session_id', sessionId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['admin-chat-sessions'] });
      toast({
        title: "Session resolved",
        description: "Chat session has been marked as resolved",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resolve session",
        variant: "destructive",
      });
    }
  };

  const clearAllSessions = async () => {
    try {
      const { error } = await supabase
        .from('live_chat_messages')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['admin-chat-sessions'] });
      toast({
        title: "All sessions cleared",
        description: "All chat sessions have been cleared successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to clear sessions",
        variant: "destructive",
      });
    }
  };

  if (selectedSession && selectedSessionData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedSession(null);
                setSelectedSessionData(null);
              }}
            >
              ← Back to Sessions
            </Button>
            <div>
              <h2 className="text-2xl font-bold">Chat with {selectedSessionData.user_name}</h2>
              <p className="text-muted-foreground">{selectedSessionData.user_email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {selectedSessionData.status !== 'resolved' && (
              <Button 
                onClick={() => resolveSession(selectedSession)}
                variant="outline"
                className="text-green-600"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Resolve Chat
              </Button>
            )}
            {isSuper && (
              <Button 
                onClick={() => deleteSession(selectedSession)}
                variant="outline"
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Session
              </Button>
            )}
          </div>
        </div>
        
        <LiveChat 
          isAdmin={true}
          adminId={adminId}
          userEmail="admin"
          userName="Admin"
          sessionId={selectedSession}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Loading chat sessions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <MessageCircle className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Live Chat Dashboard</h2>
            <p className="text-muted-foreground">Manage customer support conversations</p>
          </div>
        </div>
        {isSuper && (
          <Button 
            onClick={clearAllSessions}
            variant="outline"
            className="text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All Sessions
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Users className="h-10 w-10 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Sessions</p>
                <p className="text-2xl font-bold">{sessions?.sessions?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <MessageCircle className="h-10 w-10 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Responded</p>
                <p className="text-2xl font-bold">
                  {sessions?.sessions?.filter(s => s.has_admin_reply).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Clock className="h-10 w-10 text-orange-500" />
              <div className="flex items-center gap-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">
                    {sessions?.sessions?.filter(s => !s.has_admin_reply && s.status !== 'resolved').length || 0}
                  </p>
                </div>
                {sessions?.sessions?.filter(s => !s.has_admin_reply && s.status !== 'resolved').length > 0 && (
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" title="New unread messages" />
                )}
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
                <p className="text-2xl font-bold">
                  {sessions?.sessions?.filter(s => s.status === 'resolved').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chat Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {sessions?.sessions && sessions.sessions.length > 0 ? (
                sessions.sessions.map((session) => (
                  <Card key={session.session_id} className="p-4 hover:bg-accent/50 cursor-pointer transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold">{session.user_name}</h4>
                          <Badge variant={session.status === 'resolved' ? "secondary" : session.has_admin_reply ? "default" : "destructive"}>
                            {session.status === 'resolved' ? "Resolved" : session.has_admin_reply ? "Responded" : "Pending"}
                          </Badge>
                          <Badge variant="outline">
                            {session.message_count} messages
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {session.user_email}
                        </p>
                        <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                          {session.latest_message}
                        </p>
                        <div className="flex justify-between items-center text-xs">
                          <p className="text-muted-foreground">
                            {format(new Date(session.latest_message_time), "MMM dd, yyyy 'at' HH:mm")}
                          </p>
                          <div className="flex gap-2">
                            {session.resolved_by && (
                              <p className="text-green-600">
                                Resolved by {session.resolved_by}
                              </p>
                            )}
                            {/* Show which admin last responded for audit purposes */}
                            {session.has_admin_reply && sessions?.rawData && (() => {
                              const lastAdminMessage = sessions.rawData
                                .filter(m => m.session_id === session.session_id && m.is_admin_reply && m.responding_admin)
                                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
                              
                              if (lastAdminMessage?.responding_admin) {
                                return (
                                  <p className="text-blue-600">
                                    Last response: {lastAdminMessage.responding_admin.first_name} {lastAdminMessage.responding_admin.last_name}
                                  </p>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedSession(session.session_id);
                            setSelectedSessionData(session);
                          }}
                        >
                          {session.status === 'resolved' ? 'View' : 'Respond'}
                        </Button>
                        {isSuper && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteSession(session.session_id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No chat sessions yet</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveChatDashboard;