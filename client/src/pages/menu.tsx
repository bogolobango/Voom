import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useHostMode } from "@/hooks/use-host-mode";
import { 
  Calendar, 
  ChevronRight, 
  DollarSign, 
  Home, 
  BarChart3, 
  Book, 
  UserPlus, 
  MessageSquare, 
  User,
  Settings,
  HelpCircle,
  LogOut,
  Plus,
  Shield,
  FileText,
  Users,
  MessageCircle,
  GiftIcon,
  UserPlus2
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getInitials } from "@/lib/utils";
import { BottomNav } from "@/components/layout/bottom-nav";

export default function Menu() {
  const [, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { isHostMode, toggleHostMode } = useHostMode();
  
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
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">HOSTING</h2>
          </div>
          
          <div className="px-4">
            <button 
              onClick={() => navigate("/host-listings")}
              className="flex items-center justify-between w-full py-4"
            >
              <div className="flex items-center">
                <Calendar className="h-6 w-6 mr-4" />
                <span className="text-base">Reservations</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
            
            <button 
              onClick={() => navigate("/host-earnings")}
              className="flex items-center justify-between w-full py-4"
            >
              <div className="flex items-center">
                <DollarSign className="h-6 w-6 mr-4" />
                <span className="text-base">Earnings</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
            
            <button 
              onClick={() => navigate("/host-dashboard")}
              className="flex items-center justify-between w-full py-4"
            >
              <div className="flex items-center">
                <BarChart3 className="h-6 w-6 mr-4" />
                <span className="text-base">Insights</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
            
            <button 
              onClick={() => navigate("/help")}
              className="flex items-center justify-between w-full py-4"
            >
              <div className="flex items-center">
                <Book className="h-6 w-6 mr-4" />
                <span className="text-base">Guidebooks</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
            
            <button 
              onClick={() => navigate("/become-host/car-type")}
              className="flex items-center justify-between w-full py-4"
            >
              <div className="flex items-center">
                <Plus className="h-6 w-6 mr-4" />
                <span className="text-base">Create a new listing</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
            
            <button 
              onClick={() => navigate("/find-cohost")}
              className="flex items-center justify-between w-full py-4"
            >
              <div className="flex items-center">
                <UserPlus className="h-6 w-6 mr-4" />
                <span className="text-base">Find a co-host</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
            
            <button 
              onClick={() => navigate("/host-messages")}
              className="flex items-center justify-between w-full py-4"
            >
              <div className="flex items-center">
                <MessageSquare className="h-6 w-6 mr-4" />
                <span className="text-base">Messages</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
          </div>
          
          <Separator className="my-4" />
        </>
      )}
      
      <div className="px-4 py-2">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">ACCOUNT</h2>
      </div>
      
      <div className="px-4">
        <button 
          onClick={() => navigate("/profile")}
          className="flex items-center justify-between w-full py-4"
        >
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
        
        <button 
          onClick={() => navigate("/account-preferences")}
          className="flex items-center justify-between w-full py-4"
        >
          <div className="flex items-center">
            <Settings className="h-6 w-6 mr-4" />
            <span className="text-base">Settings</span>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </button>
        
        <button 
          onClick={() => navigate("/help")}
          className="flex items-center justify-between w-full py-4"
        >
          <div className="flex items-center">
            <HelpCircle className="h-6 w-6 mr-4" />
            <span className="text-base">Visit the Help Center</span>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </button>

        <button 
          onClick={() => navigate("/safety")}
          className="flex items-center justify-between w-full py-4"
        >
          <div className="flex items-center">
            <Shield className="h-6 w-6 mr-4" />
            <span className="text-base">Get help with a safety issue</span>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </button>

        <button 
          onClick={() => navigate("/hosting-resources")}
          className="flex items-center justify-between w-full py-4"
        >
          <div className="flex items-center">
            <FileText className="h-6 w-6 mr-4" />
            <span className="text-base">Explore hosting resources</span>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </button>

        <button 
          onClick={() => navigate("/connect-hosts")}
          className="flex items-center justify-between w-full py-4"
        >
          <div className="flex items-center">
            <Users className="h-6 w-6 mr-4" />
            <span className="text-base">Connect with Hosts near you</span>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </button>

        <button 
          onClick={() => navigate("/feedback")}
          className="flex items-center justify-between w-full py-4"
        >
          <div className="flex items-center">
            <MessageCircle className="h-6 w-6 mr-4" />
            <span className="text-base">Give us feedback</span>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </button>

        <button 
          onClick={() => navigate("/gift-cards")}
          className="flex items-center justify-between w-full py-4"
        >
          <div className="flex items-center">
            <GiftIcon className="h-6 w-6 mr-4" />
            <span className="text-base">Gift cards</span>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </button>

        <button 
          onClick={() => navigate("/refer-host")}
          className="flex items-center justify-between w-full py-4"
        >
          <div className="flex items-center">
            <UserPlus2 className="h-6 w-6 mr-4" />
            <span className="text-base">Refer a Host</span>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </button>
      </div>
      
      {/* Mode switcher moved to bottom navigation */}
      
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
        <div className="flex justify-center space-x-2">
          <a href="/terms" className="hover:underline">Terms of Service</a>
          <span>·</span>
          <a href="/privacy" className="hover:underline">Privacy Policy</a>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
}