import { BottomNav } from "@/components/layout/bottom-nav";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { MessageSquare } from "lucide-react";

export default function MessagesEmpty() {
  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="p-4 border-b">
        <h1 className="text-xl font-semibold">Messages</h1>
      </div>
      
      {/* Empty state */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="mb-4">
          <div className="bg-gray-100 rounded-full p-5 mb-2 mx-auto">
            <MessageSquare size={32} className="text-gray-400" />
          </div>
        </div>
        <h3 className="text-lg font-medium mb-2">No new messages</h3>
        <p className="text-gray-500 mb-4 max-w-xs">
          When you connect or get added to a host, you'll see your conversations here.
        </p>
        <p className="text-sm text-gray-400 mb-8">
          You'll be notified when you receive new messages
        </p>
        <Link href="/">
          <Button className="bg-red-600 hover:bg-red-700 text-white">
            Find cars to book
          </Button>
        </Link>
      </div>
      
      <BottomNav />
    </div>
  );
}