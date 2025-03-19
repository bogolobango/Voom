import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation } from 'wouter';
import { 
  Map, 
  MapPin, 
  Info, 
  ArrowLeft, 
  ArrowRight,
  Globe, 
  PlaneTakeoff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { 
  countries,
  cities, 
  airports,
  getAllCities,
  getAllAirports
} from '@/lib/locations';
import { MapPicker } from '@/components/ui/map-picker';
import { MapLocation } from '@/hooks/use-enhanced-maps';
import { CarProgress } from '@/components/ui/car-progress';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const formSchema = z.object({
  address: z.string().min(1, 'Address is required'),
  latitude: z.number(),
  longitude: z.number(),
  nearestAirport: z.string().min(1, 'Please select the nearest airport'),
  city: z.string().min(1, 'Please select a city'),
  country: z.string().min(1, 'Please select a country'),
  description: z.string().optional(),
  preferredPickupLocation: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const steps = [
  { id: 'car-type', title: 'Car Type' },
  { id: 'car-details', title: 'Car Details' },
  { id: 'car-location', title: 'Location' },
  { id: 'car-verification', title: 'Verification' },
  { id: 'car-rates', title: 'Rates' },
  { id: 'car-summary', title: 'Summary' },
];

export default function CarLocationPage() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedCountry, setSelectedCountry] = useState<string>('GH'); // Default to Ghana
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  
  // Get saved data from local storage
  useEffect(() => {
    const savedData = localStorage.getItem('carLocation');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        form.reset(parsed);
        
        setSelectedLocation({
          lat: parsed.latitude,
          lng: parsed.longitude,
          address: parsed.address,
          country: parsed.country,
          city: parsed.city,
          nearestAirportCode: parsed.nearestAirport
        });
        
        if (parsed.country === 'Cameroon') {
          setSelectedCountry('CM');
        } else {
          setSelectedCountry('GH');
        }
      } catch (e) {
        console.error('Failed to parse saved location data', e);
      }
    }
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: '',
      latitude: 5.6037,
      longitude: -0.1870,
      nearestAirport: '',
      city: '',
      country: 'Ghana', // Default to Ghana
      description: '',
      preferredPickupLocation: ''
    }
  });

  // Handle location selection from map
  const handleLocationSelect = (location: MapLocation) => {
    if (!location) return;
    
    setSelectedLocation(location);
    
    form.setValue('latitude', location.lat);
    form.setValue('longitude', location.lng);
    
    if (location.address) {
      form.setValue('address', location.address);
    }
    
    if (location.city) {
      form.setValue('city', location.city);
    }
    
    if (location.country) {
      form.setValue('country', location.country);
      // Update selected country code
      if (location.country === 'Cameroon') {
        setSelectedCountry('CM');
      } else if (location.country === 'Ghana') {
        setSelectedCountry('GH');
      }
    }
    
    if (location.nearestAirportCode) {
      form.setValue('nearestAirport', location.nearestAirportCode);
    }
  };

  const handleCountryChange = (countryCode: string) => {
    setSelectedCountry(countryCode);
    
    // Update form country value
    const countryName = countryCode === 'CM' ? 'Cameroon' : 'Ghana';
    form.setValue('country', countryName);
    
    // Reset city and airport when country changes
    form.setValue('city', '');
    form.setValue('nearestAirport', '');
    
    // Center map on the selected country
    const country = countries.find(c => c.code === countryCode);
    if (country) {
      setSelectedLocation({
        lat: country.defaultCenter[0],
        lng: country.defaultCenter[1],
        country: countryName
      });
    }
  };

  const handleNext = (values: FormValues) => {
    // Validate that we have all necessary location information
    if (!values.latitude || !values.longitude) {
      toast({
        title: "Location Required",
        description: "Please select a specific location on the map",
        variant: "destructive"
      });
      return;
    }
    
    // Save to local storage
    localStorage.setItem('carLocation', JSON.stringify(values));
    
    // Navigate to verification step
    navigate('/become-host/car-verification');
  };

  return (
    <div className="container max-w-6xl py-10">
      <CarProgress steps={steps} currentStep="car-location" />
      
      <div className="mt-8">
        <h1 className="text-4xl font-bold">Where's your car located?</h1>
        <p className="mt-2 text-muted-foreground">
          Add your car's location to help guests find it easily
        </p>
      </div>

      <Tabs defaultValue={selectedCountry} className="mt-8" onValueChange={handleCountryChange}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="GH" className="flex items-center gap-1">
              <Globe className="h-4 w-4" />
              Ghana
            </TabsTrigger>
            <TabsTrigger value="CM" className="flex items-center gap-1">
              <Globe className="h-4 w-4" />
              Cameroon
            </TabsTrigger>
          </TabsList>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                  <Info className="h-4 w-4 mr-1" />
                  Location Tips
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Add the exact location where guests can pick up your car. You can drag the pin on the map to adjust the position precisely.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="grid gap-8 md:grid-cols-5">
          <Card className="col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Location Details</CardTitle>
              <CardDescription>
                Enter specific information about where your car is located
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleNext)} className="space-y-4">
                  {/* City Selection */}
                  <TabsContent value="GH" className="m-0 p-0">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City in Ghana</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              const city = cities['GH'].find(c => c.name === value);
                              if (city && setSelectedLocation) {
                                setSelectedLocation({
                                  lat: city.coordinates[0],
                                  lng: city.coordinates[1],
                                  city: city.name,
                                  country: 'Ghana'
                                });
                              }
                            }}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a city" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {cities['GH'].map((city) => (
                                <SelectItem key={city.name} value={city.name}>
                                  {city.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  
                  <TabsContent value="CM" className="m-0 p-0">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City in Cameroon</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              const city = cities['CM'].find(c => c.name === value);
                              if (city && setSelectedLocation) {
                                setSelectedLocation({
                                  lat: city.coordinates[0],
                                  lng: city.coordinates[1],
                                  city: city.name,
                                  country: 'Cameroon'
                                });
                              }
                            }}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a city" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {cities['CM'].map((city) => (
                                <SelectItem key={city.name} value={city.name}>
                                  {city.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  
                  {/* Airport Selection */}
                  <TabsContent value="GH" className="m-0 p-0">
                    <FormField
                      control={form.control}
                      name="nearestAirport"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nearest Airport</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              const airport = airports['GH'].find(a => a.code === value);
                              if (airport && setSelectedLocation) {
                                setSelectedLocation({
                                  lat: airport.coordinates[0],
                                  lng: airport.coordinates[1],
                                  city: airport.city,
                                  country: 'Ghana',
                                  nearestAirportCode: airport.code
                                });
                              }
                            }}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select airport" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {airports['GH'].map((airport) => (
                                <SelectItem key={airport.code} value={airport.code}>
                                  <div className="flex items-center gap-2">
                                    <PlaneTakeoff className="h-4 w-4" />
                                    {airport.name} ({airport.code})
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  
                  <TabsContent value="CM" className="m-0 p-0">
                    <FormField
                      control={form.control}
                      name="nearestAirport"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nearest Airport</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              const airport = airports['CM'].find(a => a.code === value);
                              if (airport && setSelectedLocation) {
                                setSelectedLocation({
                                  lat: airport.coordinates[0],
                                  lng: airport.coordinates[1],
                                  city: airport.city,
                                  country: 'Cameroon',
                                  nearestAirportCode: airport.code
                                });
                              }
                            }}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select airport" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {airports['CM'].map((airport) => (
                                <SelectItem key={airport.code} value={airport.code}>
                                  <div className="flex items-center gap-2">
                                    <PlaneTakeoff className="h-4 w-4" />
                                    {airport.name} ({airport.code})
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                    
                  {/* Preferred Pickup Location - Common for both countries */}
                  <FormField
                    control={form.control}
                    name="preferredPickupLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Pickup Location</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || ""}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select preferred location" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="at_address">At this address</SelectItem>
                              <SelectItem value="airport">At the airport</SelectItem>
                              <SelectItem value="flexible">Flexible (discuss with guests)</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormDescription>
                          Where guests typically pick up your car
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Description - Common for both countries */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location Description</FormLabel>
                        <FormControl>
                          <textarea
                            className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Add details about the location, parking situation, or any specific instructions"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Help guests find your car easily
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Hidden fields */}
                  <input type="hidden" {...form.register('latitude', { valueAsNumber: true })} />
                  <input type="hidden" {...form.register('longitude', { valueAsNumber: true })} />
                  <input type="hidden" {...form.register('address')} />
                  <input type="hidden" {...form.register('country')} />
                  
                  {/* Navigation buttons */}
                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/become-host/car-details')}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button type="submit">
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          <Card className="col-span-3 overflow-hidden">
            <CardHeader className="pb-0">
              <CardTitle className="text-lg">Pin Your Car's Location</CardTitle>
              <CardDescription>
                Drag the pin to set the exact location or search for an address
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <MapPicker
                value={selectedLocation}
                onChange={handleLocationSelect}
                initialCountry={selectedCountry as 'GH' | 'CM'}
                height="500px"
                showSearch={true}
                showControls={true}
                showLocationDetails={true}
              />
            </CardContent>
          </Card>
        </div>
      </Tabs>
    </div>
  );
}