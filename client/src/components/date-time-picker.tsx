import React, { useState } from "react";
import { format, addHours, set } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DateTimePickerProps {
  date: Date;
  setDate: (date: Date) => void;
  label?: string;
  error?: string;
  showTime?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

export function DateTimePicker({
  date,
  setDate,
  label = "Select date",
  error,
  showTime = true,
  minDate,
  maxDate,
}: DateTimePickerProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Generate time options from 6:00 to 22:00 in 30-minute intervals
  const timeOptions = Array.from({ length: 33 }, (_, i) => {
    const time = set(new Date(), { 
      hours: 6 + Math.floor(i / 2), 
      minutes: (i % 2) * 30,
      seconds: 0,
      milliseconds: 0 
    });
    return {
      value: format(time, "HH:mm"),
      label: format(time, "h:mm aa"),
    };
  });

  const handleTimeChange = (value: string) => {
    const [hours, minutes] = value.split(":").map(Number);
    
    const newDate = set(date, {
      hours,
      minutes,
      seconds: 0,
      milliseconds: 0,
    });
    
    setDate(newDate);
  };

  return (
    <div className="space-y-2">
      {label && <div className="text-sm font-medium text-gray-700">{label}</div>}
      <div className="flex flex-col sm:flex-row gap-2">
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground",
                error && "border-red-500"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => {
                if (date) {
                  // Preserve time when setting new date
                  const newDate = set(date, {
                    hours: date.getHours(),
                    minutes: date.getMinutes(),
                  });
                  setDate(newDate);
                  setIsCalendarOpen(false);
                }
              }}
              disabled={(date) => {
                if (minDate && date < minDate) return true;
                if (maxDate && date > maxDate) return true;
                return false;
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {showTime && (
          <Select
            value={format(date, "HH:mm")}
            onValueChange={handleTimeChange}
          >
            <SelectTrigger 
              className={cn(
                "w-full sm:w-[140px]",
                error && "border-red-500"
              )}
            >
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Select time" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <div className="max-h-[200px] overflow-y-auto">
                {timeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </div>
            </SelectContent>
          </Select>
        )}
      </div>
      {error && (
        <div className="text-sm text-red-500">{error}</div>
      )}
    </div>
  );
}