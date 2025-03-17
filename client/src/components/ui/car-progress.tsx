import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, Circle, Car } from 'lucide-react';

interface Step {
  id: string;
  title: string;
  description?: string;
}

interface CarProgressProps {
  steps: Step[];
  currentStep: string;
  className?: string;
  variant?: 'default' | 'road';
}

export function CarProgress({ steps, currentStep, className, variant = 'default' }: CarProgressProps) {
  const currentIndex = steps.findIndex(step => step.id === currentStep);
  
  if (variant === 'road') {
    return (
      <div className={cn('w-full', className)}>
        <div className="relative py-6">
          {/* Road background */}
          <div className="absolute top-10 left-0 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            {/* Road markings */}
            <div 
              className="h-full w-full" 
              style={{
                backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(255,255,255,0.5) 10px, rgba(255,255,255,0.5) 20px)',
                backgroundSize: '20px 100%'
              }}
            ></div>
            
            {/* Progress fill */}
            <div 
              className="absolute top-0 left-0 h-full bg-primary transition-all duration-700 ease-in-out"
              style={{ width: `${(100 * currentIndex) / (steps.length - 1)}%` }}
            ></div>
          </div>
          
          {/* Car on road */}
          <div 
            className="absolute top-6 z-20 transition-all duration-700 ease-in-out"
            style={{ 
              left: `calc(${(100 * currentIndex) / (steps.length - 1)}% - 15px)`,
              display: currentIndex < 0 ? 'none' : 'block'
            }}
          >
            <div className="relative w-10 h-10">
              {/* Car body */}
              <div className="absolute w-full h-3 bg-primary top-1 rounded-sm"></div>
              <div className="absolute w-6 h-2 bg-primary top-0 left-2 rounded-t-sm"></div>
              <div className="absolute w-2 h-2 bg-gray-800 bottom-2 left-1 rounded-full car-wheel-animation"></div>
              <div className="absolute w-2 h-2 bg-gray-800 bottom-2 right-1 rounded-full car-wheel-animation"></div>
              <div className="absolute w-1 h-1 bg-yellow-400 right-0 top-2 rounded-full car-light-animation"></div>
            </div>
          </div>
          
          {/* Steps */}
          <div className="relative flex justify-between">
            {steps.map((step, index) => {
              const isActive = index === currentIndex;
              const isCompleted = index < currentIndex;
              
              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={cn(
                    "relative flex items-center justify-center z-10 mb-3 w-6 h-6 rounded-full",
                    isActive ? "bg-primary text-white" : 
                    isCompleted ? "bg-primary/20 text-primary" : "bg-gray-200 text-gray-500"
                  )}>
                    <span className="text-sm font-bold">{index + 1}</span>
                    {isActive && (
                      <span className="absolute w-10 h-10 border-2 border-primary rounded-full animate-ping opacity-60"></span>
                    )}
                  </div>
                  
                  <span className={cn(
                    "text-sm font-medium text-center",
                    isActive ? "text-primary" : 
                    isCompleted ? "text-primary/80" : "text-gray-500"
                  )}>
                    {step.title}
                  </span>
                  
                  {step.description && (
                    <span className="text-xs text-gray-500 mt-1 text-center max-w-[120px]">
                      {step.description}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
  
  // Default variant
  return (
    <div className={cn('w-full', className)}>
      <div className="relative">
        {/* Connecting line */}
        <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-200">
          <div 
            className="absolute h-full bg-primary transition-all duration-500 ease-in-out"
            style={{ width: `${(100 * currentIndex) / (steps.length - 1)}%` }}
          ></div>
        </div>
        
        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isActive = index === currentIndex;
            const isCompleted = index < currentIndex;
            
            return (
              <div key={step.id} className="flex flex-col items-center">
                <div className="relative flex items-center justify-center z-10 mb-2">
                  {isCompleted ? (
                    <CheckCircle className="w-8 h-8 text-primary fill-primary/20" />
                  ) : isActive ? (
                    <div className="relative">
                      <div className="car-bounce-animation">
                        <Car className="w-8 h-8 text-primary" />
                      </div>
                      <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full animate-ping"></span>
                    </div>
                  ) : (
                    <Circle className="w-8 h-8 text-gray-300" />
                  )}
                </div>
                <span className={cn(
                  "text-sm font-medium",
                  isActive || isCompleted ? "text-primary" : "text-gray-500"
                )}>
                  {step.title}
                </span>
                {step.description && (
                  <span className="text-xs text-gray-500 mt-1 text-center max-w-[100px]">
                    {step.description}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}