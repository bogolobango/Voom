import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { 
  Car, X, ChevronLeft, HelpCircle, 
  Save, Car as CarIcon, Truck
} from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const carTypes = [
  {
    id: "sedan",
    name: "Sedan",
    icon: <Car className="h-6 w-6" />,
    description: "4-door car with a separate trunk"
  },
  {
    id: "suv",
    name: "SUV",
    icon: <CarIcon className="h-6 w-6" />,
    description: "Sport utility vehicle with raised ground clearance"
  },
  {
    id: "truck",
    name: "Truck",
    icon: <Truck className="h-6 w-6" />,
    description: "Vehicle with an open cargo area"
  },
  {
    id: "sports",
    name: "Sports Car",
    icon: <CarIcon className="h-6 w-6" />,
    description: "High-performance vehicle built for speed"
  },
  {
    id: "luxury",
    name: "Luxury",
    icon: <CarIcon className="h-6 w-6" />,
    description: "Premium vehicle with high-end features"
  },
  {
    id: "electric",
    name: "Electric",
    icon: <CarIcon className="h-6 w-6" />,
    description: "Vehicle powered by electricity"
  },
  {
    id: "hybrid",
    name: "Hybrid",
    icon: <CarIcon className="h-6 w-6" />,
    description: "Vehicle with electric and gas power sources"
  },
  {
    id: "convertible",
    name: "Convertible",
    icon: <CarIcon className="h-6 w-6" />,
    description: "Car with a removable/retractable roof"
  },
];

export default function CarTypePage() {
  const [, navigate] = useLocation();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  
  const handleNext = () => {
    if (selectedType) {
      navigate(`/become-host/car-details?type=${selectedType}`);
    }
  };
  
  const handleSaveAndExit = () => {
    // Save data and exit
    navigate("/host-dashboard");
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.05
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
            onClick={() => navigate("/become-host")}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <Progress value={10} className="w-1/4 h-1" />
          
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
          <h1 className="text-3xl font-bold mb-3">What type of car will you share?</h1>
          <p className="text-muted-foreground">
            Choose the category that best describes your vehicle.
          </p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-2 gap-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {carTypes.map((type) => (
            <motion.div 
              key={type.id}
              variants={itemVariants}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <button
                onClick={() => setSelectedType(type.id)}
                className={`w-full h-24 flex flex-col items-center justify-center text-center p-3 border rounded-xl transition-all ${
                  selectedType === type.id 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className={`mb-2 ${selectedType === type.id ? "text-primary" : ""}`}>
                  {type.icon}
                </div>
                <span className="font-medium text-sm">{type.name}</span>
              </button>
            </motion.div>
          ))}
        </motion.div>
      </main>
      
      {/* Fixed bottom button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
        <div className="max-w-2xl mx-auto">
          <Button 
            className="w-full"
            disabled={!selectedType}
            onClick={handleNext}
            size="lg"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}