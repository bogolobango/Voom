import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { MapPin } from "lucide-react";
import { MapComponent } from "@/components/map/map-component";

// Location schema
const locationSchema = z.object({
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State/Province is required"),
  zipCode: z.string().min(2, "Zip/Postal code is required"),
  country: z.string().min(2, "Country is required"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

type LocationFormValues = z.infer<typeof locationSchema>;

export default function BecomeHostLocation() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedLatLng, setSelectedLatLng] = useState<{ lat: number; lng: number } | null>(null);

  // Setup form with default values
  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    }
  });

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setSelectedLatLng({ lat, lng });
    
    // Parse the address components (in a real app, this would come from geocoding API)
    const addressParts = address.split(',').map(part => part.trim());
    
    // Update form fields
    form.setValue("latitude", lat);
    form.setValue("longitude", lng);
    
    if (addressParts.length > 0) {
      form.setValue("address", addressParts[0]);
    }
  };

  const onSubmit = async (data: LocationFormValues) => {
    if (!selectedLatLng) {
      toast({
        title: "Location required",
        description: "Please select a location on the map",
        variant: "destructive"
      });
      return;
    }
    
    // Update data with coordinates
    const submitData = {
      ...data,
      latitude: selectedLatLng.lat,
      longitude: selectedLatLng.lng
    };
    
    console.log("Location data submitted:", submitData);
    
    toast({
      title: "Location saved",
      description: "Moving to the next step"
    });
    
    // Navigate to the next step (rates and conditions)
    setLocation("/become-host/rates");
  };

  return (
    <div className="container pb-10">
      <Header title="Car Location" showBack onBack={() => setLocation("/become-host/car-details")} />
      
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Step 3: Car Location</CardTitle>
          <CardDescription>Where will your car be available for pickup?</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div className="rounded-lg overflow-hidden border border-gray-200">
                  <MapComponent 
                    height="400px"
                    onLocationSelect={handleLocationSelect}
                    zoom={12}
                  />
                </div>
                
                <p className="text-sm text-gray-500 flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {selectedLatLng 
                    ? `Selected location: ${selectedLatLng.lat.toFixed(6)}, ${selectedLatLng.lng.toFixed(6)}` 
                    : "Click on the map to select your car's location"}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Street address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="City" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State/Province</FormLabel>
                      <FormControl>
                        <Input placeholder="State or province" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zip/Postal Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Zip or postal code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="Country" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      For safety reasons, your car's exact location won't be shared with guests until their booking is confirmed.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  type="submit"
                  className="w-full md:w-auto"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? "Saving..." : "Continue to Rates & Conditions"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}