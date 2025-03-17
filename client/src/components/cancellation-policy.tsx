import { Calendar, Check, XCircle, InfoIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CancellationPolicyProps {
  date: string;
}

export function CancellationPolicy({ date }: CancellationPolicyProps) {
  const pickupDate = new Date(date);
  const now = new Date();
  
  // Calculate time difference in days
  const timeDiff = Math.floor((pickupDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-4 text-sm">
      <p className="text-blue-700">
        Bookings can be cancelled according to the following policy:
      </p>
      
      <div className="space-y-3">
        <div className="flex items-start">
          <div className={`p-1 rounded-full mr-2 ${timeDiff > 7 ? 'bg-green-100' : 'bg-gray-100'}`}>
            <Check className={`h-4 w-4 ${timeDiff > 7 ? 'text-green-600' : 'text-gray-400'}`} />
          </div>
          <div>
            <p className="font-medium">More than 7 days before pickup</p>
            <p className="text-xs text-blue-700">Full refund, no cancellation fee</p>
            {timeDiff > 7 && (
              <Badge className="mt-1 bg-green-100 text-green-700 border-none">Currently applies</Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-start">
          <div className={`p-1 rounded-full mr-2 ${timeDiff <= 7 && timeDiff > 1 ? 'bg-green-100' : 'bg-gray-100'}`}>
            <Check className={`h-4 w-4 ${timeDiff <= 7 && timeDiff > 1 ? 'text-green-600' : 'text-gray-400'}`} />
          </div>
          <div>
            <p className="font-medium">1-7 days before pickup</p>
            <p className="text-xs text-blue-700">Partial refund, 20% cancellation fee</p>
            {timeDiff <= 7 && timeDiff > 1 && (
              <Badge className="mt-1 bg-green-100 text-green-700 border-none">Currently applies</Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-start">
          <div className={`p-1 rounded-full mr-2 ${timeDiff <= 1 && timeDiff > 0 ? 'bg-green-100' : 'bg-gray-100'}`}>
            <Check className={`h-4 w-4 ${timeDiff <= 1 && timeDiff > 0 ? 'text-green-600' : 'text-gray-400'}`} />
          </div>
          <div>
            <p className="font-medium">24 hours before pickup</p>
            <p className="text-xs text-blue-700">Partial refund, 50% cancellation fee</p>
            {timeDiff <= 1 && timeDiff > 0 && (
              <Badge className="mt-1 bg-green-100 text-green-700 border-none">Currently applies</Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-start">
          <div className={`p-1 rounded-full mr-2 ${timeDiff <= 0 ? 'bg-green-100' : 'bg-gray-100'}`}>
            <XCircle className={`h-4 w-4 ${timeDiff <= 0 ? 'text-red-600' : 'text-gray-400'}`} />
          </div>
          <div>
            <p className="font-medium">Less than 24 hours or after pickup</p>
            <p className="text-xs text-blue-700">No refund available</p>
            {timeDiff <= 0 && (
              <Badge className="mt-1 bg-red-100 text-red-700 border-none">Currently applies</Badge>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-center p-3 bg-blue-50 rounded-lg mt-4">
        <InfoIcon className="h-4 w-4 text-blue-600 mr-2" />
        <p className="text-xs text-blue-700">
          Contact customer support for special circumstances that may require cancellation.
        </p>
      </div>
    </div>
  );
}