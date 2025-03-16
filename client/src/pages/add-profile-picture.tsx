import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingScreen } from "@/components/ui/loader";
import { Camera, Image, FileText, Users, Shield } from "lucide-react";
import { BottomNav } from "@/components/layout/bottom-nav";
import { User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getInitials } from "@/lib/utils";

export default function AddProfilePicture() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [inputType, setInputType] = useState<string>("library");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data: user, isLoading: loadingUser } = useQuery<User>({
    queryKey: ["/api/users/me"],
  });

  const uploadProfilePictureMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("profilePicture", file);
      return apiRequest("PATCH", "/api/users/profile", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been updated successfully",
      });
      navigate("/account");
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

  const handleBack = () => {
    navigate("/account");
  };

  if (loadingUser) {
    return (
      <>
        <Header title="Profile Picture" showBack onBack={handleBack} />
        <main className="container mx-auto px-4 py-6 mb-20 md:mb-6">
          <LoadingScreen />
        </main>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <Header title="Profile Picture" showBack onBack={handleBack} />
      <main className="container mx-auto px-4 py-6 mb-20 md:mb-6">
        {/* Add Profile Picture */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-6 text-center">Add a profile picture</h2>
            
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
                {!previewUrl && (
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
                  {uploadProfilePictureMutation.isPending ? "Saving..." : "Save"}
                </Button>
                
                <Button 
                  className="w-full"
                  variant="outline"
                  onClick={handleBack}
                >
                  Cancel
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
      <BottomNav />
    </>
  );
}
