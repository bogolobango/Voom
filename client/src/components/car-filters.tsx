import React, { useState } from "react";
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { SlidersHorizontal } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export interface FilterOptions {
  priceRange: [number, number];
  make: string[];
  available: boolean;
}

interface CarFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
}

const carMakes = [
  "All", "Mitsubishi", "Mercedes", "Toyota", "Honda", "BMW", "Audi", "Ford", "Chevrolet", "Volkswagen", "Hyundai"
];

export function CarFilters({ onFilterChange, currentFilters }: CarFiltersProps) {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(currentFilters);
  
  const handlePriceChange = (value: number[]) => {
    setLocalFilters(prev => ({
      ...prev,
      priceRange: [value[0], value[1]] as [number, number]
    }));
  };
  
  const handleMakeToggle = (make: string) => {
    setLocalFilters(prev => {
      if (make === "All") {
        // If "All" is selected, clear other selections
        return {
          ...prev,
          make: prev.make.includes("All") ? [] : ["All"]
        };
      } else {
        // Remove "All" if it was selected and add the specific make
        const newMakes = prev.make.filter(m => m !== "All");
        
        if (newMakes.includes(make)) {
          return {
            ...prev,
            make: newMakes.filter(m => m !== make)
          };
        } else {
          return {
            ...prev,
            make: [...newMakes, make]
          };
        }
      }
    });
  };
  
  const handleAvailabilityChange = (checked: boolean) => {
    setLocalFilters(prev => ({
      ...prev,
      available: checked
    }));
  };
  
  const applyFilters = () => {
    onFilterChange(localFilters);
  };
  
  const resetFilters = () => {
    const defaultFilters: FilterOptions = {
      priceRange: [0, 200000],
      make: [],
      available: false
    };
    setLocalFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="ml-2">
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Filter Cars</SheetTitle>
          <SheetDescription>
            Refine your search to find the perfect car.
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-6">
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3">Price Range</h3>
            <div className="space-y-4">
              <Slider 
                defaultValue={localFilters.priceRange} 
                min={0} 
                max={200000} 
                step={5000} 
                onValueChange={handlePriceChange}
              />
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">{formatCurrency(localFilters.priceRange[0])}</span>
                <span className="text-sm text-gray-500">{formatCurrency(localFilters.priceRange[1])}</span>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3">Car Make</h3>
            <div className="grid grid-cols-2 gap-2">
              {carMakes.map(make => (
                <div key={make} className="flex items-center space-x-2">
                  <Switch 
                    id={`make-${make}`} 
                    checked={localFilters.make.includes(make)} 
                    onCheckedChange={() => handleMakeToggle(make)}
                  />
                  <Label htmlFor={`make-${make}`}>{make}</Label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3">Availability</h3>
            <div className="flex items-center space-x-2">
              <Switch 
                id="available-only" 
                checked={localFilters.available} 
                onCheckedChange={handleAvailabilityChange}
              />
              <Label htmlFor="available-only">Show available cars only</Label>
            </div>
          </div>
        </div>
        
        <SheetFooter>
          <Button variant="outline" onClick={resetFilters}>
            Reset Filters
          </Button>
          <SheetClose asChild>
            <Button className="bg-red-600 hover:bg-red-700" onClick={applyFilters}>
              Apply Filters
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}