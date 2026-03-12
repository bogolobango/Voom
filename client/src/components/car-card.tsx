import { useState } from "react";
import { Link } from "wouter";
import { Heart, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Rating } from "@/components/ui/rating";
import { formatCurrency } from "@/lib/utils";
import { Car } from "@shared/schema";
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
        return apiRequest("POST", "/api/favorites", { carId: car.id });
      }
    },
    onSuccess: () => {
      setFavorite(!favorite);
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      queryClient.invalidateQueries({ queryKey: ["/api/favorites/ids"] });
      toast({
        title: favorite ? "Removed from favorites" : "Added to favorites",
        duration: 2000,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: `Failed to ${favorite ? "remove from" : "add to"} favorites`,
        variant: "destructive",
      });
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
          className={`${favorite ? "text-red-600" : "text-white drop-shadow-md"} hover:text-red-600 transition-colors`}
          aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
          onClick={handleToggleFavorite}
        >
          <Heart className={favorite ? "fill-current" : ""} size={24} />
        </button>
      </div>

      <Link href={`/cars/${car.id}`}>
        <div className="block cursor-pointer">
          <img
            src={car.imageUrl || undefined}
            alt={`${car.make} ${car.model}`}
            className="w-full h-48 object-cover bg-gray-100"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <div className="p-4">
            <div className="flex justify-between items-start">
              <div className="min-w-0 flex-1 mr-3">
                <h2 className="text-lg font-semibold">{car.make} {car.model}</h2>
                <Rating
                  value={car.rating ?? 0}
                  count={car.ratingCount ?? 0}
                  className="mt-1"
                />
                {car.location && (
                  <p className="text-sm mt-1 text-gray-500 flex items-center">
                    <MapPin className="h-3 w-3 mr-1 shrink-0" />
                    <span className="truncate">{car.location}</span>
                  </p>
                )}
                <p className="text-sm mt-1 text-gray-500">
                  Free cancellation
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-semibold text-lg">
                  {formatCurrency(car.dailyRate)}
                </p>
                <p className="text-xs text-gray-500">/day</p>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </Card>
  );
}
