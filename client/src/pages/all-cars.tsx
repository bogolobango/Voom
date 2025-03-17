import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Search, SlidersHorizontal, Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CarGridSkeleton } from "@/components/ui/car-skeleton";
import { CarFilters, FilterOptions } from "@/components/car-filters";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Car } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { useCurrency } from "@/hooks/use-currency";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";
import { BottomNav } from "@/components/layout/bottom-nav";

export default function AllCarsPage() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const { currency } = useCurrency();
  
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
  
  const { data: cars = [], isLoading } = useQuery<Car[]>({
    queryKey: ["/api/cars"]
  });
  
  const { data: favoriteIds = [] } = useQuery<number[]>({
    queryKey: ["/api/favorites/ids"]
  });

  // Filter cars based on search and other filters
  const filteredCars = cars.filter(car => {
    // First, apply search filter if available
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesMake = car.make.toLowerCase().includes(query);
      const matchesModel = car.model.toLowerCase().includes(query);
      const matchesLocation = car.location.toLowerCase().includes(query);
      const matchesType = car.type.toLowerCase().includes(query);
      
      if (!(matchesMake || matchesModel || matchesLocation || matchesType)) {
        return false;
      }
    }
    
    // Apply all other filters
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

  return (
    <div className="min-h-screen bg-white pb-16">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center">
                <span className="text-xl font-bold text-red-500">VOOM</span>
              </div>
            </Link>
            
            <div>
              <Link href="/become-host">
                <Button variant="outline" size="sm" className="rounded-full border-red-500 text-red-500 hover:bg-red-50">
                  Become a Host
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="container mx-auto px-4 py-3">
          <h1 className="text-2xl font-semibold mb-3">Find your perfect ride</h1>
          <div className="flex gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input 
                type="text" 
                placeholder="Search for a car, a city, a type..." 
                className="pl-10 border-gray-300 rounded-md w-full"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <Button className="bg-transparent border border-gray-300 px-2" variant="outline">
              <MapPin size={18} />
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="bg-transparent border border-gray-300 px-2">
                  <SlidersHorizontal size={18} />
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
        </div>
      </header>

      <main>
        {/* Category Tabs */}
        <div className="border-b border-gray-100 py-2">
          <div className="container mx-auto px-4">
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              <Button 
                variant="default" 
                className="rounded-full flex-shrink-0 bg-red-500 hover:bg-red-600"
                onClick={() => navigate("/all-cars")}
              >
                All Cars
              </Button>
              <Button 
                variant="outline"
                className="rounded-full flex-shrink-0"
                onClick={() => navigate("/category/sedan")}
              >
                Sedan
              </Button>
              <Button 
                variant="outline"
                className="rounded-full flex-shrink-0"
                onClick={() => navigate("/category/suv")}
              >
                SUV
              </Button>
              <Button 
                variant="outline"
                className="rounded-full flex-shrink-0"
                onClick={() => navigate("/category/truck")}
              >
                Truck
              </Button>
              <Button 
                variant="outline"
                className="rounded-full flex-shrink-0"
                onClick={() => navigate("/category/sports")}
              >
                Sports
              </Button>
              <Button 
                variant="outline"
                className="rounded-full flex-shrink-0"
                onClick={() => navigate("/category/luxury")}
              >
                Luxury
              </Button>
              <Button 
                variant="outline"
                className="rounded-full flex-shrink-0"
                onClick={() => navigate("/category/compact")}
              >
                Compact
              </Button>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <CarFilters 
              onFilterChange={setFilters} 
              currentFilters={filters}
              isInline={true}
              showSelectedFilters={true}
            />
          </div>
        </div>

        {/* Results */}
        <div className="container mx-auto px-4 pt-4 pb-20">
          {isLoading ? (
            <CarGridSkeleton count={8} />
          ) : sortedCars.length > 0 ? (
            <div className="space-y-6">
              {sortedCars.map((car) => (
                <motion.div 
                  key={car.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100"
                >
                  <Link href={`/car-detail/${car.id}`}>
                    <div className="flex flex-col md:flex-row">
                      {/* Car Image */}
                      <div className="relative w-full md:w-1/3 h-48 md:h-auto">
                        <img 
                          src={car.imageUrl || `https://source.unsplash.com/random/600x400/?car-${car.make}-${car.model}`} 
                          alt={`${car.make} ${car.model}`} 
                          className="w-full h-full object-cover"
                        />
                        <button className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm">
                          <Heart 
                            className={`h-5 w-5 ${favoriteIds.includes(car.id) ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} 
                          />
                        </button>
                      </div>
                      
                      {/* Car Details */}
                      <div className="p-4 flex-1">
                        <h3 className="text-lg font-bold">{car.make} {car.model}</h3>
                        
                        {/* Rating */}
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm">{car.rating || 4.0} ({car.ratingCount || 28} voyages)</span>
                        </div>
                        
                        {/* Location */}
                        <p className="text-sm text-gray-600 mt-2">
                          Prise en charge et retour: {car.location}
                        </p>
                        
                        {/* Features/extra info */}
                        <p className="text-sm text-gray-600 mt-1">
                          Annuler Gratuitement
                        </p>
                        
                        {/* Price */}
                        <div className="mt-4 flex justify-between items-center">
                          <div className="text-right">
                            <p className="text-xl font-bold">{formatCurrency(car.dailyRate, currency)}</p>
                            <p className="text-sm text-gray-600">{currency}/jour</p>
                          </div>
                          <div>
                            <span className="text-xs text-red-500 font-medium uppercase">VOOM</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
                <SlidersHorizontal className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium mb-2">No cars found</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                We couldn't find any cars matching your search criteria. 
                Try adjusting your filters or exploring a different category.
              </p>
              <Button 
                onClick={() => {
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
                  setSearchQuery("");
                }}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}