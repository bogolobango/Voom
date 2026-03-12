import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { LoadingScreen } from "@/components/ui/loader";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, LockKeyhole, Fingerprint, Eye, History } from "lucide-react";

export default function PrivacySecurity() {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/users/me"],
  });
  const { toast } = useToast();

  const handleToggle = (setting: string) => {
    toast({
      title: `${setting} updated`,
      description: "Your preference has been saved.",
      duration: 2000,
    });
  };

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
      <main className="container mx-auto px-4 py-6 mb-20 md:mb-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Security Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <LockKeyhole className="h-4 w-4 text-gray-500" />
                  <Label>Change Password</Label>
                </div>
                <Button variant="ghost" size="sm">Change</Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Fingerprint className="h-4 w-4 text-gray-500" />
                  <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                </div>
                <Switch id="two-factor" onCheckedChange={() => handleToggle("Two-factor auth")} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-gray-500" />
                  <Label htmlFor="login-alerts">Login Alerts</Label>
                </div>
                <Switch id="login-alerts" defaultChecked onCheckedChange={() => handleToggle("Login alerts")} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Privacy Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4 text-gray-500" />
                  <Label htmlFor="location-sharing">Location Sharing</Label>
                </div>
                <Switch id="location-sharing" defaultChecked onCheckedChange={() => handleToggle("Location sharing")} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <History className="h-4 w-4 text-gray-500" />
                  <Label htmlFor="browsing-history">Save Browsing History</Label>
                </div>
                <Switch id="browsing-history" defaultChecked onCheckedChange={() => handleToggle("Browsing history")} />
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      <BottomNav />
    </>
  );
}
