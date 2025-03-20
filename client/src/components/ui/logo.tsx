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
    sm: "h-6",
    md: "h-8",
    lg: "h-10"
  };
  
  const logoContent = (
    <img 
      src="/images/voom-logo.png" 
      alt="VOOM" 
      className={cn(
        sizeClasses[size], 
        "w-auto", 
        className
      )} 
    />
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