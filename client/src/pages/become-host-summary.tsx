import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { CheckCircle2, ChevronRight, MapPin, Calendar, DollarSign, Wifi, Bluetooth, Usb, SunIcon } from "lucide-react";
import { MapComponent } from "@/components/map/map-component";
import { formatCurrency } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { InsertCar } from "@shared/schema";

export default function BecomeHostSummary() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // This is mock data - in a real implementation, this would be stored in state or context
  // as the user progresses through the wizard
  const carData = {
    // Host details
    host: {
      fullName: "John Doe",
      phoneNumber: "+123456789",
      email: "john.doe@example.com",
      address: "123 Main St, City",
      about: "Experienced driver with 10+ years of clean driving record."
    },
    
    // Car details
    car: {
      make: "Toyota",
      model: "Corolla",
      year: "2020",
      color: "Black",
      licensePlate: "ABC123",
      fuelType: "Gasoline",
      transmission: "Automatic",
      description: "A reliable, fuel-efficient sedan perfect for city driving and short trips."
    },
    
    // Location
    location: {
      address: "456 Elm St",
      city: "Douala",
      state: "Littoral",
      zipCode: "12345",
      country: "Cameroon",
      latitude: 4.051056,
      longitude: 9.767869
    },
    
    // Rates and conditions
    rates: {
      dailyRate: 50,
      weeklyDiscount: 5,
      monthlyDiscount: 10,
      minimumRentalDays: 1,
      instantBooking: true,
      securityDeposit: 300,
      hasChildSeat: true,
      hasGPS: true,
      hasBluetooth: true,
      hasUSB: true,
      hasSunroof: false,
      cancellationPolicy: "moderate",
      allowPets: false,
      allowSmoking: false
    }
  };

  const createCarMutation = useMutation({
    mutationFn: async (carData: InsertCar) => {
      const response = await apiRequest('POST', '/api/cars', carData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cars'] });
      toast({
        title: "Car listed successfully!",
        description: "Your car is now available for bookings",
      });
      setLocation("/host-dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Error listing car",
        description: error.message || "Something went wrong",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // In a real implementation, this would use the actual data collected from the forms
    const car: InsertCar = {
      make: carData.car.make,
      model: carData.car.model,
      year: parseInt(carData.car.year),
      description: carData.car.description,
      dailyRate: carData.rates.dailyRate,
      location: `${carData.location.city}, ${carData.location.country}`,
      hostId: 1, // This would be the actual user's ID in a real implementation
      // Add additional fields as needed based on the Car schema
      currency: "FCFA",
      imageUrl: "https://images.unsplash.com/photo-1590362891991-f776e747a588?ixlib=rb-4.0.3",
      available: true
    };
    
    createCarMutation.mutate(car);
  };

  return (
    <div className="container pb-10">
      <Header title="Review & Submit" showBack onBack={() => setLocation("/become-host/rates")} />
      
      <div className="space-y-6 mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
            <CardDescription>Review your car listing details before publishing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Car Details</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center text-sm"
                  onClick={() => setLocation("/become-host/car-details")}
                >
                  Edit <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Make & Model</p>
                  <p className="text-sm">{carData.car.make} {carData.car.model} ({carData.car.year})</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Color</p>
                  <p className="text-sm">{carData.car.color}</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Transmission</p>
                  <p className="text-sm">{carData.car.transmission}</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Fuel Type</p>
                  <p className="text-sm">{carData.car.fuelType}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Description</p>
                <p className="text-sm">{carData.car.description}</p>
              </div>
            </div>
            
            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Location</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center text-sm"
                  onClick={() => setLocation("/become-host/location")}
                >
                  Edit <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              
              <div className="rounded-lg overflow-hidden border">
                <MapComponent 
                  height="200px"
                  initialCoordinates={[carData.location.latitude, carData.location.longitude]}
                  readOnly
                />
              </div>
              
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                <p className="text-sm">
                  {carData.location.address}, {carData.location.city}, {carData.location.state}, {carData.location.country}
                </p>
              </div>
            </div>
            
            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Rates & Availability</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center text-sm"
                  onClick={() => setLocation("/become-host/rates")}
                >
                  Edit <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg flex items-center">
                  <DollarSign className="h-5 w-5 text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm font-medium">Daily Rate</p>
                    <p className="text-lg font-semibold">{formatCurrency(carData.rates.dailyRate)}</p>
                  </div>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg flex items-center">
                  <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm font-medium">Minimum Rental</p>
                    <p className="text-lg font-semibold">{carData.rates.minimumRentalDays} day(s)</p>
                  </div>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm font-medium">Instant Booking</p>
                    <p className="text-lg font-semibold">{carData.rates.instantBooking ? "Available" : "Not Available"}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Features</p>
                <div className="flex flex-wrap gap-2">
                  {carData.rates.hasChildSeat && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Child Seat
                    </span>
                  )}
                  {carData.rates.hasGPS && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <Wifi className="h-3 w-3 mr-1" /> GPS
                    </span>
                  )}
                  {carData.rates.hasBluetooth && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <Bluetooth className="h-3 w-3 mr-1" /> Bluetooth
                    </span>
                  )}
                  {carData.rates.hasUSB && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <Usb className="h-3 w-3 mr-1" /> USB Port
                    </span>
                  )}
                  {carData.rates.hasSunroof && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <SunIcon className="h-3 w-3 mr-1" /> Sunroof
                    </span>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Rules</p>
                <div className="flex space-x-4">
                  <p className="text-sm">
                    <span className="font-medium">Pets:</span> {carData.rates.allowPets ? "Allowed" : "Not allowed"}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Smoking:</span> {carData.rates.allowSmoking ? "Allowed" : "Not allowed"}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Cancellation Policy</p>
                <p className="text-sm capitalize">{carData.rates.cancellationPolicy}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 w-full">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    By publishing your listing, you agree to our terms of service and confirm that you have the necessary permissions to rent out this vehicle.
                  </p>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleSubmit}
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Publishing..." : "Publish Listing"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}