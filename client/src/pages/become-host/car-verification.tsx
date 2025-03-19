import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, Save, Shield, ArrowRight } from "lucide-react";
import { VerificationSystem } from "@/components/verification-system";
import { apiRequest } from "@/lib/queryClient";

// Define the steps of the car listing process
const steps = [
  { id: 'car-type', title: 'Car Type' },
  { id: 'car-details', title: 'Car Details' },
  { id: 'car-location', title: 'Location' },
  { id: 'car-verification', title: 'Verification' },
  { id: 'car-rates', title: 'Rates' },
  { id: 'car-summary', title: 'Summary' },
];

export default function CarVerificationPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isVerificationComplete, setIsVerificationComplete] = useState(false);

  // Check verification status
  const { data: verificationStatus } = useQuery({
    queryKey: ['/api/verification', user?.id],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', `/api/verification/${user?.id}`);
        return await response.json();
      } catch (error) {
        // If no verification exists yet, return default state
        return {
          identity: { status: 'pending' },
          license: { status: 'pending' },
          insurance: { status: 'pending' },
          vin: { status: 'pending' }
        };
      }
    },
    enabled: !!user?.id
  });

  const handleSaveAndExit = () => {
    toast({
      title: "Progress saved",
      description: "Your verification progress has been saved.",
    });
    navigate("/host-dashboard");
  };

  const handleNext = () => {
    navigate("/become-host/car-rates");
  };

  const handleComplete = () => {
    setIsVerificationComplete(true);
    toast({
      title: "Verification submitted",
      description: "Your verification documents have been submitted for review.",
    });
  };

  // Calculate if all verification steps are at least completed (even if not yet verified)
  const isAllSubmitted = verificationStatus && 
    (verificationStatus.identity?.status === 'completed' || verificationStatus.identity?.status === 'verified') &&
    (verificationStatus.license?.status === 'completed' || verificationStatus.license?.status === 'verified') &&
    (verificationStatus.insurance?.status === 'completed' || verificationStatus.insurance?.status === 'verified') &&
    (verificationStatus.vin?.status === 'completed' || verificationStatus.vin?.status === 'verified');

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
          
          <Progress value={70} className="w-1/4 h-1" />
          
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" onClick={handleSaveAndExit}>
              <Save className="h-4 w-4 mr-1" />
              Save & exit
            </Button>
          </div>
        </div>
      </header>

      {/* Steps progress indicator */}
      <div className="pt-16 px-4 md:px-8 lg:px-10 max-w-7xl mx-auto">
        <div className="flex justify-between mb-8 overflow-x-auto pb-2">
          {steps.map((step, index) => (
            <div 
              key={step.id} 
              className="flex flex-col items-center min-w-[80px]"
            >
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center mb-1
                  ${step.id === 'car-verification' 
                    ? 'bg-red-600 text-white' 
                    : index < 3 
                      ? 'bg-gray-200 text-gray-700' 
                      : 'bg-gray-100 text-gray-400'}`}
              >
                {index + 1}
              </div>
              <span 
                className={`text-xs text-center whitespace-nowrap
                  ${step.id === 'car-verification' 
                    ? 'text-red-600 font-medium' 
                    : index < 3 
                      ? 'text-gray-700' 
                      : 'text-gray-400'}`}
              >
                {step.title}
              </span>
            </div>
          ))}
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center">
            <Shield className="h-7 w-7 mr-2 text-red-600" />
            Identity Verification
          </h1>
          <p className="text-muted-foreground mt-2">
            Complete the verification process to ensure safety and trust for all users
          </p>
        </div>

        {user && (
          <div className="pb-24">
            <VerificationSystem 
              userId={user.id} 
              onComplete={handleComplete}
              isHost={true}
            />
            
            {/* Navigation buttons at the bottom */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
              <div className="max-w-7xl mx-auto flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => navigate("/become-host/car-location")}
                >
                  Back
                </Button>
                
                <Button
                  onClick={handleNext}
                  disabled={!isAllSubmitted && !isVerificationComplete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isAllSubmitted || isVerificationComplete ? (
                    <>
                      Continue <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    "Complete Verification to Continue"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}