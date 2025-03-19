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
  const isTablet = windowWidth >= 640 && windowWidth < 1024;
  
  // Determine which steps to show based on screen size
  const visibleSteps = () => {
    if (isMobile) {
      // On mobile, show current step and adjacent steps
      const currentIndex = steps.findIndex(step => step.id === currentStepId);
      return steps.filter((_, index) => 
        index === currentIndex || 
        index === currentIndex - 1 || 
        index === currentIndex + 1
      );
    } else if (isTablet) {
      // On tablet, show 4-5 steps
      return steps.slice(0, 5);
    } else {
      // On desktop, show all steps
      return steps;
    }
  };
  
  // Calculate current step index
  const currentIndex = steps.findIndex(step => step.id === currentStepId);
  
  return (
    <TooltipProvider>
      <div className={cn("flex justify-between overflow-x-auto", className)}>
        {visibleSteps().map((step, index) => {
          // Find the real index in the full steps array
          const realIndex = steps.findIndex(s => s.id === step.id);
          const isCompleted = realIndex < currentIndex;
          const isCurrent = step.id === currentStepId;
          const isNext = realIndex === currentIndex + 1;
          
          return (
            <div 
              key={step.id} 
              className={cn(
                "flex flex-col items-center px-1 min-w-[60px] sm:min-w-[80px] transition-all duration-300",
                isCurrent && "scale-110"
              )}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-all duration-300",
                      isCompleted ? "bg-green-500 text-white" :
                      isCurrent ? "bg-red-600 text-white" :
                      isNext ? "bg-gray-200 text-gray-700" :
                      "bg-gray-100 text-gray-400",
                      "hover:scale-110 cursor-pointer"
                    )}
                  >
                    {isCompleted ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    ) : (
                      realIndex + 1
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{step.title}</p>
                  {step.description && <p className="text-xs text-gray-500">{step.description}</p>}
                </TooltipContent>
              </Tooltip>
              
              <span 
                className={cn(
                  "text-xs text-center whitespace-nowrap transition-all duration-300",
                  isCompleted ? "text-green-600 font-medium" :
                  isCurrent ? "text-red-600 font-medium" :
                  isNext ? "text-gray-700" :
                  "text-gray-400"
                )}
              >
                {step.title}
              </span>
              
              {/* Connector line between steps */}
              {index < visibleSteps().length - 1 && (
                <div className="hidden sm:block absolute h-[2px] bg-gray-200 top-4 z-0" style={{
                  left: `calc(${(100 / visibleSteps().length) * (index + 0.5)}% + 12px)`,
                  width: `calc(${100 / visibleSteps().length}% - 24px)`
                }}></div>
              )}
            </div>
          );
        })}
        
        {/* Show indicator if there are more steps */}
        {isMobile && currentIndex < steps.length - 2 && (
          <div className="flex items-center justify-center">
            <div className="w-6 text-gray-400">...</div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}