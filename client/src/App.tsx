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
import Profile from "@/pages/profile";
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

// Import loading screen
import { LoadingScreen } from "@/components/ui/loading-screen";

// Car listing flow pages
import BecomeHost from "@/pages/become-host";

// New Airbnb-style listing flow
const CarTypePage = React.lazy(() => import("@/pages/become-host/car-type"));
const CarDetailsPage = React.lazy(() => import("@/pages/become-host/car-details"));
const CarLocationPage = React.lazy(() => import("@/pages/become-host/car-location"));
const CarRatesPage = React.lazy(() => import("@/pages/become-host/car-rates"));
const CarSummaryPage = React.lazy(() => import("@/pages/become-host/car-summary"));

// Host dashboard
import HostDashboard from "@/pages/host-dashboard";

// Lazy-loaded host components
const HostCalendar = React.lazy(() => import("@/pages/host-calendar"));
const HostListings = React.lazy(() => import("@/pages/host-listings"));
const HostMessages = React.lazy(() => import("@/pages/host-messages"));
const HostMenu = React.lazy(() => import("@/pages/host-menu"));
const Menu = React.lazy(() => import("@/pages/menu"));

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
      <ProtectedRoute 
        path="/menu" 
        component={() => (
          <Suspense fallback={<LoadingScreen message="Loading menu..." />}>
            <Menu />
          </Suspense>
        )} 
      />
      <ProtectedRoute path="/account" component={Account} />
      <ProtectedRoute path="/profile" component={Profile} />
      <ProtectedRoute path="/account-preferences" component={AccountPreferences} />
      <ProtectedRoute path="/payment-methods" component={PaymentMethods} />
      <ProtectedRoute path="/privacy-security" component={PrivacySecurity} />
      <ProtectedRoute path="/booking-confirm/:id" component={BookingConfirm} />
      <ProtectedRoute path="/add-phone" component={AddPhone} />
      <ProtectedRoute path="/add-profile-picture" component={AddProfilePicture} />
      <ProtectedRoute path="/booking-success" component={BookingSuccess} />
      
      {/* Car listing flow */}
      <ProtectedRoute path="/become-host" component={BecomeHost} />
      
      {/* New Airbnb-style listing flow */}
      <ProtectedRoute 
        path="/become-host/car-type" 
        component={() => (
          <Suspense fallback={<LoadingScreen message="Loading car types..." />}>
            <CarTypePage />
          </Suspense>
        )} 
      />
      <ProtectedRoute 
        path="/become-host/car-details" 
        component={() => (
          <Suspense fallback={<LoadingScreen message="Loading form..." />}>
            <CarDetailsPage />
          </Suspense>
        )} 
      />
      <ProtectedRoute 
        path="/become-host/car-location" 
        component={() => (
          <Suspense fallback={<LoadingScreen message="Preparing map..." />}>
            <CarLocationPage />
          </Suspense>
        )} 
      />
      <ProtectedRoute 
        path="/become-host/car-rates" 
        component={() => (
          <Suspense fallback={<LoadingScreen message="Loading pricing options..." />}>
            <CarRatesPage />
          </Suspense>
        )} 
      />
      <ProtectedRoute 
        path="/become-host/car-summary" 
        component={() => (
          <Suspense fallback={<LoadingScreen message="Preparing summary..." />}>
            <CarSummaryPage />
          </Suspense>
        )} 
      />
      
      {/* Host dashboard and related pages */}
      <ProtectedRoute path="/host-dashboard" component={HostDashboard} />
      <ProtectedRoute 
        path="/host-calendar" 
        component={() => (
          <Suspense fallback={<LoadingScreen message="Loading calendar..." />}>
            <HostCalendar />
          </Suspense>
        )} 
      />
      <ProtectedRoute 
        path="/host-listings" 
        component={() => (
          <Suspense fallback={<LoadingScreen message="Loading your listings..." />}>
            <HostListings />
          </Suspense>
        )} 
      />
      <ProtectedRoute 
        path="/host-messages" 
        component={() => (
          <Suspense fallback={<LoadingScreen message="Loading messages..." />}>
            <HostMessages />
          </Suspense>
        )} 
      />
      <ProtectedRoute 
        path="/host-menu" 
        component={() => (
          <Suspense fallback={<LoadingScreen message="Loading menu..." />}>
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
