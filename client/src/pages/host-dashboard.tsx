import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Car, Booking } from "@shared/schema";
import { getInitials, formatCurrency } from "@/lib/utils";
import { LoadingScreen } from "@/components/ui/loader";
import {
  Calendar,
  Car as CarIcon,
  ChevronRight,
  Clock,
  DollarSign,
  LineChart,
  MessageSquare,
  Star,
  Users,
} from "lucide-react";
import { Link } from "wouter";

export default function HostDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

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
  const averageRating = 4.8; // Placeholder, would be calculated from ratings

  return (
    <>
      <Header title="Host Dashboard" showBack />
      <main className="container mx-auto px-4 py-6 mb-20 md:mb-6">
        {/* Host Profile Summary */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Avatar className="h-16 w-16 mr-4">
                  <AvatarImage src={user?.profilePicture} alt={user?.username} />
                  <AvatarFallback>{user ? getInitials(user.username) : "H"}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold">{user?.username}</h2>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span className="text-sm text-gray-500">{averageRating}/5 • Host since {new Date(user?.createdAt || "").toLocaleDateString()}</span>
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
                      <h3 className="text-2xl font-bold">{averageRating}/5</h3>
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
                      <div key={car.id} className="flex items-center justify-between border-b pb-4 last:border-0">
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
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {bookings && bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-medium">{booking.car.make} {booking.car.model}</h3>
                            <p className="text-sm text-gray-500">
                              {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className={`
                            px-2 py-1 rounded-full text-xs
                            ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : ''}
                            ${booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                            ${booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                          `}>
                            {booking.status}
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="font-semibold">{formatCurrency(booking.totalAmount || 0)}</p>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500">No upcoming bookings</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Earnings Tab */}
          <TabsContent value="earnings">
            <Card className="mb-6">
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
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {bookings && bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                        <div>
                          <p className="font-medium">{booking.car.make} {booking.car.model}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(booking.endDate).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="font-semibold">{formatCurrency(booking.totalAmount || 0)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500">No transactions yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <BottomNav />
    </>
  );
}