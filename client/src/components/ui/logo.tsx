import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showLink?: boolean;
}

export function Logo({ 
  className, 
  size = "md",
  showLink = true 
}: LogoProps) {
  const sizeClasses = {
    sm: "text-xl tracking-wider",
    md: "text-2xl tracking-wider",
    lg: "text-3xl tracking-wider"
  };
  
  const logoContent = (
    <span className={cn(
      "font-bold text-red-600", 
      sizeClasses[size], 
      className
    )}>
      VOOM
    </span>
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