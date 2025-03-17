import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingScreen } from "@/components/ui/loader";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Car, User, Booking } from "@shared/schema";
import { Phone, ShieldCheck, CheckCircle } from "lucide-react";
import { formatCurrency, formatDuration } from "@/lib/utils";

const phoneFormSchema = z.object({
  country: z.string(),
  phoneNumber: z.string().min(8, "Phone number must be at least 8 digits"),
});

type PhoneFormValues = z.infer<typeof phoneFormSchema>;

export default function AddPhone() {
  const [_, navigate] = useLocation();
  const location = useLocation()[0];
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Parse location state for booking information
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const bookingId = urlParams.get('bookingId');
  const fromBooking = urlParams.get('fromBooking') === 'true';
  
  const form = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneFormSchema),
    defaultValues: {
      country: "Senegal",
      phoneNumber: "",
    },
  });

  const { data: user, isLoading: loadingUser } = useQuery<User>({
    queryKey: ["/api/users/me"],
  });
  
  // Get booking details if we came from a booking flow
  const { data: booking, isLoading: loadingBooking } = useQuery<Booking>({
    queryKey: [`/api/bookings/${bookingId}`],
    enabled: !!bookingId,
  });
  
  // Get car details either from booking or last booked car
  const { data: car, isLoading: loadingCar } = useQuery<Car>({
    queryKey: [`/api/cars/${booking ? booking.carId : null}`],
    enabled: !!booking,
  });
  
  // If not from booking flow, check last booked car as fallback
  const { data: lastCarId, isLoading: loadingLastCarId } = useQuery<number>({
    queryKey: ["/api/bookings/last-car"],
    enabled: !fromBooking,
  });
  
  const { data: lastCar, isLoading: loadingLastCar } = useQuery<Car>({
    queryKey: [`/api/cars/${lastCarId}`],
    enabled: !!lastCarId && !fromBooking,
  });

  // Pre-fill phone number from user data when available
  useEffect(() => {
    if (user?.phoneNumber) {
      form.setValue("phoneNumber", user.phoneNumber);
    }
  }, [user, form]);

  const updatePhoneMutation = useMutation({
    mutationFn: async (data: { phoneNumber: string }) => {
      const response = await apiRequest("PATCH", "/api/users/phone", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
      toast({
        title: "Phone number updated",
        description: "Your phone number has been added successfully",
      });
      
      // Choose next destination based on context
      if (fromBooking) {
        if (user?.profilePicture) {
          // If user already has a profile picture, go to booking success
          navigate("/booking-success");
        } else {
          // Otherwise go to add profile picture with context
          navigate(`/add-profile-picture?fromBooking=true${bookingId ? `&bookingId=${bookingId}` : ''}`);
        }
      } else {
        // Normal flow
        navigate("/add-profile-picture");
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update phone number. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  const onSubmit = (data: PhoneFormValues) => {
    updatePhoneMutation.mutate({ phoneNumber: data.phoneNumber });
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleSkip = () => {
    if (fromBooking) {
      if (user?.profilePicture) {
        navigate("/booking-success");
      } else {
        navigate(`/add-profile-picture?fromBooking=true${bookingId ? `&bookingId=${bookingId}` : ''}`);
      }
    } else {
      navigate("/add-profile-picture");
    }
  };

  const isLoading = 
    loadingUser || 
    (bookingId && loadingBooking) || 
    (booking && loadingCar) || 
    (lastCarId && loadingLastCar);

  if (isLoading) {
    return (
      <>
        <Header title="Add Phone Number" showBack onBack={handleBack} />
        <main className="container mx-auto px-4 py-6 mb-6">
          <LoadingScreen />
        </main>
      </>
    );
  }

  // Choose the appropriate car to display
  const displayCar = car || lastCar;
  const displayBooking = booking;

  return (
    <>
      <Header title="Add Phone Number" showBack onBack={handleBack} />
      <main className="container mx-auto px-4 py-6 mb-6">
        {/* Progress Steps - only show when from booking */}
        {fromBooking && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-1">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <span className="text-xs text-green-600">Booking</span>
              </div>
              <div className="h-0.5 flex-1 bg-gray-200 mx-2 relative">
                <div className="absolute inset-0 bg-green-500" style={{ width: "100%" }}></div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center mb-1">
                  <Phone className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium">Phone</span>
              </div>
              <div className="h-0.5 flex-1 bg-gray-200 mx-2"></div>
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-1">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-xs text-gray-400">Complete</span>
              </div>
            </div>
          </div>
        )}

        {displayCar && fromBooking && (
          <>
            {/* Vehicle Card */}
            <Card className="mb-6">
              <CardContent className="p-4 flex items-center">
                <img
                  src={displayCar.imageUrl}
                  alt={`${displayCar.make} ${displayCar.model}`}
                  className="w-20 h-20 object-cover rounded-md mr-4"
                />
                <div>
                  <h2 className="text-lg font-semibold">{displayCar.make} {displayCar.model}</h2>
                  <p className="text-sm text-gray-500">{displayCar.year} • {displayCar.type}</p>
                </div>
              </CardContent>
            </Card>

            {displayBooking && (
              <Card className="mb-6">
                <CardContent className="py-4">
                  <div className="space-y-3 divide-y divide-gray-200">
                    <div className="flex justify-between py-2">
                      <span className="text-gray-500">
                        {formatDuration(displayBooking.startDate, displayBooking.endDate)}
                      </span>
                      <span className="font-medium">
                        {formatCurrency(displayBooking.totalAmount)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Add Phone Number Form */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-red-100 p-3 rounded-full">
                <Phone className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-center">Add Phone Number</h2>
            <p className="text-center text-gray-500 mb-6">
              Adding your phone number helps verify your account and allows hosts to contact you.
            </p>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Senegal">Senegal</SelectItem>
                          <SelectItem value="Nigeria">Nigeria</SelectItem>
                          <SelectItem value="Ghana">Ghana</SelectItem>
                          <SelectItem value="Côte d'Ivoire">Côte d'Ivoire</SelectItem>
                          <SelectItem value="Kenya">Kenya</SelectItem>
                          <SelectItem value="South Africa">South Africa</SelectItem>
                          <SelectItem value="United States">United States</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your phone number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="+221 xx xxx xxxx" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <p className="text-sm text-gray-500 mt-4">
                  We'll text a code to verify your phone number.
                </p>
                
                <div className="pt-4 space-y-2">
                  <Button 
                    type="submit" 
                    className="w-full bg-red-600 hover:bg-red-700 py-6"
                    disabled={updatePhoneMutation.isPending}
                  >
                    {updatePhoneMutation.isPending ? "Processing..." : "Continue"}
                  </Button>
                  
                  {!fromBooking && (
                    <Button 
                      type="button" 
                      variant="outline"
                      className="w-full py-6"
                      onClick={handleSkip}
                    >
                      Skip for now
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
