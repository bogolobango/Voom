import React from 'react';
import { cn } from '@/lib/utils';
import { Car, Loader2 } from 'lucide-react';

interface CarLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
  variant?: 'simple' | 'animated';
}

export function CarLoader({ 
  size = 'md', 
  className, 
  text, 
  variant = 'animated' 
}: CarLoaderProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20'
  };

  // Simple variant just shows a car icon with spinning animation
  if (variant === 'simple') {
    return (
      <div className={cn('flex flex-col items-center justify-center', className)}>
        <Car className={cn('text-primary animate-spin', sizeClasses[size])} />
        {text && <p className="mt-3 text-sm text-gray-500">{text}</p>}
      </div>
    );
  }

  // Animated car with wheels and road
  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <div className="relative">
        <div className={cn('relative car-bounce-animation', sizeClasses[size])}>
          {/* Car body */}
          <div className="absolute w-full h-2/5 top-0 rounded-t-xl bg-primary z-10">
            {/* Car body extension */}
            <div className="absolute w-3/5 h-full top-full left-1/5 bg-primary rounded-b-sm"></div>
            {/* Car windows */}
            <div className="absolute w-4/5 h-2/5 top-2/5 left-[10%] bg-white/80 rounded-lg"></div>
            {/* Car lights */}
            <div className="absolute w-[10%] h-[15%] right-[5%] top-[10%] bg-yellow-300 rounded-full car-light-animation"></div>
          </div>
          
          {/* Wheels */}
          <div className="absolute w-[30%] h-[30%] bottom-0 left-[10%] bg-gray-800 rounded-full z-[5] car-wheel-animation">
            <div className="absolute w-2/5 h-2/5 top-[30%] left-[30%] bg-gray-300 rounded-full"></div>
          </div>
          <div className="absolute w-[30%] h-[30%] bottom-0 right-[10%] bg-gray-800 rounded-full z-[5] car-wheel-animation">
            <div className="absolute w-2/5 h-2/5 top-[30%] left-[30%] bg-gray-300 rounded-full"></div>
          </div>
        </div>
        
        {/* Road */}
        <div className="absolute w-[150%] h-1 -bottom-2 -left-1/4 bg-gradient-to-r from-transparent via-gray-400 to-transparent" 
            style={{backgroundImage: 'repeating-linear-gradient(90deg, #999, #999 10px, transparent 10px, transparent 20px)'}}>
          <div className="w-full h-full animate-[drive_1s_linear_infinite_reverse]"></div>
        </div>
      </div>
      
      {text && <p className="mt-3 text-sm text-gray-500">{text}</p>}
    </div>
  );
}

export function CarLoadingScreen({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] py-10">
      <CarLoader size="lg" />
      <p className="mt-4 text-lg font-medium text-gray-600">{message}</p>
    </div>
  );
}

// Button loading animation with car icon
export function CarButtonLoader({ className }: { className?: string }) {
  return (
    <div className="flex items-center">
      <Car className={cn("h-4 w-4 mr-2 animate-bounce", className)} />
      <Loader2 className="h-4 w-4 animate-spin" />
    </div>
  );
}