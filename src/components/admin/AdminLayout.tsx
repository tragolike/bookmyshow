
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';
import { SidebarProvider } from '@/components/ui/sidebar';
import AdminSidebar from './AdminSidebar';
import { useIsMobile } from '@/hooks/use-mobile';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const AdminLayout = ({ children, title = 'Dashboard' }: AdminLayoutProps) => {
  const { isAdmin, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  
  // Hash navigation for tabs
  const hash = location.hash ? location.hash.substring(1) : '';
  
  // Navigate to login if not admin
  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate('/admin/login');
    }
  }, [isAdmin, isLoading, navigate]);
  
  // Update sidebar state on mobile/desktop changes
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  return (
    <SidebarProvider defaultCollapsed={isMobile}>
      <div className="min-h-screen bg-gray-50 flex w-full">
        <AdminSidebar />
        
        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">{title}</h1>
                {location.pathname === '/admin/settings' && hash && (
                  <p className="text-gray-500">
                    {hash === 'special-offers' && 'Manage special offers and discounts'}
                    {hash === 'weekly-events' && 'Configure best events of the week'}
                    {hash === 'recommendations' && 'Setup recommended content for users'}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {/* Placeholder for header actions */}
              </div>
            </header>
            
            {children}
          </div>
        </main>
        
        <Toaster />
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
