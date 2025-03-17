import { 
  formatDateAndTime, 
  formatCurrency, 
  getDaysDifference, 
  calculateTotalAmount 
} from "@/lib/utils";
import { Booking, Car } from "@shared/schema";
import { Car as CarIcon, MapPin, Calendar, ArrowRight, CircleDollarSign, Info, Clock } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BookingDetailsProps {
  car: Car;
  booking: Partial<Booking>;
  showEdit?: boolean;
  onEdit?: () => void;
  showBreakdown?: boolean;
}

export function BookingDetails({
  car,
  booking,
  showEdit = true,
  onEdit,
  showBreakdown = true,
}: BookingDetailsProps) {
  // Calculate number of days
  const days = booking.startDate && booking.endDate 
    ? getDaysDifference(booking.startDate, booking.endDate) 
    : 0;
  
  // Calculate subtotal
  const subtotal = days * car.dailyRate;
  
  // Fees and taxes (example calculations)
  const serviceFee = Math.round(subtotal * 0.10); // 10% service fee
  const insuranceFee = 5000; // Fixed insurance fee
  const taxes = Math.round(subtotal * 0.05); // 5% tax
  
  // Calculate total
  const calculatedTotal = subtotal + serviceFee + insuranceFee + taxes;
  
  // Use booking.totalAmount if provided, otherwise use calculated
  const totalAmount = booking.totalAmount || calculatedTotal;

  return (
    <div className="bg-white rounded-lg p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <CarIcon className="h-5 w-5 text-gray-600 mr-2" />
          <h2 className="text-lg font-semibold">{car.make} {car.model}</h2>
        </div>
        {showEdit && (
          <Button
            onClick={onEdit}
            variant="ghost"
            size="sm"
            className="text-red-600 text-sm font-medium"
          >
            Edit
          </Button>
        )}
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start">
            <Calendar className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Pickup</p>
              <p className="font-medium">
                {booking.startDate
                  ? formatDateAndTime(booking.startDate)
                  : "Not set"}
              </p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-300 mx-2 mt-4" />
          <div className="flex items-start">
            <Calendar className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Return</p>
              <p className="font-medium">
                {booking.endDate ? formatDateAndTime(booking.endDate) : "Not set"}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-start">
          <MapPin className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
          <div>
            <p className="text-sm text-gray-500">Location</p>
            <p className="font-medium">
              {booking.pickupLocation || car.location}
            </p>
          </div>
        </div>
        
        {days > 0 && (
          <Badge className="mt-3 bg-blue-100 text-blue-700 border-none">
            <Clock className="h-3 w-3 mr-1" />
            {days} day{days !== 1 ? 's' : ''} rental
          </Badge>
        )}
      </div>
      
      {showBreakdown && (
        <>
          <h3 className="font-medium mb-2">Price breakdown</h3>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">{formatCurrency(car.dailyRate)} × {days} day{days !== 1 ? 's' : ''}</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-gray-600">Service fee</span>
                <Info className="h-3 w-3 text-gray-400 ml-1" />
              </div>
              <span className="font-medium">{formatCurrency(serviceFee)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Insurance</span>
              <span className="font-medium">{formatCurrency(insuranceFee)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Taxes</span>
              <span className="font-medium">{formatCurrency(taxes)}</span>
            </div>
          </div>
          
          <Separator className="my-3" />
          
          <div className="flex justify-between items-center">
            <span className="font-semibold">Total</span>
            <span className="text-xl font-bold">{formatCurrency(totalAmount)}</span>
          </div>
          
          <div className="mt-4 bg-blue-50 border border-blue-100 rounded-md p-3">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-700">Cancellation policy</p>
                <p className="text-xs text-blue-600">
                  Free cancellation up to 24 hours before pickup. After that, a fee equal to one day's rental may apply.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
