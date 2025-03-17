import { Link, useLocation } from "wouter";
import { Menu, User, LogIn, LogOut, UserPlus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getInitials } from "@/lib/utils";
import voomLogo from "@/assets/voom-logo.png";

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
}

export function Header({ title, showBack, onBack }: HeaderProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  // Handle back navigation with history
  const handleBack = useCallback(() => {
    if (onBack) {
      // Use provided callback if available
      onBack();
    } else if (window.history.length > 1) {
      // Go back in browser history
      window.history.back();
    } else {
      // Fallback to home if no history
      window.location.href = '/';
    }
  }, [onBack]);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <div className="flex items-center">
          {showBack || location !== '/' ? (
            <button
              onClick={handleBack}
              className="mr-3 p-1"
              aria-label="Go back"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </button>
          ) : (
            <Link href="/">
              <div className="flex items-center">
                <img 
                  src={voomLogo} 
                  alt="Voom Logo" 
                  className="h-10 logo-fade-in"
                />
              </div>
            </Link>
          )}
          {title && (
            <h1 className="text-xl font-semibold ml-2">{title}</h1>
          )}
        </div>

        <nav className="hidden md:flex space-x-6">
          <NavLinks />
        </nav>

        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="text-gray-800 p-2"
                aria-label="Menu"
              >
                <Menu className="h-6 w-6" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <NavLinks mobile />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

function NavLinks({ mobile = false }: { mobile?: boolean }) {
  const { user, logoutMutation } = useAuth();
  
  const authenticatedLinks = [
    { name: "Home", path: "/" },
    { name: "Favorites", path: "/favorites" },
    { name: "Bookings", path: "/bookings" },
    { name: "Messages", path: "/messages" },
    { name: "Account", path: "/account" },
  ];
  
  const unauthenticatedLinks = [
    { name: "Home", path: "/" },
  ];
  
  const links = user ? authenticatedLinks : unauthenticatedLinks;

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (mobile) {
    return (
      <>
        {links.map((link) => (
          <DropdownMenuItem key={link.name} asChild>
            <Link href={link.path}>
              <div className="w-full cursor-pointer">{link.name}</div>
            </Link>
          </DropdownMenuItem>
        ))}
        
        {user ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/auth">
                <div className="w-full cursor-pointer flex items-center">
                  <LogIn className="mr-2 h-4 w-4" />
                  <span>Login</span>
                </div>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/auth">
                <div className="w-full cursor-pointer flex items-center">
                  <UserPlus className="mr-2 h-4 w-4" />
                  <span>Register</span>
                </div>
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </>
    );
  }

  return (
    <>
      {links.map((link) => (
        <Link key={link.name} href={link.path}>
          <div className="text-gray-800 hover:text-red-600 transition-all py-2 cursor-pointer">
            {link.name}
          </div>
        </Link>
      ))}
      
      {user ? (
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.profilePicture || undefined} alt={user.username} />
                  <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{user.username}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/account">
                  <div className="w-full cursor-pointer">
                    Account
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Link href="/auth">
            <Button variant="ghost" size="sm">
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </Button>
          </Link>
          <Link href="/auth">
            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
              <UserPlus className="mr-2 h-4 w-4" />
              Register
            </Button>
          </Link>
        </div>
      )}
    </>
  );
}
