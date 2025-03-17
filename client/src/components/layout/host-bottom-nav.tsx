import { useLocation, Link } from "wouter";
import { Calendar, MessageSquare, Menu, Car, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHostMode } from "@/hooks/use-host-mode";

export function HostBottomNav() {
  const [location] = useLocation();
  const { toggleHostMode } = useHostMode();
  
  const navItems = [
    {
      name: "TODAY",
      icon: Activity,
      path: "/host-dashboard",
      notifications: 2,
    },
    {
      name: "CALENDAR",
      icon: Calendar,
      path: "/host-calendar",
      notifications: 0,
    },
    {
      name: "LISTINGS",
      icon: Car,
      path: "/host-listings",
      notifications: 0,
    },
    {
      name: "MESSAGES",
      icon: MessageSquare,
      path: "/host-messages",
      notifications: 3,
    },
    {
      name: "MENU",
      icon: Menu,
      path: "/host-menu",
      notifications: 0,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-primary text-primary-foreground border-t border-border z-50">
      <div className="flex justify-between px-4 py-2">
        {navItems.map((item) => (
          <Link key={item.name} href={item.path}>
            <div className="flex flex-col items-center text-xs p-2 relative cursor-pointer">
              <item.icon
                className={cn(
                  "h-6 w-6",
                  location === item.path 
                    ? "text-white" 
                    : "text-primary-foreground/70"
                )}
              />
              {item.notifications > 0 && (
                <div className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
                  {item.notifications}
                </div>
              )}
              <span 
                className={
                  location === item.path 
                    ? "text-white" 
                    : "text-primary-foreground/70"
                }
              >
                {item.name}
              </span>
            </div>
          </Link>
        ))}
      </div>
      
      {/* Switch Back to Guest Mode Button */}
      <div className="absolute right-4 top-0 transform -translate-y-full">
        <button
          onClick={toggleHostMode}
          className="bg-background text-primary px-3 py-1 rounded-t-md text-xs font-medium"
        >
          Switch to Guest Mode
        </button>
      </div>
    </div>
  );
}