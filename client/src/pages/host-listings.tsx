import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Car, Edit, Plus, Star } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Rating } from "@/components/ui/rating";
import { CarCardSkeleton } from "@/components/ui/car-skeleton";
import { formatCurrency } from "@/lib/utils";
import { Car as CarType } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

export default function HostListings() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const { data: cars, isLoading } = useQuery<CarType[]>({
    queryKey: ["/api/hosts/cars"],
    enabled: !!user,
  });

  const activeCars = cars?.filter(car => car.status === "active") || [];
  const pendingCars = cars?.filter(car => car.status === "pending_approval") || [];
  const inactiveCars = cars?.filter(car => car.status !== "active" && car.status !== "pending_approval") || [];
  
  const handleAddListing = () => {
    navigate("/become-host/car-type");
  };

  const handleEditListing = (id: number) => {
    navigate(`/edit-car/${id}`);
  };

  const renderCarCard = (car: CarType) => {
    // Determine if the car is pending approval
    const isPending = car.status === "pending_approval";
    
    return (
      <Card 
        key={car.id} 
        className={`overflow-hidden ${isPending ? 'opacity-70' : ''}`}
      >
        <div className="relative h-48">
          <img 
            src={car.images?.[0] || "https://source.unsplash.com/random/300x200/?car"} 
            alt={car.make + ' ' + car.model}
            className={`w-full h-full object-cover ${isPending ? 'grayscale' : ''}`}
          />
          <div className="absolute top-2 right-2">
            <Badge 
              variant={car.status === "active" ? "default" : 
                      isPending ? "outline" : "secondary"}
              className={isPending ? "bg-amber-100 text-amber-800 border-amber-300" : ""}
            >
              {car.status === "active" ? "Active" : 
               isPending ? "Pending Review" : "Inactive"}
            </Badge>
          </div>
        </div>
        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold">{car.make} {car.model}</h3>
              <p className="text-sm text-muted-foreground">{car.year}</p>
              {isPending && (
                <p className="text-xs text-amber-600 mt-1">Awaiting approval from admins</p>
              )}
            </div>
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-500 mr-1" />
              <span className="text-sm">{car.rating || "New"}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-sm mb-2">
            <span className="font-medium">{formatCurrency(car.dailyRate)}</span> / day
          </p>
          <div className="flex flex-wrap gap-1">
            {car.features?.slice(0, 3).map((feature, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {feature}
              </Badge>
            ))}
            {car.features && car.features.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{car.features.length - 3} more
              </Badge>
            )}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleEditListing(car.id)}
            className="flex items-center gap-1"
            disabled={isPending}
          >
            <Edit className="h-3 w-3" />
            Edit
          </Button>
          {!isPending ? (
            <Button 
              size="sm"
              variant="default"
              onClick={() => navigate(`/car-analytics/${car.id}`)}
            >
              View Stats
            </Button>
          ) : (
            <Button 
              size="sm"
              variant="secondary"
              disabled
              className="text-muted-foreground"
            >
              Under Review
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  };

  return (
    <AppLayout title="Your Listings">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Your Cars</h2>
          <Button 
            onClick={handleAddListing}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Add Listing
          </Button>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="active">
              Active
              {activeCars.length > 0 && (
                <Badge className="ml-2" variant="secondary">
                  {activeCars.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending
              {pendingCars.length > 0 && (
                <Badge className="ml-2" variant="secondary">
                  {pendingCars.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="inactive">
              Inactive
              {inactiveCars.length > 0 && (
                <Badge className="ml-2" variant="secondary">
                  {inactiveCars.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="active">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <CarCardSkeleton key={i} />
                ))}
              </div>
            ) : activeCars.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeCars.map(renderCarCard)}
              </div>
            ) : (
              <div className="text-center p-10 bg-muted rounded-lg">
                <Car className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No active listings</h3>
                <p className="text-muted-foreground mb-4">
                  Start earning extra income by sharing your vehicle with travelers and businesses in your city.
                  Get paid securely via Mobile Money or bank transfers.
                </p>
                <Button onClick={handleAddListing} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Your First Car
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="pending">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map(i => (
                  <CarCardSkeleton key={i} />
                ))}
              </div>
            ) : pendingCars.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingCars.map(renderCarCard)}
              </div>
            ) : (
              <div className="text-center p-10 bg-muted/50 rounded-lg border border-dashed border-amber-200">
                <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-full bg-amber-50">
                  <Car className="h-6 w-6 text-amber-500" />
                </div>
                <h3 className="text-lg font-medium mb-2">No pending listings</h3>
                <p className="text-muted-foreground mb-2">
                  Cars waiting for approval will appear here
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="inactive">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map(i => (
                  <CarCardSkeleton key={i} />
                ))}
              </div>
            ) : inactiveCars.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inactiveCars.map(renderCarCard)}
              </div>
            ) : (
              <div className="text-center p-10 bg-muted rounded-lg">
                <Car className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No inactive listings</h3>
                <p className="text-muted-foreground mb-2">
                  Deactivated or paused listings will appear here
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}