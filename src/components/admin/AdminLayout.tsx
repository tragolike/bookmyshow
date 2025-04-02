
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  FilmIcon, 
  Users, 
  Ticket, 
  BarChart4, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string; // Make subtitle optional
}

const AdminLayout = ({ children, title, subtitle }: AdminLayoutProps) => {
  const { signOut, isAdmin, isLoading, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const navItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', path: '/admin' },
    { icon: <FilmIcon className="w-5 h-5" />, label: 'Events & Movies', path: '/admin/events' },
    { icon: <Users className="w-5 h-5" />, label: 'Users', path: '/admin/users' },
    { icon: <Ticket className="w-5 h-5" />, label: 'Bookings', path: '/admin/bookings' },
    { icon: <BarChart4 className="w-5 h-5" />, label: 'Reports', path: '/admin/reports' },
    { icon: <Settings className="w-5 h-5" />, label: 'Settings', path: '/admin/settings' },
  ];
  
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  // Check if user is admin and redirect if not
  useEffect(() => {
    if (!isLoading && user) {
      if (!isAdmin) {
        console.log('User is not an admin, redirecting to home');
        toast.error('You do not have permission to access the admin panel');
        navigate('/');
      } else {
        console.log('User is admin, access granted');
      }
    } else if (!isLoading && !user) {
      console.log('User is not logged in, redirecting to login');
      toast.error('Please login to access the admin panel');
      navigate('/admin/login');
    }
  }, [isLoading, user, isAdmin, navigate]);
  
  // Show loading while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-book-primary" />
          <h2 className="mt-4 text-xl font-semibold">Loading admin panel...</h2>
        </div>
      </div>
    );
  }
  
  // If not admin and not loading, don't render the admin layout
  if (!isAdmin && !isLoading) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Mobile Header */}
      <header className="bg-white border-b py-4 px-4 md:hidden">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="text-lg font-bold text-book-primary">ShowTix Admin</div>
          
          <div className="w-10 h-10 rounded-full bg-gray-200"></div>
        </div>
      </header>
      
      {/* Sidebar (Mobile) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)}></div>
          
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="text-xl font-bold text-book-primary">ShowTix Admin</div>
              
              <button 
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-md text-gray-500 hover:bg-gray-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="py-4">
              <div className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Menu
              </div>
              
              <nav className="space-y-1 px-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-2 py-2 text-sm rounded-md ${
                      location.pathname === item.path
                        ? 'bg-book-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </nav>
              
              <div className="mt-6 px-4">
                <button
                  onClick={handleSignOut}
                  className="flex items-center px-2 py-2 text-sm rounded-md text-red-600 hover:bg-red-50 w-full"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Desktop Layout */}
      <div className="flex-1 flex">
        {/* Sidebar (Desktop) */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64 bg-white shadow-md">
            <div className="flex-1 flex flex-col pt-5 pb-4">
              <div className="flex items-center flex-shrink-0 px-4">
                <div className="text-xl font-bold text-book-primary">ShowTix Admin</div>
              </div>
              
              <div className="mt-6 flex-1 px-4">
                <nav className="space-y-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center px-2 py-2 text-sm rounded-md ${
                        location.pathname === item.path
                          ? 'bg-book-primary text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
              
              <div className="mt-auto px-4 pb-4">
                <button
                  onClick={handleSignOut}
                  className="flex items-center px-2 py-2 text-sm rounded-md text-red-600 hover:bg-red-50 w-full"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <div className="px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">{title}</h1>
              {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
            </div>
            
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
