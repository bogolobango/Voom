import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Archive, ChevronRight, Filter, Search, SlidersHorizontal, User } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { getInitials } from "@/lib/utils";

// Types from the schema
interface ConversationUser {
  id: number;
  username: string;
  profilePicture?: string;
  unreadCount: number;
  lastMessage?: string;
  lastMessageTime?: string;
  status?: 'active' | 'archived';
}

export default function HostMessages() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: conversations, isLoading } = useQuery<ConversationUser[]>({
    queryKey: ["/api/messages/conversations"],
    enabled: !!user,
  });

  // Filter conversations based on search term
  const filteredConversations = conversations?.filter(
    (conversation) =>
      conversation.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get active and archived conversations
  const activeConversations = filteredConversations?.filter(
    (conv) => conv.status !== 'archived'
  ) || [];
  
  const archivedConversations = filteredConversations?.filter(
    (conv) => conv.status === 'archived'
  ) || [];

  const handleConversationClick = (userId: number) => {
    navigate(`/messages/${userId}`);
  };

  return (
    <AppLayout title="Messages">
      <div className="container mx-auto px-4 py-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search messages..."
            className="pl-9 pr-4"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex justify-between items-center mb-4">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <SlidersHorizontal className="h-4 w-4" />
            Sort
          </Button>
        </div>

        <Tabs defaultValue="inbox" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="inbox">
              Inbox
              {activeConversations.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeConversations.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="archived">
              Archived
              {archivedConversations.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {archivedConversations.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inbox">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="ml-4 space-y-2 flex-1">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-3/4" />
                        </div>
                        <Skeleton className="h-5 w-5 rounded-full" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : activeConversations.length > 0 ? (
              <div className="space-y-3">
                {activeConversations.map((conversation) => (
                  <Card 
                    key={conversation.id} 
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => handleConversationClick(conversation.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center flex-1">
                          <Avatar>
                            <AvatarImage src={conversation.profilePicture} />
                            <AvatarFallback>
                              {getInitials(conversation.username)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="ml-3 flex-1">
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium">{conversation.username}</h4>
                              <span className="text-xs text-muted-foreground">
                                {conversation.lastMessageTime || "Just now"}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {conversation.lastMessage || "No messages yet"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center ml-2">
                          {conversation.unreadCount > 0 && (
                            <Badge className="mr-2">{conversation.unreadCount}</Badge>
                          )}
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center p-10 bg-muted rounded-lg">
                <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No messages yet</h3>
                <p className="text-muted-foreground mb-4">
                  When guests message you about your listings, you'll see their conversations here.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="archived">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="ml-4 space-y-2 flex-1">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-3/4" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : archivedConversations.length > 0 ? (
              <div className="space-y-3">
                {archivedConversations.map((conversation) => (
                  <Card 
                    key={conversation.id} 
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => handleConversationClick(conversation.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center flex-1">
                          <Avatar>
                            <AvatarImage src={conversation.profilePicture} />
                            <AvatarFallback>
                              {getInitials(conversation.username)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="ml-3 flex-1">
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium">{conversation.username}</h4>
                              <span className="text-xs text-muted-foreground">
                                {conversation.lastMessageTime || "Just now"}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {conversation.lastMessage || "No messages yet"}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="ml-2">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center p-10 bg-muted rounded-lg">
                <Archive className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No archived conversations</h3>
                <p className="text-muted-foreground">
                  You can archive conversations to keep your inbox organized.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}