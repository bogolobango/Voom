import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Car, User, InsertBooking, Booking } from "@shared/schema";
import { 
  formatCurrency, 
  formatDuration, 
  getDaysDifference,
  calculateTotalAmount
} from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookingCalendar } from "@/components/booking-calendar-new";
import { DateTimePicker } from "@/components/date-time-picker";
import { BookingDetails } from "@/components/booking-details";
import { PaymentMethodSelector } from "@/components/payment-method";
import { RequiredInfo } from "@/components/required-info";
import { CancellationPolicy } from "@/components/cancellation-policy";
import { CarProgress } from "@/components/ui/car-progress";
import { 
  CalendarDays, 
  MapPin, 
  CreditCard, 
  CheckCircle2,
  AlertTriangle,
  ChevronRight 
} from "lucide-react";

type PaymentMethod = "paypal" | "airtel" | "card";

const bookingSteps = [
  { id: "dates", title: "Dates", icon: <CalendarDays className="h-4 w-4" /> },
  { id: "location", title: "Location", icon: <MapPin className="h-4 w-4" /> },
  { id: "payment", title: "Payment", icon: <CreditCard className="h-4 w-4" /> },
  { id: "confirm", title: "Confirm", icon: <CheckCircle2 className="h-4 w-4" /> },
];

interface BookingProcessProps {
  car: Car;
  user: User;
  onComplete: (bookingId: number) => void;
  onBack: () => void;
}

export function BookingProcess({ car, user, onComplete, onBack }: BookingProcessProps) {
  const [currentStep, setCurrentStep] = useState("dates");
  const [selectedStartDate, setSelectedStartDate] = useState<Date>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    return tomorrow;
  });
  
  const [selectedEndDate, setSelectedEndDate] = useState<Date>(() => {
    const fourDaysLater = new Date();
    fourDaysLater.setDate(fourDaysLater.getDate() + 4);
    fourDaysLater.setHours(17, 0, 0, 0);
    return fourDaysLater;
  });

  const [isPickupSameAsDropoff, setIsPickupSameAsDropoff] = useState(true);
  const [pickupLocation, setPickupLocation] = useState(car.location);
  const [dropoffLocation, setDropoffLocation] = useState(car.location);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [_, navigate] = useLocation();

  // Calculate booking related values
  const days = getDaysDifference(selectedStartDate, selectedEndDate);
  const totalAmount = calculateTotalAmount(car.dailyRate, selectedStartDate, selectedEndDate);
  const serviceFee = Math.round(totalAmount * 0.10); // 10% service fee
  const grandTotal = totalAmount + serviceFee;

  // Handle date validation
  const isDateValid = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedStartDate < today) {
      toast({
        title: "Invalid dates",
        description: "Start date cannot be in the past",
        variant: "destructive",
      });
      return false;
    }
    
    if (selectedEndDate <= selectedStartDate) {
      toast({
        title: "Invalid dates",
        description: "End date must be after start date",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: InsertBooking) => {
      const response = await apiRequest("POST", "/api/bookings", bookingData);
      return await response.json() as Booking;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Success",
        description: "Your booking has been created successfully",
      });
      
      // Check if user has completed profile
      if (user?.phoneNumber && user?.profilePicture) {
        onComplete(data.id);
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

  // Handle navigation between steps
  const goToNextStep = () => {
    if (currentStep === "dates") {
      if (!isDateValid()) return;
      setCurrentStep("location");
    } else if (currentStep === "location") {
      setCurrentStep("payment");
    } else if (currentStep === "payment") {
      if (!user) {
        toast({
          title: "Please log in",
          description: "You need to be logged in to complete a booking",
          variant: "destructive",
        });
        return;
      }
      setCurrentStep("confirm");
    } else if (currentStep === "confirm") {
      handleSubmitBooking();
    }
  };

  const goToPreviousStep = () => {
    if (currentStep === "location") {
      setCurrentStep("dates");
    } else if (currentStep === "payment") {
      setCurrentStep("location");
    } else if (currentStep === "confirm") {
      setCurrentStep("payment");
    } else {
      onBack();
    }
  };

  // Submit booking
  const handleSubmitBooking = () => {
    if (!car || !user) return;
    if (!agreedToTerms) {
      toast({
        title: "Agreement required",
        description: "Please agree to the terms and conditions",
        variant: "destructive",
      });
      return;
    }
    
    const bookingData: InsertBooking = {
      carId: car.id,
      userId: user.id,
      startDate: selectedStartDate,
      endDate: selectedEndDate,
      pickupLocation: pickupLocation || car.location,
      dropoffLocation: isPickupSameAsDropoff ? (pickupLocation || car.location) : dropoffLocation,
      totalAmount: grandTotal,
      currency: "FCFA",
      paymentMethod,
      status: "confirmed", // Auto-confirm for the demo
    };
    
    createBookingMutation.mutate(bookingData);
  };

  const handleAddPhone = () => {
    navigate("/add-phone");
  };

  const handleAddProfilePicture = () => {
    navigate("/add-profile-picture");
  };

  // Create booking object for display purposes
  const booking: Partial<Booking> = {
    startDate: selectedStartDate,
    endDate: selectedEndDate,
    pickupLocation: pickupLocation || car.location,
    dropoffLocation: isPickupSameAsDropoff ? (pickupLocation || car.location) : dropoffLocation,
    totalAmount: grandTotal,
    currency: "FCFA" as any // Type fix
  };

  // Cancellation date (24h before start)
  const cancellationDate = new Date(selectedStartDate);
  cancellationDate.setDate(cancellationDate.getDate() - 1);

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <CarProgress 
        steps={bookingSteps} 
        currentStep={currentStep} 
        className="mb-8"
      />

      {/* Vehicle Card - always visible */}
      <Card className="mb-6">
        <CardContent className="p-4 flex items-center">
          <img
            src={car.imageUrl || ''}
            alt={`${car.make} ${car.model}`}
            className="w-20 h-20 object-cover rounded-md mr-4"
          />
          <div>
            <h2 className="text-lg font-semibold">{car.make} {car.model}</h2>
            <p className="text-sm text-gray-500">{car.type} · {car.year}</p>
            <p className="font-medium text-red-600 mt-1">{formatCurrency(car.dailyRate)} per day</p>
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Dates */}
      {currentStep === "dates" && (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Select rental dates</h3>
              <BookingCalendar 
                car={car}
                selectedStartDate={selectedStartDate}
                selectedEndDate={selectedEndDate}
                onSelectStartDate={setSelectedStartDate}
                onSelectEndDate={setSelectedEndDate}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Pickup & return time</h3>
              <div className="space-y-4">
                <DateTimePicker
                  date={selectedStartDate}
                  setDate={setSelectedStartDate}
                  label="Pickup time"
                  minDate={new Date()}
                />
                <DateTimePicker
                  date={selectedEndDate}
                  setDate={setSelectedEndDate}
                  label="Return time"
                  minDate={selectedStartDate}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between mb-4">
                <span className="text-gray-500">Duration</span>
                <span className="font-medium">{days} day{days !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Daily rate</span>
                <span className="font-medium">{formatCurrency(car.dailyRate)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 2: Location */}
      {currentStep === "location" && (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Pickup location</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-red-50 p-2 rounded-full mt-1">
                    <MapPin className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700 font-medium">{car.location}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      The host will meet you at this location for the key handover
                    </p>
                  </div>
                </div>

                {/* Map placeholder */}
                <div className="relative h-52 bg-gray-100 rounded-md overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                    Map view will be available here
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Return location</h3>
              
              <div className="flex items-center mb-4">
                <input 
                  type="checkbox" 
                  id="sameLocation" 
                  checked={isPickupSameAsDropoff}
                  onChange={e => setIsPickupSameAsDropoff(e.target.checked)}
                  className="h-4 w-4 text-red-600 rounded"
                />
                <label htmlFor="sameLocation" className="ml-2 text-gray-700">
                  Return to the same location
                </label>
              </div>

              {!isPickupSameAsDropoff && (
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-red-50 p-2 rounded-full mt-1">
                      <MapPin className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={dropoffLocation}
                        onChange={e => setDropoffLocation(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Enter return location"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Note: different return locations may require additional approval from the host
                      </p>
                    </div>
                  </div>

                  {/* Map placeholder for different return location */}
                  <div className="relative h-52 bg-gray-100 rounded-md overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                      Return location map view
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3: Payment */}
      {currentStep === "payment" && (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <BookingDetails 
                car={car} 
                booking={booking} 
                showBreakdown={true} 
              />
            </CardContent>
          </Card>

          <PaymentMethodSelector 
            selectedMethod={paymentMethod}
            onChange={setPaymentMethod}
          />

          <RequiredInfo 
            hasPhoneNumber={!!user.phoneNumber}
            hasProfilePicture={!!user.profilePicture}
            onAddPhone={handleAddPhone}
            onAddProfilePicture={handleAddProfilePicture}
          />
        </div>
      )}

      {/* Step 4: Confirm */}
      {currentStep === "confirm" && (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>
              <BookingDetails 
                car={car} 
                booking={booking} 
                showBreakdown={true} 
              />
            </CardContent>
          </Card>

          <CancellationPolicy 
            date={cancellationDate.toLocaleDateString("en-US", { 
              month: "long", 
              day: "numeric", 
              year: "numeric" 
            })}
          />

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start mb-4">
                <div className="mt-1">
                  <input 
                    type="checkbox" 
                    id="terms" 
                    checked={agreedToTerms}
                    onChange={e => setAgreedToTerms(e.target.checked)}
                    className="h-4 w-4 text-red-600 rounded"
                  />
                </div>
                <label htmlFor="terms" className="ml-2 text-gray-700 text-sm">
                  I agree to the <span className="text-red-600">Terms of Service</span>, <span className="text-red-600">Car Rental Agreement</span>, and <span className="text-red-600">Privacy Policy</span>. I acknowledge that I've reviewed the car details, rental period, and payment information.
                </label>
              </div>

              {!agreedToTerms && (
                <div className="flex items-center text-amber-600 bg-amber-50 p-3 rounded-md text-sm">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  <span>Please agree to the terms to continue</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t shadow-md z-10">
        <div className="container mx-auto flex justify-between items-center">
          <Button
            variant="outline"
            onClick={goToPreviousStep}
            disabled={createBookingMutation.isPending}
          >
            Back
          </Button>
          
          <div className="text-right mx-4">
            <p className="font-bold text-xl">{formatCurrency(grandTotal)}</p>
            <p className="text-sm text-gray-500">total for {days} day{days !== 1 ? 's' : ''}</p>
          </div>
          
          <Button 
            className="bg-red-600 hover:bg-red-700 px-6"
            onClick={goToNextStep}
            disabled={createBookingMutation.isPending}
          >
            {currentStep === "confirm" 
              ? (createBookingMutation.isPending ? "Processing..." : "Book Now") 
              : (
                <>
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </>
              )
            }
          </Button>
        </div>
      </div>
    </div>
  );
}