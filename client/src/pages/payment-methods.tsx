import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { LoadingScreen } from "@/components/ui/loader";
import { Button } from "@/components/ui/button";
import { PlusCircle, CreditCard as CreditCardIcon, Smartphone, Trash2 } from "lucide-react";

export default function PaymentMethods() {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/users/me"],
  });

  if (isLoading) {
    return (
      <>
        <Header title="Payment Methods" showBack />
        <main className="container mx-auto px-4 py-6 mb-20">
          <LoadingScreen />
        </main>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <Header title="Payment Methods" showBack />
      <main className="container mx-auto px-4 py-6 mb-20">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Your Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg flex justify-between items-center">
                <div className="flex items-center">
                  <div className="bg-red-100 p-2 rounded-full mr-3">
                    <CreditCardIcon className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium">Card ending in 4242</p>
                    <p className="text-sm text-gray-500">Expires 12/25</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4 text-gray-500" />
                </Button>
              </div>

              <div className="p-4 border rounded-lg flex justify-between items-center">
                <div className="flex items-center">
                  <div className="bg-red-100 p-2 rounded-full mr-3">
                    <Smartphone className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium">AirTel Money</p>
                    <p className="text-sm text-gray-500">Connected to {user?.phoneNumber}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4 text-gray-500" />
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Payment Method
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex justify-between mb-2">
                  <p className="font-medium">Mitsubishi Pajero</p>
                  <p className="font-medium text-red-600">FCFA 680,000</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-gray-500">Apr 16 - Apr 24, 2024</p>
                  <p className="text-sm text-gray-500">AirTel Money</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              View All Transactions
            </Button>
          </CardFooter>
        </Card>
      </main>
      <BottomNav />
    </>
  );
}