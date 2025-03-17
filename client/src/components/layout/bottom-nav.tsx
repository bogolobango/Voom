import { useLocation, Link } from "wouter";
import { Home, Heart, Calendar, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useHostMode } from "@/hooks/use-host-mode";

export function BottomNav() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { toggleHostMode } = useHostMode();

  const navItems = [
    {
      name: "HOME",
      icon: Home,
      path: "/",
      notifications: 0,
    },
    {
      name: "FAVORITES",
      icon: Heart,
      path: "/favorites",
      notifications: 0,
    },
    {
      name: "BOOKINGS",
      icon: Calendar,
      path: "/bookings",
      notifications: 0,
    },
    {
      name: "MESSAGES",
      icon: MessageSquare,
      path: "/messages",
      notifications: 2,
    },
    {
      name: "ACCOUNT",
      icon: User,
      path: "/account",
      notifications: 0,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="flex justify-between px-4 py-2">
        {navItems.map((item) => (
          <Link key={item.name} href={item.path}>
            <div className="flex flex-col items-center text-xs p-2 relative cursor-pointer">
              <item.icon
                className={cn(
                  "h-6 w-6",
                  location === item.path ? "text-primary" : "text-muted-foreground"
                )}
              />
              {item.notifications > 0 && (
                <div className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs">
                  {item.notifications}
                </div>
              )}
              <span className={location === item.path ? "text-primary" : "text-muted-foreground"}>
                {item.name}
              </span>
            </div>
          </Link>
        ))}
      </div>
      
      {/* Host Mode Toggle Button (only for hosts) */}
      {user?.isHost && (
        <div className="absolute right-4 top-0 transform -translate-y-full">
          <button
            onClick={toggleHostMode}
            className="bg-primary text-primary-foreground px-3 py-1 rounded-t-md text-xs font-medium"
          >
            Switch to Host Mode
          </button>
        </div>
      )}
    </div>
  );
}