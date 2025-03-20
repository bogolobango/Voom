import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface AuthLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showLink?: boolean;
}

export function AuthLogo({ 
  className, 
  size = "md",
  showLink = true 
}: AuthLogoProps) {
  const sizeClasses = {
    sm: "h-6",
    md: "h-8",
    lg: "h-10"
  };
  
  const logoContent = (
    <div className={cn("flex items-center", className)}>
      <span className={cn(
        "font-bold text-red-600 tracking-wider", 
        sizeClasses[size]
      )}>
        VOOM
      </span>
    </div>
  );
  
  if (showLink) {
    return (
      <Link href="/" className="flex items-center">
        {logoContent}
      </Link>
    );
  }
  
  return logoContent;
}