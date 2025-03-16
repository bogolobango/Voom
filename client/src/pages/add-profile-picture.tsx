import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingScreen } from "@/components/ui/loader";
import { User, Car } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getInitials } from "@/lib/utils";

export default function AddProfilePicture() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data: user, isLoading: loadingUser } = useQuery<User>({
    queryKey: ["/api/users/me"],
  });
  
  const { data: lastCarId } = useQuery<number>({
    queryKey: ["/api/bookings/last-car"],
  });
  
  const { data: car, isLoading: loadingCar } = useQuery<Car>({
    queryKey: [`/api/cars/${lastCarId}`],
    enabled: !!lastCarId,
  });

  const uploadProfilePictureMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("profilePicture", file);
      return apiRequest("POST", "/api/users/profile-picture", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been updated successfully",
      });
      navigate("/auth-code");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to upload profile picture. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectImage = () => {
    fileInputRef.current?.click();
  };

  const handleContinue = () => {
    if (profileImage) {
      uploadProfilePictureMutation.mutate(profileImage);
    } else if (user?.profilePicture) {
      // If user already has a profile picture and didn't change it
      navigate("/auth-code");
    } else {
      toast({
        title: "No image selected",
        description: "Please select a profile picture to continue",
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loadingUser || (lastCarId && loadingCar)) {
    return (
      <>
        <Header title="Confirm and Pay" showBack onBack={handleBack} />
        <main className="container mx-auto px-4 py-6 mb-6">
          <LoadingScreen />
        </main>
      </>
    );
  }

  return (
    <>
      <Header title="Confirm and Pay" showBack onBack={handleBack} />
      <main className="container mx-auto px-4 py-6 mb-6">
        {car && (
          <>
            {/* Vehicle Card */}
            <Card className="mb-6">
              <CardContent className="p-4 flex items-center">
                <img
                  src={car.imageUrl}
                  alt={`${car.make} ${car.model}`}
                  className="w-20 h-20 object-cover rounded-md mr-4"
                />
                <div>
                  <h2 className="text-lg font-semibold">{car.make} {car.model}</h2>
                </div>
              </CardContent>
            </Card>

            {/* Booking Details */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold">Your Booking</h2>
                  <button className="text-red-600 text-sm font-medium">
                    Edit
                  </button>
                </div>
                <div className="space-y-3 divide-y divide-gray-200">
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">Start of Rental Date and Time</span>
                    <span className="font-medium">April 16, 2024 10:30 AM</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">End of Rental Date and Time</span>
                    <span className="font-medium">April 24, 2024 11:30 AM</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">Pick-up and drop-off point</span>
                    <span className="font-medium">ADL</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Add Profile Picture */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-6 text-center">Add a profile picture</h2>
            
            <div className="flex flex-col items-center justify-center">
              <Avatar className="w-32 h-32 mb-6">
                <AvatarImage 
                  src={previewUrl || user?.profilePicture} 
                  alt={user?.username} 
                />
                <AvatarFallback className="text-2xl">
                  {user?.username ? getInitials(user.username) : "U"}
                </AvatarFallback>
              </Avatar>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              
              <Button 
                className="w-full bg-red-600 hover:bg-red-700 mb-4"
                onClick={handleSelectImage}
              >
                {user?.profilePicture ? "Change profile pic" : "Add a profile pic"}
              </Button>
              
              <Button 
                className="w-full"
                variant="outline"
                onClick={handleContinue}
                disabled={uploadProfilePictureMutation.isPending}
              >
                {uploadProfilePictureMutation.isPending ? "Uploading..." : "Continue"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
