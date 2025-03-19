import { useLocation } from "wouter";
import { 
  CheckCircle2, ChevronLeft, Save, Clock8, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

// Define the steps of the car listing process
const steps = [
  { id: 'car-type', title: 'Car Type' },
  { id: 'car-details', title: 'Car Details' },
  { id: 'car-location', title: 'Location' },
  { id: 'car-verification', title: 'Verification' },
  { id: 'car-rates', title: 'Rates' },
  { id: 'car-summary', title: 'Summary' },
];

export default function VerificationConfirmation() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const handleSaveAndExit = () => {
    toast({
      title: "Progress saved",
      description: "You can return to complete the listing process anytime.",
    });
    navigate("/host-dashboard");
  };

  const handleNext = () => {
    navigate("/become-host/car-rates");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed top header */}
      <header className="fixed top-0 left-0 right-0 bg-background z-10 border-b">
        <div className="flex justify-between items-center px-4 py-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/become-host/car-verification")}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
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

        <div className="max-w-xl mx-auto mt-8">
          <Card className="border-green-100 shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
              </div>
              <CardTitle className="text-2xl">Verification Submitted!</CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                Thank you for submitting your verification documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-700 flex items-center">
                    <Clock8 className="h-5 w-5 mr-2" />
                    What happens next?
                  </h3>
                  <p className="text-blue-600 text-sm mt-1">
                    Our team will review your documents within 24-48 hours. You'll receive an email notification once your verification is complete.
                  </p>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Verification Status</h3>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">ID Verification</span>
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Under Review</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Driver's License</span>
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Under Review</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Insurance Document</span>
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Under Review</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Vehicle VIN</span>
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Under Review</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3">
              <p className="text-sm text-center text-gray-500 mb-2">
                While we're reviewing your documents, you can continue setting up your listing
              </p>
              <Button 
                onClick={handleNext}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                Continue to Rates <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Navigation buttons at the bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
          <div className="max-w-7xl mx-auto flex justify-between">
            <Button
              variant="outline"
              onClick={() => navigate("/become-host/car-verification")}
            >
              Back
            </Button>
            
            <Button
              onClick={handleNext}
              className="bg-red-600 hover:bg-red-700"
            >
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}