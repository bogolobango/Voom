import React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

interface CarSkeletonProps {
  className?: string;
}

export function CarCardSkeleton({ className }: CarSkeletonProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      {/* Image skeleton */}
      <Skeleton className="w-full h-48" />
      
      <div className="p-4">
        <div className="flex justify-between">
          <div className="space-y-2">
            {/* Title skeleton */}
            <Skeleton className="h-6 w-36" />
            {/* Rating skeleton */}
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-4 w-4 rounded-full" />
              ))}
              <Skeleton className="h-4 w-8 ml-1" />
            </div>
            {/* Location skeleton */}
            <Skeleton className="h-4 w-48" />
            {/* Cancellation skeleton */}
            <Skeleton className="h-4 w-32" />
          </div>
          
          <div className="text-right space-y-2">
            {/* Price skeleton */}
            <Skeleton className="h-6 w-24 ml-auto" />
            {/* Badge skeleton */}
            <Skeleton className="h-4 w-16 ml-auto" />
          </div>
        </div>
      </div>
    </Card>
  );
}

export function CarDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Image carousel skeleton */}
      <div className="relative">
        <Skeleton className="w-full h-64 rounded-lg" />
        <div className="absolute top-4 right-4 flex space-x-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
      
      {/* Car info header skeleton */}
      <div className="flex justify-between items-start">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-4 w-4 rounded-full" />
            ))}
            <Skeleton className="h-4 w-16 ml-2" />
          </div>
        </div>
        <div className="text-right">
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-6 w-24 ml-auto" />
        </div>
      </div>
      
      {/* Features grid skeleton */}
      <Skeleton className="w-full h-24 rounded-lg" />
      
      {/* Location skeleton */}
      <div className="flex items-center">
        <Skeleton className="h-5 w-5 mr-2 rounded-full" />
        <Skeleton className="h-5 w-48" />
      </div>
      
      {/* Tabs skeleton */}
      <div className="space-y-4">
        <div className="flex space-x-1">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-10 w-1/3" />
        </div>
        
        <div className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="flex items-center">
                <Skeleton className="h-5 w-5 mr-2 rounded-full" />
                <Skeleton className="h-5 w-32" />
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Host info skeleton */}
      <Card>
        <div className="p-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="flex items-center">
            <Skeleton className="h-12 w-12 rounded-full mr-4" />
            <div>
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
      </Card>
      
      {/* Action buttons skeleton */}
      <div className="sticky bottom-4 z-10 mt-6">
        <Skeleton className="h-14 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function CarGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CarCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Animation that looks like cars are driving across the screen
export function CarDrivingAnimation() {
  return (
    <div className="relative h-6 w-full overflow-hidden my-8">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 to-transparent h-[1px] top-1/2 transform -translate-y-1/2"></div>
      
      {/* Fast car */}
      <div className="absolute left-0 top-0 car-drive-animation" style={{ animationDuration: '3s' }}>
        <div className="relative w-10 h-6">
          <div className="absolute w-6 h-2 bg-primary top-1 left-1 rounded-sm"></div>
          <div className="absolute w-2 h-2 bg-gray-800 bottom-0 left-1 rounded-full"></div>
          <div className="absolute w-2 h-2 bg-gray-800 bottom-0 left-5 rounded-full"></div>
        </div>
      </div>
      
      {/* Medium car */}
      <div className="absolute left-0 top-0 car-drive-animation" style={{ animationDuration: '5s', animationDelay: '1s' }}>
        <div className="relative w-12 h-6">
          <div className="absolute w-8 h-3 bg-blue-500 top-0 left-2 rounded-sm"></div>
          <div className="absolute w-2 h-2 bg-gray-800 bottom-0 left-2 rounded-full"></div>
          <div className="absolute w-2 h-2 bg-gray-800 bottom-0 left-8 rounded-full"></div>
        </div>
      </div>
      
      {/* Slow car */}
      <div className="absolute left-0 top-0 car-drive-animation" style={{ animationDuration: '8s', animationDelay: '2s' }}>
        <div className="relative w-14 h-6">
          <div className="absolute w-10 h-3 bg-green-500 top-0 left-2 rounded-sm"></div>
          <div className="absolute w-2 h-2 bg-gray-800 bottom-0 left-3 rounded-full"></div>
          <div className="absolute w-2 h-2 bg-gray-800 bottom-0 left-9 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}