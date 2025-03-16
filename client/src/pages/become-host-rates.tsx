import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Header } from "@/components/layout/header";
import { formatCurrency } from "@/lib/utils";

// Rates and conditions schema
const ratesSchema = z.object({
  dailyRate: z.number().min(1, "Daily rate is required"),
  weeklyDiscount: z.number().min(0).max(100, "Weekly discount must be between 0-100%"),
  monthlyDiscount: z.number().min(0).max(100, "Monthly discount must be between 0-100%"),
  minimumRentalDays: z.number().min(1, "Minimum rental period required"),
  instantBooking: z.boolean(),
  securityDeposit: z.number().min(0, "Security deposit must be a positive number"),
  hasChildSeat: z.boolean(),
  hasGPS: z.boolean(),
  hasBluetooth: z.boolean(),
  hasUSB: z.boolean(),
  hasSunroof: z.boolean(),
  cancellationPolicy: z.enum(["flexible", "moderate", "strict"]),
  allowPets: z.boolean(),
  allowSmoking: z.boolean(),
});

type RatesFormValues = z.infer<typeof ratesSchema>;

export default function BecomeHostRates() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Setup form with default values
  const form = useForm<RatesFormValues>({
    resolver: zodResolver(ratesSchema),
    defaultValues: {
      dailyRate: 50,
      weeklyDiscount: 5,
      monthlyDiscount: 10,
      minimumRentalDays: 1,
      instantBooking: true,
      securityDeposit: 300,
      hasChildSeat: false,
      hasGPS: false,
      hasBluetooth: false,
      hasUSB: false,
      hasSunroof: false,
      cancellationPolicy: "moderate",
      allowPets: false,
      allowSmoking: false,
    }
  });

  const watchDailyRate = form.watch("dailyRate");
  const watchWeeklyDiscount = form.watch("weeklyDiscount");
  const watchMonthlyDiscount = form.watch("monthlyDiscount");

  const onSubmit = async (data: RatesFormValues) => {
    console.log("Rates and conditions submitted:", data);
    
    toast({
      title: "Rates and conditions saved",
      description: "Moving to the summary page"
    });
    
    // Navigate to the summary page
    setLocation("/become-host/summary");
  };

  return (
    <div className="container pb-10">
      <Header title="Rates & Conditions" showBack onBack={() => setLocation("/become-host/location")} />
      
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Step 4: Rates & Conditions</CardTitle>
          <CardDescription>Set your pricing and rental requirements</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-6">
                <div className="border rounded-lg p-4 space-y-4">
                  <h3 className="font-medium text-lg">Pricing</h3>
                  
                  <FormField
                    control={form.control}
                    name="dailyRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Daily Rate (FCFA)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min="1"
                            step="1"
                            {...field}
                            onChange={e => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="weeklyDiscount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weekly Discount (%)</FormLabel>
                          <div className="flex items-center space-x-3">
                            <FormControl>
                              <Slider
                                min={0}
                                max={50}
                                step={1}
                                value={[field.value]}
                                onValueChange={(values) => field.onChange(values[0])}
                              />
                            </FormControl>
                            <span className="w-12 text-right">{field.value}%</span>
                          </div>
                          <FormDescription>
                            Weekly price: {formatCurrency(watchDailyRate * 7 * (1 - watchWeeklyDiscount / 100))}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="monthlyDiscount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monthly Discount (%)</FormLabel>
                          <div className="flex items-center space-x-3">
                            <FormControl>
                              <Slider
                                min={0}
                                max={50}
                                step={1}
                                value={[field.value]}
                                onValueChange={(values) => field.onChange(values[0])}
                              />
                            </FormControl>
                            <span className="w-12 text-right">{field.value}%</span>
                          </div>
                          <FormDescription>
                            Monthly price: {formatCurrency(watchDailyRate * 30 * (1 - watchMonthlyDiscount / 100))}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="securityDeposit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Security Deposit (FCFA)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min="0"
                            step="100"
                            {...field}
                            onChange={e => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          This amount will be held as a security deposit
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="border rounded-lg p-4 space-y-4">
                  <h3 className="font-medium text-lg">Rental Requirements</h3>
                  
                  <FormField
                    control={form.control}
                    name="minimumRentalDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Rental Period (days)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1"
                            max="30"
                            {...field}
                            onChange={e => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="instantBooking"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Instant Booking</FormLabel>
                          <FormDescription>
                            Allow guests to book without prior approval
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="cancellationPolicy"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Cancellation Policy</FormLabel>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="flexible"
                              value="flexible"
                              checked={field.value === "flexible"}
                              onChange={() => field.onChange("flexible")}
                              className="h-4 w-4"
                            />
                            <label htmlFor="flexible" className="text-sm font-medium">
                              Flexible (Full refund 24 hours before pickup)
                            </label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="moderate"
                              value="moderate"
                              checked={field.value === "moderate"}
                              onChange={() => field.onChange("moderate")}
                              className="h-4 w-4"
                            />
                            <label htmlFor="moderate" className="text-sm font-medium">
                              Moderate (50% refund 3 days before pickup)
                            </label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="strict"
                              value="strict"
                              checked={field.value === "strict"}
                              onChange={() => field.onChange("strict")}
                              className="h-4 w-4"
                            />
                            <label htmlFor="strict" className="text-sm font-medium">
                              Strict (No refunds within 7 days of pickup)
                            </label>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="border rounded-lg p-4 space-y-4">
                  <h3 className="font-medium text-lg">Features & Rules</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <FormField
                      control={form.control}
                      name="hasChildSeat"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Child Seat</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="hasGPS"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>GPS Navigation</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="hasBluetooth"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Bluetooth</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="hasUSB"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>USB Port</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="hasSunroof"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Sunroof</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="allowPets"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Allow Pets</FormLabel>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="allowSmoking"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Allow Smoking</FormLabel>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  type="submit"
                  className="w-full md:w-auto"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? "Saving..." : "Continue to Summary"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}