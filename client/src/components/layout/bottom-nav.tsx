import { useLocation, Link } from "wouter";
import { Home, Heart, Calendar, MessageSquare, Menu as MenuIcon, Search, Building } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useHostMode } from "@/hooks/use-host-mode";

interface NavItem {
  name: string;
  icon: React.ComponentType<any>;
  path: string;
  badge?: number;
}

export function BottomNav() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { isHostMode, toggleHostMode } = useHostMode();

  // Airbnb style bottom navigation for travelers
  const travelNavItems: NavItem[] = [
    {
      name: "Home",
      icon: Home,
      path: "/",
    },
    {
      name: "Explore",
      icon: Search,
      path: "/all-cars",
    },
    {
      name: "Wishlist",
      icon: Heart,
      path: "/favorites",
    },
    {
      name: "Trips",
      icon: Calendar,
      path: "/bookings",
    },
    {
      name: "Messages",
      icon: MessageSquare,
      path: "/messages",
    },
  ];

  // Airbnb style bottom navigation for hosts
  const hostNavItems: NavItem[] = [
    {
      name: "Today",
      icon: Home,
      path: "/host-dashboard",
    },
    {
      name: "Calendar",
      icon: Calendar,
      path: "/host-calendar",
    },
    {
      name: "Listings",
      icon: Building,
      path: "/host-listings",
    },
    {
      name: "Inbox",
      icon: MessageSquare,
      path: "/host-messages",
      badge: 2,
    },
    {
      name: "Menu",
      icon: MenuIcon,
      path: "/menu",
    },
  ];

  const navItems: NavItem[] = isHostMode ? hostNavItems : travelNavItems;

  return (
    <>
      {/* Mode switcher button */}
      {user && user.isHost && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50">
          <button
            onClick={toggleHostMode}
            className="bg-black bg-opacity-90 text-white rounded-full py-2 px-4 flex items-center shadow-lg"
          >
            {isHostMode ? (
              <>
                <Home className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Switch to traveling</span>
              </>
            ) : (
              <>
                <Building className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Switch to hosting</span>
              </>
            )}
          </button>
        </div>
      )}
      
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 py-2">
        <div className="max-w-screen-lg mx-auto">
          <div className="flex justify-between px-4">
            {navItems.map((item) => (
              <Link key={item.name} href={item.path}>
                <div className="flex flex-col items-center relative">
                  <div 
                    className={cn(
                      "relative",
                      location === item.path ? "text-red-500" : "text-gray-400"
                    )}
                  >
                    <item.icon className="h-6 w-6" />
                    {item.badge && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                        {item.badge}
                      </div>
                    )}
                  </div>
                  <span 
                    className={cn(
                      "text-xs mt-1",
                      location === item.path ? "text-red-500 font-medium" : "text-gray-500"
                    )}
                  >
                    {item.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}