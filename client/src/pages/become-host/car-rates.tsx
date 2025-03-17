import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ChevronLeft, HelpCircle, Save, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatCurrency } from "@/lib/utils";

const formSchema = z.object({
  dailyRate: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(1, "Daily rate is required").positive("Daily rate must be positive")
  ),
  weeklyDiscount: z.preprocess(
    (val) => (val === "" ? 0 : Number(val)),
    z.number().min(0, "Discount must be positive").max(50, "Maximum discount is 50%")
  ),
  monthlyDiscount: z.preprocess(
    (val) => (val === "" ? 0 : Number(val)),
    z.number().min(0, "Discount must be positive").max(50, "Maximum discount is 50%")
  ),
  minDays: z.preprocess(
    (val) => (val === "" ? 1 : Number(val)),
    z.number().min(1, "Minimum rental period must be at least 1 day")
  ),
  maxDays: z.preprocess(
    (val) => (val === "" ? 30 : Number(val)),
    z.number().min(1, "Maximum rental period must be at least 1 day")
  ),
  instantBook: z.boolean().default(true),
  cancellationPolicy: z.enum(["flexible", "moderate", "strict"]),
  securityDeposit: z.preprocess(
    (val) => (val === "" ? 0 : Number(val)),
    z.number().min(0, "Security deposit must be positive")
  ),
  additionalRules: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CarRatesPage() {
  const [, navigate] = useLocation();
  const [pricePreview, setPricePreview] = useState({
    daily: 0,
    weekly: 0,
    monthly: 0,
  });
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dailyRate: 20000, // FCFA
      weeklyDiscount: 10,
      monthlyDiscount: 20,
      minDays: 1,
      maxDays: 30,
      instantBook: true,
      cancellationPolicy: "moderate",
      securityDeposit: 50000, // FCFA
      additionalRules: "",
    }
  });
  
  const watchDailyRate = form.watch("dailyRate");
  const watchWeeklyDiscount = form.watch("weeklyDiscount");
  const watchMonthlyDiscount = form.watch("monthlyDiscount");
  
  // Update price preview when rates/discounts change
  useState(() => {
    if (watchDailyRate) {
      const daily = watchDailyRate;
      const weekly = daily * 7 * (1 - watchWeeklyDiscount / 100);
      const monthly = daily * 30 * (1 - watchMonthlyDiscount / 100);
      
      setPricePreview({
        daily,
        weekly,
        monthly
      });
    }
  });
  
  const handleNext = (values: FormValues) => {
    // In a real app, we would store the form values in a context or state management
    console.log("Car rates and rules:", values);
    navigate("/become-host/car-summary");
  };
  
  const handleSaveAndExit = () => {
    navigate("/host-dashboard");
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      } 
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* Fixed top header */}
      <header className="fixed top-0 left-0 right-0 bg-background z-10 border-b">
        <div className="flex justify-between items-center px-4 py-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/become-host/car-location")}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <Progress value={75} className="w-1/4 h-1" />
          
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" onClick={handleSaveAndExit}>
              <Save className="h-4 w-4 mr-1" />
              Save & exit
            </Button>
            <Button variant="ghost" size="icon">
              <HelpCircle className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      
      <main className="pt-16 pb-24 px-4 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 mt-6"
        >
          <h1 className="text-3xl font-bold mb-3">Set your rates and conditions</h1>
          <p className="text-muted-foreground">
            Decide how much you'll charge and your rental policies.
          </p>
        </motion.div>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleNext)} className="space-y-8">
              <motion.div variants={itemVariants} className="space-y-4">
                <h2 className="text-xl font-semibold">Pricing</h2>
                
                <FormField
                  control={form.control}
                  name="dailyRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        Daily Rate (FCFA)
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 ml-2 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">This is what guests will pay per day before discounts and Voom service fee.</p>
                          </TooltipContent>
                        </Tooltip>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">FCFA</span>
                          <Input 
                            type="number" 
                            className="pl-14" 
                            {...field} 
                            onChange={(e) => {
                              field.onChange(e);
                              const val = parseFloat(e.target.value);
                              if (!isNaN(val)) {
                                const weekly = val * 7 * (1 - watchWeeklyDiscount / 100);
                                const monthly = val * 30 * (1 - watchMonthlyDiscount / 100);
                                setPricePreview({
                                  daily: val,
                                  weekly,
                                  monthly
                                });
                              }
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="weeklyDiscount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weekly Discount (%)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => {
                              field.onChange(e);
                              const val = parseFloat(e.target.value);
                              if (!isNaN(val) && watchDailyRate) {
                                const weekly = watchDailyRate * 7 * (1 - val / 100);
                                setPricePreview(prev => ({
                                  ...prev,
                                  weekly
                                }));
                              }
                            }}
                          />
                        </FormControl>
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
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => {
                              field.onChange(e);
                              const val = parseFloat(e.target.value);
                              if (!isNaN(val) && watchDailyRate) {
                                const monthly = watchDailyRate * 30 * (1 - val / 100);
                                setPricePreview(prev => ({
                                  ...prev,
                                  monthly
                                }));
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="bg-primary/5 p-4 rounded-lg space-y-2 mt-2">
                  <h3 className="font-medium">Price Preview</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Daily</p>
                      <p className="font-semibold">{formatCurrency(pricePreview.daily)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Weekly</p>
                      <p className="font-semibold">{formatCurrency(pricePreview.weekly / 7)}/day</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly</p>
                      <p className="font-semibold">{formatCurrency(pricePreview.monthly / 30)}/day</p>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div variants={itemVariants} className="space-y-4">
                <h2 className="text-xl font-semibold">Rental Period</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="minDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Days</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormDescription>
                          Shortest rental period
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="maxDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Days</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormDescription>
                          Longest rental period
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </motion.div>
              
              <motion.div variants={itemVariants} className="space-y-4">
                <h2 className="text-xl font-semibold">Booking Settings</h2>
                
                <FormField
                  control={form.control}
                  name="instantBook"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Instant Book
                        </FormLabel>
                        <FormDescription>
                          Allow guests to book without waiting for your approval
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
                  name="securityDeposit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Security Deposit (FCFA)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">FCFA</span>
                          <Input type="number" className="pl-14" {...field} />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Amount guests will be charged if your car is damaged
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="cancellationPolicy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cancellation Policy</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select policy" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="flexible">
                            Flexible (Full refund 24 hours before)
                          </SelectItem>
                          <SelectItem value="moderate">
                            Moderate (Full refund 5 days before)
                          </SelectItem>
                          <SelectItem value="strict">
                            Strict (50% refund 7 days before)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose how strict you want to be with cancellations
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>
              
              <motion.div variants={itemVariants} className="space-y-4">
                <h2 className="text-xl font-semibold">Additional Rules</h2>
                
                <FormField
                  control={form.control}
                  name="additionalRules"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom Rules (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Any specific rules or information guests should know before booking? (e.g., no smoking, no pets, mileage limits)" 
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>
              
              {/* Fixed bottom button */}
              <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
                <div className="max-w-2xl mx-auto">
                  <Button 
                    type="submit"
                    className="w-full"
                    size="lg"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </motion.div>
      </main>
    </div>
  );
}