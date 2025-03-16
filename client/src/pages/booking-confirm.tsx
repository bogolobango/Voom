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
import { formatCurrency, formatDuration } from "@/lib/utils";
import { Car, Booking, User, InsertBooking } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Fixed booking dates for this demo
const startDate = new Date("2024-04-16T10:30:00");
const endDate = new Date("2024-04-24T11:30:00");
// Cancellation date (24h before start)
const cancellationDate = new Date(startDate);
cancellationDate.setDate(cancellationDate.getDate() - 1);

type PaymentMethod = "paypal" | "airtel" | "card";

export default function BookingConfirm() {
  const [_, navigate] = useLocation();
  const [match, params] = useRoute("/booking-confirm/:id");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("airtel");
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
      return apiRequest("POST", "/api/bookings", bookingData);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Success",
        description: "Your booking has been created",
      });
      navigate("/add-phone");
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
    
    const totalAmount = car.dailyRate * 8; // 8 days for this demo
    
    const bookingData: InsertBooking = {
      carId: car.id,
      userId: user.id,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      pickupLocation: "ADL",
      dropoffLocation: "ADL",
      totalAmount,
      currency: "FCFA",
      paymentMethod,
      status: "pending",
    };
    
    createBookingMutation.mutate(bookingData);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleEditBooking = () => {
    // In a real app, this would navigate to a booking edit screen
    toast({
      title: "Edit Booking",
      description: "This functionality is not implemented in the demo",
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
  const totalAmount = car.dailyRate * 8; // 8 days for this demo

  // Create booking object for display purposes
  const booking: Partial<Booking> = {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    pickupLocation: "ADL",
    dropoffLocation: "ADL",
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
              <Rating 
                value={car.rating || 0} 
                count={car.ratingCount} 
                className="mt-1" 
              />
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
                  {formatDuration(startDate, endDate)}
                </span>
                <span className="font-medium">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-semibold">Total</span>
                <span className="font-semibold">
                  {formatCurrency(totalAmount)}
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
