import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

// Define the ConversationUser interface locally
interface ConversationUser {
  id: number;
  username: string;
  profilePicture?: string;
  unreadCount: number;
}

export default function MessagesSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Get all conversations
  const { data: conversations, isLoading } = useQuery<ConversationUser[]>({
    queryKey: ["/api/messages/conversations"]
  });

  // Filter conversations by search term
  const filteredConversations = conversations?.filter(
    conversation => conversation.username.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // No results state
  const showNoResults = searchTerm && filteredConversations.length === 0;

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
            autoFocus
          />
        </div>
      </div>
      
      {/* No results message */}
      {showNoResults && (
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <div className="mb-4">
            <Search size={48} className="mx-auto text-gray-300" />
          </div>
          <h3 className="text-lg font-medium mb-2">No Results Found</h3>
          <p className="text-gray-500 max-w-xs">
            No conversations match your search. Try a different term or check your spelling.
          </p>
        </div>
      )}
      
      <BottomNav />
    </div>
  );
}