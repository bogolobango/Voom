import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ChevronLeft, HelpCircle, Save, Calendar, Clock, Check, Car, MapPin, DollarSign, CircleCheck, CircleAlert, AlertCircle, Edit, ShieldCheck, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { InsertCar } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";

// Sample data - in a real app, this would come from a state manager or context
const sampleCarData = {
  make: "Toyota",
  model: "Camry",
  year: "2020",
  type: "sedan",
  color: "Black",
  licensePlate: "ABC123",
  description: "Well-maintained Toyota Camry in excellent condition. Fuel-efficient and comfortable for both short and long trips. Features A/C, Bluetooth connectivity, and backup camera.",
  images: [
    "https://placehold.co/600x400/e5e7eb/a3a3a3?text=Car+Photo+1", 
    "https://placehold.co/600x400/e5e7eb/a3a3a3?text=Car+Photo+2", 
    "https://placehold.co/600x400/e5e7eb/a3a3a3?text=Car+Photo+3"
  ],
  location: {
    address: "123 Main Street",
    city: "Lomé",
    state: "Maritime",
    postalCode: "10001",
    coordinates: [6.1377, 1.2123],
    pickupInstructions: "Please meet me at the front entrance of the building. Call me when you arrive."
  },
  rates: {
    dailyRate: 20000,
    weeklyDiscount: 10,
    monthlyDiscount: 20,
    minDays: 1,
    maxDays: 30,
    instantBook: true,
    cancellationPolicy: "moderate",
    securityDeposit: 50000,
    additionalRules: "No smoking in the car. Please return with a full tank of gas."
  }
};

export default function CarSummaryPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [publishLoading, setPublishLoading] = useState(false);
  
  const publishCarMutation = useMutation({
    mutationFn: async (carData: InsertCar) => {
      const response = await apiRequest("POST", "/api/cars", carData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hosts/cars"] });
      toast({
        title: "Car listed successfully!",
        description: "Your car is now available for bookings.",
        variant: "default",
      });
      navigate("/host-listings");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to publish listing",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const handlePublish = () => {
    setPublishLoading(true);
    
    // Prepare car data for submission
    // In a real app, this would come from state or context
    const carData: InsertCar = {
      hostId: 1, // Assuming user id is 1
      make: sampleCarData.make,
      model: sampleCarData.model,
      year: parseInt(sampleCarData.year),
      type: sampleCarData.type,
      color: sampleCarData.color,
      licensePlate: sampleCarData.licensePlate,
      description: sampleCarData.description,
      dailyRate: sampleCarData.rates.dailyRate,
      location: sampleCarData.location.address,
      currency: "FCFA",
      imageUrl: sampleCarData.images[0], // Set first image as main image
      images: sampleCarData.images, // Array of image URLs
      features: ["Air Conditioning", "Bluetooth", "Backup Camera"],
      available: true,
      status: "pending_approval"
    };
    
    // Publish car listing
    publishCarMutation.mutate(carData);
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
            onClick={() => navigate("/become-host/car-rates")}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <Progress value={100} className="w-1/4 h-1" />
          
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
          <h1 className="text-3xl font-bold mb-3">Review your listing</h1>
          <p className="text-muted-foreground">
            Here's what we'll show to potential guests. Make sure everything looks good!
          </p>
        </motion.div>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Car Images */}
          <motion.div variants={itemVariants} className="space-y-2">
            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
              <img 
                src={sampleCarData.images[0]} 
                alt="Primary car view" 
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {sampleCarData.images.slice(1).map((img, index) => (
                <div key={index} className="aspect-square bg-muted rounded-lg overflow-hidden">
                  <img 
                    src={img} 
                    alt={`Car view ${index + 2}`} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              <button className="aspect-square flex flex-col items-center justify-center border border-dashed rounded-lg text-muted-foreground">
                <Plus className="h-6 w-6 mb-1" />
                <span className="text-xs">Add more</span>
              </button>
            </div>
          </motion.div>
          
          {/* Car Basic Info */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-semibold">
                  {sampleCarData.year} {sampleCarData.make} {sampleCarData.model}
                </h2>
                <p className="text-muted-foreground capitalize">{sampleCarData.type} • {sampleCarData.color}</p>
              </div>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-medium mb-2">Description</h3>
              <p className="text-muted-foreground">{sampleCarData.description}</p>
            </div>
          </motion.div>
          
          {/* Location */}
          <motion.div variants={itemVariants} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                Location
              </h3>
              <Button variant="ghost" size="sm" className="h-8 text-xs">
                Edit
              </Button>
            </div>
            
            <div className="bg-muted/40 p-3 rounded-lg">
              <p className="text-sm font-medium">{sampleCarData.location.address}</p>
              <p className="text-sm text-muted-foreground">
                {sampleCarData.location.city}, {sampleCarData.location.state} {sampleCarData.location.postalCode}
              </p>
              {sampleCarData.location.pickupInstructions && (
                <div className="mt-2 text-xs text-muted-foreground border-t pt-2">
                  <span className="font-medium">Pickup instructions:</span> {sampleCarData.location.pickupInstructions}
                </div>
              )}
            </div>
          </motion.div>
          
          {/* Pricing */}
          <motion.div variants={itemVariants} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Pricing & Availability
              </h3>
              <Button variant="ghost" size="sm" className="h-8 text-xs">
                Edit
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/40 p-3 rounded-lg">
                <p className="text-sm font-medium">Daily Rate</p>
                <p className="text-xl font-semibold">{formatCurrency(sampleCarData.rates.dailyRate)}</p>
                {(sampleCarData.rates.weeklyDiscount > 0 || sampleCarData.rates.monthlyDiscount > 0) && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    <p>Weekly: {sampleCarData.rates.weeklyDiscount}% off</p>
                    <p>Monthly: {sampleCarData.rates.monthlyDiscount}% off</p>
                  </div>
                )}
              </div>
              
              <div className="bg-muted/40 p-3 rounded-lg">
                <p className="text-sm font-medium">Rental Period</p>
                <div className="text-sm mt-1">
                  <p>Min: {sampleCarData.rates.minDays} day{sampleCarData.rates.minDays > 1 ? 's' : ''}</p>
                  <p>Max: {sampleCarData.rates.maxDays} day{sampleCarData.rates.maxDays > 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <CircleCheck className="h-4 w-4 text-green-500" />
              <span>{sampleCarData.rates.instantBook ? "Instant Book enabled" : "Host approval required"}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Security deposit: {formatCurrency(sampleCarData.rates.securityDeposit)}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              <span className="capitalize">{sampleCarData.rates.cancellationPolicy} cancellation policy</span>
            </div>
          </motion.div>
          
          {/* Additional Rules */}
          {sampleCarData.rates.additionalRules && (
            <motion.div variants={itemVariants} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Additional Rules
                </h3>
                <Button variant="ghost" size="sm" className="h-8 text-xs">
                  Edit
                </Button>
              </div>
              
              <div className="bg-muted/40 p-3 rounded-lg text-sm">
                <p>{sampleCarData.rates.additionalRules}</p>
              </div>
            </motion.div>
          )}
          
          {/* Published status */}
          <motion.div
            variants={itemVariants}
            className="mt-8 p-4 border rounded-lg bg-muted/20"
          >
            <div className="flex items-start gap-3">
              <CircleAlert className="h-6 w-6 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium">Almost done!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Your car listing is ready to publish. Once published, it will be visible to guests looking for cars in your area.
                </p>
              </div>
            </div>
          </motion.div>
          
          {/* Fixed bottom button */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
            <div className="max-w-2xl mx-auto">
              <Button 
                onClick={handlePublish}
                className="w-full"
                size="lg"
                disabled={publishLoading}
              >
                {publishLoading ? "Publishing..." : "Publish your listing"}
              </Button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}