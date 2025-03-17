import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation } from 'wouter';
import { Map, MapPin } from 'lucide-react';
import { useGoogleMaps } from '@/hooks/use-google-maps';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ghanaAirports, ghanaCities } from '@/lib/ghana-locations';
import { CarProgress } from '@/components/ui/car-progress';

const formSchema = z.object({
  address: z.string().min(1, 'Address is required'),
  latitude: z.number(),
  longitude: z.number(),
  nearestAirport: z.string().min(1, 'Please select the nearest airport'),
  city: z.string().min(1, 'Please select a city'),
});

type FormValues = z.infer<typeof formSchema>;

const steps = [
  { id: 'car-type', title: 'Car Type' },
  { id: 'car-details', title: 'Car Details' },
  { id: 'car-location', title: 'Location' },
  { id: 'car-rates', title: 'Rates' },
  { id: 'car-summary', title: 'Summary' },
];

export default function CarLocationPage() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();

  const {
    mapRef,
    searchBoxRef,
    selectedLocation,
    panTo
  } = useGoogleMaps({
    zoom: 12,
    onPlaceSelect: (place) => {
      if (place.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        form.setValue('latitude', lat);
        form.setValue('longitude', lng);
        if (place.formatted_address) {
          form.setValue('address', place.formatted_address);
        }
      }
    }
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: '',
      latitude: 5.6037,
      longitude: -0.1870,
      nearestAirport: '',
      city: ''
    }
  });

  const handleNext = (values: FormValues) => {
    // Save to local storage
    localStorage.setItem('carLocation', JSON.stringify(values));
    // Navigate to next step
    navigate('/become-host/car-rates');
  };

  return (
    <div className="container max-w-5xl py-10">
      <CarProgress steps={steps} currentStep="car-location" />
      
      <div className="mt-8">
        <h1 className="text-4xl font-bold">Where's your car located?</h1>
        <p className="mt-2 text-muted-foreground">
          Add your car's location to help guests find it easily
        </p>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleNext)} className="space-y-6">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter address or landmark"
                        {...field}
                        ref={(e) => {
                          if (e) {
                            searchBoxRef.current = e;
                            field.ref(e);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          const city = ghanaCities.find(c => c.name === value);
                          if (city) {
                            panTo(city.coordinates[0], city.coordinates[1]);
                          }
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a city" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ghanaCities.map((city) => (
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

                <FormField
                  control={form.control}
                  name="nearestAirport"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nearest Airport</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          const airport = ghanaAirports.find(a => a.code === value);
                          if (airport) {
                            panTo(airport.coordinates[0], airport.coordinates[1]);
                          }
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select airport" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ghanaAirports.map((airport) => (
                            <SelectItem key={airport.code} value={airport.code}>
                              {airport.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <input type="hidden" {...form.register('latitude', { valueAsNumber: true })} />
              <input type="hidden" {...form.register('longitude', { valueAsNumber: true })} />

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/become-host/car-details')}
                >
                  Back
                </Button>
                <Button type="submit">
                  Continue
                  <MapPin className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </Form>
        </div>

        <Card className="overflow-hidden">
          <div
            ref={mapRef}
            className="h-[400px] w-full"
          />
        </Card>
      </div>
    </div>
  );
}