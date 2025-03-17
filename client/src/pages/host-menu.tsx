import { useLocation } from "wouter";
import {
  CreditCard,
  HelpCircle,
  Home,
  LogOut,
  MessageSquare,
  Settings,
  Star,
  TrendingUp,
  User,
  CarFront,
  FileText,
  Mail,
  Wallet,
  ShieldCheck,
} from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useHostMode } from "@/hooks/use-host-mode";
import { getInitials } from "@/lib/utils";

export default function HostMenu() {
  const [, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { toggleHostMode } = useHostMode();

  const handleLogout = () => {
    logoutMutation.mutate();
    navigate("/auth");
  };

  const menuItems = [
    {
      group: "Account",
      items: [
        {
          icon: User,
          label: "Profile",
          onClick: () => navigate("/account"),
        },
        {
          icon: Settings,
          label: "Settings",
          onClick: () => navigate("/account-preferences"),
        },
        {
          icon: Home,
          label: "Switch to Guest Mode",
          onClick: toggleHostMode,
          highlight: true,
        },
      ],
    },
    {
      group: "Hosting",
      items: [
        {
          icon: CarFront,
          label: "Your Listings",
          onClick: () => navigate("/host-listings"),
        },
        {
          icon: TrendingUp,
          label: "Performance & Analytics",
          onClick: () => navigate("/host-analytics"),
        },
        {
          icon: Star,
          label: "Reviews",
          onClick: () => navigate("/host-reviews"),
        },
        {
          icon: Wallet,
          label: "Earnings & Payouts",
          onClick: () => navigate("/host-earnings"),
        },
      ],
    },
    {
      group: "Resources",
      items: [
        {
          icon: HelpCircle,
          label: "Help Center",
          onClick: () => navigate("/help"),
        },
        {
          icon: ShieldCheck,
          label: "Insurance & Protection",
          onClick: () => navigate("/host-insurance"),
        },
        {
          icon: FileText,
          label: "Policies",
          onClick: () => navigate("/policies"),
        },
        {
          icon: Mail,
          label: "Contact Support",
          onClick: () => navigate("/contact"),
        },
      ],
    },
  ];

  return (
    <AppLayout title="Menu">
      <div className="container mx-auto px-4 py-6">
        {/* Profile card */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.profilePicture} />
                <AvatarFallback>
                  {user?.fullName ? getInitials(user.fullName) : "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{user?.fullName || "Host"}</CardTitle>
                <CardDescription>{user?.username}</CardDescription>
                <Button 
                  variant="link" 
                  className="px-0 h-auto" 
                  onClick={() => navigate("/account")}
                >
                  View and edit profile
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Quick actions */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Button
            variant="outline"
            className="flex-col h-auto py-4"
            onClick={() => navigate("/host-dashboard")}
          >
            <TrendingUp className="h-5 w-5 mb-1" />
            <span className="text-xs">Dashboard</span>
          </Button>
          <Button
            variant="outline"
            className="flex-col h-auto py-4"
            onClick={() => navigate("/host-earnings")}
          >
            <CreditCard className="h-5 w-5 mb-1" />
            <span className="text-xs">Earnings</span>
          </Button>
          <Button
            variant="outline"
            className="flex-col h-auto py-4"
            onClick={() => navigate("/host-messages")}
          >
            <MessageSquare className="h-5 w-5 mb-1" />
            <span className="text-xs">Messages</span>
          </Button>
        </div>

        {/* Menu sections */}
        <div className="space-y-6">
          {menuItems.map((section) => (
            <div key={section.group}>
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                {section.group}
              </h3>
              <Card>
                <CardContent className="p-0 divide-y">
                  {section.items.map((item) => (
                    <button
                      key={item.label}
                      onClick={item.onClick}
                      className={`flex items-center w-full p-4 text-left hover:bg-accent ${
                        item.highlight ? "text-primary font-medium" : ""
                      }`}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.label}
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Logout button */}
        <Button
          variant="outline"
          className="w-full mt-6 text-destructive hover:text-destructive hover:border-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Log out
        </Button>
      </div>
    </AppLayout>
  );
}