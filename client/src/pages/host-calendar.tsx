import { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function HostCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // Sample booking data for the calendar
  const bookings = [
    {
      id: 1,
      startDate: new Date(2025, 2, 15),
      endDate: new Date(2025, 2, 18),
      carId: 101,
      carName: "Tesla Model 3",
      guestName: "John Smith",
      status: "confirmed",
    },
    {
      id: 2,
      startDate: new Date(2025, 2, 20),
      endDate: new Date(2025, 2, 23),
      carId: 102,
      carName: "BMW X5",
      guestName: "Emma Johnson",
      status: "pending",
    },
    {
      id: 3,
      startDate: new Date(2025, 2, 25),
      endDate: new Date(2025, 2, 28),
      carId: 101,
      carName: "Tesla Model 3",
      guestName: "Michael Brown",
      status: "confirmed",
    },
  ];
  
  // Filter bookings for the selected date
  const selectedDateBookings = bookings.filter(booking => {
    if (!date) return false;
    const bookingStart = booking.startDate;
    const bookingEnd = booking.endDate;
    return date >= bookingStart && date <= bookingEnd;
  });
  
  // Function to highlight dates with bookings
  const isDayWithBooking = (day: Date) => {
    return bookings.some(booking => {
      const bookingStart = booking.startDate;
      const bookingEnd = booking.endDate;
      return day >= bookingStart && day <= bookingEnd;
    });
  };

  return (
    <AppLayout title="Calendar">
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="calendar" className="space-y-4">
            <div className="flex justify-center mb-6">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
                modifiers={{
                  booked: (date) => isDayWithBooking(date),
                }}
                modifiersStyles={{
                  booked: {
                    fontWeight: "bold",
                    backgroundColor: "rgba(var(--primary), 0.1)",
                    color: "hsl(var(--primary))",
                  },
                }}
              />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">
                {date ? date.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                }) : "Select a date"}
              </h3>
              
              {selectedDateBookings.length > 0 ? (
                <div className="space-y-4">
                  {selectedDateBookings.map(booking => (
                    <Card key={booking.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base">{booking.carName}</CardTitle>
                          <Badge 
                            variant={booking.status === "confirmed" ? "default" : "outline"}
                          >
                            {booking.status}
                          </Badge>
                        </div>
                        <CardDescription>{booking.guestName}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center text-sm">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          <span>
                            {booking.startDate.toLocaleDateString()} - {booking.endDate.toLocaleDateString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center p-6 bg-muted rounded-lg">
                  <p className="text-muted-foreground">No bookings for this date</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="bookings">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button className="py-2 px-4 rounded bg-primary text-primary-foreground">
                  Upcoming
                </button>
                <button className="py-2 px-4 rounded bg-muted text-muted-foreground">
                  Past
                </button>
              </div>
              
              {bookings.map(booking => (
                <Card key={booking.id} className="mb-4">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base">{booking.carName}</CardTitle>
                      <Badge 
                        variant={booking.status === "confirmed" ? "default" : "outline"}
                      >
                        {booking.status}
                      </Badge>
                    </div>
                    <CardDescription>{booking.guestName}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm mb-2">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      <span>
                        {booking.startDate.toLocaleDateString()} - {booking.endDate.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex space-x-2 mt-2">
                      <button className="text-xs py-1 px-3 bg-primary text-primary-foreground rounded-full">
                        Message
                      </button>
                      <button className="text-xs py-1 px-3 bg-muted text-muted-foreground rounded-full">
                        View Details
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}