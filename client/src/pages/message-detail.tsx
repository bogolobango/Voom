import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Message, User, Car } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { getInitials, formatDateAndTime } from "@/lib/utils";
import { 
  ArrowLeft, 
  Phone, 
  Info, 
  Paperclip, 
  Image, 
  Smile, 
  Send, 
  Play, 
  Calendar,
  MapPin,
  Car as CarIcon,
  ChevronRight,
  Clock,
  CheckCircle2,
  MoreHorizontal,
  MessageCircleMore,
  CircleHelpIcon,
  Star
} from "lucide-react";
import { useLocation, useParams } from "wouter";
import { BottomNav } from "@/components/layout/bottom-nav";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface MessageWithUser extends Message {
  sender: User;
}

// Message type enum for quick replies
type QuickReplyType = 
  | 'greeting' 
  | 'directions' 
  | 'confirm_reservation' 
  | 'payment' 
  | 'car_details' 
  | 'pickup_instructions';

interface QuickReply {
  type: QuickReplyType;
  text: string;
}

export default function MessageDetail() {
  const [location, navigate] = useLocation();
  const params = useParams<{ userId: string }>();
  const userId = params.userId ? parseInt(params.userId) : null;
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const { toast } = useToast();
  
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
  
  // Mock car data for sharing in messages
  const { data: cars } = useQuery<Car[]>({
    queryKey: ["/api/hosts/cars"],
    enabled: !!userId
  });
  
  // List of quick replies for hosts
  const quickReplies: QuickReply[] = [
    {
      type: 'greeting',
      text: 'Hi there! Thank you for your interest in my car. How can I help you today?'
    },
    {
      type: 'directions',
      text: 'Here are the pickup directions: Please come to the designated parking area. I\'ll meet you there.'
    },
    {
      type: 'confirm_reservation',
      text: 'Great! Your reservation is confirmed. I look forward to meeting you on the pickup date.'
    },
    {
      type: 'payment',
      text: 'The payment has been processed successfully. No further action is needed.'
    },
    {
      type: 'car_details',
      text: 'The car has GPS, Bluetooth connectivity, and a full tank of gas. Let me know if you have any questions.'
    },
    {
      type: 'pickup_instructions',
      text: 'For pickup: Please bring your driver\'s license and the credit card you used for the booking.'
    }
  ];

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messages && messages.length > 0) {
      scrollToBottom();
    }
    
    // Mark messages as read when conversation is opened
    if (userId) {
      markAsReadMutation.mutate(userId);
    }
    
    // Start typing indicator for demo
    const typingTimer = setTimeout(() => {
      if (messages && messages.length > 0) {
        setIsTyping(true);
        
        // Hide typing indicator after 3 seconds
        setTimeout(() => {
          setIsTyping(false);
        }, 3000);
      }
    }, 5000);
    
    return () => clearTimeout(typingTimer);
  }, [messages, userId]);

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
      
      // Show typing indicator
      setTimeout(() => {
        setIsTyping(true);
        
        // Hide typing indicator after 3 seconds
        setTimeout(() => {
          setIsTyping(false);
        }, 3000);
      }, 1000);
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

  const handleQuickReply = (reply: QuickReply) => {
    if (userId) {
      sendMessageMutation.mutate(reply.text);
      setShowQuickReplies(false);
    }
  };
  
  const handleShareCar = (car: Car) => {
    if (userId) {
      const carMessage = `Check out this ${car.make} ${car.model} (${car.year})\nDaily rate: ${car.dailyRate} ${car.currency}\n${car.description}`;
      sendMessageMutation.mutate(carMessage);
    }
  };
  
  const handleShareLocation = () => {
    if (userId) {
      sendMessageMutation.mutate("Here's my current location for pickup: https://maps.app.goo.gl/xyz123");
      toast({
        title: "Location shared",
        description: "Your current location has been shared with the recipient.",
      });
    }
  };

  // Format timestamp for messages
  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };
  
  // Format date for message groups
  const formatMessageDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString(undefined, { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };
  
  // Group messages by date
  const groupMessagesByDate = (messages: MessageWithUser[]) => {
    const groups: { [key: string]: MessageWithUser[] } = {};
    
    messages.forEach(message => {
      const dateKey = new Date(message.createdAt).toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });
    
    return Object.entries(groups).map(([date, messages]) => ({
      date,
      messages
    }));
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
            <Dialog>
              <DialogTrigger asChild>
                <div className="flex items-center cursor-pointer">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage 
                      src={user?.profilePicture} 
                      alt={user?.username} 
                    />
                    <AvatarFallback>{user ? getInitials(user.username) : "WW"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="font-medium">{user?.username || "Wade Warren"}</span>
                    <p className="text-xs text-gray-500">Online • Host</p>
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Profile Information</DialogTitle>
                  <DialogDescription>
                    Details about your conversation partner
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center py-4">
                  <Avatar className="h-20 w-20 mb-4">
                    <AvatarImage 
                      src={user?.profilePicture} 
                      alt={user?.username} 
                    />
                    <AvatarFallback className="text-xl">{user ? getInitials(user.username) : "WW"}</AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-bold">{user?.username || "Wade Warren"}</h3>
                  <p className="text-gray-500">Host • Member since 2023</p>
                  
                  <div className="flex items-center mt-2">
                    <Badge className="bg-green-100 text-green-800 mr-2">Verified ID</Badge>
                    <Badge className="bg-blue-100 text-blue-800">Superhost</Badge>
                  </div>
                  
                  <div className="w-full mt-6 space-y-3">
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                      <span>ADL, Douala, Cameroon</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-400 mr-3" />
                      <span>4.9 (25 reviews)</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-gray-400 mr-3" />
                      <span>Response time: &lt;1 hour</span>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    className="bg-red-600 hover:bg-red-700 w-full"
                    onClick={() => navigate(`/booking-confirm/1`)}
                  >
                    View Host's Cars
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="flex">
            <Dialog>
              <DialogTrigger asChild>
                <button className="mx-1">
                  <Info size={20} className="text-gray-600" />
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Conversation Details</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Active Booking</h3>
                    <div className="flex items-center">
                      <div className="bg-gray-100 h-12 w-12 rounded-md flex items-center justify-center mr-3">
                        <CarIcon className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">Mitsubishi Pajero</p>
                        <p className="text-xs text-gray-500">
                          Apr 16, 2024 - Apr 24, 2024
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="ml-auto"
                        onClick={() => navigate("/booking-detail/1")}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-medium mb-2">Media</h3>
                    <div className="grid grid-cols-4 gap-2">
                      <div className="relative h-16 w-16 rounded-md overflow-hidden">
                        <img 
                          src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
                          alt="Shared media" 
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                          <Play className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="h-16 w-16 rounded-md overflow-hidden">
                        <img 
                          src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
                          alt="Shared media" 
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" className="w-full" onClick={() => navigate("/messages")}>
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="mx-1">
                  <MoreHorizontal size={20} className="text-gray-600" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleShareLocation}>
                  <MapPin className="h-4 w-4 mr-2" />
                  Share Location
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowQuickReplies(true)}>
                  <MessageCircleMore className="h-4 w-4 mr-2" />
                  Quick Replies
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/messages")}>
                  <CircleHelpIcon className="h-4 w-4 mr-2" />
                  Help
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Messages Area */}
        <div 
          ref={messagesContainerRef} 
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
        >
          {messages && messages.length > 0 ? (
            <>
              {/* Date separator for today's messages */}
              <div className="flex items-center justify-center">
                <div className="px-4 py-1 rounded-full bg-gray-200 text-gray-600 text-xs">
                  Today
                </div>
              </div>
              
              {/* Demo messages for design */}
              <div className="flex justify-start">
                <Avatar className="h-8 w-8 mr-2 self-end">
                  <AvatarFallback>WW</AvatarFallback>
                </Avatar>
                <div className="max-w-[80%] p-3 rounded-lg bg-gray-100 rounded-tl-none">
                  <p>Hi there! Are you here to pick up a car?</p>
                  <p className="text-xs mt-1 text-right text-gray-500">
                    10:30 am
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <div className="max-w-[80%] p-3 rounded-lg bg-red-600 text-white rounded-tr-none">
                  <p>Yes, that's right! And I'm really looking forward to my road trip.</p>
                  <p className="text-xs mt-1 text-right text-red-100">
                    10:31 am
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
                    10:35 am
                  </p>
                </div>
              </div>
              
              {/* Car reservation card */}
              <div className="flex justify-end">
                <div className="max-w-[80%] overflow-hidden rounded-lg bg-white border border-gray-200 rounded-tr-none">
                  <div className="p-3 border-b bg-gray-50">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-red-600 mr-2" />
                      <p className="text-sm font-medium">Booking #BK-1234</p>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="flex items-center mb-2">
                      <div className="h-12 w-12 bg-gray-100 rounded-md overflow-hidden mr-3">
                        <img 
                          src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
                          alt="Car" 
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">Mitsubishi Pajero</p>
                        <p className="text-xs text-gray-500">Apr 16 - Apr 24, 2024</p>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mr-1" />
                      <span>Confirmed</span>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 text-xs text-gray-500 text-right">
                    10:38 am
                  </div>
                </div>
                <div className="w-8"></div>
              </div>

              {/* Car video/image message */}
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
              
              {/* Location shared message */}
              <div className="flex justify-start">
                <Avatar className="h-8 w-8 mr-2 self-end">
                  <AvatarFallback>WW</AvatarFallback>
                </Avatar>
                <div className="max-w-[80%] rounded-lg bg-gray-100 rounded-tl-none overflow-hidden">
                  <div className="relative">
                    <img 
                      src="https://maps.googleapis.com/maps/api/staticmap?center=40.7128,-74.0060&zoom=14&size=600x300&markers=color:red%7C40.7128,-74.0060&key=AIzaSyD2Z4kA_I2mZpKEv9pzCWGiGEVliKZpVYg" 
                      alt="Location Map" 
                      className="w-full h-32 object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <div className="flex items-center mb-1">
                      <MapPin className="h-4 w-4 text-red-600 mr-1" />
                      <p className="text-sm font-medium">Pickup Location</p>
                    </div>
                    <p className="text-sm">123 Main Street, ADL, Douala, Cameroon</p>
                    <p className="text-xs mt-1 text-right text-gray-500">
                      10:42 am
                    </p>
                  </div>
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
              
              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <Avatar className="h-8 w-8 mr-2 self-end">
                    <AvatarFallback>WW</AvatarFallback>
                  </Avatar>
                  <div className="max-w-[80%] p-3 rounded-lg bg-gray-100 rounded-tl-none">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </>
          ) : loadingMessages ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Loading messages...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <MessageCircleMore className="h-12 w-12 text-gray-300 mb-2" />
              <p className="text-gray-500 mb-2">No messages yet</p>
              <p className="text-sm text-gray-400 max-w-xs text-center">
                Start the conversation with a friendly message about your car booking needs.
              </p>
            </div>
          )}
        </div>
        
        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="border-t p-3 bg-white">
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="px-2">
                  <Paperclip size={20} className="text-gray-500" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem 
                  onClick={() => toast({
                    title: "Feature coming soon",
                    description: "This feature will be available in a future update.",
                  })}
                >
                  <Image className="h-4 w-4 mr-2" />
                  Send Photo
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => toast({
                    title: "Feature coming soon",
                    description: "This feature will be available in a future update.",
                  })}
                >
                  <Paperclip className="h-4 w-4 mr-2" />
                  Send Document
                </DropdownMenuItem>
                {cars && cars.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Share a Car</DropdownMenuLabel>
                    {cars.slice(0, 3).map(car => (
                      <DropdownMenuItem key={car.id} onClick={() => handleShareCar(car)}>
                        <CarIcon className="h-4 w-4 mr-2" />
                        {car.make} {car.model}
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Message..."
              className="flex-1 mx-2 border-gray-200"
            />
            
            <Popover open={showQuickReplies} onOpenChange={setShowQuickReplies}>
              <PopoverTrigger asChild>
                <button type="button" className="px-2">
                  <Smile size={20} className="text-gray-500" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0">
                <div className="p-3 border-b">
                  <h3 className="font-medium">Quick Replies</h3>
                  <p className="text-xs text-gray-500">Select a pre-written message</p>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {quickReplies.map((reply, index) => (
                    <div 
                      key={index}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      onClick={() => handleQuickReply(reply)}
                    >
                      <p className="text-sm line-clamp-2">{reply.text}</p>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            
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