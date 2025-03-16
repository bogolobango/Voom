import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Message, User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { getInitials } from "@/lib/utils";
import { ArrowLeft, Phone, Info, Paperclip, Image, Smile, Send, Play } from "lucide-react";
import { useLocation, useParams } from "wouter";
import { BottomNav } from "@/components/layout/bottom-nav";

interface MessageWithUser extends Message {
  sender: User;
}

export default function MessageDetail() {
  const [location, navigate] = useLocation();
  const params = useParams<{ userId: string }>();
  const userId = params.userId ? parseInt(params.userId) : null;
  const [newMessage, setNewMessage] = useState("");
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  // Get messages for conversation
  const { data: messages, isLoading: loadingMessages } = useQuery<MessageWithUser[]>({
    queryKey: ["/api/messages/conversation", userId],
    enabled: !!userId
  });
  
  // Get user details
  const { data: user } = useQuery<User>({
    queryKey: ["/api/users", userId],
    enabled: !!userId
  });

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messages && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!userId) return;
      
      return apiRequest("POST", "/api/messages", {
        receiverId: userId,
        content,
      });
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ 
        queryKey: ["/api/messages/conversation", userId] 
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
    if (newMessage.trim() && userId) {
      sendMessageMutation.mutate(newMessage);
    }
  };

  // Format timestamp for messages
  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  return (
    <>
      <div className="flex flex-col h-screen bg-white pb-14">
        {/* Conversation Header */}
        <div className="flex items-center p-4 border-b">
          <button 
            onClick={() => navigate("/messages")} 
            className="mr-2"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="flex items-center flex-1">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage 
                src={user?.profilePicture} 
                alt={user?.username} 
              />
              <AvatarFallback>{user ? getInitials(user.username) : "WW"}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{user?.username || "Wade Warren"}</span>
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
          {messages && messages.length > 0 ? (
            <>
              {/* Predefined messages from the design */}
              <div className="flex justify-start">
                <Avatar className="h-8 w-8 mr-2 self-end">
                  <AvatarFallback>WW</AvatarFallback>
                </Avatar>
                <div className="max-w-[80%] p-3 rounded-lg bg-gray-100 rounded-tl-none">
                  <p>Hi there! Are you here to pick up a car?</p>
                  <p className="text-xs mt-1 text-right text-gray-500">
                    10:30 pm
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <div className="max-w-[80%] p-3 rounded-lg bg-red-600 text-white rounded-tr-none">
                  <p>Yes, that's right! And I'm really looking forward to my road trip.</p>
                  <p className="text-xs mt-1 text-right text-red-100">
                    10:31 pm
                  </p>
                </div>
                <div className="w-8"></div>
              </div>

              <div className="flex justify-start">
                <Avatar className="h-8 w-8 mr-2 self-end">
                  <AvatarFallback>WW</AvatarFallback>
                </Avatar>
                <div className="max-w-[80%] p-3 rounded-lg bg-gray-100 rounded-tl-none">
                  <p>Wonderful! I'm Wade, happy to help you get on the road. Do you have your reservation information handy?</p>
                  <p className="text-xs mt-1 text-right text-gray-500">
                    10:35 pm
                  </p>
                </div>
              </div>

              {/* Car video/image mockup message */}
              <div className="flex justify-start">
                <Avatar className="h-8 w-8 mr-2 self-end">
                  <AvatarFallback>WW</AvatarFallback>
                </Avatar>
                <div className="max-w-[80%] rounded-lg bg-gray-100 rounded-tl-none overflow-hidden">
                  <div className="relative">
                    <img 
                      src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
                      alt="Car" 
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black bg-opacity-50 rounded-full p-2">
                        <Play size={24} className="text-white" />
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2">
                      VOOM LAUNCH
                    </div>
                  </div>
                  <p className="p-3">Check this out, your ride is ready to go!</p>
                  <p className="px-3 pb-3 text-xs text-right text-gray-500">
                    10:40 am
                  </p>
                </div>
              </div>

              <div className="flex justify-start">
                <Avatar className="h-8 w-8 mr-2 self-end">
                  <AvatarFallback>WW</AvatarFallback>
                </Avatar>
                <div className="max-w-[80%] rounded-lg bg-gray-100 rounded-tl-none overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
                    alt="Car" 
                    className="w-full h-32 object-cover"
                  />
                </div>
              </div>

              {/* User's messages mapped from API */}
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
                          src={user?.profilePicture || undefined} 
                          alt={user?.username || ""} 
                        />
                        <AvatarFallback>
                          {user ? getInitials(user.username) : "WW"}
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
          ) : loadingMessages ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Loading messages...</p>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">No messages in this conversation yet.</p>
            </div>
          )}
        </div>
        
        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="border-t p-3 bg-white">
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
      <BottomNav />
    </>
  );
}