import React, { lazy, Suspense, Component, ErrorInfo, ReactNode } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { CookieConsentProvider } from "@/contexts/CookieConsentContext";
import { CartProvider } from "@/contexts/CartContext";
import CookieManager from "@/components/cookie-consent/CookieManager";
import { DashboardLayout } from "@/components/DashboardLayout";
import { AdminGuard } from "./components/AdminGuard";
import { MaintenanceGuard } from "./components/MaintenanceGuard";
import { RequiresPlan } from "./components/RequiresPlan";

// Error Boundary to catch React errors
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 [ErrorBoundary] Caught error:', error);
    console.error('🚨 [ErrorBoundary] Error info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Une erreur s'est produite</h1>
            <p className="text-gray-600 mb-4">
              Une erreur inattendue a empêché le chargement du dashboard.
            </p>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40 mb-4">
              {this.state.error?.message || 'Erreur inconnue'}
            </pre>
            <button 
              onClick={() => window.location.href = '/login'}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Retourner à la connexion
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Lazy load all dashboard pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const OrdersPage = lazy(() => import("./pages/Orders"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Revenue = lazy(() => import("./pages/analytics/Revenue"));
const AnalyticsOrders = lazy(() => import("./pages/analytics/Orders"));
const CustomerMetrics = lazy(() => import("./pages/analytics/CustomerMetrics"));
const Settings = lazy(() => import("./pages/Settings"));
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
const Onboarding = lazy(() => import("./pages/Onboarding"));
const PublicProfile = lazy(() => import("./pages/PublicProfile"));
const PaymentSettings = lazy(() => import("./pages/PaymentSettings"));

const queryClient = new QueryClient();

// Simple loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

const App = () => (
  <ErrorBoundary>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <CookieConsentProvider>
              <CartProvider>
                <Toaster />
                <Sonner />
                {/* Base path /app pour toutes les routes du dashboard */}
                <BrowserRouter basename="/app">
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      {/* Maintenance Page */}
                      <Route path="/maintenance" element={<Maintenance />} />
                      
                      {/* Redirect root to dashboard */}
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      
                      {/* Protected Routes with Sidebar Layout + Maintenance Guard */}
                      <Route element={<MaintenanceGuard />}>
                        <Route path="/onboarding" element={<Onboarding />} />
                        <Route element={<DashboardLayout />}>
                          {/* User Routes */}
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/orders" element={<OrdersPage />} />
                          <Route path="/catalogue" element={<Catalogue />} />
                          <Route path="/conversations" element={<Conversations />} />
                          <Route path="/support" element={<Support />} />
                          <Route path="/public-profile" element={<PublicProfile />} />
                          <Route path="/analytics" element={<RequiresPlan requiredPlan="pro"><Analytics /></RequiresPlan>} />
                          <Route path="/analytics/revenue" element={<RequiresPlan requiredPlan="pro"><Revenue /></RequiresPlan>} />
                          <Route path="/analytics/orders" element={<RequiresPlan requiredPlan="pro"><AnalyticsOrders /></RequiresPlan>} />
                          <Route path="/analytics/customers" element={<RequiresPlan requiredPlan="pro"><CustomerMetrics /></RequiresPlan>} />
                          <Route path="/payments" element={<PaymentSettings />} />
                          <Route path="/settings" element={<Settings />} />
                          
                          {/* Admin Routes */}
                          <Route path="/admin/dashboard" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
                          <Route path="/admin/dashboards" element={<AdminGuard><AdminDashboards /></AdminGuard>} />
                          <Route path="/admin/users" element={<AdminGuard><AdminUsers /></AdminGuard>} />
                          <Route path="/admin/tickets" element={<AdminGuard><AdminTickets /></AdminGuard>} />
                          <Route path="/admin/security" element={<AdminGuard><AdminSecurity /></AdminGuard>} />
                          <Route path="/admin/settings" element={<AdminGuard><AdminSettings /></AdminGuard>} />
                          <Route path="/admin/restaurant-settings" element={<AdminGuard><AdminRestaurantSettings /></AdminGuard>} />
                        </Route>
                      </Route>
                      
                      {/* Catch-all - redirect to dashboard or show not found */}
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
  </ErrorBoundary>
);

export default App;
