import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Rating } from "@/components/ui/rating";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingScreen } from "@/components/ui/loader";
import { formatCurrency } from "@/lib/utils";
import { Car } from "@shared/schema";
import { Heart, MapPin, Calendar, Shield, Star, Car as CarIcon, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function CarDetail() {
  const [_, navigate] = useLocation();
  const [match, params] = useRoute("/cars/:id");
  const [isFavorite, setIsFavorite] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const carId = match ? parseInt(params.id) : null;

  const { data: car, isLoading } = useQuery<Car>({
    queryKey: [`/api/cars/${carId}`],
    enabled: !!carId,
  });

  const { data: isFavoriteData } = useQuery<boolean>({
    queryKey: [`/api/favorites/check/${carId}`],
    enabled: !!carId,
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorite) {
        return apiRequest("DELETE", `/api/favorites/${carId}`);
      } else {
        return apiRequest("POST", "/api/favorites", { carId, userId: 1 });
      }
    },
    onSuccess: () => {
      setIsFavorite(!isFavorite);
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      
      toast({
        title: isFavorite ? "Removed from favorites" : "Added to favorites",
        duration: 2000,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: `Failed to ${isFavorite ? "remove from" : "add to"} favorites`,
        variant: "destructive",
      });
    },
  });

  const handleReserve = () => {
    if (car) {
      navigate(`/booking-confirm/${car.id}`);
    }
  };

  // Set favorite status from server data
  useState(() => {
    if (isFavoriteData !== undefined) {
      setIsFavorite(isFavoriteData);
    }
  });

  const handleToggleFavorite = () => {
    toggleFavoriteMutation.mutate();
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (isLoading || !car) {
    return (
      <>
        <Header showBack onBack={handleBack} />
        <main className="container mx-auto px-4 py-6 mb-6">
          <LoadingScreen />
        </main>
      </>
    );
  }

  return (
    <>
      <Header showBack onBack={handleBack} />
      <main className="container mx-auto px-4 py-6 mb-6">
        <div className="relative">
          <img
            src={car.imageUrl}
            alt={`${car.make} ${car.model}`}
            className="w-full h-64 object-cover rounded-lg mb-4"
          />
          <button
            onClick={handleToggleFavorite}
            className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart 
              className={`h-6 w-6 ${isFavorite ? "fill-red-600 text-red-600" : "text-gray-600"}`} 
            />
          </button>
        </div>

        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-semibold">
              {car.make} {car.model}
            </h1>
            <div className="flex items-center mt-1">
              <Rating 
                value={car.rating || 0} 
                count={car.ratingCount} 
              />
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">
              {formatCurrency(car.dailyRate)}<span className="text-sm font-normal">/jour</span>
            </p>
          </div>
        </div>

        <div className="flex items-center mb-6">
          <MapPin className="h-5 w-5 text-gray-500 mr-2" />
          <span className="text-gray-700">{car.location}</span>
        </div>

        <Tabs defaultValue="details" className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="pt-4">
            <p className="text-gray-700 mb-4">
              {car.description || `Experience the powerful and stylish ${car.year} ${car.make} ${car.model}. Perfect for both city driving and longer journeys.`}
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center">
                <CarIcon className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-gray-700">{car.year}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-gray-700">Available now</span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="features" className="pt-4">
            <ul className="space-y-2">
              <li className="flex items-center">
                <Shield className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-gray-700">Insurance included</span>
              </li>
              <li className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-gray-700">Free cancellation up to 24h before pickup</span>
              </li>
              {/* Add more features as needed */}
            </ul>
          </TabsContent>
          
          <TabsContent value="reviews" className="pt-4">
            {car.ratingCount > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center mb-4">
                  <Star className="h-8 w-8 text-yellow-500 fill-current mr-2" />
                  <div>
                    <p className="text-xl font-bold">{car.rating?.toFixed(1)}</p>
                    <p className="text-sm text-gray-500">{car.ratingCount} reviews</p>
                  </div>
                </div>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start mb-2">
                      <div className="mr-3">
                        <div className="bg-gray-200 rounded-full h-10 w-10 flex items-center justify-center">
                          <span className="text-gray-700 font-medium">JD</span>
                        </div>
                      </div>
                      <div>
                        <p className="font-medium">John Doe</p>
                        <p className="text-sm text-gray-500">April 2024</p>
                        <div className="flex items-center mt-1 mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star}
                              className={`h-4 w-4 ${star <= 5 ? "text-yellow-500 fill-current" : "text-gray-300"}`} 
                            />
                          ))}
                        </div>
                        <p className="text-gray-700">
                          Great car, very clean and drove well. Host was punctual and friendly.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No reviews yet</p>
            )}
          </TabsContent>
        </Tabs>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-4">About the host</h2>
            <div className="flex items-center">
              <div className="mr-4">
                <div className="bg-gray-200 rounded-full h-12 w-12 flex items-center justify-center">
                  <span className="text-gray-700 font-medium">VH</span>
                </div>
              </div>
              <div>
                <p className="font-medium">VOOM Host</p>
                <p className="text-sm text-gray-500">Responds within an hour</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-auto"
                onClick={() => navigate("/messages")}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <div>
              <p className="font-bold text-xl">{formatCurrency(car.dailyRate)}</p>
              <p className="text-sm text-gray-500">per day</p>
            </div>
            <Button 
              className="bg-red-600 hover:bg-red-700 px-8"
              onClick={handleReserve}
            >
              Reserve Now
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
