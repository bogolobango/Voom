import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { CarCard } from "@/components/car-card";
import { CarCategories } from "@/components/car-categories";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Car } from "@shared/schema";
import { Search, MapPin, Calendar as CalendarIcon, Shield, Gift, Car as CarIcon, Hotel, Star, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { CarGridSkeleton } from "@/components/ui/car-skeleton";
import { motion, AnimatePresence, stagger } from "framer-motion";

export default function Home() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("Kotoka International Airport, Accra");
  const [checkInDate, setCheckInDate] = useState<Date | undefined>(undefined);
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>(undefined);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const { data: cars, isLoading } = useQuery<Car[]>({
    queryKey: ["/api/cars"],
  });

  const { data: favorites } = useQuery<number[]>({
    queryKey: ["/api/favorites/ids"],
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Searching for cars",
      description: `Showing available cars in ${selectedLocation}`,
    });
  };

  // Filter luxury cars for featured section
  const luxuryCars = cars?.filter(car => car.type === "Luxury").slice(0, 4);
  
  // Filter economy cars for budget section
  const economyCars = cars?.filter(car => 
    car.type === "Sedan" || car.type === "Compact"
  ).slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
                   className="w-8 h-8 text-red-500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 9.2C19 6.4 16.4 4 13.2 4c-3.2 0-5.9 2.4-5.9 5.2 0 2.1.8 3.9 2.1 5.4.8.9 1.6 1.8 2.8 3 .6.7 1.2 1.3 1.9 2.1.7-.7 1.4-1.4 2-2.1 1.1-1.2 2-2 2.8-3 1.3-1.5 2.1-3.3 2.1-5.4z" />
              </svg>
              <span className="text-xl font-bold text-red-500 ml-2">voom</span>
            </div>
          </Link>
          
          <div className="flex items-center gap-4">
            {!user ? (
              <>
                <Link href="/auth">
                  <Button variant="outline" size="sm" className="hidden md:flex">Sign up</Button>
                </Link>
                <Link href="/auth">
                  <Button size="sm">Log in</Button>
                </Link>
              </>
            ) : (
              <Link href="/menu">
                <Button variant="outline" size="sm" className="flex items-center gap-2 border border-gray-300 rounded-full py-1.5 pl-1.5 pr-3">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span>Menu</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <main className="flex-grow">
        {/* List a New Car Banner - Prominently displayed at top */}
        {user && (
          <motion.div 
            className="bg-gradient-to-r from-red-500 to-red-600 py-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
              <motion.div 
                className="text-white mb-3 md:mb-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <h2 className="text-xl font-semibold mb-1">Have a car? Earn money by sharing it!</h2>
                <p className="text-white/90">Join thousands of hosts making extra income on Voom</p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <Button 
                  onClick={() => navigate("/become-host")} 
                  className="bg-white text-red-600 hover:bg-gray-100 font-semibold"
                  size="lg"
                >
                  List a New Car
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
        
        {/* Hero Section with Check-in Form FIRST */}
        <div className="relative bg-gray-100 overflow-hidden">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0">
            <img 
              src="/images/IMG_0096.jpeg" 
              alt="Luxury car background" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30 backdrop-blur-[2px]"></div>
          </div>
          
          <div className="container mx-auto px-4 md:px-8 py-10 md:py-20 relative z-10">
            <motion.div 
              className="max-w-lg bg-white/95 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/10"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <motion.h1 
                className="text-3xl font-bold mb-2 text-gray-900"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                Premium cars available in Accra
              </motion.h1>
              <motion.p 
                className="text-gray-700 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                Discover luxury and comfort for your next adventure with Voom's top-rated car rentals.
              </motion.p>

              <form onSubmit={handleSearchSubmit} className="space-y-4">
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <label className="text-sm font-medium">LOCATION</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" size={18} />
                    <Select
                      value={selectedLocation}
                      onValueChange={(value) => setSelectedLocation(value)}
                    >
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Select an airport" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Kotoka International Airport, Accra">Kotoka International Airport, Accra</SelectItem>
                        <SelectItem value="Tamale Airport, Tamale">Tamale Airport, Tamale</SelectItem>
                        <SelectItem value="Kumasi Airport, Kumasi">Kumasi Airport, Kumasi</SelectItem>
                        <SelectItem value="Takoradi Airport, Sekondi-Takoradi">Takoradi Airport, Sekondi-Takoradi</SelectItem>
                        <SelectItem value="Ho Airport, Ho">Ho Airport, Ho</SelectItem>
                        <SelectItem value="Wa Airport, Wa">Wa Airport, Wa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </motion.div>

                <motion.div 
                  className="grid grid-cols-2 gap-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium">CHECK IN</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {checkInDate ? format(checkInDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={checkInDate}
                          onSelect={setCheckInDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">CHECK OUT</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {checkOutDate ? format(checkOutDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={checkOutDate}
                          onSelect={setCheckOutDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </motion.div>

                <motion.div 
                  className="grid grid-cols-2 gap-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium">ADULTS</label>
                    <Select defaultValue={adults.toString()} onValueChange={(val) => setAdults(parseInt(val))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Number of adults" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6].map(num => (
                          <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">CHILDREN</label>
                    <Select defaultValue={children.toString()} onValueChange={(val) => setChildren(parseInt(val))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Number of children" />
                      </SelectTrigger>
                      <SelectContent>
                        {[0, 1, 2, 3, 4, 5, 6].map(num => (
                          <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.5 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white">
                    Search
                  </Button>
                </motion.div>
              </form>
            </motion.div>
          </div>
          {/* Desktop image removed as we now have a full-width background image */}
        </div>

        {/* Category Selection SECOND */}
        <div className="container mx-auto px-4 py-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Browse by category</h2>
              <Link href="/all-cars">
                <Button variant="link" className="text-red-500 font-semibold">
                  See all cars <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
            <CarCategories 
              onCategorySelect={(category) => navigate(`/category/${category}`)}
              selectedCategory={null}
            />
          </div>
        </div>

        {/* Featured Luxury Cars THIRD */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold">Premium vehicles with amenities</h2>
              <p className="text-gray-600">Find luxury cars complete with top features and driver services.</p>
            </div>
            <Button variant="outline" onClick={() => navigate('/category/luxury')} className="hidden md:flex items-center">
              Explore more <ChevronRight size={16} />
            </Button>
          </div>

          {isLoading ? (
            <CarGridSkeleton count={4} />
          ) : luxuryCars && luxuryCars.length > 0 ? (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1
                  }
                },
                hidden: {}
              }}
            >
              {luxuryCars.map((car) => (
                <motion.div 
                  key={car.id} 
                  className="rounded-lg overflow-hidden border border-gray-200 cursor-pointer"
                  variants={{
                    visible: { 
                      opacity: 1, 
                      y: 0,
                      transition: { duration: 0.5 }
                    },
                    hidden: { 
                      opacity: 0, 
                      y: 30
                    }
                  }}
                  whileHover={{ 
                    y: -8,
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                    transition: { duration: 0.2 } 
                  }}
                  onClick={() => navigate(`/cars/${car.id}`)}
                >
                  <div className="relative">
                    <img 
                      src={car.imageUrl ? `${car.imageUrl}&q=80&w=800&h=600&fit=crop&crop=entropy` : `https://placehold.co/800x600/e2e8f0/64748b?text=${car.make}+${car.model}`}
                      alt={`${car.make} ${car.model}`}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        // Fallback to a placeholder if image fails to load
                        e.currentTarget.src = `https://placehold.co/800x600/e2e8f0/64748b?text=${car.make}+${car.model}`;
                      }}
                    />
                    <Badge className="absolute top-2 left-2 bg-white text-black">Superhost</Badge>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between">
                      <h3 className="font-semibold">{car.make} {car.model}</h3>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        <span className="text-sm">{car.rating || "4.9"}</span>
                      </div>
                    </div>
                    <p className="text-gray-500 text-sm">{car.location}</p>
                    <p className="mt-2">
                      <span className="font-semibold">FCFA {car.dailyRate.toLocaleString()}</span> / day
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-xl font-semibold mb-2">No luxury cars available at the moment</h3>
              <p className="text-gray-500 mb-4">Check back soon for premium vehicles.</p>
            </motion.div>
          )}
          
          <div className="mt-4 text-center md:hidden">
            <Button variant="outline" onClick={() => navigate('/category/luxury')} className="w-full">
              Show all luxury cars
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="container mx-auto px-4 py-12">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.2
                }
              },
              hidden: {}
            }}
          >
            <motion.div 
              className="flex flex-col items-center text-center"
              variants={{
                visible: { 
                  opacity: 1, 
                  y: 0,
                  transition: { duration: 0.6 }
                },
                hidden: { opacity: 0, y: 50 }
              }}
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  delay: 0.2,
                  duration: 0.8 
                }}
              >
                <Shield className="w-12 h-12 mb-4 text-red-500" />
              </motion.div>
              <h3 className="text-lg font-semibold mb-2">Book with confidence</h3>
              <p className="text-gray-600">
                Get 24/7 support and discover helpful reviews from our trusted community of guests.
              </p>
            </motion.div>

            <motion.div 
              className="flex flex-col items-center text-center"
              variants={{
                visible: { 
                  opacity: 1, 
                  y: 0,
                  transition: { duration: 0.6 }
                },
                hidden: { opacity: 0, y: 50 }
              }}
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  delay: 0.4,
                  duration: 0.8 
                }}
              >
                <Gift className="w-12 h-12 mb-4 text-red-500" />
              </motion.div>
              <h3 className="text-lg font-semibold mb-2">Find more amenities</h3>
              <p className="text-gray-600">
                Explore cars based on the comforts you want for the perfect, dreamy getaway.
              </p>
            </motion.div>

            <motion.div 
              className="flex flex-col items-center text-center"
              variants={{
                visible: { 
                  opacity: 1, 
                  y: 0,
                  transition: { duration: 0.6 }
                },
                hidden: { opacity: 0, y: 50 }
              }}
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  delay: 0.6,
                  duration: 0.8 
                }}
              >
                <CalendarIcon className="w-12 h-12 mb-4 text-red-500" />
              </motion.div>
              <h3 className="text-lg font-semibold mb-2">Keep it flexible</h3>
              <p className="text-gray-600">
                Stays with flexible cancellation make it easy to re-book if your plans change.
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Economic Cars Section FOURTH */}
        <div className="container mx-auto px-4 py-8 mb-20">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold">Affordable rides for every budget</h2>
              <p className="text-gray-600">Discover economic vehicles perfect for daily commutes and short trips.</p>
            </div>
            <Button variant="outline" onClick={() => navigate('/category/sedan')} className="hidden md:flex items-center">
              Explore more <ChevronRight size={16} />
            </Button>
          </div>

          {isLoading ? (
            <CarGridSkeleton count={4} />
          ) : economyCars && economyCars.length > 0 ? (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1
                  }
                },
                hidden: {}
              }}
            >
              {economyCars.map((car) => (
                <motion.div 
                  key={car.id} 
                  className="rounded-lg overflow-hidden border border-gray-200 cursor-pointer"
                  variants={{
                    visible: { 
                      opacity: 1, 
                      y: 0,
                      transition: { duration: 0.5 }
                    },
                    hidden: { 
                      opacity: 0, 
                      y: 30
                    }
                  }}
                  whileHover={{ 
                    y: -8,
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                    transition: { duration: 0.2 } 
                  }}
                  onClick={() => navigate(`/cars/${car.id}`)}
                >
                  <div className="relative">
                    <img 
                      src={car.imageUrl ? `${car.imageUrl}&q=80&w=800&h=600&fit=crop&crop=entropy` : `https://placehold.co/800x600/e2e8f0/64748b?text=${car.make}+${car.model}`}
                      alt={`${car.make} ${car.model}`}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        // Fallback to a placeholder if image fails to load
                        e.currentTarget.src = `https://placehold.co/800x600/e2e8f0/64748b?text=${car.make}+${car.model}`;
                      }}
                    />
                    <Badge className="absolute top-2 left-2 bg-white text-black">Guest favorite</Badge>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between">
                      <h3 className="font-semibold">{car.make} {car.model}</h3>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        <span className="text-sm">{car.rating || "4.8"}</span>
                      </div>
                    </div>
                    <p className="text-gray-500 text-sm">{car.location}</p>
                    <p className="mt-2">
                      <span className="font-semibold">FCFA {car.dailyRate.toLocaleString()}</span> / day
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-xl font-semibold mb-2">No economy cars available at the moment</h3>
              <p className="text-gray-500 mb-4">Check back soon for economy vehicles.</p>
            </motion.div>
          )}
          
          <div className="mt-4 text-center md:hidden">
            <Button variant="outline" onClick={() => navigate('/category/sedan')} className="w-full">
              Show all economy cars
            </Button>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
