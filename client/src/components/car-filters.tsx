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
import { 
  SlidersHorizontal, 
  Check, 
  Star, 
  X, 
  Calendar, 
  Banknote, 
  Car as CarIcon, 
  Fuel,
  Sparkles,
  Trash2
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface FilterOptions {
  priceRange: [number, number];
  make: string[];
  available: boolean;
  features: string[];
  year: number | null;
  minRating: number | null;
  sort: string | null;
  transmission: string | null;
  fuelType: string | null;
  seats: number | null;
}

interface CarFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
  isInline?: boolean; // For horizontal filter display on desktop
  showSelectedFilters?: boolean; // Show active filters as badges
}

const carMakes = [
  "All", "Toyota", "Honda", "BMW", "Mercedes", "Audi", "Ford", "Kia", "Hyundai", 
  "Volkswagen", "Mitsubishi", "Nissan", "Lexus", "Land Rover", "Jeep"
];

const carFeatures = [
  "Bluetooth", "Air conditioning", "GPS", "Backup camera", "Heated seats", "Leather seats",
  "Sunroof", "4x4", "Premium audio", "Parking sensors", "Apple CarPlay", "Android Auto",
  "Keyless entry", "Cruise control", "Blind spot monitoring", "Lane assist"
];

const transmissionTypes = ["Automatic", "Manual", "CVT", "Semi-automatic"];
const fuelTypes = ["Petrol", "Diesel", "Electric", "Hybrid", "Plug-in Hybrid"];
const seatOptions = [2, 4, 5, 6, 7, 8, 9];
const years = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015]; 

// Icons for each filter type
const filterIcons = {
  price: <Banknote className="h-3 w-3" />,
  make: <CarIcon className="h-3 w-3" />,
  year: <Calendar className="h-3 w-3" />,
  rating: <Star className="h-3 w-3" />,
  feature: <Sparkles className="h-3 w-3" />,
  transmission: <CarIcon className="h-3 w-3" />,
  fuelType: <Fuel className="h-3 w-3" />,
};

export function CarFilters({ 
  onFilterChange, 
  currentFilters, 
  isInline = false,
  showSelectedFilters = false
}: CarFiltersProps) {
  const [localFilters, setLocalFilters] = useState<FilterOptions>({
    ...currentFilters,
    transmission: currentFilters.transmission || null,
    fuelType: currentFilters.fuelType || null,
    seats: currentFilters.seats || null
  });
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced'>('basic');
  
  // Count active filters to show in UI
  const activeFilterCount = [
    localFilters.make.length > 0,
    localFilters.available,
    localFilters.features.length > 0,
    localFilters.year !== null,
    localFilters.minRating !== null,
    localFilters.transmission !== null,
    localFilters.fuelType !== null,
    localFilters.seats !== null,
    (localFilters.priceRange[0] > 0 || localFilters.priceRange[1] < 200000)
  ].filter(Boolean).length;
  
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
  
  const handleTransmissionChange = (value: string) => {
    setLocalFilters(prev => ({
      ...prev,
      transmission: value === "any" ? null : value
    }));
  };
  
  const handleFuelTypeChange = (value: string) => {
    setLocalFilters(prev => ({
      ...prev,
      fuelType: value === "any" ? null : value
    }));
  };
  
  const handleSeatsChange = (value: string) => {
    setLocalFilters(prev => ({
      ...prev,
      seats: value === "any" ? null : parseInt(value)
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
      sort: null,
      transmission: null,
      fuelType: null,
      seats: null
    };
    setLocalFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };
  
  // Helper function to remove a single filter
  const removeFilter = (filterType: string, value?: string | number) => {
    switch (filterType) {
      case 'make':
        setLocalFilters(prev => ({
          ...prev,
          make: value ? prev.make.filter(m => m !== value) : []
        }));
        break;
      case 'feature':
        setLocalFilters(prev => ({
          ...prev,
          features: value ? prev.features.filter(f => f !== value) : []
        }));
        break;
      case 'year':
        setLocalFilters(prev => ({ ...prev, year: null }));
        break;
      case 'rating':
        setLocalFilters(prev => ({ ...prev, minRating: null }));
        break;
      case 'transmission':
        setLocalFilters(prev => ({ ...prev, transmission: null }));
        break;
      case 'fuelType':
        setLocalFilters(prev => ({ ...prev, fuelType: null }));
        break;
      case 'seats':
        setLocalFilters(prev => ({ ...prev, seats: null }));
        break;
      case 'price':
        setLocalFilters(prev => ({ ...prev, priceRange: [0, 200000] }));
        break;
      case 'available':
        setLocalFilters(prev => ({ ...prev, available: false }));
        break;
      default:
        break;
    }
  };
  
  // Render selected filters as badges if showSelectedFilters is true
  const SelectedFilters = () => {
    if (!showSelectedFilters || activeFilterCount === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-2 my-3">
        {/* Price Range Filter */}
        {(localFilters.priceRange[0] > 0 || localFilters.priceRange[1] < 200000) && (
          <Badge className="flex items-center gap-1 pl-2 bg-gray-100 text-gray-800 hover:bg-gray-200">
            <Banknote className="h-3 w-3 mr-1" />
            {formatCurrency(localFilters.priceRange[0])} - {formatCurrency(localFilters.priceRange[1])}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5 p-0 ml-1 rounded-full hover:bg-gray-300" 
              onClick={() => removeFilter('price')}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}
        
        {/* Available Only Filter */}
        {localFilters.available && (
          <Badge className="flex items-center gap-1 pl-2 bg-gray-100 text-gray-800 hover:bg-gray-200">
            <Check className="h-3 w-3 mr-1" />
            Available only
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5 p-0 ml-1 rounded-full hover:bg-gray-300" 
              onClick={() => removeFilter('available')}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}
        
        {/* Car Make Filters */}
        {localFilters.make.map(make => (
          <Badge 
            key={make}
            className="flex items-center gap-1 pl-2 bg-gray-100 text-gray-800 hover:bg-gray-200"
          >
            <CarIcon className="h-3 w-3 mr-1" />
            {make}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5 p-0 ml-1 rounded-full hover:bg-gray-300" 
              onClick={() => removeFilter('make', make)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
        
        {/* Features Filters */}
        {localFilters.features.map(feature => (
          <Badge 
            key={feature}
            className="flex items-center gap-1 pl-2 bg-gray-100 text-gray-800 hover:bg-gray-200"
          >
            <Sparkles className="h-3 w-3 mr-1" />
            {feature}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5 p-0 ml-1 rounded-full hover:bg-gray-300" 
              onClick={() => removeFilter('feature', feature)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
        
        {/* Year Filter */}
        {localFilters.year && (
          <Badge className="flex items-center gap-1 pl-2 bg-gray-100 text-gray-800 hover:bg-gray-200">
            <Calendar className="h-3 w-3 mr-1" />
            Year: {localFilters.year}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5 p-0 ml-1 rounded-full hover:bg-gray-300" 
              onClick={() => removeFilter('year')}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}
        
        {/* Rating Filter */}
        {localFilters.minRating && (
          <Badge className="flex items-center gap-1 pl-2 bg-gray-100 text-gray-800 hover:bg-gray-200">
            <Star className="h-3 w-3 mr-1 fill-current" />
            {localFilters.minRating}+ stars
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5 p-0 ml-1 rounded-full hover:bg-gray-300" 
              onClick={() => removeFilter('rating')}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}
        
        {/* Transmission Type */}
        {localFilters.transmission && (
          <Badge className="flex items-center gap-1 pl-2 bg-gray-100 text-gray-800 hover:bg-gray-200">
            <CarIcon className="h-3 w-3 mr-1" />
            {localFilters.transmission}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5 p-0 ml-1 rounded-full hover:bg-gray-300" 
              onClick={() => removeFilter('transmission')}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}
        
        {/* Fuel Type */}
        {localFilters.fuelType && (
          <Badge className="flex items-center gap-1 pl-2 bg-gray-100 text-gray-800 hover:bg-gray-200">
            <Fuel className="h-3 w-3 mr-1" />
            {localFilters.fuelType}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5 p-0 ml-1 rounded-full hover:bg-gray-300" 
              onClick={() => removeFilter('fuelType')}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}
        
        {/* Seats */}
        {localFilters.seats && (
          <Badge className="flex items-center gap-1 pl-2 bg-gray-100 text-gray-800 hover:bg-gray-200">
            <CarIcon className="h-3 w-3 mr-1" />
            {localFilters.seats} seats
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5 p-0 ml-1 rounded-full hover:bg-gray-300" 
              onClick={() => removeFilter('seats')}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}
        
        {/* Clear All */}
        {activeFilterCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm"
            className="h-7 px-2 text-xs flex items-center gap-1 text-red-600" 
            onClick={resetFilters}
          >
            <Trash2 className="h-3 w-3" />
            Clear all
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className={cn(isInline && "w-full")}>
      {/* Badges for selected filters */}
      <SelectedFilters />
      
      <Sheet>
        <SheetTrigger asChild>
          <Button 
            variant="outline" 
            size={isInline ? "sm" : "icon"} 
            className={cn("relative", isInline && "w-full")}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {!isInline ? (
              activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-3 h-3 flex items-center justify-center text-[8px]">
                  <Check className="h-2 w-2" />
                </span>
              )
            ) : (
              <span className="ml-2">Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ""}</span>
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
                  <h3 className="text-sm font-medium mb-3">Transmission</h3>
                  <Select 
                    value={localFilters.transmission || "any"} 
                    onValueChange={handleTransmissionChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Any transmission" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any transmission</SelectItem>
                      {transmissionTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-3">Fuel Type</h3>
                  <Select 
                    value={localFilters.fuelType || "any"} 
                    onValueChange={handleFuelTypeChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Any fuel type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any fuel type</SelectItem>
                      {fuelTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="make">
                    <AccordionTrigger className="text-sm font-medium">Car Make</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 gap-2 pt-2">
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
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
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
                      <SelectItem value="price-asc">Price: Low to High</SelectItem>
                      <SelectItem value="price-desc">Price: High to Low</SelectItem>
                      <SelectItem value="rating-desc">Rating: High to Low</SelectItem>
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
                  <h3 className="text-sm font-medium mb-3">Number of Seats</h3>
                  <Select 
                    value={localFilters.seats?.toString() || "any"} 
                    onValueChange={handleSeatsChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Any seats" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any number of seats</SelectItem>
                      {seatOptions.map(seats => (
                        <SelectItem key={seats} value={seats.toString()}>{seats} seats</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-3">Minimum Rating</h3>
                  <div className="flex items-center space-x-3 flex-wrap">
                    {[0, 3, 3.5, 4, 4.5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => handleRatingChange(rating === 0 ? "any" : rating.toString())}
                        className={cn(
                          "p-2 border rounded-md flex items-center my-1",
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
                
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="features">
                    <AccordionTrigger className="text-sm font-medium">Car Features</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 gap-2 pt-2">
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
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
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
    </div>
  );
}