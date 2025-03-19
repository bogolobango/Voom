import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export type Step = {
  id: string;
  title: string;
  description?: string;
  completed?: boolean;
};

interface ListingProgressStepsProps {
  steps: Step[];
  currentStepId: string;
  className?: string;
}

export function ListingProgressSteps({
  steps,
  currentStepId,
  className,
}: ListingProgressStepsProps) {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );
  
  // Update window width on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  
  const isMobile = windowWidth < 640;
  
  // Determine which steps to show based on screen size
  const visibleSteps = () => {
    if (isMobile) {
      // On mobile, only show 3 steps: previous, current, and next
      const currentIndex = steps.findIndex(step => step.id === currentStepId);
      const startIndex = Math.max(0, currentIndex - 1);
      const endIndex = Math.min(steps.length, currentIndex + 2);
      return steps.slice(startIndex, endIndex);
    } else {
      // On desktop, show all steps
      return steps;
    }
  };
  
  // Calculate current step index
  const currentIndex = steps.findIndex(step => step.id === currentStepId);
  
  return (
    <TooltipProvider>
      <div className={cn("flex overflow-x-auto py-2 px-1", className)}>
        <div className="flex mx-auto space-x-1 sm:space-x-4">
          {visibleSteps().map((step) => {
            // Find the real index in the full steps array
            const realIndex = steps.findIndex(s => s.id === step.id);
            const isCompleted = step.completed || realIndex < currentIndex;
            const isCurrent = step.id === currentStepId;
            
            return (
              <Tooltip key={step.id}>
                <TooltipTrigger asChild>
                  <div 
                    className={cn(
                      "flex flex-col items-center group cursor-pointer",
                      isCurrent && "scale-105"
                    )}
                  >
                    <div 
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center mb-1 transition-all duration-300",
                        isCompleted ? "bg-green-500 text-white" :
                        isCurrent ? "bg-red-600 text-white" :
                        "bg-gray-200 text-gray-500",
                        "group-hover:scale-110 shadow-sm"
                      )}
                    >
                      {isCompleted ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      ) : (
                        realIndex + 1
                      )}
                    </div>
                    
                    <span 
                      className={cn(
                        "text-xs font-medium text-center whitespace-nowrap transition-all duration-300",
                        isCompleted ? "text-green-600" :
                        isCurrent ? "text-red-600" :
                        "text-gray-500"
                      )}
                    >
                      {step.title}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{step.title}</p>
                  {step.description && <p className="text-xs text-gray-500">{step.description}</p>}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}