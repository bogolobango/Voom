import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@shared/schema";
import { getInitials } from "@/lib/utils";
import { useLocation, useParams } from "wouter";
import { MessageCircle, Phone, Video } from "lucide-react";

export default function MessageProfile() {
  const [location, navigate] = useLocation();
  const params = useParams<{ userId: string }>();
  const userId = params.userId ? parseInt(params.userId) : null;

  // Get user details
  const { data: user, isLoading: loadingUser } = useQuery<User>({
    queryKey: ["/api/users", userId],
    enabled: !!userId
  });

  // Fallback profile info if data isn't loaded yet
  const profileName = user?.username || "Wade Warren";
  const initials = user ? getInitials(user.username) : "WW";

  return (
    <div className="flex flex-col h-screen bg-black bg-opacity-90">
      {/* Top half - profile image */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="rounded-full overflow-hidden mb-4 border-4 border-white w-24 h-24">
          <Avatar className="w-full h-full">
            <AvatarImage 
              src={user?.profilePicture || undefined} 
              alt={profileName} 
              className="w-full h-full object-cover" 
            />
            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
          </Avatar>
        </div>
        <h2 className="text-xl font-semibold text-white mb-1">{profileName}</h2>
        <p className="text-sm text-gray-300">Host</p>
      </div>

      {/* Bottom half - action buttons */}
      <div className="p-8 flex justify-center gap-8">
        <button 
          className="flex flex-col items-center"
          onClick={() => navigate(`/messages/${userId}`)}
        >
          <div className="bg-white rounded-full p-3 mb-2">
            <MessageCircle size={24} className="text-gray-800" />
          </div>
          <span className="text-white text-sm">Message</span>
        </button>

        <button className="flex flex-col items-center">
          <div className="bg-white rounded-full p-3 mb-2">
            <Phone size={24} className="text-gray-800" />
          </div>
          <span className="text-white text-sm">Call</span>
        </button>

        <button className="flex flex-col items-center">
          <div className="bg-white rounded-full p-3 mb-2">
            <Video size={24} className="text-gray-800" />
          </div>
          <span className="text-white text-sm">Video</span>
        </button>
      </div>
    </div>
  );
}