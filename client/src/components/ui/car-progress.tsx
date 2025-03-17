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
  
  // Simplified progress indicator with no animations for both variants
  return (
    <div className={cn('w-full', className)}>
      <div className="relative">
        {/* Connecting line */}
        <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-200">
          <div 
            className="absolute h-full bg-primary"
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
                    <Car className="w-8 h-8 text-primary" />
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