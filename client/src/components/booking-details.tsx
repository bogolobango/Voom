import { formatDateAndTime } from "@/lib/utils";
import { Booking, Car } from "@shared/schema";

interface BookingDetailsProps {
  car: Car;
  booking: Partial<Booking>;
  showEdit?: boolean;
  onEdit?: () => void;
}

export function BookingDetails({
  car,
  booking,
  showEdit = true,
  onEdit,
}: BookingDetailsProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Your Booking</h2>
        {showEdit && (
          <button
            onClick={onEdit}
            className="text-red-600 text-sm font-medium"
          >
            Edit
          </button>
        )}
      </div>
      <div className="space-y-3 divide-y divide-gray-200">
        <div className="flex justify-between py-2">
          <span className="text-gray-500">Start of Rental</span>
          <span className="font-medium">
            {booking.startDate
              ? formatDateAndTime(booking.startDate)
              : "Not set"}
          </span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-gray-500">End of Rental</span>
          <span className="font-medium">
            {booking.endDate ? formatDateAndTime(booking.endDate) : "Not set"}
          </span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-gray-500">Pick-up and drop-off point</span>
          <span className="font-medium">
            {booking.pickupLocation || car.location}
          </span>
        </div>
      </div>
    </div>
  );
}
