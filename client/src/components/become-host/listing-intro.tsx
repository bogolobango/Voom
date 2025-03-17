import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Car } from "lucide-react";

export function ListingIntro() {
  const [, navigate] = useLocation();
  
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        ease: "easeOut"
      } 
    }
  };
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.5 }
    }
  };
  
  return (
    <AppLayout hideNavigation>
      <motion.div 
        className="flex flex-col min-h-[90vh] items-center justify-center p-6"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <div className="max-w-lg mx-auto text-center">
          <motion.div 
            className="mb-8 flex justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <div className="p-6 bg-primary/10 rounded-full">
              <Car className="h-16 w-16 text-primary" />
            </div>
          </motion.div>
          
          <motion.h1 
            className="text-3xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            It's easy to get started on Voom
          </motion.h1>
          
          <motion.div 
            className="space-y-8 my-10 text-left"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div className="flex items-start gap-4" variants={itemVariants}>
              <div className="bg-primary/10 p-3 rounded-lg">
                <span className="font-bold text-xl">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Tell us about your car</h3>
                <p className="text-muted-foreground">
                  Share basic info like make, model, year, and location.
                </p>
              </div>
            </motion.div>
            
            <motion.div className="flex items-start gap-4" variants={itemVariants}>
              <div className="bg-primary/10 p-3 rounded-lg">
                <span className="font-bold text-xl">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Make it stand out</h3>
                <p className="text-muted-foreground">
                  Add 5 or more photos plus a detailed description—we'll help you out.
                </p>
              </div>
            </motion.div>
            
            <motion.div className="flex items-start gap-4" variants={itemVariants}>
              <div className="bg-primary/10 p-3 rounded-lg">
                <span className="font-bold text-xl">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Finish up and publish</h3>
                <p className="text-muted-foreground">
                  Set your daily rate, availability, and review listing details before publishing.
                </p>
              </div>
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <Button 
              size="lg" 
              className="w-full py-6 text-lg font-medium mt-4"
              onClick={() => navigate("/become-host/car-type")}
            >
              Get started
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </AppLayout>
  );
}