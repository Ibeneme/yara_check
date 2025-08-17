import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, Send, User, UserCheck } from "lucide-react";
import { format } from "date-fns";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface LiveChatProps {
  userEmail?: string;
  userName?: string;
  isAdmin?: boolean;
  adminId?: string;
  sessionId?: string; // For admin to respond to specific session
}

const LiveChat: React.FC<LiveChatProps> = ({
  userEmail,
  userName,
  isAdmin,
  adminId,
  sessionId: propSessionId,
}) => {
  const [message, setMessage] = useState("");
  const [sessionId] = useState(
    () =>
      propSessionId ||
      `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );
  const [isConnected, setIsConnected] = useState(false);
  const [hasUserStarted, setHasUserStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch chat messages
  const { data: messages, isLoading } = useQuery({
    queryKey: ["chat-messages", sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("live_chat_messages")
        .select(
          `
          *,
          admin:profiles!live_chat_messages_admin_id_fkey(first_name, last_name)
        `
        )
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data;
    },
    refetchInterval: 2000, // Poll every 2 seconds for new messages
  });

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("chat-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "live_chat_messages",
          filter: `session_id=eq.${sessionId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: ["chat-messages", sessionId],
          });
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setIsConnected(true);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, queryClient]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    if (!isAdmin && !userEmail) {
      toast({
        title: "Email required",
        description: "Please provide your email to start chatting",
        variant: "destructive",
      });
      return;
    }

    try {
      const messageData = {
        session_id: sessionId,
        message: message.trim(),
        is_admin_reply: isAdmin || false,
        admin_id: isAdmin ? adminId : null,
        ...(isAdmin
          ? {
              user_email: "admin",
              user_name: "Admin",
            }
          : {
              user_email: userEmail,
              user_name: userName || "Anonymous User",
            }),
      };

      const { error } = await supabase
        .from("live_chat_messages")
        .insert(messageData);

      if (error) throw error;

      setMessage("");

      // Show appropriate messages for first-time users
      if (!isAdmin && !hasUserStarted) {
        setHasUserStarted(true);
        // Add automatic response for new users
        setTimeout(async () => {
          await supabase.from("live_chat_messages").insert({
            session_id: sessionId,
            message:
              "Thank you for contacting us! Please describe your issue and one of our agents will connect to the chat shortly. If you cannot wait, we will contact you using the email you provided.",
            is_admin_reply: true,
            user_email: "system",
            user_name: "System",
          });
        }, 1000);
      }

      toast({
        title: "Message sent",
        description: "Your message has been sent",
      });
    } catch (error: any) {
      console.error("Send message error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center">Loading chat...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Live Chat Support
          <Badge variant={isConnected ? "default" : "secondary"}>
            {isConnected ? "Connected" : "Connecting..."}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="h-96 border rounded-lg p-4">
          <div className="space-y-4">
            {messages && messages.length > 0 ? (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.is_admin_reply ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.is_admin_reply
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {msg.is_admin_reply ? (
                        <UserCheck className="h-4 w-4" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                      <span className="text-xs font-medium">
                        {msg.is_admin_reply
                          ? `${msg.admin?.first_name || "Admin"} ${
                              msg.admin?.last_name || ""
                            }`.trim()
                          : msg.user_name}
                      </span>
                    </div>
                    <div
                      className="text-sm"
                      dangerouslySetInnerHTML={{
                        __html: msg.message.replace(
                          /https?:\/\/[^\s<>"]+/g,
                          '<a href="$&" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">$&</a>'
                        ),
                      }}
                    />
                    <div className="text-xs opacity-70 mt-1">
                      {format(new Date(msg.created_at), "HH:mm")}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button onClick={sendMessage} disabled={!message.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {!isAdmin && (
          <div className="text-xs text-muted-foreground text-center">
            Messages are monitored by our support team. We'll respond as soon as
            possible.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LiveChat;
