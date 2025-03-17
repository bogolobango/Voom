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
      icon: <Car className="h-5 w-5" />,
      description: "Browse all available vehicles",
      count: 8
    },
    {
      id: "sedan",
      name: "Sedan",
      icon: <Car className="h-5 w-5" />,
      description: "Comfortable 4-door vehicles",
      count: 2
    },
    {
      id: "suv",
      name: "SUV",
      icon: <ShieldCheck className="h-5 w-5" />,
      description: "Spacious vehicles with elevated seating",
      count: 1
    },
    {
      id: "truck",
      name: "Truck",
      icon: <TruckIcon className="h-5 w-5" />,
      description: "Utility vehicles with cargo beds",
      count: 1
    },
    {
      id: "sports",
      name: "Sports",
      icon: <GaugeCircle className="h-5 w-5" />,
      description: "High-performance vehicles",
      count: 1
    },
    {
      id: "luxury",
      name: "Luxury",
      icon: <Crown className="h-5 w-5" />,
      description: "Premium vehicles with high-end features",
      count: 2
    },
    {
      id: "compact",
      name: "Compact",
      icon: <Cog className="h-5 w-5" />,
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
    <div className="mb-6 relative">
      {showLeftArrow && (
        <button 
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-1 border hidden md:flex items-center justify-center"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}
      
      <div 
        ref={scrollRef}
        className="overflow-x-auto hide-scrollbar scroll-smooth"
      >
        <div className="flex space-x-2 pb-2 px-1">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              className={cn(
                "flex items-center space-x-1 min-w-max transition-all duration-200",
                selectedCategory === category.id 
                  ? "bg-red-600 hover:bg-red-700" 
                  : "hover:border-gray-300"
              )}
              onClick={() => onCategorySelect(category.id)}
              title={category.description}
            >
              {category.icon}
              <span>{category.name}</span>
              {category.count !== undefined && category.id !== "all" && (
                <Badge variant="outline" className="ml-1 bg-white/20 text-white text-[10px] h-5">
                  {category.count}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>
      
      {showRightArrow && (
        <button 
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-1 border hidden md:flex items-center justify-center"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}