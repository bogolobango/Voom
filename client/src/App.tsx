import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/protected-route";

// Import pages
import Home from "@/pages/home";
import Favorites from "@/pages/favorites";
import Bookings from "@/pages/bookings";
import BookingDetail from "@/pages/booking-detail";
import Messages from "@/pages/messages";
import Account from "@/pages/account";
import AccountPreferences from "@/pages/account-preferences";
import PaymentMethods from "@/pages/payment-methods";
import PrivacySecurity from "@/pages/privacy-security";
import CarDetail from "@/pages/car-detail";
import BookingConfirm from "@/pages/booking-confirm";
import AddPhone from "@/pages/add-phone";
import AddProfilePicture from "@/pages/add-profile-picture";
import BookingSuccess from "@/pages/booking-success";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/cars/:id" component={CarDetail} />
      
      {/* Protected routes */}
      <ProtectedRoute path="/favorites" component={Favorites} />
      <ProtectedRoute path="/bookings" component={Bookings} />
      <ProtectedRoute path="/bookings/:id" component={BookingDetail} />
      <ProtectedRoute path="/messages" component={Messages} />
      <ProtectedRoute path="/account" component={Account} />
      <ProtectedRoute path="/account-preferences" component={AccountPreferences} />
      <ProtectedRoute path="/payment-methods" component={PaymentMethods} />
      <ProtectedRoute path="/privacy-security" component={PrivacySecurity} />
      <ProtectedRoute path="/booking-confirm/:id" component={BookingConfirm} />
      <ProtectedRoute path="/add-phone" component={AddPhone} />
      <ProtectedRoute path="/add-profile-picture" component={AddProfilePicture} />
      <ProtectedRoute path="/booking-success" component={BookingSuccess} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
