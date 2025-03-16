import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface RatingProps {
  value: number;
  count?: number;
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

  return (
    <div className={cn("flex items-center", className)}>
      <Star 
        className={cn("text-yellow-500 fill-current", sizeClass[size])} 
      />
      <span className={cn("ml-1 font-medium", textSize[size])}>
        {value.toFixed(1)}
        {showCount && count !== undefined && ` (${count} ${count === 1 ? 'voyage' : 'voyages'})`}
      </span>
    </div>
  );
}
