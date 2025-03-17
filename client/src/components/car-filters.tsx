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
import { SlidersHorizontal, Check, Star } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface FilterOptions {
  priceRange: [number, number];
  make: string[];
  available: boolean;
  features: string[];
  year: number | null;
  minRating: number | null;
  sort: string | null;
}

interface CarFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
}

const carMakes = [
  "All", "Mitsubishi", "Mercedes", "Toyota", "Honda", "BMW", "Audi", "Ford", "Volkswagen", "Kia"
];

const carFeatures = [
  "Bluetooth", "Air conditioning", "GPS", "Backup camera", "Heated seats", "Leather seats",
  "Sunroof", "4x4", "Premium audio", "Parking sensors"
];

const years = [2023, 2022, 2021, 2020, 2019, 2018]; 

export function CarFilters({ onFilterChange, currentFilters }: CarFiltersProps) {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(currentFilters);
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced'>('basic');
  
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
  
  const handleFeatureToggle = (feature: string) => {
    setLocalFilters(prev => {
      if (prev.features.includes(feature)) {
        return {
          ...prev,
          features: prev.features.filter(f => f !== feature)
        };
      } else {
        return {
          ...prev,
          features: [...prev.features, feature]
        };
      }
    });
  };
  
  const handleAvailabilityChange = (checked: boolean) => {
    setLocalFilters(prev => ({
      ...prev,
      available: checked
    }));
  };
  
  const handleYearChange = (value: string) => {
    setLocalFilters(prev => ({
      ...prev,
      year: value === "any" ? null : parseInt(value)
    }));
  };
  
  const handleRatingChange = (value: string) => {
    setLocalFilters(prev => ({
      ...prev,
      minRating: value === "any" ? null : parseFloat(value)
    }));
  };
  
  const handleSortChange = (value: string) => {
    setLocalFilters(prev => ({
      ...prev,
      sort: value === "default" ? null : value
    }));
  };
  
  const applyFilters = () => {
    onFilterChange(localFilters);
  };
  
  const resetFilters = () => {
    const defaultFilters: FilterOptions = {
      priceRange: [0, 200000],
      make: [],
      available: false,
      features: [],
      year: null,
      minRating: null,
      sort: null
    };
    setLocalFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="ml-2 relative">
          <SlidersHorizontal className="h-4 w-4" />
          {(localFilters.make.length > 0 || 
            localFilters.available || 
            localFilters.features.length > 0 || 
            localFilters.year || 
            localFilters.minRating || 
            localFilters.sort) && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-3 h-3 flex items-center justify-center text-[8px]">
              <Check className="h-2 w-2" />
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filter Cars</SheetTitle>
          <SheetDescription>
            Refine your search to find the perfect car.
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex mt-4 mb-2 border-b">
          <button 
            className={cn(
              "pb-2 px-4 font-medium text-sm", 
              activeTab === 'basic' 
                ? "border-b-2 border-red-600 text-red-600" 
                : "text-gray-500"
            )}
            onClick={() => setActiveTab('basic')}
          >
            Basic Filters
          </button>
          <button 
            className={cn(
              "pb-2 px-4 font-medium text-sm", 
              activeTab === 'advanced' 
                ? "border-b-2 border-red-600 text-red-600" 
                : "text-gray-500"
            )}
            onClick={() => setActiveTab('advanced')}
          >
            Advanced Filters
          </button>
        </div>
        
        <div className="py-4">
          {activeTab === 'basic' ? (
            <>
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3">Price Range</h3>
                <div className="space-y-4">
                  <Slider 
                    value={localFilters.priceRange} 
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
            </>
          ) : (
            <>
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3">Sort By</h3>
                <Select 
                  value={localFilters.sort || "default"}
                  onValueChange={handleSortChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sort order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="price_low">Price: Low to High</SelectItem>
                    <SelectItem value="price_high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Rating: High to Low</SelectItem>
                    <SelectItem value="newest">Year: Newest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3">Year</h3>
                <Select 
                  value={localFilters.year?.toString() || "any"} 
                  onValueChange={handleYearChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Any year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any year</SelectItem>
                    {years.map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3">Minimum Rating</h3>
                <div className="flex items-center space-x-3">
                  {[0, 3, 3.5, 4, 4.5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => handleRatingChange(rating === 0 ? "any" : rating.toString())}
                      className={cn(
                        "p-2 border rounded-md flex items-center",
                        (localFilters.minRating === rating || (rating === 0 && !localFilters.minRating))
                          ? "border-red-600 bg-red-50 text-red-600"
                          : "border-gray-300"
                      )}
                    >
                      {rating === 0 ? (
                        <span>Any</span>
                      ) : (
                        <div className="flex items-center">
                          <span>{rating}</span>
                          <Star className="h-3 w-3 ml-1 fill-current" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3">Features</h3>
                <div className="grid grid-cols-2 gap-2">
                  {carFeatures.map(feature => (
                    <div key={feature} className="flex items-center space-x-2">
                      <Switch 
                        id={`feature-${feature}`} 
                        checked={localFilters.features.includes(feature)} 
                        onCheckedChange={() => handleFeatureToggle(feature)}
                      />
                      <Label htmlFor={`feature-${feature}`}>{feature}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
        
        <SheetFooter className="pt-2 border-t">
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