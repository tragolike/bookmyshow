
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./contexts/AuthContext";
import { Loader2 } from "lucide-react";
import ErrorBoundary from "./components/ErrorBoundary";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Lazy load the pages for better performance
const Index = lazy(() => import("./pages/Index"));
const EventDetail = lazy(() => import("./pages/EventDetail"));
const BookingPage = lazy(() => import("./pages/BookingPage"));
const BookingConfirmation = lazy(() => import("./pages/BookingConfirmation"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage"));
const PasswordReset = lazy(() => import("./components/auth/PasswordReset"));
const ResetPasswordConfirm = lazy(() => import("./components/auth/ResetPasswordConfirm"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const MyBookings = lazy(() => import("./pages/MyBookings"));
const MoviesPage = lazy(() => import("./pages/MoviesPage"));
const LiveEventsPage = lazy(() => import("./pages/LiveEventsPage"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminEvents = lazy(() => import("./pages/admin/Events"));
const AdminUsers = lazy(() => import("./pages/admin/Users"));
const AdminBookings = lazy(() => import("./pages/admin/Bookings"));
const AdminReports = lazy(() => import("./pages/admin/Reports"));
const AdminSettings = lazy(() => import("./pages/admin/Settings"));
const AdminLoginPage = lazy(() => import("./pages/admin/LoginPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading spinner for lazy-loaded components
const PageLoader = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="flex flex-col items-center">
      <Loader2 className="w-12 h-12 animate-spin text-book-primary" />
      <p className="mt-4 text-gray-600 text-lg">Loading...</p>
    </div>
  </div>
);

// Create a wrapper component for admin routes
const AdminRoute = ({ element }: { element: React.ReactNode }) => {
  const { isAdmin, isLoading } = useAuth();
  
  // If still loading auth state, show loading spinner
  if (isLoading) {
    return <PageLoader />;
  }
  
  // If not an admin, redirect to admin login
  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }
  
  // If admin, show the requested page
  return <>{element}</>;
};

// Create a wrapper component for user routes
const UserRoute = ({ element }: { element: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  // If still loading auth state, show loading spinner
  if (isLoading) {
    return <PageLoader />;
  }
  
  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // If logged in, show the requested page
  return <>{element}</>;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <Toaster />
            <Sonner position="top-right" closeButton={true} />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* User-facing routes */}
                <Route path="/" element={<Index />} />
                <Route path="/events/:id" element={<EventDetail />} />
                <Route path="/events/:id/booking" element={<UserRoute element={<BookingPage />} />} />
                <Route path="/booking-confirmation" element={<UserRoute element={<BookingConfirmation />} />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/password-reset" element={<PasswordReset />} />
                <Route path="/reset-password-confirm" element={<ResetPasswordConfirm />} />
                <Route path="/profile" element={<UserRoute element={<ProfilePage />} />} />
                <Route path="/my-bookings" element={<UserRoute element={<MyBookings />} />} />
                <Route path="/movies" element={<MoviesPage />} />
                <Route path="/live-events" element={<LiveEventsPage />} />
                
                {/* Admin login route */}
                <Route path="/admin/login" element={<AdminLoginPage />} />
                
                {/* Admin routes */}
                <Route path="/admin" element={<AdminRoute element={<AdminDashboard />} />} />
                <Route path="/admin/events" element={<AdminRoute element={<AdminEvents />} />} />
                <Route path="/admin/users" element={<AdminRoute element={<AdminUsers />} />} />
                <Route path="/admin/bookings" element={<AdminRoute element={<AdminBookings />} />} />
                <Route path="/admin/reports" element={<AdminRoute element={<AdminReports />} />} />
                <Route path="/admin/settings" element={<AdminRoute element={<AdminSettings />} />} />
                
                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
