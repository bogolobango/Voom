import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Calendar, MapPin, Star, Phone, Upload } from "lucide-react";
import { User, Booking, Car } from "@shared/schema";
import { Header } from "@/components/layout/header";
import { LoadingScreen } from "@/components/ui/loader";
import { formatDateAndTime, formatCurrency, getDaysDifference } from "@/lib/utils";

export default function BookingSuccess() {
  const [location, navigate] = useLocation();
  
  // Get bookingId from URL if coming from booking flow
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const bookingId = urlParams.get('bookingId');
  
  // Get most recent booking if no specific booking ID
  const { data: bookings, isLoading: loadingBookings } = useQuery<Booking[]>({
    queryKey: ['/api/bookings'],
  });
  
  // Get user info
  const { data: user, isLoading: loadingUser } = useQuery<User>({
    queryKey: ['/api/users/me'],
  });
  
  // Get specific booking if ID is provided
  const { data: specificBooking, isLoading: loadingSpecificBooking } = useQuery<Booking>({
    queryKey: [`/api/bookings/${bookingId}`],
    enabled: !!bookingId,
  });
  
  // Choose the booking to display (specific or most recent)
  const booking = specificBooking || (bookings && bookings.length > 0 ? bookings[0] : null);
  
  // Get car info if we have a booking
  const { data: car, isLoading: loadingCar } = useQuery<Car>({
    queryKey: [`/api/cars/${booking?.carId}`],
    enabled: !!booking,
  });
  
  const isLoading = 
    loadingBookings || 
    loadingUser || 
    (bookingId && loadingSpecificBooking) || 
    (booking && loadingCar);
  
  const handleViewBookings = () => {
    navigate("/bookings");
  };
  
  const handleContinueBrowsing = () => {
    navigate("/");
  };

  if (isLoading) {
    return (
      <>
        <Header title="Booking Confirmed" />
        <main className="container mx-auto px-4 py-6 mb-6">
          <LoadingScreen />
        </main>
      </>
    );
  }

  return (
    <>
      <Header title="Booking Confirmed" />
      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-center py-10">
          <div className="bg-red-600 rounded-full p-5 mb-6">
            <Check className="h-10 w-10 text-white" />
          </div>
          
          <h1 className="text-2xl font-semibold mb-2 text-center">Booking Confirmed!</h1>
          <p className="text-center text-gray-500 mb-8 max-w-md">
            Your reservation has been confirmed and the host has been notified
          </p>
          
          {user && (
            <div className="w-full max-w-md mb-8 space-y-3">
              {user.phoneNumber && (
                <div className="bg-green-100 p-3 rounded-lg flex items-center">
                  <div className="bg-green-600 rounded-full p-1.5 mr-3">
                    <Phone className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-green-800 text-sm">
                    Phone number verified: {user.phoneNumber}
                  </span>
                </div>
              )}
              
              {user.profilePicture && (
                <div className="bg-green-100 p-3 rounded-lg flex items-center">
                  <div className="bg-green-600 rounded-full p-1.5 mr-3">
                    <Upload className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-green-800 text-sm">
                    Profile picture added successfully
                  </span>
                </div>
              )}
            </div>
          )}
          
          {car && booking && (
            <Card className="w-full max-w-md mb-8">
              <CardContent className="p-4">
                <div className="flex items-start space-x-4 mb-4">
                  <img
                    src={car.imageUrl}
                    alt={`${car.make} ${car.model}`}
                    className="w-24 h-24 object-cover rounded-md"
                  />
                  <div>
                    <h2 className="font-semibold text-lg">{car.make} {car.model}</h2>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span>{car.rating} ({car.ratingCount} reviews)</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{car.type} • {car.year}</p>
                    
                    <div className="flex items-center mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Confirmed
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 border-t pt-3">
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 mr-2 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-sm">Trip Dates</div>
                      <div className="text-sm text-gray-600">
                        {formatDateAndTime(booking.startDate)} - {formatDateAndTime(booking.endDate)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {getDaysDifference(booking.startDate, booking.endDate)} days
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 mr-2 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-sm">Pickup Location</div>
                      <div className="text-sm text-gray-600">{booking.pickupLocation}</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-medium">Total</span>
                    <span className="font-medium">{formatCurrency(booking.totalAmount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="w-full max-w-md space-y-3">
            <Button
              onClick={handleViewBookings}
              className="w-full bg-red-600 hover:bg-red-700 py-6"
            >
              View My Bookings
            </Button>
            
            <Button
              onClick={handleContinueBrowsing}
              variant="outline"
              className="w-full py-6"
            >
              Continue Browsing
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
