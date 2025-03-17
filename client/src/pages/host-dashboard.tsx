import { useState, useEffect } from "react";
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
import { useToast } from "@/hooks/use-toast";
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
  ArrowLeft,
} from "lucide-react";
import { Link } from "wouter";

export default function HostDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const [location, setLocation] = useState<string | null>(null);

  useEffect(() => {
    // Welcome toast message when dashboard loads
    toast({
      title: "Welcome to Host Dashboard",
      description: "Manage your cars, bookings, and earnings in one place",
      variant: "default"
    });
  }, []);
  
  // Track tab changes for better UX
  useEffect(() => {
    if (activeTab === "overview") {
      toast({
        title: "Dashboard Overview",
        description: "View your hosting activity at a glance",
        variant: "default"
      });
    } else if (activeTab === "cars") {
      toast({
        title: "Your Listed Cars",
        description: "Manage your vehicle listings",
        variant: "default"
      });
    } else if (activeTab === "bookings") {
      toast({
        title: "Your Bookings",
        description: "Track your upcoming and past bookings",
        variant: "default"
      });
    } else if (activeTab === "earnings") {
      toast({
        title: "Earnings Dashboard",
        description: "Monitor your rental income",
        variant: "default"
      });
    }
  }, [activeTab]);

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
      <Header 
        title="Host Dashboard" 
        showBack 
        onBack={() => {
          toast({
            title: "Returning to Account",
            description: "Navigating back to your account page",
          });
          window.location.href = "/account";
        }} 
      />
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
                      <div 
                        key={car.id} 
                        className="flex items-center justify-between border-b pb-4 last:border-0 cursor-pointer hover:bg-gray-50 rounded-md p-2"
                        onClick={() => {
                          toast({
                            title: "Car Details",
                            description: `Viewing details for ${car.make} ${car.model}`,
                          });
                          window.location.href = `/car-detail?id=${car.id}`;
                        }}
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
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {bookings && bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div 
                        key={booking.id} 
                        className="border rounded-lg p-4 hover:border-red-200 hover:shadow-sm transition-all cursor-pointer"
                        onClick={() => {
                          toast({
                            title: "Booking Details",
                            description: `Viewing booking for ${booking.car.make} ${booking.car.model}`,
                          });
                          window.location.href = `/booking-detail/${booking.id}`;
                        }}
                      >
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
                          <Button variant="outline" size="sm" className="hover:bg-red-50">
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
                          <p className="text-sm text-gray-500">Booking Rate</p>
                          <p className="font-semibold">78%</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-8 bg-blue-600 rounded-full mr-3"></div>
                        <div>
                          <p className="text-sm text-gray-500">Response Rate</p>
                          <p className="font-semibold">92%</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Occupancy Rate</p>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-red-600 h-2.5 rounded-full w-[65%]"></div>
                      </div>
                      <div className="flex justify-between mt-1">
                        <p className="text-xs text-gray-500">65% Occupancy</p>
                        <p className="text-xs text-gray-500">Target: 75%</p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Customer Satisfaction</p>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-green-600 h-2.5 rounded-full w-[92%]"></div>
                      </div>
                      <div className="flex justify-between mt-1">
                        <p className="text-xs text-gray-500">4.8/5 Rating</p>
                        <p className="text-xs text-gray-500">Top 10% of hosts</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Earnings</CardTitle>
                  <CardDescription>Last 6 months of earnings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex items-end justify-between mb-2">
                    {[40, 65, 45, 80, 75, 90].map((height, index) => (
                      <div key={index} className="relative flex flex-col items-center">
                        <div 
                          className="w-10 bg-red-600 rounded-t-sm" 
                          style={{ height: `${height}%` }}
                        ></div>
                        <span className="text-xs mt-2">{
                          new Date(Date.now() - (5-index) * 30 * 24 * 60 * 60 * 1000).toLocaleString('default', { month: 'short' })
                        }</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center mt-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-gray-500">Best month</p>
                      <p className="font-medium">March 2025</p>
                    </div>
                    <p className="font-bold">{formatCurrency(450000)}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Breakdown</CardTitle>
                  <CardDescription>By car and service type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">By Car</p>
                      <div className="space-y-2">
                        {cars && cars.map((car, index) => {
                          // Calculate a percentage based on car index (for demonstration)
                          const percentage = 100 - (index * 15);
                          return (
                            <div key={car.id} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>{car.make} {car.model}</span>
                                <span>{percentage}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`${index === 0 ? 'bg-red-600' : index === 1 ? 'bg-blue-600' : 'bg-green-600'} h-2 rounded-full`}
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <p className="text-sm font-medium mb-3">By Booking Length</p>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-gray-50 p-2 rounded-lg">
                          <p className="text-xs text-gray-500">1-3 days</p>
                          <p className="font-medium">35%</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded-lg">
                          <p className="text-xs text-gray-500">4-7 days</p>
                          <p className="font-medium">45%</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded-lg">
                          <p className="text-xs text-gray-500">8+ days</p>
                          <p className="font-medium">20%</p>
                        </div>
                      </div>
                    </div>
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