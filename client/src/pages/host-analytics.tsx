import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, Car, Booking } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";
import { LoadingScreen } from "@/components/ui/loader";
import {
  BarChart3,
  Calendar,
  Car as CarIcon,
  CheckCircle2,
  Clock,
  DollarSign,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { useLocation } from "wouter";

type EarningsData = {
  totalEarnings: number;
  pendingPayouts: number;
  completedBookings: number;
  activeBookings: number;
  totalListings: number;
  currency: string;
};

export default function HostAnalytics() {
  const [, navigate] = useLocation();

  const { data: user } = useQuery<User>({ queryKey: ["/api/users/me"] });
  const { data: cars, isLoading: isLoadingCars } = useQuery<Car[]>({
    queryKey: ["/api/hosts/cars"],
    enabled: !!user,
  });
  const { data: bookings, isLoading: isLoadingBookings } = useQuery<(Booking & { car: Car })[]>({
    queryKey: ["/api/hosts/bookings"],
    enabled: !!user,
  });
  const { data: earnings, isLoading: isLoadingEarnings } = useQuery<EarningsData>({
    queryKey: ["/api/host/earnings"],
    enabled: !!user,
  });

  const isLoading = isLoadingCars || isLoadingBookings || isLoadingEarnings;

  if (isLoading) {
    return (
      <>
        <Header title="Analytics" showBack />
        <main className="container mx-auto px-4 py-6 mb-20"><LoadingScreen /></main>
        <BottomNav />
      </>
    );
  }

  const totalBookings = bookings?.length || 0;
  const completedBookings = bookings?.filter(b => b.status === "completed").length || 0;
  const approvedBookings = bookings?.filter(b => b.status === "approved" || b.status === "active").length || 0;
  const pendingBookings = bookings?.filter(b => b.status === "pending").length || 0;
  const cancelledBookings = bookings?.filter(b => b.status === "cancelled" || b.status === "rejected").length || 0;
  const completionRate = totalBookings > 0 ? Math.round(((completedBookings + approvedBookings) / totalBookings) * 100) : 0;

  const carsWithRatings = cars?.filter(c => c.rating && c.rating > 0) || [];
  const averageRating = carsWithRatings.length > 0
    ? (carsWithRatings.reduce((sum, c) => sum + (c.rating || 0), 0) / carsWithRatings.length)
    : 0;

  // Revenue per car
  const carRevenue = (cars || []).map(car => {
    const carBookings = bookings?.filter(b => b.carId === car.id) || [];
    const revenue = carBookings
      .filter(b => b.status !== "cancelled" && b.status !== "rejected")
      .reduce((s, b) => s + (b.totalAmount || 0), 0);
    const trips = carBookings.filter(b => b.status === "completed").length;
    return { car, revenue, trips, bookingCount: carBookings.length };
  }).sort((a, b) => b.revenue - a.revenue);

  // Monthly breakdown (last 6 months)
  const monthlyData: { month: string; amount: number; count: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = d.toLocaleDateString("en-US", { month: "short" });
    const monthBookings = bookings?.filter(b => {
      const bDate = new Date(b.createdAt || "");
      return bDate.getMonth() === d.getMonth() && bDate.getFullYear() === d.getFullYear();
    }) || [];
    const amount = monthBookings.reduce((s, b) => s + (b.totalAmount || 0), 0);
    monthlyData.push({ month: monthName, amount, count: monthBookings.length });
  }
  const maxMonthly = Math.max(...monthlyData.map(m => m.amount), 1);

  return (
    <>
      <Header title="Performance & Analytics" showBack onBack={() => navigate("/host-dashboard")} />
      <main className="container mx-auto px-4 py-6 mb-20 md:mb-6">
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-gray-500">Total Revenue</span>
                </div>
                <p className="text-xl font-bold">{formatCurrency(earnings?.totalEarnings || 0)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  <span className="text-xs text-gray-500">Total Trips</span>
                </div>
                <p className="text-xl font-bold">{completedBookings}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-xs text-gray-500">Avg Rating</span>
                </div>
                <p className="text-xl font-bold">{averageRating > 0 ? `${averageRating.toFixed(1)}/5` : "N/A"}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-red-600" />
                  <span className="text-xs text-gray-500">Success Rate</span>
                </div>
                <p className="text-xl font-bold">{completionRate}%</p>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Monthly Revenue
              </CardTitle>
              <CardDescription>Last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-40">
                {monthlyData.map((m) => (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-gray-500">{m.count}</span>
                    <div className="w-full bg-gray-100 rounded-t-md relative flex flex-col justify-end" style={{ height: "100px" }}>
                      <div
                        className="bg-red-500 rounded-t-md w-full transition-all duration-500"
                        style={{ height: `${Math.max((m.amount / maxMonthly) * 100, 2)}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium">{m.month}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Booking Status Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Booking Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { label: "Completed", count: completedBookings, color: "bg-green-500", textColor: "text-green-700" },
                  { label: "Active / Approved", count: approvedBookings, color: "bg-blue-500", textColor: "text-blue-700" },
                  { label: "Pending", count: pendingBookings, color: "bg-yellow-500", textColor: "text-yellow-700" },
                  { label: "Cancelled / Rejected", count: cancelledBookings, color: "bg-red-500", textColor: "text-red-700" },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{item.label}</span>
                      <span className={`font-medium ${item.textColor}`}>{item.count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`${item.color} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${totalBookings > 0 ? Math.max((item.count / totalBookings) * 100, 2) : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Per-Car Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CarIcon className="h-4 w-4" />
                Vehicle Performance
              </CardTitle>
              <CardDescription>Revenue and trips per vehicle</CardDescription>
            </CardHeader>
            <CardContent>
              {carRevenue.length > 0 ? (
                <div className="space-y-4">
                  {carRevenue.map(({ car, revenue, trips }) => (
                    <div key={car.id} className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        {car.imageUrl ? (
                          <img src={car.imageUrl} alt={`${car.make} ${car.model}`} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <CarIcon className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{car.make} {car.model}</p>
                        <p className="text-xs text-gray-500">{trips} trips &middot; {formatCurrency(car.dailyRate)}/day</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">{formatCurrency(revenue)}</p>
                        <div className="flex items-center gap-1">
                          {car.rating ? (
                            <>
                              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                              <span className="text-xs">{car.rating.toFixed(1)}</span>
                            </>
                          ) : (
                            <span className="text-xs text-gray-400">No rating</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4 text-sm">No vehicles listed yet</p>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <CarIcon className="h-5 w-5 text-gray-500 mx-auto mb-1" />
                  <p className="text-lg font-bold">{cars?.length || 0}</p>
                  <p className="text-xs text-gray-500">Listed Cars</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-gray-500 mx-auto mb-1" />
                  <p className="text-lg font-bold">{totalBookings}</p>
                  <p className="text-xs text-gray-500">Total Bookings</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Clock className="h-5 w-5 text-gray-500 mx-auto mb-1" />
                  <p className="text-lg font-bold">{pendingBookings}</p>
                  <p className="text-xs text-gray-500">Awaiting Action</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Users className="h-5 w-5 text-gray-500 mx-auto mb-1" />
                  <p className="text-lg font-bold">
                    {new Set(bookings?.map(b => b.userId) || []).size}
                  </p>
                  <p className="text-xs text-gray-500">Unique Renters</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <BottomNav />
    </>
  );
}
