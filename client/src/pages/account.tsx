import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { getInitials } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { LoadingScreen } from "@/components/ui/loader";
import { Camera, Settings, Car, CreditCard, LogOut, Shield } from "lucide-react";
import { Link } from "wouter";

export default function Account() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/users/me"],
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return apiRequest("PATCH", "/api/users/profile", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profileImage) {
      toast({
        title: "No image selected",
        description: "Please select an image to upload.",
        variant: "destructive",
      });
      return;
    }
    
    const formData = new FormData();
    formData.append("profilePicture", profileImage);
    updateProfileMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <>
        <Header title="Account" />
        <main className="container mx-auto px-4 py-6 mb-20 md:mb-6">
          <LoadingScreen />
        </main>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <Header title="Account" />
      <main className="container mx-auto px-4 py-6 mb-20 md:mb-6">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Avatar className="h-16 w-16 mr-4">
                <AvatarImage src={user?.profilePicture} alt={user?.username} />
                <AvatarFallback>{user ? getInitials(user.username) : "U"}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">{user?.username}</h2>
                <p className="text-sm text-gray-500">Member since {new Date(user?.createdAt || "").toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="profile" className="mb-6">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="profile" className="flex-1">Profile</TabsTrigger>
            <TabsTrigger value="cars" className="flex-1">My Cars</TabsTrigger>
            <TabsTrigger value="settings" className="flex-1">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate}>
                  <div className="space-y-4">
                    <div className="flex flex-col items-center justify-center mb-4">
                      <div className="relative mb-4">
                        <Avatar className="h-24 w-24">
                          <AvatarImage 
                            src={previewUrl || user?.profilePicture} 
                            alt={user?.username} 
                          />
                          <AvatarFallback className="bg-red-100 text-red-600">
                            {user ? getInitials(user.username) : "U"}
                          </AvatarFallback>
                        </Avatar>
                        <label 
                          htmlFor="profile-upload" 
                          className="absolute bottom-0 right-0 bg-red-600 text-white p-1 rounded-full cursor-pointer"
                        >
                          <Camera size={18} />
                        </label>
                        <input 
                          id="profile-upload" 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </div>
                      {profileImage && (
                        <Button
                          type="submit"
                          disabled={updateProfileMutation.isPending}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {updateProfileMutation.isPending ? "Uploading..." : "Update Photo"}
                        </Button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" value={user?.username || ""} disabled />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" value={user?.phoneNumber || ""} disabled />
                      <div className="text-right">
                        <Link href="/add-phone">
                          <Button variant="link" className="text-red-600 p-0">
                            {user?.phoneNumber ? "Change" : "Add"} Phone Number
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cars">
            <Card>
              <CardHeader>
                <CardTitle>My Listed Cars</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <p className="text-gray-500 mb-4">You haven't listed any cars yet</p>
                  <Button className="bg-red-600 hover:bg-red-700 text-white">
                    List Your Car
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">Account Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="ghost" className="w-full justify-start">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Account Preferences</span>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span>Payment Methods</span>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Privacy & Security</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Button 
                variant="outline" 
                className="w-full border-red-600 text-red-600 hover:bg-red-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <BottomNav />
    </>
  );
}
