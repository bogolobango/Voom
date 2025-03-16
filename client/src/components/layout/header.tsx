import { Link, useLocation } from "wouter";
import { Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCallback } from "react";

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
}

export function Header({ title, showBack, onBack }: HeaderProps) {
  const [location] = useLocation();

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
              <div className="text-red-600 font-bold text-2xl">VOOM</div>
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
  const links = [
    { name: "Home", path: "/" },
    { name: "Favorites", path: "/favorites" },
    { name: "Bookings", path: "/bookings" },
    { name: "Messages", path: "/messages" },
    { name: "Account", path: "/account" },
  ];

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
    </>
  );
}
