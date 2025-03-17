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
  CheckCircle2,
  Check,
  Building2,
  Utensils,
  Tv
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

      {/* Confirmed information */}
      <div className="px-4 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold mb-4">{user?.username}'s confirmed information</h2>
        
        <div className="mb-2 flex items-center">
          <Check className="h-5 w-5 mr-3" /> 
          <span className="text-base">Identity</span>
        </div>
        
        <div className="mb-2 flex items-center">
          <Check className="h-5 w-5 mr-3" /> 
          <span className="text-base">Email address</span>
        </div>
        
        <div className="mb-3 flex items-center">
          <Check className="h-5 w-5 mr-3" /> 
          <span className="text-base">Phone number</span>
        </div>
        
        <button className="text-black font-medium underline">
          Learn about identity verification
        </button>
      </div>
      
      {/* Bio information */}
      <div className="px-4 py-5 border-b border-gray-200">
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
      
      {/* Ask about section */}
      <div className="px-4 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold mb-4">Ask {user?.username} about</h2>
        
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center px-4 py-2 rounded-full border border-gray-300">
            <Building2 className="h-4 w-4 mr-2" />
            <span>Architecture</span>
          </div>
          
          <div className="flex items-center px-4 py-2 rounded-full border border-gray-300">
            <Utensils className="h-4 w-4 mr-2" />
            <span>Food</span>
          </div>
          
          <div className="flex items-center px-4 py-2 rounded-full border border-gray-300">
            <Tv className="h-4 w-4 mr-2" />
            <span>Live sports</span>
          </div>
        </div>
      </div>
      
      {/* Where user has been */}
      <div className="px-4 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold mb-4">Where {user?.username} has been</h2>
        
        <div className="mb-4">
          <div className="border border-blue-400 rounded-lg p-2 inline-block text-center">
            <div className="text-blue-500 mb-2">
              <Building2 className="h-16 w-16 mx-auto" />
              <div className="text-xs text-gray-500 uppercase">US</div>
            </div>
            <h3 className="font-semibold">Boston</h3>
            <p className="text-sm text-gray-500">Massachusetts</p>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}