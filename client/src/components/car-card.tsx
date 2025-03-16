import { useState } from "react";
import { Link } from "wouter";
import { Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Rating } from "@/components/ui/rating";
import { formatCurrency } from "@/lib/utils";
import { Car, InsertFavorite } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface CarCardProps {
  car: Car;
  isFavorite?: boolean;
}

export function CarCard({ car, isFavorite = false }: CarCardProps) {
  const [favorite, setFavorite] = useState(isFavorite);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (favorite) {
        return apiRequest("DELETE", `/api/favorites/${car.id}`);
      } else {
        const favoriteData: InsertFavorite = {
          carId: car.id,
          userId: 1, // In a real app, get this from auth context
        };
        return apiRequest("POST", "/api/favorites", favoriteData);
      }
    },
    onSuccess: () => {
      setFavorite(!favorite);
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      
      toast({
        title: favorite ? "Removed from favorites" : "Added to favorites",
        duration: 2000,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${favorite ? "remove from" : "add to"} favorites`,
        variant: "destructive",
      });
      console.error(error);
    },
  });

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavoriteMutation.mutate();
  };

  return (
    <Card className="overflow-hidden relative">
      <div className="absolute top-4 right-4 z-10">
        <button
          className={`text-${favorite ? "red-600" : "gray-100"} hover:text-red-600 transition-colors`}
          aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
          onClick={handleToggleFavorite}
        >
          <Heart className={favorite ? "fill-current" : ""} size={24} />
        </button>
      </div>
      
      <Link href={`/cars/${car.id}`}>
        <a className="block">
          <img
            src={car.imageUrl}
            alt={`${car.make} ${car.model}`}
            className="w-full h-48 object-cover"
          />
          <div className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold">{car.make} {car.model}</h2>
                <Rating 
                  value={car.rating || 0} 
                  count={car.ratingCount} 
                  className="mt-1" 
                />
                <p className="text-sm mt-1 text-gray-500">
                  Prise en charge et retour: {car.location}
                </p>
                <p className="text-sm mt-1 text-gray-500">
                  Annuler Gratuitement
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-lg">
                  {formatCurrency(car.dailyRate)}/jour
                </p>
                <p className="text-xs uppercase font-semibold text-red-600 mt-1">
                  VOOM
                </p>
              </div>
            </div>
          </div>
        </a>
      </Link>
    </Card>
  );
}
