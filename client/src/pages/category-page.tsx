import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { useState } from "react";
import { ArrowLeft, Sliders, SlidersHorizontal } from "lucide-react";
import { Car as CarType } from "@shared/schema";
import { CarCard } from "@/components/car-card";
import { CarGridSkeleton } from "@/components/ui/car-skeleton";
import { Button } from "@/components/ui/button";
import { CarCategories } from "@/components/car-categories";
import { CarFilters, FilterOptions } from "@/components/car-filters";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function CategoryPage() {
  const [, navigate] = useLocation();
  const [, params] = useRoute("/category/:categoryId");
  const categoryId = params?.categoryId || "all";

  // State for filters
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: [0, 100000],
    make: [],
    available: true,
    features: [],
    year: null,
    minRating: null,
    sort: null,
    transmission: null,
    fuelType: null,
    seats: null
  });

  // Fetch cars data
  const { data: cars = [], isLoading } = useQuery<CarType[]>({
    queryKey: ["/api/cars"]
  });

  // Fetch favorite IDs for the current user
  const { data: favoriteIds = [] } = useQuery<number[]>({
    queryKey: ["/api/favorites/ids"]
  });

  // Filter cars based on category
  const filteredCars = cars.filter(car => {
    // First, apply category filter
    if (categoryId !== "all" && car.type?.toLowerCase() !== categoryId.toLowerCase()) {
      return false;
    }

    // Then apply all other filters
    if (filters.make.length > 0 && !filters.make.includes(car.make)) {
      return false;
    }

    if (filters.available && !car.available) {
      return false;
    }

    if (filters.priceRange && 
        (car.dailyRate < filters.priceRange[0] || car.dailyRate > filters.priceRange[1])) {
      return false;
    }

    if (filters.year && car.year !== filters.year) {
      return false;
    }

    if (filters.minRating && car.rating && car.rating < filters.minRating) {
      return false;
    }

    // New filter for transmission type - using optional chaining and safe type casting
    if (filters.transmission && car.transmission && 
        (car.transmission as string).toLowerCase() !== filters.transmission.toLowerCase()) {
      return false;
    }

    // New filter for fuel type - using optional chaining and safe type casting
    if (filters.fuelType && car.fuelType && 
        (car.fuelType as string).toLowerCase() !== filters.fuelType.toLowerCase()) {
      return false;
    }

    // New filter for number of seats - using optional chaining and safe type casting
    if (filters.seats && car.seats && 
        (car.seats as number) !== filters.seats) {
      return false;
    }

    if (filters.features.length > 0) {
      // Skip this check if car has no features
      if (!car.features) return false;
      
      // Check if car has all the required features
      const hasAllFeatures = filters.features.every(feature => 
        car.features?.includes(feature)
      );
      if (!hasAllFeatures) return false;
    }

    return true;
  });

  // Sort cars based on sort option
  const sortedCars = [...filteredCars].sort((a, b) => {
    if (!filters.sort) return 0;
    
    switch (filters.sort) {
      case "price-asc":
        return a.dailyRate - b.dailyRate;
      case "price-desc":
        return b.dailyRate - a.dailyRate;
      case "rating-desc":
        return (b.rating || 0) - (a.rating || 0);
      case "newest":
        return b.year - a.year;
      default:
        return 0;
    }
  });

  const getCategoryName = (id: string): string => {
    switch (id.toLowerCase()) {
      case "all": return "All Cars";
      case "sedan": return "Sedans";
      case "suv": return "SUVs";
      case "truck": return "Trucks";
      case "sports": return "Sports Cars";
      case "luxury": return "Luxury Cars";
      case "compact": return "Compact Cars";
      default: return "Cars";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate("/")}
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">{getCategoryName(categoryId)}</h1>
          </div>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <SlidersHorizontal className="h-4 w-4 mr-1" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="overflow-y-auto">
              <div className="py-6">
                <h2 className="text-lg font-medium mb-6">Filter Options</h2>
                <CarFilters 
                  onFilterChange={setFilters} 
                  currentFilters={filters} 
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main>
        {/* Category Selection */}
        <div className="border-b">
          <div className="container mx-auto px-4">
            <CarCategories 
              onCategorySelect={(category) => navigate(`/category/${category}`)}
              selectedCategory={categoryId}
            />
          </div>
        </div>

        {/* Results */}
        <div className="container mx-auto px-4 pt-6 pb-20">
          <div className="flex flex-col mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-medium mb-1">
                  {isLoading ? "Loading..." : `${sortedCars.length} cars available`}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {categoryId !== "all" 
                    ? `Showing all ${getCategoryName(categoryId).toLowerCase()} in your area`
                    : "Showing all available cars in your area"
                  }
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1 md:hidden"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Sliders className="h-4 w-4" />
                  {showFilters ? "Hide filters" : "Show filters"}
                </Button>
                <CarFilters 
                  onFilterChange={setFilters} 
                  currentFilters={filters}
                  isInline={true}
                  showSelectedFilters={true}
                />
              </div>
            </div>
          </div>

          {isLoading ? (
            <CarGridSkeleton count={8} />
          ) : sortedCars.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedCars.map((car) => (
                <CarCard 
                  key={car.id} 
                  car={car} 
                  isFavorite={favoriteIds.includes(car.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-muted/30 rounded-lg">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <SlidersHorizontal className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No cars found</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                We couldn't find any cars matching your search criteria. 
                Try adjusting your filters or exploring a different category.
              </p>
              <Button onClick={() => {
                setFilters({
                  priceRange: [0, 100000],
                  make: [],
                  available: true,
                  features: [],
                  year: null,
                  minRating: null,
                  sort: null,
                  transmission: null,
                  fuelType: null,
                  seats: null
                });
              }}>
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}