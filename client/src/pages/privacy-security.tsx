import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { LoadingScreen } from "@/components/ui/loader";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Shield, Lock, Fingerprint, Eye, LockKeyhole, History } from "lucide-react";

export default function PrivacySecurity() {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/users/me"],
  });

  if (isLoading) {
    return (
      <>
        <Header title="Privacy & Security" showBack />
        <main className="container mx-auto px-4 py-6 mb-20">
          <LoadingScreen />
        </main>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <Header title="Privacy & Security" showBack />
      <main className="container mx-auto px-4 py-6 mb-20">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Security Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <LockKeyhole className="h-4 w-4 text-gray-500" />
                  <Label>Change Password</Label>
                </div>
                <Button variant="ghost" size="sm">
                  Change
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Fingerprint className="h-4 w-4 text-gray-500" />
                  <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                </div>
                <Switch id="two-factor" />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-gray-500" />
                  <Label htmlFor="login-alerts">Login Alerts</Label>
                </div>
                <Switch id="login-alerts" defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Privacy Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4 text-gray-500" />
                  <Label htmlFor="profile-visibility">Profile Visibility</Label>
                </div>
                <Button variant="outline" size="sm">
                  Public
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Lock className="h-4 w-4 text-gray-500" />
                  <Label htmlFor="location-sharing">Location Sharing</Label>
                </div>
                <Switch id="location-sharing" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <History className="h-4 w-4 text-gray-500" />
                  <Label htmlFor="browsing-history">Save Browsing History</Label>
                </div>
                <Switch id="browsing-history" defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button variant="outline" className="w-full justify-start">
                <Shield className="mr-2 h-4 w-4" />
                <span>Privacy Policy</span>
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <Shield className="mr-2 h-4 w-4" />
                <span>Terms of Service</span>
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <History className="mr-2 h-4 w-4" />
                <span>Clear Search History</span>
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="destructive" className="w-full">
              Deactivate Account
            </Button>
          </CardFooter>
        </Card>
      </main>
      <BottomNav />
    </>
  );
}