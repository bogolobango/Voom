import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingScreen } from "@/components/ui/loader";
import { Camera, Image, FileText, Users, Shield, ShieldCheck, CheckCircle, Phone } from "lucide-react";
import { BottomNav } from "@/components/layout/bottom-nav";
import { User, Booking, Car } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getInitials, formatCurrency, formatDuration } from "@/lib/utils";

export default function AddProfilePicture() {
  const [_, navigate] = useLocation();
  const location = useLocation()[0];
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Parse location state for booking information
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const bookingId = urlParams.get('bookingId');
  const fromBooking = urlParams.get('fromBooking') === 'true';
  
  const [inputType, setInputType] = useState<string>("library");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data: user, isLoading: loadingUser } = useQuery<User>({
    queryKey: ["/api/users/me"],
  });
  
  // Get booking details if we came from a booking flow
  const { data: booking, isLoading: loadingBooking } = useQuery<Booking>({
    queryKey: [`/api/bookings/${bookingId}`],
    enabled: !!bookingId,
  });
  
  // Get car details from booking
  const { data: car, isLoading: loadingCar } = useQuery<Car>({
    queryKey: [`/api/cars/${booking ? booking.carId : null}`],
    enabled: !!booking,
  });

  const uploadProfilePictureMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("profilePicture", file);
      const response = await apiRequest("POST", "/api/users/profile-picture", formData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been added successfully",
      });
      
      // Choose next destination based on context
      if (fromBooking) {
        // If from booking flow, go to booking success
        navigate("/booking-success");
      } else {
        // Normal flow
        navigate("/account");
      }
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

  const handleSelectImage = (type: string) => {
    setInputType(type);
    if (type === "library") {
      fileInputRef.current?.click();
    } else if (type === "camera") {
      cameraInputRef.current?.click();
    } else if (type === "document") {
      documentInputRef.current?.click();
    }
  };

  const handleSave = () => {
    if (profileImage) {
      uploadProfilePictureMutation.mutate(profileImage);
    } else {
      toast({
        title: "No image selected",
        description: "Please select a profile picture to continue",
        variant: "destructive",
      });
    }
  };

  const handleSkip = () => {
    if (fromBooking) {
      navigate("/booking-success");
    } else {
      navigate("/account");
    }
  };

  const handleBack = () => {
    if (fromBooking) {
      navigate(`/add-phone?fromBooking=true${bookingId ? `&bookingId=${bookingId}` : ''}`);
    } else {
      navigate("/account");
    }
  };

  const isLoading = 
    loadingUser || 
    (bookingId && loadingBooking) || 
    (booking && loadingCar);

  if (isLoading) {
    return (
      <>
        <Header title="Profile Picture" showBack onBack={handleBack} />
        <main className="container mx-auto px-4 py-6 mb-20 md:mb-6">
          <LoadingScreen />
        </main>
      </>
    );
  }

  return (
    <>
      <Header title="Profile Picture" showBack onBack={handleBack} />
      <main className="container mx-auto px-4 py-6 mb-20 md:mb-6">
        {/* Progress Steps - only show when from booking */}
        {fromBooking && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-1">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <span className="text-xs text-green-600">Booking</span>
              </div>
              <div className="h-0.5 flex-1 bg-gray-200 mx-2 relative">
                <div className="absolute inset-0 bg-green-500" style={{ width: "100%" }}></div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-1">
                  <Phone className="w-5 h-5" />
                </div>
                <span className="text-xs text-green-600">Phone</span>
              </div>
              <div className="h-0.5 flex-1 bg-gray-200 mx-2 relative">
                <div className="absolute inset-0 bg-green-500" style={{ width: "100%" }}></div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center mb-1">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium">Complete</span>
              </div>
            </div>
          </div>
        )}

        {car && fromBooking && (
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
                  <p className="text-sm text-gray-500">{car.year} • {car.type}</p>
                </div>
              </CardContent>
            </Card>

            {booking && (
              <Card className="mb-6">
                <CardContent className="py-4">
                  <div className="space-y-3 divide-y divide-gray-200">
                    <div className="flex justify-between py-2">
                      <span className="text-gray-500">
                        {formatDuration(booking.startDate, booking.endDate)}
                      </span>
                      <span className="font-medium">
                        {formatCurrency(booking.totalAmount)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Add Profile Picture */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-red-100 p-3 rounded-full">
                <Camera className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-center">Add a profile picture</h2>
            <p className="text-center text-gray-500 mb-6">
              Adding a photo helps hosts recognize you and builds trust in the community.
            </p>
            
            <div className="flex flex-col items-center justify-center">
              <div className="relative mb-6">
                <Avatar className="w-32 h-32">
                  <AvatarImage 
                    src={previewUrl || user?.profilePicture} 
                    alt={user?.username} 
                  />
                  <AvatarFallback className="text-2xl bg-red-100 text-red-600">
                    {user?.username ? getInitials(user.username) : "U"}
                  </AvatarFallback>
                </Avatar>
                {!previewUrl && !user?.profilePicture && (
                  <div className="absolute inset-0 bg-black bg-opacity-30 rounded-full flex items-center justify-center">
                    <Camera className="w-10 h-10 text-white" />
                  </div>
                )}
              </div>
              
              {/* Hidden inputs for different sources */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              
              <input
                type="file"
                ref={cameraInputRef}
                onChange={handleFileChange}
                accept="image/*"
                capture="environment"
                className="hidden"
              />
              
              <input
                type="file"
                ref={documentInputRef}
                onChange={handleFileChange}
                accept="image/*,.pdf"
                className="hidden"
              />
              
              <div className="grid grid-cols-3 gap-3 w-full mb-6">
                <Button 
                  variant={inputType === 'library' ? 'default' : 'outline'}
                  className={inputType === 'library' ? 'bg-red-600 hover:bg-red-700' : ''}
                  onClick={() => handleSelectImage('library')}
                >
                  <Image className="mr-2 h-4 w-4" />
                  <span>Gallery</span>
                </Button>
                
                <Button 
                  variant={inputType === 'camera' ? 'default' : 'outline'}
                  className={inputType === 'camera' ? 'bg-red-600 hover:bg-red-700' : ''}
                  onClick={() => handleSelectImage('camera')}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  <span>Camera</span>
                </Button>
                
                <Button 
                  variant={inputType === 'document' ? 'default' : 'outline'}
                  className={inputType === 'document' ? 'bg-red-600 hover:bg-red-700' : ''}
                  onClick={() => handleSelectImage('document')}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  <span>Files</span>
                </Button>
              </div>
              
              <div className="w-full space-y-3">
                <Button 
                  className="w-full bg-red-600 hover:bg-red-700"
                  onClick={handleSave}
                  disabled={uploadProfilePictureMutation.isPending || !profileImage}
                >
                  {uploadProfilePictureMutation.isPending ? "Saving..." : "Continue"}
                </Button>
                
                <Button 
                  className="w-full"
                  variant="outline"
                  onClick={handleSkip}
                >
                  {fromBooking ? "Skip & complete booking" : "Skip for now"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Why add a profile picture?</h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-red-100 p-2 rounded-full mr-3 mt-1">
                <Users className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <h4 className="font-medium">Build trust</h4>
                <p className="text-sm text-gray-500">Hosts and guests prefer to do business with people they can see</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-red-100 p-2 rounded-full mr-3 mt-1">
                <Shield className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <h4 className="font-medium">Increase security</h4>
                <p className="text-sm text-gray-500">Help us verify you're really you and keep our community safe</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      {!fromBooking && <BottomNav />}
    </>
  );
}
