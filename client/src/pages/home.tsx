import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { CarCard } from "@/components/car-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/ui/loader";
import { Car } from "@shared/schema";
import { Search, MapPin } from "lucide-react";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: cars, isLoading } = useQuery<Car[]>({
    queryKey: ["/api/cars"],
  });

  const { data: favorites } = useQuery<number[]>({
    queryKey: ["/api/favorites/ids"],
  });

  // Filter cars based on search query
  const filteredCars = cars?.filter(
    (car) =>
      car.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-6 mb-20 md:mb-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-4">Find your perfect ride</h1>
          <div className="flex gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                className="pl-10"
                placeholder="Search for a car..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="flex items-center gap-1">
              <MapPin size={18} /> 
              <span className="hidden sm:inline">Location</span>
            </Button>
          </div>
        </div>

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
              onClick={() => setSearchQuery("")}
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
