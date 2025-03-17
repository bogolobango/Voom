import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Car, 
  TruckIcon, 
  Cog, 
  Crown, 
  GaugeCircle, 
  ShieldCheck, 
  ChevronRight, 
  ChevronLeft 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface CarCategoryProps {
  onCategorySelect: (category: string) => void;
  selectedCategory: string | null;
}

type CategoryItem = {
  id: string;
  name: string;
  icon: React.ReactNode;
  description?: string;
  count?: number;
};

export function CarCategories({ onCategorySelect, selectedCategory }: CarCategoryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  
  const categories: CategoryItem[] = [
    {
      id: "all",
      name: "All Cars",
      icon: <Car className="h-6 w-6" />,
      description: "Browse all available vehicles",
      count: 8
    },
    {
      id: "sedan",
      name: "Sedan",
      icon: <Car className="h-6 w-6" />,
      description: "Comfortable 4-door vehicles",
      count: 2
    },
    {
      id: "suv",
      name: "SUV",
      icon: <ShieldCheck className="h-6 w-6" />,
      description: "Spacious vehicles with elevated seating",
      count: 1
    },
    {
      id: "truck",
      name: "Truck",
      icon: <TruckIcon className="h-6 w-6" />,
      description: "Utility vehicles with cargo beds",
      count: 1
    },
    {
      id: "sports",
      name: "Sports",
      icon: <GaugeCircle className="h-6 w-6" />,
      description: "High-performance vehicles",
      count: 1
    },
    {
      id: "luxury",
      name: "Luxury",
      icon: <Crown className="h-6 w-6" />,
      description: "Premium vehicles with high-end features",
      count: 2
    },
    {
      id: "compact",
      name: "Compact",
      icon: <Cog className="h-6 w-6" />,
      description: "Fuel-efficient smaller vehicles",
      count: 1
    },
  ];
  
  const checkScroll = () => {
    if (!scrollRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10); // Small buffer
  };
  
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener("scroll", checkScroll);
      // Initial check
      checkScroll();
      
      window.addEventListener('resize', checkScroll);
      
      return () => {
        scrollElement.removeEventListener("scroll", checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, []);
  
  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    
    const scrollAmount = 300; // Adjust as needed
    const newPosition = direction === 'left' 
      ? scrollRef.current.scrollLeft - scrollAmount 
      : scrollRef.current.scrollLeft + scrollAmount;
      
    scrollRef.current.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    });
  };

  return (
    <div className="mb-10 relative">
      <h2 className="text-lg font-medium mb-4">Browse by category</h2>
      
      {showLeftArrow && (
        <button 
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-2 border hidden md:flex items-center justify-center"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}
      
      <div 
        ref={scrollRef}
        className="overflow-x-auto hide-scrollbar scroll-smooth"
      >
        <div className="flex space-x-4 pb-2 px-1">
          {categories.map((category) => (
            <div
              key={category.id}
              className={cn(
                "flex flex-col items-center cursor-pointer min-w-[80px] transition-all duration-200",
                selectedCategory === category.id 
                  ? "opacity-100" 
                  : "opacity-70 hover:opacity-100"
              )}
              onClick={() => onCategorySelect(category.id)}
              title={category.description}
            >
              <div className={cn(
                "flex items-center justify-center w-14 h-14 rounded-full mb-2",
                selectedCategory === category.id 
                  ? "text-white bg-red-600" 
                  : "text-gray-700 bg-gray-100"
              )}>
                {category.icon}
              </div>
              <span className={cn(
                "text-sm truncate text-center",
                selectedCategory === category.id && "font-medium"
              )}>
                {category.name}
              </span>
              {category.count !== undefined && category.id !== "all" && selectedCategory === category.id && (
                <Badge className="mt-1 text-[10px]">
                  {category.count}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {showRightArrow && (
        <button 
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-2 border hidden md:flex items-center justify-center"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}