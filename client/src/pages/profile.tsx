import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { User } from "@shared/schema";
import { getInitials } from "@/lib/utils";
import { BottomNav } from "@/components/layout/bottom-nav";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Globe,
  MapPin,
  Star,
  ChevronLeft,
  CheckCircle2,
  Check,
  Calendar,
  Car,
  Shield,
} from "lucide-react";

export default function Profile() {
  const [, navigate] = useLocation();

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/users/me"],
  });

  if (isLoading) {
    return <LoadingScreen message="Loading profile..." />;
  }

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "Recently";

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header with back button */}
      <div className="flex justify-between items-center p-4 border-b border-gray-100">
        <button onClick={() => navigate("/")} className="p-1">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-semibold">Profile</h1>
        <button onClick={() => navigate("/account")} className="text-red-600 font-medium">
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
            {user?.isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1 rounded-full">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            )}
          </div>
          <h2 className="text-2xl font-bold mt-3">{user?.fullName || user?.username}</h2>
          <p className="text-gray-500">{user?.isHost ? "Host" : "Guest"} &middot; Joined {memberSince}</p>
        </div>
      </div>

      {/* Verified information */}
      <div className="px-4 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold mb-4">Verified information</h2>

        <div className="space-y-2">
          <div className="flex items-center">
            <Check className={`h-5 w-5 mr-3 ${user?.isVerified ? "text-green-600" : "text-gray-300"}`} />
            <span className="text-base">Identity {user?.isVerified ? "verified" : "not verified"}</span>
          </div>

          <div className="flex items-center">
            <Check className="h-5 w-5 mr-3 text-green-600" />
            <span className="text-base">Email address</span>
          </div>

          <div className="flex items-center">
            <Check className={`h-5 w-5 mr-3 ${user?.phoneNumber ? "text-green-600" : "text-gray-300"}`} />
            <span className="text-base">Phone number {user?.phoneNumber ? "" : "(not added)"}</span>
          </div>
        </div>
      </div>

      {/* About section */}
      <div className="px-4 py-5 border-b border-gray-200">
        <h2 className="text-xl font-bold mb-4">About {user?.fullName || user?.username}</h2>

        <div className="space-y-3">
          <div className="flex items-center">
            <Globe className="h-5 w-5 mr-3 text-gray-500 flex-shrink-0" />
            <span className="text-base">Speaks English</span>
          </div>

          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-3 text-gray-500 flex-shrink-0" />
            <span className="text-base">Member since {memberSince}</span>
          </div>

          {user?.isHost && (
            <div className="flex items-center">
              <Car className="h-5 w-5 mr-3 text-gray-500 flex-shrink-0" />
              <span className="text-base">Car host on Voom</span>
            </div>
          )}
        </div>
      </div>

      {/* Trust & Safety */}
      <div className="px-4 py-5">
        <div className="flex items-center mb-3">
          <Shield className="h-5 w-5 mr-2 text-red-600" />
          <h2 className="text-xl font-bold">Trust & Safety</h2>
        </div>
        <p className="text-gray-600 text-sm">
          Voom verifies personal information for everyone who uses the platform.
          This helps keep our community safe.
        </p>
        {!user?.isVerified && (
          <Button
            variant="outline"
            className="mt-3 border-red-600 text-red-600"
            onClick={() => navigate("/account")}
          >
            Complete verification
          </Button>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
