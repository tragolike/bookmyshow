
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
      navigate('/login');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  // Check if user is admin and redirect if not
  useEffect(() => {
    if (!isLoading && user) {
      if (!isAdmin) {
        toast.error('You do not have permission to access the admin panel');
        navigate('/');
      }
    } else if (!isLoading && !user) {
      toast.error('Please login to access the admin panel');
      navigate('/login');
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
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <nav className="p-4">
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link 
                      to={item.path}
                      className={`flex items-center space-x-3 p-3 rounded-md ${
                        location.pathname === item.path
                          ? 'bg-book-primary text-white'
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              
              <div className="mt-6 pt-6 border-t">
                <button 
                  onClick={handleSignOut}
                  className="flex items-center space-x-3 w-full p-3 rounded-md text-red-500 hover:bg-red-50"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}
      
      <div className="flex flex-1">
        {/* Sidebar (Desktop) */}
        <aside className="hidden md:block w-64 bg-white border-r">
          <div className="p-6 border-b">
            <h1 className="text-xl font-bold text-book-primary">ShowTix Admin</h1>
          </div>
          
          <nav className="p-4">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link 
                    to={item.path}
                    className={`flex items-center space-x-3 p-3 rounded-md ${
                      location.pathname === item.path
                        ? 'bg-book-primary text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
            
            <div className="mt-6 pt-6 border-t">
              <button 
                onClick={handleSignOut}
                className="flex items-center space-x-3 w-full p-3 rounded-md text-red-500 hover:bg-red-50"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </nav>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">{title}</h1>
            {subtitle && <p className="text-gray-500">{subtitle}</p>}
          </div>
          
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
