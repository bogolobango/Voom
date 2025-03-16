import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { LoadingScreen } from "@/components/ui/loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Booking, Car } from "@shared/schema";
import { formatDateAndTime, formatCurrency, formatDuration } from "@/lib/utils";
import { Link } from "wouter";
import { Calendar, Clock, MapPin } from "lucide-react";

// Define interface for bookings with car information
interface BookingWithCar extends Booking {
  car: Car;
}

export default function Bookings() {
  const { data: bookings, isLoading } = useQuery<BookingWithCar[]>({
    queryKey: ["/api/bookings"],
  });

  const getStatusClass = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <>
      <Header title="Bookings" />
      <main className="container mx-auto px-4 py-6 mb-20 md:mb-6">
        {isLoading ? (
          <LoadingScreen />
        ) : bookings && bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden">
                <div className="flex border-b">
                  <img
                    src={booking.car.imageUrl}
                    alt={`${booking.car.make} ${booking.car.model}`}
                    className="w-32 h-32 object-cover"
                  />
                  <div className="p-4 flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-lg font-semibold">
                          {booking.car.make} {booking.car.model}
                        </h2>
                        <span className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${getStatusClass(booking.status)}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>
                      <p className="font-semibold">
                        {formatCurrency(booking.totalAmount)}
                      </p>
                    </div>
                  </div>
                </div>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">
                          {formatDateAndTime(booking.startDate)} -{" "}
                          {formatDateAndTime(booking.endDate)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDuration(booking.startDate, booking.endDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 mr-2 text-gray-500" />
                      <p className="text-sm text-gray-500">
                        {booking.pickupLocation}
                        {booking.pickupLocation !== booking.dropoffLocation
                          ? ` - ${booking.dropoffLocation}`
                          : ""}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end space-x-2">
                    <Link href={`/bookings/${booking.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                    {booking.status === "confirmed" && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Cancel Booking
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">No bookings yet</h2>
            <p className="text-gray-500 mb-6">
              When you book a car, your booking details will appear here.
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
