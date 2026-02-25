import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Car, Booking } from "@shared/schema";
import { getInitials, formatCurrency } from "@/lib/utils";
import { LoadingScreen } from "@/components/ui/loader";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Calendar,
  Car as CarIcon,
  Check,
  ChevronRight,
  Clock,
  DollarSign,
  LineChart,
  MessageSquare,
  Star,
  Users,
  X,
  ArrowLeft,
} from "lucide-react";
import { Link, useLocation } from "wouter";

export default function HostDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const { data: user, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: ["/api/users/me"],
  });

  const { data: cars, isLoading: isLoadingCars } = useQuery<Car[]>({
    queryKey: ["/api/hosts/cars"],
    enabled: !!user,
  });

  const { data: bookings, isLoading: isLoadingBookings } = useQuery<(Booking & { car: Car })[]>({
    queryKey: ["/api/hosts/bookings"],
    enabled: !!user,
  });

  const approveMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      const res = await apiRequest("PUT", `/api/bookings/${bookingId}/approve`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hosts/bookings"] });
      toast({ title: "Booking approved", description: "The renter has been notified." });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to approve", description: err.message, variant: "destructive" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      const res = await apiRequest("PUT", `/api/bookings/${bookingId}/reject`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hosts/bookings"] });
      toast({ title: "Booking rejected" });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to reject", description: err.message, variant: "destructive" });
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      const res = await apiRequest("PUT", `/api/bookings/${bookingId}/complete`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hosts/bookings"] });
      toast({ title: "Booking completed", description: "Earnings will be added to your balance." });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to complete", description: err.message, variant: "destructive" });
    },
  });

  const isLoading = isLoadingUser || isLoadingCars || isLoadingBookings;

  if (isLoading) {
    return (
      <>
        <Header title="Host Dashboard" showBack />
        <main className="container mx-auto px-4 py-6 mb-20 md:mb-6">
          <LoadingScreen />
        </main>
        <BottomNav />
      </>
    );
  }

  // Stats and metrics for overview
  const totalListings = cars?.length || 0;
  const activeBookings = bookings?.filter(b => b.status === "confirmed").length || 0;
  const totalEarnings = bookings?.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0) || 0;
  // Compute average rating from cars that have ratings
  const carsWithRatings = cars?.filter(c => c.rating && c.rating > 0) || [];
  const averageRating = carsWithRatings.length > 0
    ? (carsWithRatings.reduce((sum, c) => sum + (c.rating || 0), 0) / carsWithRatings.length)
    : 0;

  return (
    <>
      <Header 
        title="Host Dashboard" 
        showBack 
        onBack={() => navigate("/account")} 
      />
      <main className="container mx-auto px-4 py-6 mb-20 md:mb-6">
        {/* Host Profile Summary */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Avatar className="h-16 w-16 mr-4">
                  <AvatarImage src={user?.profilePicture ?? undefined} alt={user?.username ?? undefined} />
                  <AvatarFallback>{user ? getInitials(user.username) : "H"}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold">{user?.username}</h2>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span className="text-sm text-gray-500">{averageRating > 0 ? `${averageRating.toFixed(1)}/5` : "No ratings yet"} &middot; Host since {new Date(user?.createdAt || "").toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <Link href="/account">
                <Button variant="outline" size="sm">
                  View Profile
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Navigation Tabs */}
        <Tabs defaultValue="overview" className="mb-8" onValueChange={setActiveTab}>
          <TabsList className="w-full mb-4 grid grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="cars">Cars</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Listed Cars</p>
                      <h3 className="text-2xl font-bold">{totalListings}</h3>
                    </div>
                    <div className="bg-red-100 p-3 rounded-full">
                      <CarIcon className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Active Bookings</p>
                      <h3 className="text-2xl font-bold">{activeBookings}</h3>
                    </div>
                    <div className="bg-red-100 p-3 rounded-full">
                      <Calendar className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Earnings</p>
                      <h3 className="text-2xl font-bold">{formatCurrency(totalEarnings)}</h3>
                    </div>
                    <div className="bg-red-100 p-3 rounded-full">
                      <DollarSign className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Rating</p>
                      <h3 className="text-2xl font-bold">{averageRating > 0 ? `${averageRating.toFixed(1)}/5` : "N/A"}</h3>
                    </div>
                    <div className="bg-red-100 p-3 rounded-full">
                      <Star className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {bookings && bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.slice(0, 3).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                            {booking.status === "confirmed" ? (
                              <Calendar className="h-5 w-5 text-green-600" />
                            ) : booking.status === "pending" ? (
                              <Clock className="h-5 w-5 text-yellow-600" />
                            ) : (
                              <Users className="h-5 w-5 text-gray-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{booking.car.make} {booking.car.model}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(booking.totalAmount || 0)}</p>
                          <p className="text-sm text-gray-500 capitalize">{booking.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500 mb-4">No recent activity</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Link href="/become-host">
                    <Button className="w-full bg-red-600 hover:bg-red-700">
                      List a New Car
                    </Button>
                  </Link>
                  <Link href="/host-earnings">
                    <Button variant="outline" className="w-full">
                      <DollarSign className="mr-2 h-4 w-4" />
                      Earnings
                    </Button>
                  </Link>
                  <Link href="/host-analytics">
                    <Button variant="outline" className="w-full">
                      <LineChart className="mr-2 h-4 w-4" />
                      Analytics
                    </Button>
                  </Link>
                  <Link href="/messages">
                    <Button variant="outline" className="w-full">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Messages
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cars Tab */}
          <TabsContent value="cars">
            <Card>
              <CardHeader className="flex justify-between items-center pb-2">
                <CardTitle>My Listed Cars</CardTitle>
                <Link href="/become-host">
                  <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                    + Add Car
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {cars && cars.length > 0 ? (
                  <div className="space-y-4">
                    {cars.map((car) => (
                      <div 
                        key={car.id} 
                        className="flex items-center justify-between border-b pb-4 last:border-0 cursor-pointer hover:bg-gray-50 rounded-md p-2"
                        onClick={() => navigate(`/cars/${car.id}`)}
                      >
                        <div className="flex items-center">
                          <div className="h-16 w-16 rounded-md overflow-hidden relative mr-3">
                            <img 
                              src={car.imageUrl || "/placeholder-car.png"} 
                              alt={`${car.make} ${car.model}`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="font-medium">{car.make} {car.model}</h3>
                            <p className="text-sm text-gray-500">{car.year} • {formatCurrency(car.dailyRate)}/day</p>
                            <div className="flex items-center mt-1">
                              <div className={`h-2 w-2 rounded-full ${car.available ? 'bg-green-500' : 'bg-red-500'} mr-1`}></div>
                              <span className="text-xs text-gray-500">{car.available ? 'Available' : 'Unavailable'}</span>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500 mb-4">You haven't listed any cars yet</p>
                    <Link href="/become-host">
                      <Button className="bg-red-600 hover:bg-red-700 text-white">
                        List Your First Car
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            {/* Pending Requests Section */}
            {(() => {
              const pendingBookings = bookings?.filter(b => b.status === "pending") || [];
              if (pendingBookings.length === 0) return null;
              return (
                <Card className="mb-4 border-yellow-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      Pending Requests ({pendingBookings.length})
                    </CardTitle>
                    <CardDescription>These bookings need your approval</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {pendingBookings.map((booking) => (
                        <div key={booking.id} className="border border-yellow-100 bg-yellow-50/50 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-medium">{booking.car.make} {booking.car.model}</h3>
                              <p className="text-sm text-gray-500">
                                {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                              </p>
                            </div>
                            <p className="font-semibold">{formatCurrency(booking.totalAmount || 0)}</p>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                            <span>Pickup: {booking.pickupLocation}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                              disabled={approveMutation.isPending}
                              onClick={(e) => {
                                e.stopPropagation();
                                approveMutation.mutate(booking.id);
                              }}
                            >
                              <Check className="h-4 w-4 mr-1" /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                              disabled={rejectMutation.isPending}
                              onClick={(e) => {
                                e.stopPropagation();
                                rejectMutation.mutate(booking.id);
                              }}
                            >
                              <X className="h-4 w-4 mr-1" /> Reject
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })()}

            {/* Active & Approved Bookings */}
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="text-base">Active Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const activeBookingsList = bookings?.filter(b => b.status === "approved" || b.status === "active") || [];
                  if (activeBookingsList.length === 0) return <p className="text-gray-500 text-center py-4 text-sm">No active bookings</p>;
                  return (
                    <div className="space-y-4">
                      {activeBookingsList.map((booking) => (
                        <div key={booking.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-medium">{booking.car.make} {booking.car.model}</h3>
                              <p className="text-sm text-gray-500">
                                {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatCurrency(booking.totalAmount || 0)}</p>
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full capitalize">{booking.status}</span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full mt-2"
                            disabled={completeMutation.isPending}
                            onClick={() => completeMutation.mutate(booking.id)}
                          >
                            Mark as Completed
                          </Button>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            {/* All Bookings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">All Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {bookings && bookings.length > 0 ? (
                  <div className="space-y-3">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                        <div>
                          <p className="font-medium text-sm">{booking.car.make} {booking.car.model}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{formatCurrency(booking.totalAmount || 0)}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                            booking.status === 'approved' ? 'bg-green-100 text-green-800' :
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            booking.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            booking.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>{booking.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500">No bookings yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Earnings Tab */}
          <TabsContent value="earnings">
            <div className="grid gap-6 md:grid-cols-2 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Earnings Overview</CardTitle>
                  <CardDescription>Your earnings from car rentals</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-500">Total Earnings</p>
                          <p className="text-2xl font-bold">{formatCurrency(totalEarnings)}</p>
                        </div>
                        <div className="bg-red-100 p-3 rounded-full">
                          <LineChart className="h-5 w-5 text-red-600" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-500">Available for Payout</p>
                        <p className="text-xl font-bold">{formatCurrency(totalEarnings * 0.8)}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-500">In Progress</p>
                        <p className="text-xl font-bold">{formatCurrency(totalEarnings * 0.2)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>Key indicators for your hosting business</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-2 h-8 bg-red-600 rounded-full mr-3"></div>
                        <div>
                          <p className="text-sm text-gray-500">Total Bookings</p>
                          <p className="font-semibold">{bookings?.length || 0}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-8 bg-blue-600 rounded-full mr-3"></div>
                        <div>
                          <p className="text-sm text-gray-500">Completed</p>
                          <p className="font-semibold">{bookings?.filter(b => b.status === "completed").length || 0}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Completion Rate</p>
                      {(() => {
                        const total = bookings?.length || 0;
                        const completed = bookings?.filter(b => b.status === "completed" || b.status === "confirmed").length || 0;
                        const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
                        return (
                          <>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div className="bg-red-600 h-2.5 rounded-full" style={{ width: `${rate}%` }}></div>
                            </div>
                            <div className="flex justify-between mt-1">
                              <p className="text-xs text-gray-500">{rate}% Completion</p>
                            </div>
                          </>
                        );
                      })()}
                    </div>

                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Customer Satisfaction</p>
                      {(() => {
                        const ratingPct = averageRating > 0 ? Math.round((averageRating / 5) * 100) : 0;
                        return (
                          <>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${ratingPct}%` }}></div>
                            </div>
                            <div className="flex justify-between mt-1">
                              <p className="text-xs text-gray-500">{averageRating > 0 ? `${averageRating.toFixed(1)}/5 Rating` : "No ratings yet"}</p>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Earnings</CardTitle>
                  <CardDescription>Your rental income summary</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-500">Total from {bookings?.length || 0} bookings</p>
                      <p className="text-3xl font-bold mt-1">{formatCurrency(totalEarnings)}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-green-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500">Confirmed</p>
                        <p className="text-lg font-bold text-green-700">
                          {formatCurrency(bookings?.filter(b => b.status === "confirmed").reduce((s, b) => s + (b.totalAmount || 0), 0) || 0)}
                        </p>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500">Pending</p>
                        <p className="text-lg font-bold text-yellow-700">
                          {formatCurrency(bookings?.filter(b => b.status === "pending").reduce((s, b) => s + (b.totalAmount || 0), 0) || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Car</CardTitle>
                  <CardDescription>Earnings breakdown per vehicle</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cars && cars.length > 0 ? (
                      <div className="space-y-3">
                        {cars.map((car, index) => {
                          const carEarnings = bookings?.filter(b => b.carId === car.id && b.status !== "cancelled")
                            .reduce((s, b) => s + (b.totalAmount || 0), 0) || 0;
                          const pct = totalEarnings > 0 ? Math.round((carEarnings / totalEarnings) * 100) : 0;
                          const colors = ["bg-red-600", "bg-blue-600", "bg-green-600", "bg-purple-600", "bg-orange-600"];
                          return (
                            <div key={car.id} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>{car.make} {car.model}</span>
                                <span className="font-medium">{formatCurrency(carEarnings)}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`${colors[index % colors.length]} h-2 rounded-full`}
                                  style={{ width: `${Math.max(pct, 2)}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No cars listed yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Your latest earnings from rentals</CardDescription>
                </div>
                <Button variant="outline" size="sm">Export CSV</Button>
              </CardHeader>
              <CardContent>
                {bookings && bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                        <div className="flex items-center">
                          <div className="bg-gray-100 h-10 w-10 rounded-md flex items-center justify-center mr-3">
                            <CarIcon className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium">{booking.car.make} {booking.car.model}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">{formatCurrency(booking.totalAmount || 0)}</p>
                          <p className="text-xs text-gray-500">After fees: {formatCurrency((booking.totalAmount || 0) * 0.85)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500">No transactions yet</p>
                  </div>
                )}
                
                <Button variant="outline" className="w-full mt-4">
                  View All Transactions
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <BottomNav />
    </>
  );
}