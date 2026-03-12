import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useHostMode } from "@/hooks/use-host-mode";
import {
  Calendar,
  ChevronRight,
  DollarSign,
  BarChart3,
  MessageSquare,
  Settings,
  HelpCircle,
  LogOut,
  Plus,
  Shield,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getInitials } from "@/lib/utils";
import { BottomNav } from "@/components/layout/bottom-nav";

function MenuItem({ icon: Icon, label, onClick }: { icon: React.ComponentType<any>; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center justify-between w-full py-4">
      <div className="flex items-center">
        <Icon className="h-6 w-6 mr-4 text-gray-600" />
        <span className="text-base">{label}</span>
      </div>
      <ChevronRight className="h-5 w-5 text-gray-400" />
    </button>
  );
}

export default function Menu() {
  const [, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { isHostMode } = useHostMode();

  const handleLogout = () => {
    logoutMutation.mutate();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <header className="px-4 py-6">
        <h1 className="text-3xl font-bold">Menu</h1>
      </header>

      {isHostMode && (
        <>
          <div className="px-4 py-2">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Hosting</h2>
          </div>

          <div className="px-4">
            <MenuItem icon={Calendar} label="Reservations" onClick={() => navigate("/host-dashboard?tab=bookings")} />
            <MenuItem icon={DollarSign} label="Earnings" onClick={() => navigate("/host-earnings")} />
            <MenuItem icon={BarChart3} label="Analytics" onClick={() => navigate("/host-analytics")} />
            <MenuItem icon={Plus} label="Create a new listing" onClick={() => navigate("/become-host/car-type")} />
            <MenuItem icon={MessageSquare} label="Messages" onClick={() => navigate("/host-messages")} />
          </div>

          <Separator className="my-4" />
        </>
      )}

      <div className="px-4 py-2">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Account</h2>
      </div>

      <div className="px-4">
        <button onClick={() => navigate("/profile")} className="flex items-center justify-between w-full py-4">
          <div className="flex items-center">
            <div className="mr-4">
              <Avatar className="h-7 w-7">
                <AvatarImage src={user?.profilePicture || undefined} />
                <AvatarFallback>{user?.username ? getInitials(user.username) : "U"}</AvatarFallback>
              </Avatar>
            </div>
            <span className="text-base">Your profile</span>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </button>

        <MenuItem icon={Settings} label="Settings" onClick={() => navigate("/account-preferences")} />
        <MenuItem icon={Shield} label="Privacy & Security" onClick={() => navigate("/privacy-security")} />
        <MenuItem icon={HelpCircle} label="Help Center" onClick={() => navigate("/account")} />
      </div>

      <div className="px-4 py-4">
        <Button
          variant="outline"
          className="w-full justify-center text-red-600 hover:text-red-700 border-gray-300"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Log out
        </Button>
      </div>

      <div className="text-center text-xs text-gray-500 pb-5">
        Voom Car Sharing &middot; v1.0
      </div>

      <BottomNav />
    </div>
  );
}
