import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Rating } from "@/components/ui/rating";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CarLoadingScreen } from "@/components/ui/car-loader";
import { CarDetailSkeleton } from "@/components/ui/car-skeleton";
import { 
  formatCurrency, 
  formatDateAndTime, 
  calculateTotalAmount,
  getInitials 
} from "@/lib/utils";
import { Car, User } from "@shared/schema";
import { 
  Heart, 
  MapPin, 
  Calendar, 
  Shield, 
  Star, 
  Car as CarIcon, 
  MessageSquare, 
  Fuel, 
  Users, 
  Info,
  Share2,
  ArrowRight,
  CornerDownRight,
  Settings,
  BadgeCheck,
  ScrollText,
  CircleDollarSign,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BookingDetails } from "@/components/booking-details";
import { BookingCalendar } from "@/components/booking-calendar-new";
import { BookingProcess } from "@/components/booking-process-fixed";
import { VerificationSystem } from "@/components/verification-system";

export default function CarDetail() {
  const [_, navigate] = useLocation();
  const [match, params] = useRoute("/cars/:id");
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [showBookingProcess, setShowBookingProcess] = useState(false);

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

  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  // Initialize demo dates
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 5);
    
    setSelectedStartDate(tomorrow);
    setSelectedEndDate(endDate);
  }, []);

  // Set favorite status from server data
  useEffect(() => {
    if (isFavoriteData !== undefined) {
      setIsFavorite(isFavoriteData);
    }
  }, [isFavoriteData]);

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
      if (!user) {
        toast({
          title: "Login required", 
          description: "Please log in to book this car",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }
      
      // For demo - checking verification status
      const isUserVerified = user.isVerified;
      
      if (!isUserVerified) {
        setShowVerificationDialog(true);
      } else {
        // Show the new booking process
        setShowBookingProcess(true);
      }
    }
  };
  
  const handleBookingComplete = (bookingId: number) => {
    setShowBookingProcess(false);
    navigate(`/booking-success?id=${bookingId}`);
  };

  const handleToggleFavorite = () => {
    toggleFavoriteMutation.mutate();
  };

  const handleBack = () => {
    navigate("/");
  };

  const handleShare = () => {
    toast({
      title: "Share feature",
      description: "This feature is coming soon.",
      duration: 2000,
    });
  };

  // Demo images for carousel with transformed URLs
  const carImages = car ? [
    `${car.imageUrl}&q=80&w=1000&h=600&fit=crop&crop=entropy`,
    `https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=1000&h=600&fit=crop&crop=entropy`,
    `https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=1000&h=600&fit=crop&crop=entropy`,
    `https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=1000&h=600&fit=crop&crop=entropy`,
  ] : [];

  if (isLoading || !car) {
    return (
      <>
        <Header showBack onBack={handleBack} />
        <main className="container mx-auto px-4 py-6 mb-6">
          <div className="py-6">
            <CarLoadingScreen message="Loading car details..." />
            <CarDetailSkeleton />
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header showBack onBack={handleBack} title={`${car.make} ${car.model}`} />
      <main className="container mx-auto px-4 py-6 mb-20">
        <div className="relative mb-6">
          <Carousel className="w-full">
            <CarouselContent>
              {carImages.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="relative">
                    <img
                      src={image}
                      alt={`${car.make} ${car.model} - View ${index + 1}`}
                      className="w-full h-64 object-cover rounded-lg"
                      onError={(e) => {
                        // Fallback to a placeholder if image fails to load
                        e.currentTarget.src = `https://placehold.co/800x600/e2e8f0/64748b?text=${car.make}+${car.model}`;
                      }}
                    />
                    {index === 0 && car.type && (
                      <Badge 
                        className="absolute top-4 left-4 bg-black/70 text-white"
                      >
                        {car.type}
                      </Badge>
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
          
          <div className="absolute top-4 right-4 flex space-x-2">
            <button
              onClick={handleShare}
              className="bg-white p-2 rounded-full shadow-md"
              aria-label="Share"
            >
              <Share2 className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={handleToggleFavorite}
              className="bg-white p-2 rounded-full shadow-md"
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart 
                className={`h-5 w-5 ${isFavorite ? "fill-red-600 text-red-600" : "text-gray-600"}`} 
              />
            </button>
          </div>
        </div>

        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-semibold">
              {car.make} {car.model} {car.year}
            </h1>
            <div className="flex items-center mt-1">
              <Rating 
                value={car.rating ?? 0} 
                count={car.ratingCount ?? 0} 
                showCount
              />
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">
              {formatCurrency(car.dailyRate)}<span className="text-sm font-normal">/day</span>
            </p>
            {car.available ? (
              <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                Available
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                Not Available
              </Badge>
            )}
          </div>
        </div>
        
        <div className="mb-6 bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center justify-center">
              <Users className="h-6 w-6 text-gray-500 mb-1" />
              <span className="text-sm text-gray-700">5 Seats</span>
            </div>
            <div className="flex flex-col items-center justify-center">
              <Fuel className="h-6 w-6 text-gray-500 mb-1" />
              <span className="text-sm text-gray-700">Diesel</span>
            </div>
            <div className="flex flex-col items-center justify-center">
              <Settings className="h-6 w-6 text-gray-500 mb-1" />
              <span className="text-sm text-gray-700">Automatic</span>
            </div>
          </div>
        </div>

        <div className="flex items-center mb-4">
          <MapPin className="h-5 w-5 text-gray-500 mr-2" />
          <span className="text-gray-700">{car.location}</span>
          <Badge className="ml-2 bg-blue-100 text-blue-700 border-none">
            <Calendar className="h-3 w-3 mr-1" />
            Ready for pickup
          </Badge>
        </div>

        {/* Show Booking Process if active */}
        {showBookingProcess && user ? (
          <div className="mb-20">
            <BookingProcess 
              car={car}
              user={user}
              onComplete={handleBookingComplete}
              onBack={() => setShowBookingProcess(false)}
            />
          </div>
        ) : (
          <>
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
                
                <h3 className="font-semibold mb-3">Vehicle Specifications</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center">
                    <CarIcon className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-gray-700">Model year: {car.year}</span>
                  </div>
                  <div className="flex items-center">
                    <Info className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-gray-700">Type: {car.type}</span>
                  </div>
                  <div className="flex items-center">
                    <Settings className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-gray-700">Automatic transmission</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-gray-700">5 passengers</span>
                  </div>
                  <div className="flex items-center">
                    <Fuel className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-gray-700">Fuel type: Diesel</span>
                  </div>
                  <div className="flex items-center">
                    <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200">
                      A/C
                    </Badge>
                    <Badge className="ml-2 bg-gray-100 text-gray-700 hover:bg-gray-200">
                      GPS
                    </Badge>
                    <Badge className="ml-2 bg-gray-100 text-gray-700 hover:bg-gray-200">
                      Bluetooth
                    </Badge>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="features" className="pt-4">
                <h3 className="font-semibold mb-3">Car Features</h3>
                {car.features && car.features.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {car.features.map((feature, index) => (
                      <div key={index} className="flex items-start">
                        <div className="mt-0.5 mr-2 h-5 w-5 text-green-500">
                          <BadgeCheck className="h-5 w-5" />
                        </div>
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No specific features listed.</p>
                )}
                
                <Separator className="my-4" />
                
                <h3 className="font-semibold mb-3">Rental Includes</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-start">
                    <div className="mt-0.5 mr-2 h-5 w-5 text-green-500">
                      <Shield className="h-5 w-5" />
                    </div>
                    <span className="text-gray-700">Insurance included</span>
                  </div>
                  <div className="flex items-start">
                    <div className="mt-0.5 mr-2 h-5 w-5 text-green-500">
                      <ScrollText className="h-5 w-5" />
                    </div>
                    <span className="text-gray-700">Free 200km/day</span>
                  </div>
                  <div className="flex items-start">
                    <div className="mt-0.5 mr-2 h-5 w-5 text-green-500">
                      <CircleDollarSign className="h-5 w-5" />
                    </div>
                    <span className="text-gray-700">Deposit required</span>
                  </div>
                  <div className="flex items-start">
                    <div className="mt-0.5 mr-2 h-5 w-5 text-green-500">
                      <Clock className="h-5 w-5" />
                    </div>
                    <span className="text-gray-700">24/7 roadside assistance</span>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <h3 className="font-semibold mb-3">Cancellation Policy</h3>
                <div className="flex items-start">
                  <div className="mt-0.5 mr-2 h-5 w-5 text-blue-500">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-gray-700">Free cancellation up to 24 hours before pickup</span>
                    <p className="text-sm text-gray-500">
                      After that, a cancellation fee equal to one day's rental may apply.
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="reviews" className="pt-4">
                {car.ratingCount && car.ratingCount > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center mb-4">
                      <Star className="h-8 w-8 text-yellow-500 fill-current mr-2" />
                      <div>
                        <p className="text-xl font-bold">{car.rating?.toFixed(1)}</p>
                        <p className="text-sm text-gray-500">{car.ratingCount} reviews</p>
                      </div>
                    </div>
                    
                    <div className="mb-4 grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500">Cleanliness</p>
                        <div className="flex items-center justify-between">
                          <Rating value={4.8} size="sm" />
                          <span className="text-sm font-medium">4.8</span>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500">Condition</p>
                        <div className="flex items-center justify-between">
                          <Rating value={4.7} size="sm" />
                          <span className="text-sm font-medium">4.7</span>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500">Communication</p>
                        <div className="flex items-center justify-between">
                          <Rating value={4.9} size="sm" />
                          <span className="text-sm font-medium">4.9</span>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500">Pickup/Return</p>
                        <div className="flex items-center justify-between">
                          <Rating value={4.6} size="sm" />
                          <span className="text-sm font-medium">4.6</span>
                        </div>
                      </div>
                    </div>
                    
                    <Card className="mb-4">
                      <CardContent className="pt-6">
                        <div className="flex items-start mb-2">
                          <div className="mr-3">
                            <div className="bg-blue-100 rounded-full h-10 w-10 flex items-center justify-center">
                              <span className="text-blue-600 font-medium">JD</span>
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
                            <p className="text-gray-700 mb-2">
                              Great car, very clean and drove well. Host was punctual and friendly. Would definitely rent again.
                            </p>
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>5-day rental</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="mb-4">
                      <CardContent className="pt-6">
                        <div className="flex items-start mb-2">
                          <div className="mr-3">
                            <div className="bg-green-100 rounded-full h-10 w-10 flex items-center justify-center">
                              <span className="text-green-600 font-medium">SA</span>
                            </div>
                          </div>
                          <div>
                            <p className="font-medium">Sarah A.</p>
                            <p className="text-sm text-gray-500">March 2024</p>
                            <div className="flex items-center mt-1 mb-2">
                              <Rating value={4} size="sm" />
                            </div>
                            <p className="text-gray-700 mb-2">
                              The vehicle was perfect for our weekend trip. It was comfortable and fuel-efficient.
                            </p>
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>2-day rental</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-lg font-medium text-gray-700">No reviews yet</p>
                    <p className="text-gray-500">
                      This car doesn't have any reviews yet. Be the first to leave a review after your trip.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {selectedStartDate && selectedEndDate && (
              <Dialog>
                <DialogTrigger asChild>
                  <Card className="mb-4 cursor-pointer hover:bg-gray-50">
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-2">Trip dates</h3>
                      <div className="flex justify-between items-center mb-2">
                        <span>{formatDateAndTime(selectedStartDate)}</span>
                        <ArrowRight className="h-4 w-4 text-gray-500" />
                        <span>{formatDateAndTime(selectedEndDate)}</span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Total: {formatCurrency(calculateTotalAmount(car.dailyRate, selectedStartDate, selectedEndDate))}
                      </p>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Price Breakdown</DialogTitle>
                    <DialogDescription>
                      Rental period: {formatDateAndTime(selectedStartDate)} - {formatDateAndTime(selectedEndDate)}
                    </DialogDescription>
                  </DialogHeader>
                  <BookingDetails 
                    car={car} 
                    booking={{
                      startDate: selectedStartDate,
                      endDate: selectedEndDate,
                      totalAmount: calculateTotalAmount(car.dailyRate, selectedStartDate, selectedEndDate)
                    }}
                  />
                </DialogContent>
              </Dialog>
            )}

            {/* Reserve Button (fixed at bottom) */}
            <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t shadow-md z-10">
              <div className="container mx-auto flex justify-between items-center">
                <div>
                  <p className="font-bold text-xl">{formatCurrency(car.dailyRate)}</p>
                  <p className="text-sm text-gray-500">per day</p>
                </div>
                <Button 
                  className="bg-red-600 hover:bg-red-700 px-8"
                  onClick={handleReserve}
                  disabled={!car.available}
                >
                  {car.available ? 'Reserve Now' : 'Not Available'}
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Verification Dialog */}
        <Dialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Identity Verification Required</DialogTitle>
              <DialogDescription>
                To ensure safety and trust in our car sharing community, we need to verify your identity before booking.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {user && (
                <VerificationSystem 
                  userId={user.id} 
                  onComplete={() => {
                    setShowVerificationDialog(false);
                    toast({
                      title: "Verification in progress",
                      description: "Your documents are being verified. This usually takes 24-48 hours.",
                    });
                  }}
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </>
  );
}