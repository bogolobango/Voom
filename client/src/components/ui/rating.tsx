import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface RatingProps {
  value: number | null | undefined;
  count?: number | null | undefined;
  showCount?: boolean;
  className?: string;
  size?: "sm" | "md";
}

export function Rating({
  value,
  count,
  showCount = true,
  className,
  size = "md",
}: RatingProps) {
  const sizeClass = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
  };

  const textSize = {
    sm: "text-xs",
    md: "text-sm",
  };

  // Ensure value is a number
  const ratingValue = typeof value === 'number' ? value : 0;
  
  // Ensure count is a number or undefined
  const ratingCount = count != null ? count : undefined;

  return (
    <div className={cn("flex items-center", className)}>
      <Star 
        className={cn("text-yellow-500 fill-current", sizeClass[size])} 
      />
      <span className={cn("ml-1 font-medium", textSize[size])}>
        {ratingValue.toFixed(1)}
        {showCount && ratingCount !== undefined && ` (${ratingCount} ${ratingCount === 1 ? 'voyage' : 'voyages'})`}
      </span>
    </div>
  );
}
