import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths, isValid, isSameDay, isAfter, isBefore, isWithinInterval } from "date-fns";
import { cn, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { Car, Booking } from "@shared/schema";

interface BookingCalendarProps {
  car: Car;
  selectedStartDate: Date | null;
  selectedEndDate: Date | null;
  onSelectStartDate: (date: Date) => void;
  onSelectEndDate: (date: Date) => void;
}

interface BookingUnavailability {
  startDate: Date;
  endDate: Date;
}

export function BookingCalendar({
  car,
  selectedStartDate,
  selectedEndDate,
  onSelectStartDate,
  onSelectEndDate,
}: BookingCalendarProps) {
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [selectionState, setSelectionState] = useState<"start" | "end">("start");
  const [unavailableDates, setUnavailableDates] = useState<BookingUnavailability[]>([]);

  // Fetch existing bookings for this car
  const { data: bookings, isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: [`/api/bookings/car/${car.id}`],
    enabled: !!car.id,
  });

  // Process bookings to get unavailable dates
  useEffect(() => {
    if (bookings && bookings.length > 0) {
      const unavailable = bookings
        .filter(booking => 
          ["confirmed", "inProgress", "completed"].includes(booking.status)
        )
        .map(booking => ({
          startDate: new Date(booking.startDate),
          endDate: new Date(booking.endDate),
        }));
      
      setUnavailableDates(unavailable);
    }
  }, [bookings]);

  // Check if a date is unavailable
  const isDateUnavailable = (date: Date) => {
    // Don't allow booking in the past
    if (isBefore(date, new Date())) {
      return true;
    }

    // Check if date falls within an existing booking
    return unavailableDates.some(period => 
      isWithinInterval(date, { 
        start: period.startDate, 
        end: period.endDate 
      })
    );
  };

  // Handle date selection
  const handleSelect = (date: Date | undefined) => {
    if (!date || !isValid(date)) return;

    // Don't allow selecting unavailable dates
    if (isDateUnavailable(date)) {
      return;
    }

    if (selectionState === "start") {
      // If end date exists and is before the new start date, reset end date
      if (selectedEndDate && isAfter(date, selectedEndDate)) {
        onSelectEndDate(new Date(0));
      }
      onSelectStartDate(date);
      setSelectionState("end");
    } else {
      // Don't allow selecting end date before start date
      if (selectedStartDate && isBefore(date, selectedStartDate)) {
        return;
      }

      // Check if there are any unavailable dates between start and end
      if (selectedStartDate) {
        const hasUnavailableDatesBetween = unavailableDates.some(period => {
          return (
            // Check if any unavailable period starts within our selected range
            (isAfter(period.startDate, selectedStartDate) && isBefore(period.startDate, date)) ||
            // Check if any unavailable period ends within our selected range
            (isAfter(period.endDate, selectedStartDate) && isBefore(period.endDate, date))
          );
        });

        if (hasUnavailableDatesBetween) {
          return;
        }
      }

      onSelectEndDate(date);
      setSelectionState("start");
    }
  };

  // Navigate between months
  const handlePreviousMonth = () => {
    setCalendarMonth(subMonths(calendarMonth, 1));
  };

  const handleNextMonth = () => {
    setCalendarMonth(addMonths(calendarMonth, 1));
  };

  // We're not using the custom day component due to type compatibility issues
  // Instead, we'll use the built-in day rendering provided by the calendar component
  
  // Helper function to determine if a date should be styled specially
  const getDayClass = (date: Date) => {
    const isUnavailable = isDateUnavailable(date);
    const isStartDate = selectedStartDate && isSameDay(date, selectedStartDate);
    const isEndDate = selectedEndDate && isSameDay(date, selectedEndDate);
    const isInRange = selectedStartDate && selectedEndDate && 
      isAfter(date, selectedStartDate) && isBefore(date, selectedEndDate);

    if (isStartDate || isEndDate) return "bg-red-50";
    if (isInRange) return "bg-red-50/30";
    if (isUnavailable) return "opacity-50";
    return "";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="h-5 w-5 text-gray-500" />
          <span className="font-medium">
            {selectionState === "start" ? "Select pickup date" : "Select return date"}
          </span>
        </div>
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePreviousMonth}
            className="h-7 w-7"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="w-32 text-center font-medium">
            {format(calendarMonth, "MMMM yyyy")}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextMonth}
            className="h-7 w-7"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {bookingsLoading ? (
        <div className="grid place-items-center h-[350px]">
          <div className="space-y-3 w-full max-w-[400px]">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-[300px] w-full" />
          </div>
        </div>
      ) : (
        <Calendar
          mode="single"
          selected={selectionState === "start" ? selectedStartDate ?? undefined : selectedEndDate ?? undefined}
          onSelect={handleSelect}
          month={calendarMonth}
          onMonthChange={setCalendarMonth}
          className="border rounded-md p-3"
          modifiersClassNames={{
            selected: "bg-red-50",
            today: "bg-orange-50",
          }}
          modifiers={{
            unavailable: isDateUnavailable,
          }}
          disabled={isDateUnavailable}
          fromDate={new Date()}
        />
      )}

      <div className="flex flex-col space-y-3 pt-2">
        <div className="flex items-center space-x-4">
          <div className="h-4 w-4 bg-red-50 rounded-sm" />
          <span className="text-sm">Selected dates</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="h-4 w-4 bg-red-50/30 rounded-sm" />
          <span className="text-sm">Nights between selection</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="h-4 w-4 opacity-50 bg-gray-200 rounded-sm" />
          <span className="text-sm">Unavailable dates</span>
        </div>
      </div>

      {selectedStartDate && selectedEndDate && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-gray-500">Pickup</div>
              <div className="font-medium">
                {format(selectedStartDate, "EEE, MMM d")}
              </div>
            </div>
            <div className="text-gray-400">→</div>
            <div>
              <div className="text-sm text-gray-500">Return</div>
              <div className="font-medium">
                {format(selectedEndDate, "EEE, MMM d")}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}