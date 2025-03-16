import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  Check, 
  Ban 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Separator } from "@/components/ui/separator";
import { BookingDetails } from "@/components/booking-details";
import { CancellationPolicy } from "@/components/cancellation-policy";
import { formatCurrency, formatDateAndTime, getDaysDifference } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";

export default function BookingDetailPage() {
  const { id } = useParams();
  const [_, setLocation] = useLocation();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const queryClient = useQueryClient();
  
  const bookingId = parseInt(id);
  
  // Fetch booking details
  const { data: booking, isLoading: bookingLoading } = useQuery({
    queryKey: ['/api/bookings', bookingId],
    enabled: !isNaN(bookingId),
  });
  
  // Fetch car details
  const { data: car, isLoading: carLoading } = useQuery({
    queryKey: ['/api/cars', booking?.carId],
    enabled: !!booking?.carId,
  });
  
  // Handle booking cancellation
  const cancelMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "cancelled" }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bookings', bookingId] });
      setLocation("/bookings");
    },
  });
  
  const isLoading = bookingLoading || carLoading;
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Booking Details" showBack />
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!booking || !car) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Booking Details" showBack />
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Booking Not Found</h2>
            <p className="text-gray-600 mb-6">The booking you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => setLocation("/bookings")}>Back to Bookings</Button>
          </div>
        </div>
      </div>
    );
  }
  
  const canCancel = booking.status === "confirmed" || booking.status === "pending";
  
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Header title="Booking Details" showBack />
      
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main booking details */}
          <div className="md:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
                  <img 
                    src={car.imageUrl} 
                    alt={`${car.make} ${car.model}`} 
                    className="w-full sm:w-32 h-24 object-cover rounded-md"
                  />
                  <div>
                    <h2 className="text-xl font-semibold">{car.make} {car.model}</h2>
                    <div className="text-gray-600">{car.year}</div>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        booking.status === "confirmed" 
                          ? "bg-green-100 text-green-800" 
                          : booking.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Trip Dates</div>
                      <div className="text-sm text-gray-600">
                        {formatDateAndTime(new Date(booking.startDate))} - {formatDateAndTime(new Date(booking.endDate))}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {getDaysDifference(new Date(booking.startDate), new Date(booking.endDate))} days
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Pickup Location</div>
                      <div className="text-sm text-gray-600">{booking.pickupLocation}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Pickup Time</div>
                      <div className="text-sm text-gray-600">
                        {new Date(booking.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Dropoff Location</div>
                      <div className="text-sm text-gray-600">{booking.dropoffLocation}</div>
                    </div>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Daily Rate</span>
                    <span>{formatCurrency(car.dailyRate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Days</span>
                    <span>{getDaysDifference(new Date(booking.startDate), new Date(booking.endDate))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Insurance</span>
                    <span>{formatCurrency(15000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Fee</span>
                    <span>{formatCurrency(5000)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatCurrency(booking.totalAmount)}</span>
                  </div>
                  <div className="text-xs text-gray-500 text-right">
                    Paid with {booking.paymentMethod === "card" ? "Credit Card" : booking.paymentMethod === "airtel" ? "Airtel Money" : "PayPal"}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Map */}
            <Card className="mt-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Location</h3>
                <div className="h-64 bg-gray-200 rounded-lg overflow-hidden relative">
                  {/* Placeholder for Google Maps - would be integrated with Google Maps API */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-8 w-8 text-red-600 mx-auto mb-2" />
                      <div className="text-sm font-medium">{booking.pickupLocation}</div>
                      <div className="text-xs text-gray-600 mt-1">Google Maps integration would go here</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Cancellation Policy */}
            <Card className="mt-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Cancellation Policy</h3>
                <CancellationPolicy date={booking.startDate} />
              </CardContent>
            </Card>
          </div>
          
          {/* Action sidebar */}
          <div>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Booking Actions</h3>
                
                {booking.status === "confirmed" && (
                  <div className="bg-green-50 p-4 rounded-md mb-6 flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-medium text-green-800">Booking Confirmed</div>
                      <div className="text-sm text-green-700 mt-1">
                        Your booking has been confirmed. You're all set for your trip!
                      </div>
                    </div>
                  </div>
                )}
                
                {booking.status === "cancelled" && (
                  <div className="bg-red-50 p-4 rounded-md mb-6 flex items-start gap-3">
                    <Ban className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-medium text-red-800">Booking Cancelled</div>
                      <div className="text-sm text-red-700 mt-1">
                        This booking has been cancelled.
                      </div>
                    </div>
                  </div>
                )}
                
                {!showCancelConfirm ? (
                  <div className="space-y-4">
                    <Button
                      onClick={() => window.open(`tel:${car.hostPhoneNumber || "+1234567890"}`)}
                      variant="outline"
                      className="w-full"
                    >
                      Contact Host
                    </Button>
                    
                    <Button
                      onClick={() => setLocation(`/messages/${car.hostId}`)}
                      variant="outline"
                      className="w-full"
                    >
                      Message Host
                    </Button>
                    
                    {canCancel && (
                      <Button
                        onClick={() => setShowCancelConfirm(true)}
                        variant="destructive"
                        className="w-full"
                      >
                        Cancel Booking
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-amber-50 p-4 rounded-md mb-2 flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-medium text-amber-800">Confirm Cancellation</div>
                        <div className="text-sm text-amber-700 mt-1">
                          Are you sure you want to cancel this booking? This action cannot be undone.
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => cancelMutation.mutate()}
                      variant="destructive"
                      className="w-full"
                      disabled={cancelMutation.isPending}
                    >
                      {cancelMutation.isPending ? "Cancelling..." : "Yes, Cancel Booking"}
                    </Button>
                    
                    <Button
                      onClick={() => setShowCancelConfirm(false)}
                      variant="secondary"
                      className="w-full"
                      disabled={cancelMutation.isPending}
                    >
                      No, Keep Booking
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}