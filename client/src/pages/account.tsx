import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { getInitials } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { LoadingScreen } from "@/components/ui/loader";
import { Camera, Settings, Car, CreditCard, LogOut, Shield, UserCog, ChevronRight } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function Account() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showUploadMenu, setShowUploadMenu] = useState<boolean>(false);
  const [isHostMode, setIsHostMode] = useState<boolean>(false);

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/users/me"],
  });
  
  const [, setLocation] = useLocation();

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
        
        // Close the upload menu modal
        setShowUploadMenu(false);
        
        // Show a toast notification
        toast({
          title: "Image selected",
          description: "Click 'Update Photo' to save your new profile picture.",
        });
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
            <div className="flex items-center justify-between">
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
              <div className="flex flex-col items-end">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="text-sm text-gray-600">{isHostMode ? "Host" : "User"}</div>
                  <Switch 
                    checked={isHostMode}
                    onCheckedChange={setIsHostMode}
                    className="data-[state=checked]:bg-red-600"
                  />
                  <UserCog className="h-5 w-5 text-gray-600" />
                </div>
                {isHostMode && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-red-600 text-red-600"
                    onClick={() => setLocation("/host-dashboard")}
                  >
                    Host Dashboard
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                )}
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
                        <div 
                          onClick={() => setShowUploadMenu(true)}
                          className="absolute bottom-0 right-0 bg-red-600 text-white p-1 rounded-full cursor-pointer"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus">
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                          </svg>
                        </div>
                        
                        {/* Hidden file inputs for different sources */}
                        <input 
                          id="photo-library" 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                        <input 
                          id="take-photo" 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          capture="environment"
                          onChange={handleImageChange}
                        />
                        <input 
                          id="document-upload" 
                          type="file" 
                          className="hidden" 
                          accept="image/*,.pdf"
                          onChange={handleImageChange}
                        />
                      </div>
                      
                      {/* Upload Menu Modal */}
                      {showUploadMenu && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center sm:items-center">
                          <div className="bg-white rounded-t-xl w-full max-w-md sm:rounded-xl overflow-hidden">
                            <div className="p-4 border-b">
                              <h3 className="text-lg font-semibold text-center">Upload Profile Picture</h3>
                            </div>
                            
                            <div className="p-2">
                              <label htmlFor="photo-library" className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                                <div className="bg-red-100 p-2 rounded-full mr-3">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600">
                                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                                    <circle cx="9" cy="9" r="2" />
                                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                                  </svg>
                                </div>
                                <span>Choose from library</span>
                              </label>
                              
                              <label htmlFor="take-photo" className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                                <div className="bg-red-100 p-2 rounded-full mr-3">
                                  <Camera size={20} className="text-red-600" />
                                </div>
                                <span>Take a photo</span>
                              </label>
                              
                              <label htmlFor="document-upload" className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                                <div className="bg-red-100 p-2 rounded-full mr-3">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600">
                                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                                    <polyline points="14 2 14 8 20 8" />
                                  </svg>
                                </div>
                                <span>Upload document</span>
                              </label>
                              
                              <div className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer" 
                                onClick={() => {
                                  setShowUploadMenu(false);
                                  window.location.href = '/add-profile-picture';
                                }}>
                                <div className="bg-red-100 p-2 rounded-full mr-3">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600">
                                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
                                    <line x1="16" x2="22" y1="5" y2="5" />
                                    <line x1="19" x2="19" y1="2" y2="8" />
                                    <circle cx="9" cy="9" r="2" />
                                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                                  </svg>
                                </div>
                                <span>Use full screen editor</span>
                              </div>
                            </div>
                            
                            <div className="p-3 border-t">
                              <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => setShowUploadMenu(false)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                      
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
              <CardHeader className="flex justify-between items-center pb-2">
                <CardTitle>{isHostMode ? "My Listed Cars" : "My Bookings"}</CardTitle>
                {isHostMode && (
                  <Link href="/become-host">
                    <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                      + Add Car
                    </Button>
                  </Link>
                )}
              </CardHeader>
              <CardContent>
                {isHostMode ? (
                  <div className="space-y-4">
                    <div className="text-center py-6">
                      <p className="text-gray-500 mb-4">You haven't listed any cars yet</p>
                      <Link href="/become-host">
                        <Button className="bg-red-600 hover:bg-red-700 text-white">
                          List Your First Car
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center py-6">
                      <p className="text-gray-500 mb-4">You don't have any car bookings yet</p>
                      <Link href="/">
                        <Button className="bg-red-600 hover:bg-red-700 text-white">
                          Find a Car
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
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
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <Link href="/account-preferences">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Account Preferences</span>
                      </Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <Link href="/payment-methods">
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span>Payment Methods</span>
                      </Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <Link href="/privacy-security">
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Privacy & Security</span>
                      </Link>
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
