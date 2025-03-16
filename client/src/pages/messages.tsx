import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { LoadingScreen } from "@/components/ui/loader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Message, User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { getInitials } from "@/lib/utils";
import { Send } from "lucide-react";
import { Link } from "wouter";

interface MessageWithUser extends Message {
  sender: User;
}

interface ConversationUser {
  id: number;
  username: string;
  profilePicture?: string;
  unreadCount: number;
}

export default function Messages() {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const queryClient = useQueryClient();

  // Get all conversations
  const { data: conversations, isLoading: loadingConversations } = useQuery<ConversationUser[]>({
    queryKey: ["/api/messages/conversations"],
  });

  // Get messages for selected conversation
  const { data: messages, isLoading: loadingMessages } = useQuery<MessageWithUser[]>({
    queryKey: ["/api/messages/conversation", selectedUserId],
    enabled: !!selectedUserId,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedUserId) return;
      
      return apiRequest("POST", "/api/messages", {
        receiverId: selectedUserId,
        content,
      });
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ 
        queryKey: ["/api/messages/conversation", selectedUserId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["/api/messages/conversations"] 
      });
    },
  });

  // Mark conversation as read
  const markAsReadMutation = useMutation({
    mutationFn: async (userId: number) => {
      return apiRequest("POST", `/api/messages/read/${userId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/messages/conversations"] 
      });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && selectedUserId) {
      sendMessageMutation.mutate(newMessage);
    }
  };

  const handleSelectConversation = (userId: number) => {
    setSelectedUserId(userId);
    
    // Mark conversation as read when selected
    if (conversations?.find(c => c.id === userId)?.unreadCount) {
      markAsReadMutation.mutate(userId);
    }
  };

  return (
    <>
      <Header title="Messages" />
      <main className="container mx-auto px-4 py-6 mb-20 md:mb-0 md:flex md:h-[calc(100vh-64px)]">
        {/* Conversations List */}
        <div className="md:w-1/3 md:border-r md:pr-4 md:h-full md:overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">Conversations</h2>
          
          {loadingConversations ? (
            <LoadingScreen />
          ) : conversations && conversations.length > 0 ? (
            <div className="space-y-2">
              {conversations.map((user) => (
                <Card
                  key={user.id}
                  className={`p-3 cursor-pointer hover:bg-gray-50 ${
                    selectedUserId === user.id ? "border-red-600 bg-red-50" : ""
                  }`}
                  onClick={() => handleSelectConversation(user.id)}
                >
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src={user.profilePicture} alt={user.username} />
                      <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="font-medium">{user.username}</span>
                        {user.unreadCount > 0 && (
                          <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                            {user.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No conversations yet</p>
              <Link href="/">
                <Button className="bg-red-600 hover:bg-red-700 text-white">
                  Find cars to book
                </Button>
              </Link>
            </div>
          )}
        </div>
        
        {/* Message Content */}
        <div className="mt-6 md:mt-0 md:w-2/3 md:pl-4 md:flex md:flex-col md:h-full">
          {selectedUserId ? (
            <>
              <div className="border-b pb-3 mb-4">
                <h2 className="text-lg font-semibold">
                  {conversations?.find(c => c.id === selectedUserId)?.username}
                </h2>
              </div>
              
              <div className="flex-1 overflow-y-auto mb-4 space-y-3" style={{ maxHeight: 'calc(100vh - 240px)' }}>
                {loadingMessages ? (
                  <LoadingScreen />
                ) : messages && messages.length > 0 ? (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderId === 1 ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.senderId === 1
                            ? "bg-red-600 text-white rounded-tr-none"
                            : "bg-gray-100 rounded-tl-none"
                        }`}
                      >
                        <p>{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.senderId === 1 ? "text-red-100" : "text-gray-500"
                        }`}>
                          {new Date(message.createdAt).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      Start a conversation by sending a message
                    </p>
                  </div>
                )}
              </div>
              
              <form onSubmit={handleSendMessage} className="mt-auto">
                <div className="flex">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 mr-2"
                  />
                  <Button 
                    type="submit" 
                    disabled={sendMessageMutation.isPending || !newMessage.trim()}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {sendMessageMutation.isPending ? (
                      <span className="animate-spin">●</span>
                    ) : (
                      <Send size={18} />
                    )}
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                <p className="text-gray-500">
                  Choose a conversation from the list to view messages
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </>
  );
}
