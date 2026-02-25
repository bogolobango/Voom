import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Car, Calculator, Shield, TrendingUp, Wallet } from "lucide-react";

const CAR_ESTIMATES: Record<string, number> = {
  "Sedan": 15000,
  "SUV": 25000,
  "Luxury": 50000,
  "Truck": 20000,
  "Sports": 40000,
  "Electric": 35000,
};

export function ListingIntro() {
  const [, navigate] = useLocation();
  const [selectedType, setSelectedType] = useState("Sedan");
  const [daysPerMonth, setDaysPerMonth] = useState(15);

  const dailyRate = CAR_ESTIMATES[selectedType] || 15000;
  const monthlyGross = dailyRate * daysPerMonth;
  const monthlyNet = Math.round(monthlyGross * 0.85); // 85% after 15% platform fee
  const yearlyNet = monthlyNet * 12;

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
        className="flex flex-col items-center p-6 pb-20"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <div className="max-w-lg mx-auto w-full">
          {/* Hero */}
          <motion.div
            className="text-center mb-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <div className="p-6 bg-primary/10 rounded-full inline-flex mb-6">
              <Car className="h-16 w-16 text-primary" />
            </div>
          </motion.div>

          <motion.h1
            className="text-3xl font-bold mb-2 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Turn your car into income
          </motion.h1>
          <motion.p
            className="text-muted-foreground text-center mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Join car owners earning extra income on Voom
          </motion.p>

          {/* Earnings Calculator */}
          <motion.div
            className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 mb-8 border border-red-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="h-5 w-5 text-red-600" />
              <h2 className="font-semibold text-lg">Earnings Calculator</h2>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Select your car type</p>
              <div className="grid grid-cols-3 gap-2">
                {Object.keys(CAR_ESTIMATES).map((type) => (
                  <button
                    key={type}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedType === type
                        ? "bg-red-600 text-white"
                        : "bg-white border border-gray-200 text-gray-700 hover:border-red-300"
                    }`}
                    onClick={() => setSelectedType(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Days rented per month</span>
                <span className="font-medium">{daysPerMonth} days</span>
              </div>
              <input
                type="range"
                min={5}
                max={28}
                value={daysPerMonth}
                onChange={(e) => setDaysPerMonth(parseInt(e.target.value))}
                className="w-full h-2 bg-red-200 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>5 days</span>
                <span>28 days</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Daily rate</span>
                <span className="font-medium">{formatCurrency(dailyRate)}/day</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Monthly (after 15% fee)</span>
                <span className="font-semibold text-lg">{formatCurrency(monthlyNet)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="text-sm font-medium">Estimated yearly earnings</span>
                <span className="font-bold text-xl text-red-600">{formatCurrency(yearlyNet)}</span>
              </div>
            </div>
          </motion.div>

          {/* Steps */}
          <motion.div
            className="space-y-6 mb-8 text-left"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div className="flex items-start gap-4" variants={itemVariants}>
              <div className="bg-primary/10 p-3 rounded-lg shrink-0">
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
              <div className="bg-primary/10 p-3 rounded-lg shrink-0">
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
              <div className="bg-primary/10 p-3 rounded-lg shrink-0">
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

          {/* Trust Signals */}
          <motion.div
            className="grid grid-cols-3 gap-3 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
          >
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <Shield className="h-6 w-6 text-red-600 mx-auto mb-1" />
              <p className="text-xs font-medium">Insurance Included</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <Wallet className="h-6 w-6 text-red-600 mx-auto mb-1" />
              <p className="text-xs font-medium">Fast Payouts</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <TrendingUp className="h-6 w-6 text-red-600 mx-auto mb-1" />
              <p className="text-xs font-medium">You Set Prices</p>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <Button
              size="lg"
              className="w-full py-6 text-lg font-medium bg-red-600 hover:bg-red-700"
              onClick={() => navigate("/become-host/car-type")}
            >
              List your car
            </Button>
            <p className="text-center text-xs text-muted-foreground mt-3">
              Free to list. No commitment. Cancel anytime.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </AppLayout>
  );
}
