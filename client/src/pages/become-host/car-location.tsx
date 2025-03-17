import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ChevronLeft, HelpCircle, Save, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { MapComponent } from "@/components/map/map-component";

const formSchema = z.object({
  address: z.string().min(5, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  pickupInstructions: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CarLocationPage() {
  const [, navigate] = useLocation();
  const [coordinates, setCoordinates] = useState<[number, number]>([6.1377, 1.2123]); // Lomé, Togo as default
  const [address, setAddress] = useState("");
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: "",
      city: "",
      state: "",
      postalCode: "",
      pickupInstructions: "",
    }
  });
  
  const handleNext = (values: FormValues) => {
    // In a real app, we would store the form values in a context or state management
    console.log("Car location:", { ...values, coordinates });
    navigate("/become-host/car-rates");
  };
  
  const handleSaveAndExit = () => {
    navigate("/host-dashboard");
  };
  
  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setCoordinates([lat, lng]);
    setAddress(address);
    form.setValue("address", address);
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
            onClick={() => navigate("/become-host/car-details")}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <Progress value={50} className="w-1/4 h-1" />
          
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
          <h1 className="text-3xl font-bold mb-3">Where is your car located?</h1>
          <p className="text-muted-foreground">
            Pin the exact location where guests can pick up your car.
          </p>
        </motion.div>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="mb-8">
            <div className="h-72 rounded-lg overflow-hidden border mb-2">
              <MapComponent 
                draggableMarker={true}
                onLocationSelect={handleLocationSelect}
                initialCoordinates={coordinates}
                height="100%"
                zoom={13}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Drag the pin to mark your car's exact pickup location
            </p>
          </motion.div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleNext)} className="space-y-6">
              <motion.div variants={itemVariants}>
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || address} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>
              
              <div className="grid grid-cols-2 gap-4">
                <motion.div variants={itemVariants}>
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State/Province</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
              </div>
              
              <motion.div variants={itemVariants}>
                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <FormField
                  control={form.control}
                  name="pickupInstructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pickup Instructions (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Provide details on where to meet, parking instructions, or any special directions." 
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