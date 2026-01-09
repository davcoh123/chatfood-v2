import React, { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { CookieConsentProvider } from "@/contexts/CookieConsentContext";
import { CartProvider } from "@/contexts/CartContext";
import CookieManager from "@/components/cookie-consent/CookieManager";
import { DashboardLayout } from "@/components/DashboardLayout";
import Index from "./pages/Index";
import { AdminGuard } from "./components/AdminGuard";
import { MaintenanceGuard } from "./components/MaintenanceGuard";
import { RequiresPlan } from "./components/RequiresPlan";

// Lazy load all pages except the landing page for better initial load performance
const Offres = lazy(() => import("./pages/Offres"));
const Contact = lazy(() => import("./pages/Contact"));
const Demo = lazy(() => import("./pages/Demo"));
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const OrdersPage = lazy(() => import("./pages/Orders"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Revenue = lazy(() => import("./pages/analytics/Revenue"));
const AnalyticsOrders = lazy(() => import("./pages/analytics/Orders"));
const CustomerMetrics = lazy(() => import("./pages/analytics/CustomerMetrics"));
const Settings = lazy(() => import("./pages/Settings"));
const StarterPlan = lazy(() => import("./pages/StarterPlan"));
const ProPlan = lazy(() => import("./pages/ProPlan"));
const PremiumPlan = lazy(() => import("./pages/PremiumPlan"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminTickets = lazy(() => import("./pages/admin/AdminTickets"));
const AdminSecurity = lazy(() => import("./pages/admin/AdminSecurity"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminDashboards = lazy(() => import("./pages/admin/AdminDashboards"));
const AdminRestaurantSettings = lazy(() => import("./pages/admin/AdminRestaurantSettings"));
const Support = lazy(() => import("./pages/Support"));
const Catalogue = lazy(() => import("./pages/Catalogue"));
const Conversations = lazy(() => import("./pages/Conversations"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Maintenance = lazy(() => import("./pages/Maintenance"));
const Legal = lazy(() => import("./pages/Legal"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const DataDeletion = lazy(() => import("./pages/DataDeletion"));
const Cookies = lazy(() => import("./pages/Cookies"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const MagicLogin = lazy(() => import("./pages/MagicLogin"));
const RestaurantProfile = lazy(() => import("./pages/RestaurantProfile"));
const PublicProfile = lazy(() => import("./pages/PublicProfile"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderConfirmation = lazy(() => import("./pages/OrderConfirmation"));
const PaymentSettings = lazy(() => import("./pages/PaymentSettings"));
const queryClient = new QueryClient();

// Simple loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <CookieConsentProvider>
            <CartProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <CookieManager />
            <Suspense fallback={<PageLoader />}>
              <Routes>
              {/* Maintenance Page (always accessible) */}
              <Route path="/maintenance" element={<Maintenance />} />
              
              {/* Public Routes (NO Maintenance Guard - accessible even during maintenance) */}
              <Route path="/" element={<Index />} />
              <Route path="/offres" element={<Offres />} />
              <Route path="/offres/starter" element={<StarterPlan />} />
              <Route path="/offres/pro" element={<ProPlan />} />
              <Route path="/offres/premium" element={<PremiumPlan />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/demo" element={<Demo />} />
              <Route path="/login" element={<Login />} />
              <Route path="/legal" element={<Legal />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/data-deletion" element={<DataDeletion />} />
              <Route path="/cookies" element={<Cookies />} />
              <Route path="/magic-login" element={<MagicLogin />} />
              <Route path="/r/:slug" element={<RestaurantProfile />} />
              <Route path="/r/:slug/checkout" element={<Checkout />} />
              <Route path="/r/:slug/confirmation" element={<OrderConfirmation />} />
              
              {/* Protected Routes with Sidebar Layout + Maintenance Guard (ONLY here) */}
              <Route element={<MaintenanceGuard />}>
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/" element={<DashboardLayout />}>
                {/* User Routes */}
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="orders" element={<OrdersPage />} />
                  <Route path="catalogue" element={<Catalogue />} />
                  <Route path="conversations" element={<Conversations />} />
                  <Route path="support" element={<Support />} />
                  <Route path="public-profile" element={<PublicProfile />} />
                  <Route path="analytics" element={<RequiresPlan requiredPlan="pro"><Analytics /></RequiresPlan>} />
                  <Route path="analytics/revenue" element={<RequiresPlan requiredPlan="pro"><Revenue /></RequiresPlan>} />
                  <Route path="analytics/orders" element={<RequiresPlan requiredPlan="pro"><AnalyticsOrders /></RequiresPlan>} />
                  <Route path="analytics/customers" element={<RequiresPlan requiredPlan="pro"><CustomerMetrics /></RequiresPlan>} />
                  <Route path="payments" element={<PaymentSettings />} />
                  <Route path="settings" element={<Settings />} />
                  
                  {/* Admin Routes */}
                  <Route path="admin/dashboard" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
                  <Route path="admin/dashboards" element={<AdminGuard><AdminDashboards /></AdminGuard>} />
                  <Route path="admin/users" element={<AdminGuard><AdminUsers /></AdminGuard>} />
                  <Route path="admin/tickets" element={<AdminGuard><AdminTickets /></AdminGuard>} />
                  <Route path="admin/security" element={<AdminGuard><AdminSecurity /></AdminGuard>} />
                  <Route path="admin/settings" element={<AdminGuard><AdminSettings /></AdminGuard>} />
                  <Route path="admin/restaurant-settings" element={<AdminGuard><AdminRestaurantSettings /></AdminGuard>} />
                </Route>
              </Route>
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
          </BrowserRouter>
            </CartProvider>
          </CookieConsentProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
