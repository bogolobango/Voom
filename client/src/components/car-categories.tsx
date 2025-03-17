import React from "react";
import { Button } from "@/components/ui/button";
import { Car, TruckIcon, Cog, Crown, GaugeCircle, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface CarCategoryProps {
  onCategorySelect: (category: string) => void;
  selectedCategory: string | null;
}

type CategoryItem = {
  id: string;
  name: string;
  icon: React.ReactNode;
};

export function CarCategories({ onCategorySelect, selectedCategory }: CarCategoryProps) {
  const categories: CategoryItem[] = [
    {
      id: "all",
      name: "All",
      icon: <Car className="h-5 w-5" />,
    },
    {
      id: "sedan",
      name: "Sedan",
      icon: <Car className="h-5 w-5" />,
    },
    {
      id: "suv",
      name: "SUV",
      icon: <ShieldCheck className="h-5 w-5" />,
    },
    {
      id: "truck",
      name: "Truck",
      icon: <TruckIcon className="h-5 w-5" />,
    },
    {
      id: "sports",
      name: "Sports",
      icon: <GaugeCircle className="h-5 w-5" />,
    },
    {
      id: "luxury",
      name: "Luxury",
      icon: <Crown className="h-5 w-5" />,
    },
    {
      id: "compact",
      name: "Compact",
      icon: <Cog className="h-5 w-5" />,
    },
  ];

  return (
    <div className="mb-6 overflow-x-auto">
      <div className="flex space-x-2 pb-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            className={cn(
              "flex items-center space-x-1 min-w-max",
              selectedCategory === category.id && "bg-red-600 hover:bg-red-700"
            )}
            onClick={() => onCategorySelect(category.id)}
          >
            {category.icon}
            <span>{category.name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}