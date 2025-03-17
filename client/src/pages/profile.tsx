import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getInitials } from "@/lib/utils";
import { BottomNav } from "@/components/layout/bottom-nav";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Heart,
  Music,
  Globe,
  MapPin,
  Star,
  Coffee,
  ChevronLeft,
  CheckCircle2
} from "lucide-react";

export default function Profile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/users/me"],
  });

  // Example user bio data - in a real app, these would come from the user's profile in the database
  const userBio = {
    work: "Senior Account Exec",
    forGuests: "Go above and beyond",
    birthDecade: "the 80s",
    favoriteSong: "50 Cent \"In Da Club\"",
    languages: "English and French",
    obsessedWith: "Cooking",
    location: "New York, NY",
    homeUnique: "The tranquility it brings!",
    breakfast: "Oatmeal with Chia Seeds and Bananas",
    bio: "I love traveling with my wife and kids, and discovering new places and cultures!"
  };

  if (isLoading) {
    return <LoadingScreen message="Loading profile..." />;
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header with back button */}
      <div className="flex justify-between items-center p-4 border-b border-gray-100">
        <button onClick={() => navigate("/")} className="p-1">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-semibold">Profile</h1>
        <button onClick={() => navigate("/account")} className="text-black font-medium">
          Edit
        </button>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-xl mx-4 mt-4 p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col items-center">
          <div className="relative">
            <Avatar className="h-24 w-24 border-2 border-white shadow-md">
              <AvatarImage src={user?.profilePicture || undefined} alt={user?.username} />
              <AvatarFallback className="bg-red-100 text-red-600 text-xl">
                {user ? getInitials(user.username) : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 bg-pink-500 text-white p-1 rounded-full">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mt-3">{user?.username}</h2>
          <p className="text-gray-500">{user?.isHost ? "Host" : "New user"}</p>
        </div>
      </div>

      {/* Bio information */}
      <div className="px-4 py-5">
        <div className="flex items-start mb-4">
          <Briefcase className="h-5 w-5 mr-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-base">My work: {userBio.work}</p>
          </div>
        </div>

        <div className="flex items-start mb-4">
          <Star className="h-5 w-5 mr-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-base">For guests, I always: {userBio.forGuests}</p>
          </div>
        </div>

        <div className="flex items-start mb-4">
          <MapPin className="h-5 w-5 mr-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-base">Born in {userBio.birthDecade}</p>
          </div>
        </div>

        <div className="flex items-start mb-4">
          <Music className="h-5 w-5 mr-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-base">Favorite song in high school: {userBio.favoriteSong}</p>
          </div>
        </div>

        <div className="flex items-start mb-4">
          <Globe className="h-5 w-5 mr-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-base">Speaks {userBio.languages}</p>
          </div>
        </div>

        <div className="flex items-start mb-4">
          <Heart className="h-5 w-5 mr-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-base">I'm obsessed with: {userBio.obsessedWith}</p>
          </div>
        </div>

        <div className="flex items-start mb-4">
          <MapPin className="h-5 w-5 mr-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-base">Lives in {userBio.location}</p>
          </div>
        </div>

        <div className="flex items-start mb-4">
          <Star className="h-5 w-5 mr-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-base">What makes my home unique: {userBio.homeUnique}</p>
          </div>
        </div>

        <div className="flex items-start mb-5">
          <Coffee className="h-5 w-5 mr-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-base">What's for breakfast: {userBio.breakfast}</p>
          </div>
        </div>

        <p className="text-base mb-4 border-b border-black inline-block">
          {userBio.bio}
        </p>
      </div>

      <BottomNav />
    </div>
  );
}