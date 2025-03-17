import React, { useState } from 'react';
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { CarLoader, CarLoadingScreen, CarButtonLoader } from "@/components/ui/car-loader";
import { CarCardSkeleton, CarDetailSkeleton, CarDrivingAnimation } from "@/components/ui/car-skeleton";
import { CarProgress } from "@/components/ui/car-progress";

// Demo steps for the progress component
const bookingSteps = [
  { id: "search", title: "Search", description: "Find your car" },
  { id: "select", title: "Select", description: "Choose dates and options" },
  { id: "verify", title: "Verify", description: "Confirm identity" },
  { id: "payment", title: "Payment", description: "Secure checkout" },
  { id: "confirm", title: "Confirm", description: "Booking complete" }
];

export default function AnimationDemo() {
  const [currentStep, setCurrentStep] = useState("search");
  const [isLoading, setIsLoading] = useState(false);
  
  const handleNextStep = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      const currentIndex = bookingSteps.findIndex(step => step.id === currentStep);
      const nextIndex = Math.min(currentIndex + 1, bookingSteps.length - 1);
      setCurrentStep(bookingSteps[nextIndex].id);
      setIsLoading(false);
    }, 1500);
  };
  
  const handlePrevStep = () => {
    const currentIndex = bookingSteps.findIndex(step => step.id === currentStep);
    const prevIndex = Math.max(currentIndex - 1, 0);
    setCurrentStep(bookingSteps[prevIndex].id);
  };
  
  const resetDemo = () => {
    setCurrentStep("search");
  };

  return (
    <>
      <Header title="Animation Components" />
      <main className="container mx-auto px-4 py-8 mb-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Voom Car-Themed UI Components</h1>
          
          <Tabs defaultValue="progress">
            <TabsList className="mb-6">
              <TabsTrigger value="progress">Progress Indicators</TabsTrigger>
              <TabsTrigger value="loaders">Loaders</TabsTrigger>
              <TabsTrigger value="skeletons">Skeletons</TabsTrigger>
            </TabsList>
            
            <TabsContent value="progress">
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Step Progress Indicator (Default)</CardTitle>
                  <CardDescription>
                    Track multi-step processes with animated car indicators
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <CarProgress 
                    steps={bookingSteps} 
                    currentStep={currentStep} 
                  />
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-6">
                  <Button 
                    variant="outline" 
                    onClick={handlePrevStep} 
                    disabled={currentStep === "search"}
                  >
                    Previous Step
                  </Button>
                  
                  <Button
                    onClick={resetDemo}
                    variant="ghost"
                  >
                    Reset
                  </Button>
                  
                  <Button 
                    onClick={handleNextStep} 
                    disabled={currentStep === "confirm" || isLoading}
                  >
                    {isLoading ? <CarButtonLoader /> : 'Next Step'}
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Road Progress Indicator</CardTitle>
                  <CardDescription>
                    Track progress with a car driving along a road
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <CarProgress 
                    steps={bookingSteps} 
                    currentStep={currentStep} 
                    variant="road"
                  />
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-6">
                  <Button 
                    variant="outline" 
                    onClick={handlePrevStep} 
                    disabled={currentStep === "search"}
                  >
                    Previous Step
                  </Button>
                  
                  <Button
                    onClick={resetDemo}
                    variant="ghost"
                  >
                    Reset
                  </Button>
                  
                  <Button 
                    onClick={handleNextStep} 
                    disabled={currentStep === "confirm" || isLoading}
                  >
                    {isLoading ? <CarButtonLoader /> : 'Next Step'}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="loaders">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Car Loader (Animated)</CardTitle>
                    <CardDescription>Default animated car loader</CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center py-10">
                    <CarLoader size="lg" text="Loading..." />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Car Loader (Simple)</CardTitle>
                    <CardDescription>Simple spinning car icon</CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center py-10">
                    <CarLoader size="lg" variant="simple" text="Processing..." />
                  </CardContent>
                </Card>
              </div>
              
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Loading Screen</CardTitle>
                  <CardDescription>Full-page loading state</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg">
                    <CarLoadingScreen message="Finding your perfect car..." />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Cars Driving Animation</CardTitle>
                  <CardDescription>Animated cars driving across screen</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-4">
                    <CarDrivingAnimation />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Button Loader</CardTitle>
                  <CardDescription>Loading state for buttons</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-4">
                  <Button disabled>
                    <CarButtonLoader />
                    <span className="ml-2">Loading...</span>
                  </Button>
                  
                  <Button variant="outline" disabled>
                    <CarButtonLoader className="text-primary" />
                    <span className="ml-2">Processing</span>
                  </Button>
                  
                  <Button variant="secondary" disabled>
                    <CarButtonLoader />
                    <span className="ml-2">Please wait</span>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="skeletons">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Car Card Skeleton</CardTitle>
                    <CardDescription>Loading state for car card</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CarCardSkeleton />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Car Grid Skeleton</CardTitle>
                    <CardDescription>Grid of skeleton cards</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 scale-[0.6] origin-top-left">
                      <CarCardSkeleton />
                      <CarCardSkeleton />
                      <CarCardSkeleton />
                      <CarCardSkeleton />
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Car Detail Skeleton</CardTitle>
                  <CardDescription>Loading state for car detail page</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="scale-75 origin-top-left">
                    <CarDetailSkeleton />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
}