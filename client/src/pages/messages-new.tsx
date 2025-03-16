import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BottomNav } from "@/components/layout/bottom-nav";
import { LoadingScreen } from "@/components/ui/loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Message, User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { getInitials } from "@/lib/utils";
import { Search, Send, Phone, ArrowLeft, Info, Paperclip, Image, Smile } from "lucide-react";
import { Link, useLocation } from "wouter";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [showEmptyState, setShowEmptyState] = useState(false);
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  // Get all conversations
  const { data: conversations, isLoading: loadingConversations } = useQuery<ConversationUser[]>({
    queryKey: ["/api/messages/conversations"]
  });

  // Get messages for selected conversation
  const { data: messages, isLoading: loadingMessages } = useQuery<MessageWithUser[]>({
    queryKey: ["/api/messages/conversation", selectedUserId],
    enabled: !!selectedUserId
  });
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messages && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  // Set empty state if no conversations
  useEffect(() => {
    if (conversations && conversations.length === 0) {
      setShowEmptyState(true);
    }
  }, [conversations]);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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
    const userConversation = conversations?.find(c => c.id === userId);
    if (userConversation?.unreadCount && userConversation.unreadCount > 0) {
      markAsReadMutation.mutate(userId);
    }
  };

  const filteredConversations = conversations?.filter(
    conversation => conversation.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format timestamp for messages
  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const selectedConversation = conversations?.find(c => c.id === selectedUserId);

  // If we're viewing a conversation
  if (selectedUserId) {
    return (
      <div className="flex flex-col h-screen bg-white">
        {/* Conversation Header */}
        <div className="flex items-center p-4 border-b">
          <button 
            onClick={() => setSelectedUserId(null)} 
            className="mr-2"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="flex items-center flex-1">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage 
                src={selectedConversation?.profilePicture} 
                alt={selectedConversation?.username} 
              />
              <AvatarFallback>{selectedConversation ? getInitials(selectedConversation.username) : ""}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{selectedConversation?.username}</span>
          </div>
          
          <div className="flex">
            <button className="mx-1">
              <Phone size={20} />
            </button>
            <button className="mx-1">
              <Info size={20} />
            </button>
          </div>
        </div>
        
        {/* Messages Area */}
        <div 
          ref={messagesContainerRef} 
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
        >
          {loadingMessages ? (
            <LoadingScreen />
          ) : messages && messages.length > 0 ? (
            <>
              {messages.map((message, index) => {
                // Check if this is the first message of a series from the same sender
                const isFirstInSeries = index === 0 || 
                  (messages[index - 1] && messages[index - 1].senderId !== message.senderId);
                
                // Is this message from the current user
                const isCurrentUser = message.senderId === 1; // Assuming current user ID is 1
                
                return (
                  <div
                    key={message.id}
                    className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                  >
                    {!isCurrentUser && isFirstInSeries && (
                      <Avatar className="h-8 w-8 mr-2 self-end">
                        <AvatarImage 
                          src={selectedConversation?.profilePicture} 
                          alt={selectedConversation?.username || ""} 
                        />
                        <AvatarFallback>
                          {selectedConversation ? getInitials(selectedConversation.username) : ""}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        isCurrentUser
                          ? "bg-red-600 text-white rounded-tr-none"
                          : "bg-gray-100 rounded-tl-none"
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className={`text-xs mt-1 text-right ${
                        isCurrentUser ? "text-red-100" : "text-gray-500"
                      }`}>
                        {message.createdAt ? formatMessageTime(message.createdAt.toString()) : '--'}
                      </p>
                    </div>
                    {isCurrentUser && isFirstInSeries && (
                      <div className="w-8"></div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-gray-500 mb-4">
                No messages yet. Start a conversation!
              </p>
            </div>
          )}
        </div>
        
        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="border-t p-3">
          <div className="flex items-center">
            <button type="button" className="px-2">
              <Paperclip size={20} className="text-gray-500" />
            </button>
            <button type="button" className="px-2">
              <Image size={20} className="text-gray-500" />
            </button>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Message..."
              className="flex-1 mx-2 border-gray-200"
            />
            <button type="button" className="px-2">
              <Smile size={20} className="text-gray-500" />
            </button>
            <Button 
              type="submit" 
              disabled={sendMessageMutation.isPending || !newMessage.trim()}
              className="ml-2 bg-red-600 hover:bg-red-700 rounded-full w-8 h-8 p-0 flex items-center justify-center"
            >
              {sendMessageMutation.isPending ? (
                <span className="animate-spin">●</span>
              ) : (
                <Send size={16} />
              )}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // Empty state - no messages
  if (showEmptyState) {
    return (
      <div className="flex flex-col h-screen bg-white">
        <div className="p-4 border-b">
          <h1 className="text-xl font-semibold">Messages</h1>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <div className="mb-4">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-gray-400">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">No new messages</h3>
          <p className="text-gray-500 mb-6">
            When you connect or get added to a host, you'll see your conversations here.
          </p>
          <p className="text-sm text-gray-400 mb-3">
            When you contact car hosts, you'll see your messages here.
          </p>
        </div>
        
        <BottomNav />
      </div>
    );
  }

  // Conversations list view
  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="p-4 border-b">
        <h1 className="text-xl font-semibold">Messages</h1>
        <div className="mt-3 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-gray-200"
          />
        </div>
      </div>
      
      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {loadingConversations ? (
          <LoadingScreen />
        ) : filteredConversations && filteredConversations.length > 0 ? (
          <div className="divide-y">
            {filteredConversations.map((user) => (
              <div
                key={user.id}
                className="p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleSelectConversation(user.id)}
              >
                <div className="flex items-center">
                  <Avatar className="h-12 w-12 mr-3">
                    <AvatarImage src={user.profilePicture} alt={user.username} />
                    <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-medium">{user.username}</span>
                      <span className="text-xs text-gray-500">10:30 pm</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      I'm taking a week-long adventure • 10:30PM
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : searchTerm ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <h3 className="text-lg font-medium mb-2">No Results Found</h3>
            <p className="text-gray-500">
              No conversations match your search. Try a different term.
            </p>
          </div>
        ) : (
          <LoadingScreen />
        )}
      </div>
      
      <BottomNav />
    </div>
  );
}