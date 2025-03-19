import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, Save, Shield, ArrowRight, CreditCard, Car } from "lucide-react";
import { VerificationSystem } from "@/components/verification-system";
import { IDVerificationStep } from "@/components/id-verification-step";
import { VerificationStep } from "@/components/verification-step"; 
import { ListingProgressSteps } from "@/components/listing-progress-steps";
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
  const [activeStep, setActiveStep] = useState<string>("id");
  const queryClient = useQueryClient();

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
          id_front: { status: 'pending' },
          id_back: { status: 'pending' },
          license: { status: 'pending' },
          insurance: { status: 'pending' },
          vin: { status: 'pending' }
        };
      }
    },
    enabled: !!user?.id
  });

  // Upload document mutation
  const uploadMutation = useMutation({
    mutationFn: async ({ 
      documentType, 
      file, 
      textData = null 
    }: { 
      documentType: string; 
      file?: File; 
      textData?: string | null;
    }) => {
      const formData = new FormData();
      if (file) {
        formData.append('document', file);
      }
      if (textData) {
        formData.append('textData', textData);
      }
      formData.append('documentType', documentType);
      formData.append('userId', user!.id.toString());
      
      // Use isFormData parameter to properly handle FormData
      return await apiRequest('POST', '/api/verification/upload', formData, true);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/verification', user?.id] });
      
      toast({
        title: "Document uploaded",
        description: `Your ${variables.documentType} has been uploaded and is being reviewed.`,
      });
      
      // Advance to next step based on completed doc type
      if (variables.documentType === 'id_front' || variables.documentType === 'id_back') {
        // Check if both front and back are completed
        const updatedStatus = queryClient.getQueryData(['/api/verification', user?.id]) as any;
        if (updatedStatus?.id_front?.status !== 'pending' && updatedStatus?.id_back?.status !== 'pending') {
          setActiveStep('license');
        }
      } else if (variables.documentType === 'license') {
        setActiveStep('insurance');
      } else if (variables.documentType === 'insurance') {
        setActiveStep('vin');
      } else if (variables.documentType === 'vin') {
        handleVerificationComplete();
      }
    },
    onError: (error, variables) => {
      toast({
        title: "Upload failed",
        description: `Failed to upload ${variables.documentType}. Please try again.`,
        variant: "destructive",
      });
    }
  });

  const handleSaveAndExit = () => {
    toast({
      title: "Progress saved",
      description: "Your verification progress has been saved.",
    });
    navigate("/host-dashboard");
  };

  const handleNext = () => {
    if (isAllSubmitted || isVerificationComplete) {
      navigate("/become-host/car-rates");
    } else {
      toast({
        title: "Verification incomplete",
        description: "Please complete all verification steps before proceeding.",
        variant: "destructive"
      });
    }
  };

  const handleVerificationComplete = () => {
    setIsVerificationComplete(true);
    toast({
      title: "Verification submitted",
      description: "Your verification documents have been submitted for review.",
    });
    // Navigate to confirmation page
    navigate("/become-host/verification-confirmation");
  };

  // Handlers for the ID verification component
  const handleUploadIDFront = (file: File) => {
    uploadMutation.mutate({ documentType: 'id_front', file });
  };

  const handleUploadIDBack = (file: File) => {
    uploadMutation.mutate({ documentType: 'id_back', file });
  };

  const handleUploadLicense = (file: File) => {
    uploadMutation.mutate({ documentType: 'license', file });
  };

  const handleUploadInsurance = (file: File) => {
    uploadMutation.mutate({ documentType: 'insurance', file });
  };

  const handleSubmitVIN = (text: string) => {
    uploadMutation.mutate({ documentType: 'vin', textData: text });
  };

  // Calculate if all verification steps are at least completed (even if not yet verified)
  const isAllSubmitted = verificationStatus && 
    (verificationStatus.id_front?.status === 'completed' || verificationStatus.id_front?.status === 'verified') &&
    (verificationStatus.id_back?.status === 'completed' || verificationStatus.id_back?.status === 'verified') &&
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
        <div className="relative mb-8">
          <ListingProgressSteps
            steps={steps.map((step, index) => ({
              id: step.id,
              title: step.title,
              completed: index < 3 // First three steps are completed
            }))}
            currentStepId="car-verification"
            className="pb-2"
          />
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

        {user && verificationStatus && (
          <div className="space-y-6 pb-24">
            {/* ID Verification (Both Front and Back) */}
            <IDVerificationStep
              userId={user.id}
              onFrontUpload={handleUploadIDFront}
              onBackUpload={handleUploadIDBack}
              frontStatus={verificationStatus.id_front?.status || 'pending'}
              backStatus={verificationStatus.id_back?.status || 'pending'}
              frontErrorMessage={verificationStatus.id_front?.error}
              backErrorMessage={verificationStatus.id_back?.error}
              isActive={activeStep === 'id'}
            />
            
            {/* Driver's License Verification */}
            <VerificationStep
              title="Driver's License"
              description="Upload a photo of your driver's license"
              status={verificationStatus.license?.status || 'pending'}
              icon={<CreditCard className="h-5 w-5" />}
              onUpload={handleUploadLicense}
              isActive={activeStep === 'license'}
              errorMessage={verificationStatus.license?.error}
              index={1}
              allowCamera={true}
            />

            {/* Insurance Verification */}
            <VerificationStep
              title="Insurance Verification"
              description="Upload proof of insurance"
              status={verificationStatus.insurance?.status || 'pending'}
              icon={<Shield className="h-5 w-5" />}
              onUpload={handleUploadInsurance}
              isActive={activeStep === 'insurance'}
              errorMessage={verificationStatus.insurance?.error}
              index={2}
            />

            {/* Vehicle VIN Verification */}
            <VerificationStep
              title="Vehicle VIN Verification"
              description="Enter the Vehicle Identification Number (VIN)"
              status={verificationStatus.vin?.status || 'pending'}
              icon={<Car className="h-5 w-5" />}
              onTextSubmit={handleSubmitVIN}
              textPlaceholder="Enter the 17-character VIN"
              textInputLabel="Vehicle Identification Number (VIN)"
              isActive={activeStep === 'vin'}
              errorMessage={verificationStatus.vin?.error}
              index={3}
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