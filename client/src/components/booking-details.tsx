import { useState } from "react";
import { 
  formatDateAndTime, 
  formatCurrency, 
  getDaysDifference, 
  calculateTotalAmount 
} from "@/lib/utils";
import { Booking, Car } from "@shared/schema";
import { 
  Car as CarIcon, 
  MapPin, 
  Calendar, 
  ArrowRight, 
  CircleDollarSign, 
  Info, 
  Clock, 
  Shield, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle,
  PiggyBank,
  Receipt,
  Banknote,
  Tag,
  CreditCard
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { CancellationPolicy } from "./cancellation-policy";

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
  // State for UI interactions
  const [showFullBreakdown, setShowFullBreakdown] = useState(false);
  const [showCancellationDetails, setShowCancellationDetails] = useState(false);
  
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
  const cleaningFee = 2500; // Fixed cleaning fee
  
  // Discounts (example calculations)
  const weeklyDiscount = days >= 7 ? Math.round(subtotal * 0.05) : 0; // 5% weekly discount
  const longTermDiscount = days >= 28 ? Math.round(subtotal * 0.10) : 0; // 10% monthly discount
  const totalDiscounts = weeklyDiscount + longTermDiscount;
  
  // Calculate total
  const calculatedTotal = subtotal + serviceFee + insuranceFee + taxes + cleaningFee - totalDiscounts;
  
  // Use booking.totalAmount if provided, otherwise use calculated
  const totalAmount = booking.totalAmount || calculatedTotal;
  
  // Security deposit (separate from total)
  const securityDeposit = 50000;
  
  // Payment due dates
  const now = new Date();
  const bookingDate = booking.startDate ? new Date(booking.startDate) : new Date();
  const daysUntilBooking = booking.startDate ? Math.max(0, Math.floor((bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0;
  
  // Payment schedule based on days until booking
  const payNow = Math.round(totalAmount * 0.25); // 25% now
  const payLater = totalAmount - payNow; // Remainder
  
  // Calculate trip progress if booking is ongoing
  const isOngoing = booking.startDate && booking.endDate && 
    new Date(booking.startDate) <= now && new Date(booking.endDate) >= now;
  const tripProgress = isOngoing && booking.startDate && booking.endDate ? 
    Math.min(100, Math.max(0, Math.round(
      ((now.getTime() - new Date(booking.startDate).getTime()) / 
      (new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime())) * 100
    ))) : 0;

  return (
    <div className="bg-white rounded-lg p-4 mb-6 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <div className="bg-red-50 p-2 rounded-full mr-3">
            <CarIcon className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">{car.make} {car.model}</h2>
            <p className="text-sm text-gray-500">{car.year} • {car.type}</p>
          </div>
        </div>
        {showEdit && (
          <Button
            onClick={onEdit}
            variant="outline"
            size="sm"
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            Edit
          </Button>
        )}
      </div>
      
      {/* Trip Progress Bar (if trip is ongoing) */}
      {isOngoing && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1 text-sm">
            <span>Trip progress</span>
            <span className="font-medium">{tripProgress}%</span>
          </div>
          <Progress value={tripProgress} className="h-2" />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Pickup: {booking.startDate ? new Date(booking.startDate).toLocaleDateString() : ""}</span>
            <span>Return: {booking.endDate ? new Date(booking.endDate).toLocaleDateString() : ""}</span>
          </div>
        </div>
      )}
      
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
          <div className="flex items-start mb-3 md:mb-0">
            <div className="bg-white p-2 rounded-md shadow-sm mr-3">
              <Calendar className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pickup</p>
              <p className="font-medium">
                {booking.startDate
                  ? formatDateAndTime(booking.startDate)
                  : "Not set"}
              </p>
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-red-600"></div>
              <div className="w-20 h-0.5 bg-red-200"></div>
              <div className="w-2 h-2 rounded-full bg-red-600"></div>
            </div>
            <div className="text-xs text-center text-gray-500 mt-1">
              {days} day{days !== 1 ? 's' : ''}
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="bg-white p-2 rounded-md shadow-sm mr-3">
              <Calendar className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Return</p>
              <p className="font-medium">
                {booking.endDate ? formatDateAndTime(booking.endDate) : "Not set"}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="bg-white p-2 rounded-md shadow-sm mr-3">
            <MapPin className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Location</p>
            <p className="font-medium">
              {booking.pickupLocation || car.location}
            </p>
            <Button variant="link" className="h-auto p-0 text-xs text-red-600" onClick={() => window.open("https://maps.google.com", "_blank")}>
              View on map
            </Button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-3">
          {days > 0 && (
            <Badge className="bg-blue-100 text-blue-700 border-none">
              <Clock className="h-3 w-3 mr-1" />
              {days} day{days !== 1 ? 's' : ''} rental
            </Badge>
          )}
          
          <Badge className="bg-red-100 text-red-700 border-none">
            <Tag className="h-3 w-3 mr-1" />
            {car.fuelType}
          </Badge>
          
          <Badge className="bg-green-100 text-green-700 border-none">
            <Shield className="h-3 w-3 mr-1" />
            Insured
          </Badge>
        </div>
      </div>
      
      {showBreakdown && (
        <>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Price breakdown</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 p-0 text-gray-500"
              onClick={() => setShowFullBreakdown(!showFullBreakdown)}
            >
              {showFullBreakdown ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Banknote className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-600">{formatCurrency(car.dailyRate)} × {days} day{days !== 1 ? 's' : ''}</span>
              </div>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            
            {showFullBreakdown ? (
              <>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <CircleDollarSign className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Service fee</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3 w-3 text-gray-400 ml-1 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-60 text-xs">
                            Service fee helps us maintain the platform and provide customer support for your booking.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <span className="font-medium">{formatCurrency(serviceFee)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Insurance</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3 w-3 text-gray-400 ml-1 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-60 text-xs">
                            Insurance covers damage to the vehicle up to 5,000,000 FCFA with a 50,000 FCFA deductible.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <span className="font-medium">{formatCurrency(insuranceFee)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Receipt className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Taxes</span>
                  </div>
                  <span className="font-medium">{formatCurrency(taxes)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <CircleDollarSign className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Cleaning fee</span>
                  </div>
                  <span className="font-medium">{formatCurrency(cleaningFee)}</span>
                </div>
                
                {(weeklyDiscount > 0 || longTermDiscount > 0) && (
                  <div className="pt-2">
                    <div className="text-sm font-medium text-green-600">Discounts</div>
                    
                    {weeklyDiscount > 0 && (
                      <div className="flex justify-between items-center pl-6 mt-1">
                        <span className="text-gray-600 text-sm">Weekly discount (5%)</span>
                        <span className="font-medium text-green-600">-{formatCurrency(weeklyDiscount)}</span>
                      </div>
                    )}
                    
                    {longTermDiscount > 0 && (
                      <div className="flex justify-between items-center pl-6 mt-1">
                        <span className="text-gray-600 text-sm">Long-term discount (10%)</span>
                        <span className="font-medium text-green-600">-{formatCurrency(longTermDiscount)}</span>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="pt-3">
                  <div className="text-sm font-medium">Security deposit (refundable)</div>
                  <div className="flex justify-between items-center pl-6 mt-1">
                    <div className="flex items-center">
                      <span className="text-gray-600 text-sm">Returned after the trip</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3 w-3 text-gray-400 ml-1 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="w-60 text-xs">
                              The security deposit will be returned within 3 business days after the car is returned in its original condition.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <span className="font-medium">{formatCurrency(securityDeposit)}</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="text-gray-600">Fees & Taxes</span>
                  </div>
                  <span className="font-medium">{formatCurrency(serviceFee + insuranceFee + taxes + cleaningFee)}</span>
                </div>
                
                {totalDiscounts > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Discounts</span>
                    <span className="font-medium text-green-600">-{formatCurrency(totalDiscounts)}</span>
                  </div>
                )}
              </>
            )}
          </div>
          
          <Separator className="my-3" />
          
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold">Total</span>
            <span className="text-xl font-bold">{formatCurrency(totalAmount)}</span>
          </div>
          
          {/* Payment schedule */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <h4 className="text-sm font-medium mb-2 flex items-center">
              <CreditCard className="h-4 w-4 text-gray-500 mr-1" />
              Payment Schedule
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">Pay now (25%)</p>
                  <p className="text-xs text-gray-500">Due today</p>
                </div>
                <span className="font-semibold">{formatCurrency(payNow)}</span>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">Pay later (75%)</p>
                  <p className="text-xs text-gray-500">Due {daysUntilBooking > 0 ? `${daysUntilBooking} days before pickup` : 'at pickup'}</p>
                </div>
                <span className="font-semibold">{formatCurrency(payLater)}</span>
              </div>
            </div>
          </div>
          
          {/* Cancellation policy */}
          <div 
            className={`rounded-md p-3 transition-colors duration-200 cursor-pointer ${
              showCancellationDetails ? 'bg-blue-100 border border-blue-200' : 'bg-blue-50 border border-blue-100'
            }`}
            onClick={() => setShowCancellationDetails(!showCancellationDetails)}
          >
            <div className="flex items-start">
              <AlertCircle className={`h-5 w-5 mr-2 mt-0.5 ${showCancellationDetails ? 'text-blue-600' : 'text-blue-500'}`} />
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <p className={`text-sm font-medium ${showCancellationDetails ? 'text-blue-800' : 'text-blue-700'}`}>
                    Cancellation policy
                  </p>
                  {showCancellationDetails ? (
                    <ChevronUp className="h-4 w-4 text-blue-600" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-blue-600" />
                  )}
                </div>
                <p className={`text-xs ${showCancellationDetails ? 'text-blue-700' : 'text-blue-600'}`}>
                  Free cancellation up to 24 hours before pickup
                </p>
                
                {showCancellationDetails && booking.startDate && (
                  <div className="mt-3">
                    <CancellationPolicy date={booking.startDate.toString()} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
