
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarGroup, 
  SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, 
  SidebarMenuButton, useSidebar 
} from '@/components/ui/sidebar';
import { 
  Home, ShoppingCart, Users, BarChart3, Settings, LogOut, Layers, Ticket,
  Tag, Gift, CalendarCheck, Lightbulb, Database, Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';

const AdminSidebar = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const { collapsed, setCollapsed } = useSidebar();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const isActive = (path: string) => location.pathname === path;
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };
  
  // Close sidebar on mobile when navigating
  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) {
      setCollapsed(true);
    }
  };
  
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          {!collapsed && (
            <span className="font-bold text-xl">ShowTix Admin</span>
          )}
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  active={isActive('/admin')}
                  onClick={() => handleNavigate('/admin')}
                >
                  <Home className="h-4 w-4" />
                  {!collapsed && <span>Dashboard</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton
                  active={isActive('/admin/events')}
                  onClick={() => handleNavigate('/admin/events')}
                >
                  <Ticket className="h-4 w-4" />
                  {!collapsed && <span>Events</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton
                  active={isActive('/admin/bookings')}
                  onClick={() => handleNavigate('/admin/bookings')}
                >
                  <ShoppingCart className="h-4 w-4" />
                  {!collapsed && <span>Bookings</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton
                  active={isActive('/admin/users')}
                  onClick={() => handleNavigate('/admin/users')}
                >
                  <Users className="h-4 w-4" />
                  {!collapsed && <span>Users</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton
                  active={isActive('/admin/reports')}
                  onClick={() => handleNavigate('/admin/reports')}
                >
                  <BarChart3 className="h-4 w-4" />
                  {!collapsed && <span>Reports</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Configuration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  active={isActive('/admin/settings')}
                  onClick={() => handleNavigate('/admin/settings')}
                >
                  <Settings className="h-4 w-4" />
                  {!collapsed && <span>Settings</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Marketing</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  active={location.pathname === '/admin/settings' && location.hash === '#special-offers'}
                  onClick={() => handleNavigate('/admin/settings#special-offers')}
                >
                  <Gift className="h-4 w-4" />
                  {!collapsed && <span>Special Offers</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton
                  active={location.pathname === '/admin/settings' && location.hash === '#weekly-events'}
                  onClick={() => handleNavigate('/admin/settings#weekly-events')}
                >
                  <CalendarCheck className="h-4 w-4" />
                  {!collapsed && <span>Weekly Events</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton
                  active={location.pathname === '/admin/settings' && location.hash === '#recommendations'}
                  onClick={() => handleNavigate('/admin/settings#recommendations')}
                >
                  <Lightbulb className="h-4 w-4" />
                  {!collapsed && <span>Recommendations</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <div className="flex items-center justify-between">
          {!collapsed ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email || 'User'} />
                <AvatarFallback>
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user?.email}</span>
                <span className="text-xs text-muted-foreground">Admin</span>
              </div>
            </div>
          ) : (
            <Avatar className="h-9 w-9">
              <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email || 'User'} />
              <AvatarFallback>
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          )}
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleSignOut}
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
