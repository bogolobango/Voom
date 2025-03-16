import { useLocation, Link } from "wouter";
import { Home, Heart, Calendar, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const [location] = useLocation();

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
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg md:hidden z-50">
      <div className="flex justify-between px-4 py-2">
        {navItems.map((item) => (
          <Link key={item.name} href={item.path}>
            <div className="flex flex-col items-center text-xs p-2 relative cursor-pointer">
              <item.icon
                className={cn(
                  "h-6 w-6",
                  location === item.path ? "text-red-600 fill-current" : "text-gray-500"
                )}
              />
              {item.notifications > 0 && (
                <div className="absolute top-1 right-1 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center text-white text-xs">
                  {item.notifications}
                </div>
              )}
              <span className={location === item.path ? "text-red-600" : "text-gray-500"}>
                {item.name}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
