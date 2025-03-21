import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { LoadingScreen } from "@/components/ui/loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Message, User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { getInitials } from "@/lib/utils";
import { Search, Send, Phone, ArrowLeft, Info, Paperclip, Image, Smile, AlertCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { whatsappService } from "@/lib/whatsapp";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  const [showEmptyState, setShowEmptyState] = useState(false);
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  // Auto-select the first conversation when the page loads
  const autoSelectFirstConversation = (conversations: ConversationUser[] | undefined) => {
    if (conversations && conversations.length > 0 && !selectedUserId) {
      // Find the conversation with unread messages first, otherwise select the first one
      const unreadConversation = conversations.find(c => c.unreadCount > 0);
      const conversationToSelect = unreadConversation || conversations[0];
      
      handleSelectConversation(conversationToSelect.id);
    } else if (conversations && conversations.length === 0) {
      setShowEmptyState(true);
    }
  };
  
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Get all conversations
  const { data: conversations, isLoading: loadingConversations } = useQuery<ConversationUser[]>({
    queryKey: ["/api/messages/conversations"],
  });

  // Effect to auto-select first conversation when data loads
  useEffect(() => {
    if (conversations) {
      autoSelectFirstConversation(conversations);
    }
  }, [conversations]);

  // Get messages for selected conversation
  const { data: messages, isLoading: loadingMessages } = useQuery<MessageWithUser[]>({
    queryKey: ["/api/messages/conversation", selectedUserId],
    enabled: !!selectedUserId,
  });
  
  // Effect to scroll to bottom when messages change
  useEffect(() => {
    if (messages) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages]);
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messages && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const { toast } = useToast();
  
  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedUserId) return;
      
      // Send message through the API (regular in-app messaging)
      const apiResult = await apiRequest("POST", "/api/messages", {
        receiverId: selectedUserId,
        content,
      });
      
      // If WhatsApp is configured, also try to send via WhatsApp
      const whatsappConfigStatus = whatsappService.getConfigStatus();
      if (whatsappConfigStatus.isConfigured && selectedConversation) {
        try {
          // This would normally get the phone number from the user profile
          // Using a placeholder since we don't have real phone numbers in ConversationUser yet
          // In a production environment, we would fetch this from the user profile
          const phoneNumber = "+1234567890"; // Hardcoded placeholder for demo purposes
          
          // Send message via WhatsApp
          await whatsappService.sendMessage({
            recipientPhoneNumber: phoneNumber,
            messageText: content
          });
          
        } catch (whatsappError) {
          console.error("WhatsApp message sending failed:", whatsappError);
          // Only show a toast if the API message was sent successfully
          toast({
            title: "WhatsApp message failed",
            description: "Your message was sent in-app but couldn't be delivered via WhatsApp.",
            variant: "destructive"
          });
        }
      }
      
      return apiResult;
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
    onError: (error) => {
      toast({
        title: "Message sending failed",
        description: "Please try again later.",
        variant: "destructive"
      });
      console.error("Message sending error:", error);
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
          {/* Removed WhatsApp Integration Notice */}
            
          {loadingMessages ? (
            <LoadingScreen />
          ) : messages && messages.length > 0 ? (
            <>
              {messages.map((message, index) => {
                // Check if this is the first message of a series from the same sender
                const isFirstInSeries = index === 0 || messages[index - 1].senderId !== message.senderId;
                
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
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <div className="mb-6">
              <div className="bg-green-50 rounded-full p-4 inline-block">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="64" height="64" fill="#25D366">
                  <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.301.297-.496.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.195 2.105 3.195 5.1 4.485.714.3 1.27.48 1.704.629.714.227 1.365.195 1.88.121.574-.091 1.767-.721 2.016-1.426.255-.705.255-1.29.18-1.425-.074-.135-.27-.21-.57-.345m-5.446 7.443h-.016c-1.77 0-3.524-.48-5.055-1.38l-.36-.214-3.75.975 1.005-3.645-.239-.375c-.99-1.576-1.516-3.391-1.516-5.26 0-5.445 4.455-9.885 9.942-9.885 2.654 0 5.145 1.035 7.021 2.91 1.875 1.859 2.909 4.35 2.909 6.99-.004 5.444-4.46 9.885-9.935 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.334.101 11.893c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652c1.746.943 3.71 1.444 5.71 1.447h.006c6.585 0 11.946-5.336 11.949-11.896 0-3.176-1.24-6.165-3.495-8.411"/>
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">WhatsApp Integration Coming Soon!</h2>
            <p className="text-gray-600 mb-4 max-w-md">
              We're excited to announce that WhatsApp integration will be available soon, 
              allowing you to communicate with hosts and guests directly through WhatsApp.
            </p>
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 w-full max-w-md">
              <h3 className="font-semibold text-gray-800 mb-2">Features coming soon:</h3>
              <ul className="text-left space-y-2">
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Real-time messaging with hosts and guests</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Booking confirmation notifications</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Pickup and return reminders</span>
                </li>
              </ul>
            </div>
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