import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Booking, Car } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";
import { LoadingScreen } from "@/components/ui/loader";
import { CreditCard, Smartphone, Wallet } from "lucide-react";

interface BookingWithCar extends Booking {
  car: Car;
}

export default function PaymentMethods() {
  const { data: user, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: ["/api/users/me"],
  });

  const { data: bookings, isLoading: isLoadingBookings } = useQuery<BookingWithCar[]>({
    queryKey: ["/api/bookings"],
    enabled: !!user,
  });

  if (isLoadingUser || isLoadingBookings) {
    return (
      <>
        <Header title="Payment Methods" showBack />
        <main className="container mx-auto px-4 py-6 mb-20">
          <LoadingScreen />
        </main>
        <BottomNav />
      </>
    );
  }

  const paidBookings = bookings?.filter(
    (b) => b.status === "completed" || b.status === "approved" || b.status === "active"
  ) || [];

  return (
    <>
      <Header title="Payment Methods" showBack />
      <main className="container mx-auto px-4 py-6 mb-20 md:mb-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Payment Options</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Choose how you'd like to pay when booking a car on Voom.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="bg-red-100 p-2 rounded-full">
                  <Smartphone className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Mobile Money (MoMo)</p>
                  <p className="text-xs text-gray-500">Pay with MTN or Airtel Mobile Money</p>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Available</span>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="bg-red-100 p-2 rounded-full">
                  <CreditCard className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Credit / Debit Card</p>
                  <p className="text-xs text-gray-500">Visa, Mastercard via Stripe</p>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Available</span>
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-4">
              Payment method is selected when you confirm a booking. No card is stored on file.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            {paidBookings.length > 0 ? (
              <div className="space-y-3">
                {paidBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium text-sm">
                        {booking.car.make} {booking.car.model}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(booking.startDate).toLocaleDateString()} — {new Date(booking.endDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400 capitalize">
                        {booking.paymentMethod || "Pending payment"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">{formatCurrency(booking.totalAmount)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                        booking.status === "completed" ? "bg-green-100 text-green-700" :
                        "bg-blue-100 text-blue-700"
                      }`}>
                        {booking.status === "completed" ? "Paid" : "In progress"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Wallet className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No payments yet</p>
                <p className="text-xs text-gray-400 mt-1">Your booking payments will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <BottomNav />
    </>
  );
}
