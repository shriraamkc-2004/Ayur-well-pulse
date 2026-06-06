import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./hooks/useAuth";
import { I18nProvider } from "./context/I18nContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";

// Lazy-loaded pages for code splitting
const Auth = lazy(() => import("./pages/Auth"));
const RoleSelectionPage = lazy(() => import("./pages/RoleSelectionPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Dashboards = lazy(() => import("./pages/Dashboards"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes — avoid unnecessary refetches
      retry: 1, // Only retry once on failure
      refetchOnWindowFocus: false, // Don't refetch when tab regains focus
      gcTime: 10 * 60 * 1000, // Garbage collect after 10 minutes
    },
  },
});

const LoadingFallback = () => (
  <div className="h-screen flex items-center justify-center text-muted-foreground">
    Loading...
  </div>
);

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

const App = () => (
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <I18nProvider>
          <TooltipProvider>
            <Toaster />
            <BrowserRouter>
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/role-selection" element={<RoleSelectionPage />} />

                  <Route path="/dashboard" element={
                    <ProtectedRoute allowedRoles={["patient"]}>
                      <Dashboards type="patient" />
                    </ProtectedRoute>
                  } />
                  <Route path="/doctor-dashboard" element={
                    <ProtectedRoute allowedRoles={["doctor"]}>
                      <Dashboards type="doctor" />
                    </ProtectedRoute>
                  } />
                  <Route path="/dietitian-dashboard" element={
                    <ProtectedRoute allowedRoles={["dietitian"]}>
                      <Dashboards type="dietitian" />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin-dashboard" element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <Dashboards type="admin" />
                    </ProtectedRoute>
                  } />

                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </I18nProvider>
      </AuthProvider>
    </QueryClientProvider>
  </GoogleOAuthProvider>
);

export default App;
