import { useLocation, Link } from "wouter";
import { Calendar, MessageSquare, Menu, Car, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export function HostBottomNav() {
  const [location] = useLocation();

  const navItems = [
    { name: "Today", icon: Activity, path: "/host-dashboard" },
    { name: "Calendar", icon: Calendar, path: "/host-calendar" },
    { name: "Listings", icon: Car, path: "/host-listings" },
    { name: "Messages", icon: MessageSquare, path: "/host-messages" },
    { name: "Menu", icon: Menu, path: "/host-menu" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 z-50 py-2">
      <div className="flex justify-between px-4">
        {navItems.map((item) => {
          const isActive = location === item.path;
          return (
            <Link key={item.name} href={item.path}>
              <div className="flex flex-col items-center">
                <item.icon className={cn("h-6 w-6", isActive ? "text-white" : "text-gray-400")} />
                <span className={cn("text-xs mt-1", isActive ? "text-white font-medium" : "text-gray-400")}>
                  {item.name}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
