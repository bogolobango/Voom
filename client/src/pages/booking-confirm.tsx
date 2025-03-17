import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Rating } from "@/components/ui/rating";
import { LoadingScreen } from "@/components/ui/loader";
import { BookingDetails } from "@/components/booking-details";
import { PaymentMethodSelector } from "@/components/payment-method";
import { RequiredInfo } from "@/components/required-info";
import { CancellationPolicy } from "@/components/cancellation-policy";
import { formatCurrency, formatDuration, getDaysDifference } from "@/lib/utils";
import { Car, Booking, User, InsertBooking } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock } from "lucide-react";

// Dynamic booking dates (set default to a week from now)
const today = new Date();
const startDate = new Date(today);
startDate.setDate(today.getDate() + 1); // Start tomorrow
startDate.setHours(10, 30, 0, 0);

const endDate = new Date(today);
endDate.setDate(today.getDate() + 9); // End 8 days after
endDate.setHours(11, 30, 0, 0);

// Cancellation date (24h before start)
const cancellationDate = new Date(startDate);
cancellationDate.setDate(cancellationDate.getDate() - 1);

type PaymentMethod = "paypal" | "airtel" | "card";

export default function BookingConfirm() {
  const [_, navigate] = useLocation();
  const [match, params] = useRoute("/booking-confirm/:id");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("airtel");
  const [isPickupSameAsDropoff, setIsPickupSameAsDropoff] = useState(true);
  const [pickupLocation, setPickupLocation] = useState("Dakar, Senegal");
  const [dropoffLocation, setDropoffLocation] = useState("Dakar, Senegal");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const carId = match ? parseInt(params.id) : null;

  const { data: car, isLoading: loadingCar } = useQuery<Car>({
    queryKey: [`/api/cars/${carId}`],
    enabled: !!carId,
  });

  const { data: user, isLoading: loadingUser } = useQuery<User>({
    queryKey: ["/api/users/me"],
  });

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: InsertBooking) => {
      const response = await apiRequest("POST", "/api/bookings", bookingData);
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Success",
        description: "Your booking has been created successfully",
      });
      
      // Check if user has completed profile
      if (user?.phoneNumber && user?.profilePicture) {
        navigate("/booking-success");
      } else {
        // If profile incomplete, redirect to add phone first
        navigate("/add-phone", { state: { fromBooking: true, bookingId: data.id } });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create booking. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  const handleSubmit = () => {
    if (!car || !user) return;
    
    const days = getDaysDifference(startDate, endDate);
    const totalAmount = car.dailyRate * days;
    
    const bookingData: InsertBooking = {
      carId: car.id,
      userId: user.id,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      pickupLocation: pickupLocation || car.location,
      dropoffLocation: isPickupSameAsDropoff ? (pickupLocation || car.location) : dropoffLocation,
      totalAmount,
      currency: "FCFA",
      paymentMethod,
      status: "confirmed", // Auto-confirm for the demo
    };
    
    createBookingMutation.mutate(bookingData);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleEditBooking = () => {
    toast({
      title: "Edit Dates & Times",
      description: "In a real app, this would allow you to modify your booking dates and times.",
    });
  };

  const handleAddPhone = () => {
    navigate("/add-phone");
  };

  const handleAddProfilePicture = () => {
    navigate("/add-profile-picture");
  };

  if (loadingCar || loadingUser || !car || !user) {
    return (
      <>
        <Header title="Confirm and Pay" showBack onBack={handleBack} />
        <main className="container mx-auto px-4 py-6 mb-6">
          <LoadingScreen />
        </main>
      </>
    );
  }

  // Calculate total based on daily rate and duration
  const days = getDaysDifference(startDate, endDate);
  const totalAmount = car.dailyRate * days;

  // Create booking object for display purposes
  const booking: Partial<Booking> = {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    pickupLocation: pickupLocation || car.location,
    dropoffLocation: isPickupSameAsDropoff ? (pickupLocation || car.location) : dropoffLocation,
    totalAmount,
    currency: "FCFA"
  };

  return (
    <>
      <Header title="Confirm and Pay" showBack onBack={handleBack} />
      <main className="container mx-auto px-4 py-6 mb-24">
        {/* Vehicle Card */}
        <Card className="mb-6">
          <CardContent className="p-4 flex items-center">
            <img
              src={car.imageUrl}
              alt={`${car.make} ${car.model}`}
              className="w-20 h-20 object-cover rounded-md mr-4"
            />
            <div>
              <h2 className="text-lg font-semibold">{car.make} {car.model}</h2>
              <div className="flex items-center mt-1">
                <Rating 
                  value={car.rating || 0} 
                  count={car.ratingCount} 
                />
                <span className="text-sm text-gray-500 ml-2">
                  ({car.ratingCount} reviews)
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{car.location}</p>
            </div>
          </CardContent>
        </Card>
        
        {/* Trip Time */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Trip Dates</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-red-600 -mr-2"
                onClick={handleEditBooking}
              >
                Edit
              </Button>
            </div>
            
            <div className="flex flex-col space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-red-50 p-2 rounded-full">
                  <Calendar className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="font-medium">
                    {startDate.toLocaleDateString("en-US", { 
                      weekday: 'short',
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                  <p className="text-sm text-gray-500">
                    {startDate.toLocaleTimeString("en-US", {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-red-50 p-2 rounded-full">
                  <Calendar className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">End Date</p>
                  <p className="font-medium">
                    {endDate.toLocaleDateString("en-US", { 
                      weekday: 'short',
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                  <p className="text-sm text-gray-500">
                    {endDate.toLocaleTimeString("en-US", {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="bg-red-50 p-2 rounded-full">
                  <Clock className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="font-medium">{days} day{days !== 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Booking Details */}
        <BookingDetails car={car} booking={booking} onEdit={handleEditBooking} />
        
        {/* Total */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-3 divide-y divide-gray-200">
              <div className="flex justify-between py-2">
                <span className="text-gray-500">
                  {formatCurrency(car.dailyRate)} × {days} day{days !== 1 ? 's' : ''}
                </span>
                <span className="font-medium">
                  {formatCurrency(car.dailyRate * days)}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500">Service fee</span>
                <span className="font-medium">
                  {formatCurrency(Math.round(totalAmount * 0.1))}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-semibold">Total</span>
                <span className="font-semibold">
                  {formatCurrency(totalAmount + Math.round(totalAmount * 0.1))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Payment Method */}
        <PaymentMethodSelector 
          selectedMethod={paymentMethod}
          onChange={setPaymentMethod}
        />
        
        {/* Required Information */}
        <RequiredInfo 
          hasPhoneNumber={!!user.phoneNumber}
          hasProfilePicture={!!user.profilePicture}
          onAddPhone={handleAddPhone}
          onAddProfilePicture={handleAddProfilePicture}
        />
        
        {/* Cancellation Policy */}
        <CancellationPolicy 
          date={cancellationDate.toLocaleDateString("en-US", { 
            month: "long", 
            day: "numeric", 
            year: "numeric" 
          })}
        />
        
        {/* Fixed at the bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t shadow-md">
          <div className="container mx-auto">
            <Button 
              className="w-full bg-red-600 hover:bg-red-700 py-6"
              onClick={handleSubmit}
              disabled={createBookingMutation.isPending}
            >
              {createBookingMutation.isPending ? "Processing..." : "Reserve Now"}
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
