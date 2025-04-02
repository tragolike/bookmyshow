
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import EventDetail from "./pages/EventDetail";
import BookingPage from "./pages/BookingPage";
import BookingConfirmation from "./pages/BookingConfirmation";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import PasswordReset from "./components/auth/PasswordReset";
import ResetPasswordConfirm from "./components/auth/ResetPasswordConfirm";
import ProfilePage from "./pages/ProfilePage";
import MyBookings from "./pages/MyBookings";
import MoviesPage from "./pages/MoviesPage";
import LiveEventsPage from "./pages/LiveEventsPage";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminEvents from "./pages/admin/Events";
import AdminUsers from "./pages/admin/Users";
import AdminBookings from "./pages/admin/Bookings";
import AdminReports from "./pages/admin/Reports";
import AdminSettings from "./pages/admin/Settings";
import AdminLoginPage from "./pages/admin/LoginPage";
import NotFound from "./pages/NotFound";
import { useAuth } from "./contexts/AuthContext";

// Create a wrapper component for admin routes
const AdminRoute = ({ element }: { element: React.ReactNode }) => {
  const { isAdmin, isLoading } = useAuth();
  
  // If still loading auth state, show nothing yet
  if (isLoading) {
    return null;
  }
  
  // If not an admin, redirect to admin login
  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }
  
  // If admin, show the requested page
  return element;
};

// Create a wrapper component for user routes
const UserRoute = ({ element }: { element: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  // If still loading auth state, show nothing yet
  if (isLoading) {
    return null;
  }
  
  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // If logged in, show the requested page
  return element;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
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
        </AuthProvider>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
