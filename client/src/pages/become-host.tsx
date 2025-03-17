import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ListingIntro } from "@/components/become-host/listing-intro";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Check, Car, CarFront, ChevronRight } from "lucide-react";

const hostDetailsSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().min(8, "Valid phone number is required"),
  email: z.string().email("Valid email is required"),
  drivingExperience: z.string().min(1, "Please select your driving experience"),
  bio: z.string().min(10, "Bio must be at least 10 characters").max(500, "Bio must be less than 500 characters"),
});

type HostDetailsFormValues = z.infer<typeof hostDetailsSchema>;

export default function BecomeHost() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<"intro" | "form">("intro");
  
  const form = useForm<HostDetailsFormValues>({
    resolver: zodResolver(hostDetailsSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      drivingExperience: "",
      bio: "",
    }
  });
  
  const onSubmit = async (data: HostDetailsFormValues) => {
    // Save host details
    console.log("Host details:", data);
    
    // Navigate to car details step
    navigate("/become-host/car-type");
  };
  
  if (step === "intro") {
    return <ListingIntro />;
  }
  
  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    }
  };
  
  return (
    <AppLayout hideNavigation>
      <motion.div 
        className="max-w-2xl mx-auto p-6 py-10"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-3">Tell us about yourself</h1>
          <p className="text-muted-foreground">
            Let guests know who'll be hosting them with the car
          </p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name as it appears on your ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="your.email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="drivingExperience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Driving Experience</FormLabel>
                  <div className="grid grid-cols-3 gap-3">
                    {["1-3 Years", "4-10 Years", "10+ Years"].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => form.setValue("drivingExperience", option)}
                        className={`border rounded-lg p-3 flex flex-col items-center justify-center h-20 transition-all ${
                          field.value === option 
                            ? "border-primary bg-primary/5" 
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        {field.value === option && (
                          <Check className="h-4 w-4 text-primary mb-1" />
                        )}
                        <span className="text-sm font-medium">{option}</span>
                      </button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Bio</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell guests a bit about yourself, your interest in cars, and your hosting style." 
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    This helps guests feel comfortable with you as their host
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="pt-4">
              <Button 
                type="submit"
                className="w-full py-6 text-lg"
                size="lg"
              >
                Continue
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
              
              <p className="text-center text-sm text-muted-foreground mt-4">
                Your information is used for identification and contact purposes only. 
                It will not be shared without your permission.
              </p>
            </div>
          </form>
        </Form>
      </motion.div>
    </AppLayout>
  );
}