import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export default function BookingSuccess() {
  const [_, navigate] = useLocation();
  
  const handleReturn = () => {
    navigate("/bookings");
  };

  return (
    <main className="container mx-auto px-4 py-6">
      <div className="flex flex-col items-center justify-center py-20">
        <div className="bg-red-600 rounded-full p-5 mb-8">
          <Check className="h-10 w-10 text-white" />
        </div>
        
        <h1 className="text-2xl font-semibold mb-4 text-center">Success!</h1>
        
        <div className="bg-green-100 p-2 rounded-full flex items-center mb-8">
          <div className="bg-green-600 rounded-full p-1 mr-2">
            <Check className="h-4 w-4 text-white" />
          </div>
          <span className="text-green-800 text-sm font-medium">
            Phone number added successfully.
          </span>
        </div>
        
        <div className="bg-green-100 p-2 rounded-full flex items-center mb-8">
          <div className="bg-green-600 rounded-full p-1 mr-2">
            <Check className="h-4 w-4 text-white" />
          </div>
          <span className="text-green-800 text-sm font-medium">
            Profile Picture added successfully
          </span>
        </div>
        
        <p className="text-center text-gray-500 mb-10 max-w-md">
          Your booking is confirmed! The host has been notified and will be in touch with you shortly. You can view your booking details in the Bookings section.
        </p>
        
        <Button
          onClick={handleReturn}
          className="w-full max-w-xs bg-red-600 hover:bg-red-700 py-6"
        >
          View My Bookings
        </Button>
      </div>
    </main>
  );
}
