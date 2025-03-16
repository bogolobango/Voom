import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { CarCard } from "@/components/car-card";
import { LoadingScreen } from "@/components/ui/loader";
import { Button } from "@/components/ui/button";
import { Car } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function Favorites() {
  const { toast } = useToast();

  const { data: favorites, isLoading } = useQuery<Car[]>({
    queryKey: ["/api/favorites"],
  });
  
  return (
    <>
      <Header title="Favoris" />
      <main className="container mx-auto px-4 py-6 mb-20 md:mb-6">
        {isLoading ? (
          <LoadingScreen />
        ) : favorites && favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((car) => (
              <CarCard key={car.id} car={car} isFavorite={true} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">No favorites yet</h2>
            <p className="text-gray-500 mb-6">
              Add cars to your favorites list to quickly access them later.
            </p>
            <Link href="/">
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                Browse cars
              </Button>
            </Link>
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}
