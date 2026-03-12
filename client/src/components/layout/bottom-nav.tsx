import { useLocation, Link } from "wouter";
import { Home, Heart, Calendar, MessageSquare, Menu as MenuIcon, Search, Building } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useHostMode } from "@/hooks/use-host-mode";

interface NavItem {
  name: string;
  icon: React.ComponentType<any>;
  path: string;
}

export function BottomNav() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { isHostMode, toggleHostMode } = useHostMode();

  const travelNavItems: NavItem[] = [
    { name: "Home", icon: Home, path: "/" },
    { name: "Explore", icon: Search, path: "/all-cars" },
    { name: "Wishlist", icon: Heart, path: "/favorites" },
    { name: "Trips", icon: Calendar, path: "/bookings" },
    { name: "Messages", icon: MessageSquare, path: "/messages" },
  ];

  const hostNavItems: NavItem[] = [
    { name: "Today", icon: Home, path: "/host-dashboard" },
    { name: "Calendar", icon: Calendar, path: "/host-calendar" },
    { name: "Listings", icon: Building, path: "/host-listings" },
    { name: "Inbox", icon: MessageSquare, path: "/host-messages" },
    { name: "Menu", icon: MenuIcon, path: "/host-menu" },
  ];

  const navItems: NavItem[] = isHostMode ? hostNavItems : travelNavItems;

  return (
    <>
      {user && user.isHost && (
        <div className="fixed bottom-16 left-1/2 transform -translate-x-1/2 z-40">
          <button
            onClick={toggleHostMode}
            className="bg-gray-900 text-white rounded-full py-2 px-4 flex items-center shadow-lg text-sm font-medium"
          >
            {isHostMode ? (
              <>
                <Home className="h-4 w-4 mr-2" />
                Switch to traveling
              </>
            ) : (
              <>
                <Building className="h-4 w-4 mr-2" />
                Switch to hosting
              </>
            )}
          </button>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 py-2">
        <div className="max-w-screen-lg mx-auto">
          <div className="flex justify-between px-4">
            {navItems.map((item) => {
              const isActive = location === item.path;
              return (
                <Link key={item.name} href={item.path}>
                  <div className="flex flex-col items-center">
                    <item.icon className={cn("h-6 w-6", isActive ? "text-red-600" : "text-gray-400")} />
                    <span className={cn("text-xs mt-1", isActive ? "text-red-600 font-medium" : "text-gray-500")}>
                      {item.name}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
