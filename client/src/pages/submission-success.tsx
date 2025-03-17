import { useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle, Home, Calendar, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function SubmissionSuccessPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Show a toast message on component mount
    toast({
      title: "Listing submitted successfully!",
      description: "Your car listing is now pending approval.",
    });
  }, [toast]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container max-w-lg mx-auto pt-10 pb-24 px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Success Message */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <div className="inline-flex justify-center items-center w-20 h-20 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold mb-3">Submission Successful!</h1>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Your car listing has been submitted and is pending approval. Our team will review it shortly.
            </p>
          </motion.div>

          {/* Status Card */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-medium mb-4">Listing Status</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium">Pending Review</p>
                      <p className="text-sm text-muted-foreground">
                        Our team is reviewing your listing for quality and compliance
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">What happens next?</p>
                    <ul className="text-sm text-muted-foreground space-y-1.5">
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                        <span>Our team reviews your car listing (typically within 24 hours)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                        <span>You'll receive an email notification once approved</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                        <span>Your car becomes visible to potential renters</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* View in Profile Button */}
          <motion.div variants={itemVariants} className="text-center mt-6">
            <p className="text-sm text-muted-foreground mb-4">
              You can view your pending listing in your host profile
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => navigate("/host-listings")} className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                View My Listings
              </Button>
              <Button variant="outline" onClick={() => navigate("/")} className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Return to Home
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}