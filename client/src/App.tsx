import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { HostModeProvider } from "@/hooks/use-host-mode";
import { ProtectedRoute } from "@/components/protected-route";
import React, { Suspense } from "react";

// Import pages
import Home from "@/pages/home";
import Favorites from "@/pages/favorites";
import Bookings from "@/pages/bookings";
import BookingDetail from "@/pages/booking-detail";
import Messages from "@/pages/messages";
import MessagesNew from "@/pages/messages-new";
import MessagesEmpty from "@/pages/messages-empty";
import MessagesSearch from "@/pages/messages-search";
import MessageDetail from "@/pages/message-detail";
import MessageProfile from "@/pages/message-profile";
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
import AnimationDemo from "@/pages/animation-demo";

// Car listing flow pages
import BecomeHost from "@/pages/become-host";
import BecomeHostCarDetails from "@/pages/become-host-car-details";
import BecomeHostLocation from "@/pages/become-host-location";
import BecomeHostRates from "@/pages/become-host-rates";
import BecomeHostSummary from "@/pages/become-host-summary";

// Host dashboard
import HostDashboard from "@/pages/host-dashboard";

// Lazy-loaded host components
const HostCalendar = React.lazy(() => import("@/pages/host-calendar"));
const HostListings = React.lazy(() => import("@/pages/host-listings"));
const HostMessages = React.lazy(() => import("@/pages/host-messages"));
const HostMenu = React.lazy(() => import("@/pages/host-menu"));

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/cars/:id" component={CarDetail} />
      <Route path="/animation-demo" component={AnimationDemo} />
      
      {/* Protected routes */}
      <ProtectedRoute path="/favorites" component={Favorites} />
      <ProtectedRoute path="/bookings" component={Bookings} />
      <ProtectedRoute path="/bookings/:id" component={BookingDetail} />
      
      {/* Message routes - specific routes first */}
      <ProtectedRoute path="/messages/profile/:userId" component={MessageProfile} />
      <ProtectedRoute path="/messages/:userId" component={MessageDetail} />
      <ProtectedRoute path="/messages-new" component={MessagesNew} />
      <ProtectedRoute path="/messages-empty" component={MessagesEmpty} />
      <ProtectedRoute path="/messages-search" component={MessagesSearch} />
      <ProtectedRoute path="/messages" component={Messages} />
      <ProtectedRoute path="/account" component={Account} />
      <ProtectedRoute path="/account-preferences" component={AccountPreferences} />
      <ProtectedRoute path="/payment-methods" component={PaymentMethods} />
      <ProtectedRoute path="/privacy-security" component={PrivacySecurity} />
      <ProtectedRoute path="/booking-confirm/:id" component={BookingConfirm} />
      <ProtectedRoute path="/add-phone" component={AddPhone} />
      <ProtectedRoute path="/add-profile-picture" component={AddProfilePicture} />
      <ProtectedRoute path="/booking-success" component={BookingSuccess} />
      
      {/* Car listing flow */}
      <ProtectedRoute path="/become-host" component={BecomeHost} />
      <ProtectedRoute path="/become-host/car-details" component={BecomeHostCarDetails} />
      <ProtectedRoute path="/become-host/location" component={BecomeHostLocation} />
      <ProtectedRoute path="/become-host/rates" component={BecomeHostRates} />
      <ProtectedRoute path="/become-host/summary" component={BecomeHostSummary} />
      
      {/* Host dashboard and related pages */}
      <ProtectedRoute path="/host-dashboard" component={HostDashboard} />
      <ProtectedRoute 
        path="/host-calendar" 
        component={() => (
          <Suspense fallback={<div>Loading...</div>}>
            <HostCalendar />
          </Suspense>
        )} 
      />
      <ProtectedRoute 
        path="/host-listings" 
        component={() => (
          <Suspense fallback={<div>Loading...</div>}>
            <HostListings />
          </Suspense>
        )} 
      />
      <ProtectedRoute 
        path="/host-messages" 
        component={() => (
          <Suspense fallback={<div>Loading...</div>}>
            <HostMessages />
          </Suspense>
        )} 
      />
      <ProtectedRoute 
        path="/host-menu" 
        component={() => (
          <Suspense fallback={<div>Loading...</div>}>
            <HostMenu />
          </Suspense>
        )} 
      />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <HostModeProvider>
          <Router />
          <Toaster />
        </HostModeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
