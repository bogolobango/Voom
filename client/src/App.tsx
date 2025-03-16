import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";

// Import pages
import Home from "@/pages/home";
import Favorites from "@/pages/favorites";
import Bookings from "@/pages/bookings";
import Messages from "@/pages/messages";
import Account from "@/pages/account";
import CarDetail from "@/pages/car-detail";
import BookingConfirm from "@/pages/booking-confirm";
import AddPhone from "@/pages/add-phone";
import AddProfilePicture from "@/pages/add-profile-picture";
import AuthCode from "@/pages/auth-code";
import BookingSuccess from "@/pages/booking-success";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/favorites" component={Favorites} />
      <Route path="/bookings" component={Bookings} />
      <Route path="/messages" component={Messages} />
      <Route path="/account" component={Account} />
      <Route path="/cars/:id" component={CarDetail} />
      <Route path="/booking-confirm/:id" component={BookingConfirm} />
      <Route path="/add-phone" component={AddPhone} />
      <Route path="/add-profile-picture" component={AddProfilePicture} />
      <Route path="/auth-code" component={AuthCode} />
      <Route path="/booking-success" component={BookingSuccess} />
      <Route path="/login" component={Login} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
