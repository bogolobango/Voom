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
import { Search, Send, Phone, ArrowLeft, Info, Paperclip, Image, Smile, MessageSquare } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

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
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Get all conversations
  const { data: conversations, isLoading: loadingConversations } = useQuery<ConversationUser[]>({
    queryKey: ["/api/messages/conversations"],
  });

  // Get messages for selected conversation
  const { data: messages, isLoading: loadingMessages } = useQuery<MessageWithUser[]>({
    queryKey: ["/api/messages/conversation", selectedUserId],
    enabled: !!selectedUserId,
    refetchInterval: 5000, // Poll every 5s for new messages
  });

  // Effect to scroll to bottom when messages change
  useEffect(() => {
    if (messages && messages.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages]);

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
    onError: () => {
      toast({
        title: "Message sending failed",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
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

  const filteredConversations = conversations?.filter(
    conversation => conversation.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format timestamp for messages
  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
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
                const isFirstInSeries = index === 0 || messages[index - 1].senderId !== message.senderId;

                // Is this message from the current user
                const isCurrentUser = currentUser ? message.senderId === currentUser.id : false;

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
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => handleSelectConversation(conversation.id)}
                className="w-full flex items-center p-4 hover:bg-gray-50 transition-colors text-left"
              >
                <Avatar className="h-12 w-12 mr-3">
                  <AvatarImage
                    src={conversation.profilePicture}
                    alt={conversation.username}
                  />
                  <AvatarFallback>{getInitials(conversation.username)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="font-medium truncate">{conversation.username}</span>
                    {conversation.unreadCount > 0 && (
                      <span className="bg-red-600 text-white text-xs rounded-full h-5 min-w-[20px] flex items-center justify-center px-1.5 ml-2">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <div className="mb-4">
              <MessageSquare size={48} className="text-gray-300 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No conversations yet</h2>
            <p className="text-gray-500 mb-6 max-w-sm">
              Start a conversation by booking a car or contacting a host.
            </p>
            <Link href="/">
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                Explore available cars
              </Button>
            </Link>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
