import { useState } from "react";
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
import { Car, User } from "@shared/schema";

const phoneFormSchema = z.object({
  country: z.string(),
  phoneNumber: z.string().min(8, "Phone number must be at least 8 digits"),
});

type PhoneFormValues = z.infer<typeof phoneFormSchema>;

export default function AddPhone() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
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
  
  const { data: lastCarId } = useQuery<number>({
    queryKey: ["/api/bookings/last-car"],
  });
  
  const { data: car, isLoading: loadingCar } = useQuery<Car>({
    queryKey: [`/api/cars/${lastCarId}`],
    enabled: !!lastCarId,
  });

  const updatePhoneMutation = useMutation({
    mutationFn: async (data: { phoneNumber: string }) => {
      return apiRequest("PATCH", "/api/users/phone", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
      toast({
        title: "Phone number updated",
        description: "Your phone number has been updated successfully",
      });
      navigate("/add-profile-picture");
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

  if (loadingUser || (lastCarId && loadingCar)) {
    return (
      <>
        <Header title="Confirm and Pay" showBack onBack={handleBack} />
        <main className="container mx-auto px-4 py-6 mb-6">
          <LoadingScreen />
        </main>
      </>
    );
  }

  return (
    <>
      <Header title="Confirm and Pay" showBack onBack={handleBack} />
      <main className="container mx-auto px-4 py-6 mb-6">
        {car && (
          <>
            {/* Vehicle Card */}
            <Card className="mb-6">
              <CardContent className="p-4 flex items-center">
                <img
                  src={car.imageUrl}
                  alt={`${car.make} ${car.model}`}
                  className="w-20 h-20 object-cover rounded-md mr-4"
                />
                <div>
                  <h2 className="text-lg font-semibold">{car.make} {car.model}</h2>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardContent className="py-4">
                <div className="space-y-3 divide-y divide-gray-200">
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">8 days and 1 hour</span>
                    <span className="font-medium">680,000 FCFA</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Add Phone Number Form */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-6 text-center">Add Phone Number</h2>
            
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
                          value={field.value || (user?.phoneNumber || "")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <p className="text-sm text-gray-500 mt-4 mb-6">
                  We'll text a code to verify your phone number.
                </p>
                
                <Button 
                  type="submit" 
                  className="w-full bg-red-600 hover:bg-red-700 py-6"
                  disabled={updatePhoneMutation.isPending}
                >
                  {updatePhoneMutation.isPending ? "Processing..." : "Continue"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
