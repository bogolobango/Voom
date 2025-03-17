import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { CarCard } from "@/components/car-card";
import { CarCategories } from "@/components/car-categories";
import { CarFilters, FilterOptions } from "@/components/car-filters";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/ui/loader";
import { Car } from "@shared/schema";
import { Search, MapPin, LogIn, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>("all");
  const { toast } = useToast();
  const { user, isLoading: isAuthLoading } = useAuth();
  
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: [0, 200000],
    make: [],
    available: false,
    features: [],
    year: null,
    minRating: null,
    sort: null
  });

  const { data: cars, isLoading } = useQuery<Car[]>({
    queryKey: ["/api/cars"],
  });

  const { data: favorites } = useQuery<number[]>({
    queryKey: ["/api/favorites/ids"],
  });

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    toast({
      title: "Category Selected",
      description: `Showing ${category === 'all' ? 'all cars' : category + ' category'}`,
    });
  };
  
  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    toast({
      title: "Filters Applied",
      description: "Your search results have been updated",
    });
  };

  // Filter cars based on all criteria
  let filteredCars = cars?.filter((car) => {
    // Search query filter
    const matchesSearch = 
      searchQuery === "" || 
      car.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (car.type && car.type.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Category filter
    const matchesCategory = 
      selectedCategory === "all" || 
      (selectedCategory === "truck" && car.type === "Truck") ||
      (selectedCategory === "sedan" && car.type === "Sedan") ||
      (selectedCategory === "sports" && car.type === "Sports") ||
      (selectedCategory === "luxury" && car.type === "Luxury") ||
      (selectedCategory === "suv" && car.type === "SUV") ||
      (selectedCategory === "compact" && car.type === "Compact");
    
    // Price range filter
    const matchesPrice = 
      car.dailyRate >= filters.priceRange[0] && 
      car.dailyRate <= filters.priceRange[1];
    
    // Make filter
    const matchesMake = 
      filters.make.length === 0 || 
      filters.make.includes("All") || 
      filters.make.includes(car.make);
    
    // Availability filter
    const matchesAvailability = 
      !filters.available || car.available;
    
    // Year filter
    const matchesYear = 
      !filters.year || car.year === filters.year;
    
    // Rating filter
    const matchesRating = 
      !filters.minRating || (car.rating && car.rating >= filters.minRating);
    
    // Features filter
    const matchesFeatures = 
      filters.features.length === 0 || 
      (car.features && filters.features.every(feature => 
        car.features?.includes(feature)
      ));
    
    return matchesSearch && matchesCategory && matchesPrice && matchesMake && 
           matchesAvailability && matchesYear && matchesRating && matchesFeatures;
  });
  
  // Apply sorting if needed
  if (filteredCars && filters.sort) {
    switch (filters.sort) {
      case "price_low":
        filteredCars = [...filteredCars].sort((a, b) => a.dailyRate - b.dailyRate);
        break;
      case "price_high":
        filteredCars = [...filteredCars].sort((a, b) => b.dailyRate - a.dailyRate);
        break;
      case "rating":
        filteredCars = [...filteredCars].sort((a, b) => {
          const ratingA = a.rating || 0;
          const ratingB = b.rating || 0;
          return ratingB - ratingA;
        });
        break;
      case "newest":
        filteredCars = [...filteredCars].sort((a, b) => b.year - a.year);
        break;
      default:
        // Keep original order
        break;
    }
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-6 mb-20 md:mb-6">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-semibold">Find your perfect ride</h1>
            <Link href="/become-host">
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                Become a Host
              </Button>
            </Link>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                className="pl-10"
                placeholder="Search for a car, a city, a type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="flex items-center gap-1">
              <MapPin size={18} /> 
              <span className="hidden sm:inline">Location</span>
            </Button>
            <CarFilters onFilterChange={handleFilterChange} currentFilters={filters} />
          </div>
        </div>
        
        {/* Category Selection */}
        <CarCategories 
          onCategorySelect={handleCategorySelect}
          selectedCategory={selectedCategory}
        />

        {isLoading ? (
          <LoadingScreen />
        ) : filteredCars && filteredCars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCars.map((car) => (
              <CarCard
                key={car.id}
                car={car}
                isFavorite={favorites?.includes(car.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">No cars found</h2>
            <p className="text-gray-500 mb-6">
              Try adjusting your search criteria or browse all available cars.
            </p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setFilters({
                  priceRange: [0, 200000],
                  make: [],
                  available: false,
                  features: [],
                  year: null,
                  minRating: null,
                  sort: null
                });
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Show all cars
            </Button>
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}
