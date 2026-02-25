import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { LoadingScreen } from "@/components/ui/loader";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Globe, Mail, BellRing } from "lucide-react";

export default function AccountPreferences() {
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
        <Header title="Settings" showBack />
        <main className="container mx-auto px-4 py-6 mb-20">
          <LoadingScreen />
        </main>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <Header title="Settings" showBack />
      <main className="container mx-auto px-4 py-6 mb-20 md:mb-6">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base">Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BellRing className="h-4 w-4 text-gray-500" />
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                </div>
                <Switch id="push-notifications" defaultChecked onCheckedChange={() => handleToggle("Push notifications")} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                </div>
                <Switch id="email-notifications" defaultChecked onCheckedChange={() => handleToggle("Email notifications")} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BellRing className="h-4 w-4 text-gray-500" />
                  <Label htmlFor="booking-reminders">Booking Reminders</Label>
                </div>
                <Switch id="booking-reminders" defaultChecked onCheckedChange={() => handleToggle("Booking reminders")} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base">Language & Region</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <Label>Language</Label>
                </div>
                <Button variant="outline" size="sm">English</Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <Label>Currency</Label>
                </div>
                <Button variant="outline" size="sm">FCFA</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      <BottomNav />
    </>
  );
}
