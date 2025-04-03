
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BrandingSettings from '@/components/admin/BrandingSettings';
import PaymentSettings from '@/components/admin/PaymentSettings';
import TicketTypeManager from '@/components/admin/TicketTypeManager';
import NotificationSettings from '@/components/admin/NotificationSettings';
import SystemSettings from '@/components/admin/SystemSettings';
import SeatCategoryManager from '@/components/admin/SeatCategoryManager';
import HeroSectionSettings from '@/components/admin/HeroSectionSettings';
import HeroSliderManager from '@/components/admin/HeroSliderManager';
import SpecialOffersManager from '@/components/admin/specialOffers/SpecialOffersManager';
import WeeklyEventsManager from '@/components/admin/weeklyEvents/WeeklyEventsManager';
import { useIsMobile } from '@/hooks/use-mobile';

const AdminSettings = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Extract hash from URL for initial tab
  const hash = location.hash ? location.hash.substring(1) : '';
  const [activeTab, setActiveTab] = useState(hash || 'branding');
  
  // Update URL hash when tab changes
  useEffect(() => {
    if (activeTab) {
      navigate(`/admin/settings#${activeTab}`, { replace: true });
    }
  }, [activeTab, navigate]);
  
  // Update active tab when URL hash changes
  useEffect(() => {
    if (hash) {
      setActiveTab(hash);
    }
  }, [hash]);
  
  return (
    <AdminLayout title="Settings">
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <div className="overflow-x-auto pb-2">
          <TabsList className={`${isMobile ? 'w-auto' : 'w-full'} sm:w-auto bg-transparent p-0 mb-4`}>
            <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground overflow-x-auto">
              <TabsTrigger
                value="branding"
                className="rounded-sm data-[state=active]:bg-background data-[state=active]:text-foreground"
              >
                Branding
              </TabsTrigger>
              
              <TabsTrigger
                value="hero"
                className="rounded-sm data-[state=active]:bg-background data-[state=active]:text-foreground"
              >
                Hero Slider
              </TabsTrigger>
              
              <TabsTrigger
                value="payment"
                className="rounded-sm data-[state=active]:bg-background data-[state=active]:text-foreground"
              >
                Payment
              </TabsTrigger>
              
              <TabsTrigger
                value="seating"
                className="rounded-sm data-[state=active]:bg-background data-[state=active]:text-foreground"
              >
                Seat Categories
              </TabsTrigger>
              
              <TabsTrigger
                value="special-offers"
                className="rounded-sm data-[state=active]:bg-background data-[state=active]:text-foreground"
              >
                Special Offers
              </TabsTrigger>
              
              <TabsTrigger
                value="weekly-events"
                className="rounded-sm data-[state=active]:bg-background data-[state=active]:text-foreground"
              >
                Weekly Events
              </TabsTrigger>
              
              <TabsTrigger
                value="recommendations"
                className="rounded-sm data-[state=active]:bg-background data-[state=active]:text-foreground"
              >
                Recommendations
              </TabsTrigger>
              
              <TabsTrigger
                value="notifications"
                className="rounded-sm data-[state=active]:bg-background data-[state=active]:text-foreground"
              >
                Notifications
              </TabsTrigger>
              
              <TabsTrigger
                value="system"
                className="rounded-sm data-[state=active]:bg-background data-[state=active]:text-foreground"
              >
                System
              </TabsTrigger>
            </div>
          </TabsList>
        </div>
        
        <TabsContent value="branding" className="space-y-6">
          <BrandingSettings />
        </TabsContent>
        
        <TabsContent value="hero" className="space-y-6">
          <HeroSliderManager />
        </TabsContent>
        
        <TabsContent value="payment" className="space-y-6">
          <PaymentSettings />
        </TabsContent>
        
        <TabsContent value="seating" className="space-y-6">
          <SeatCategoryManager />
        </TabsContent>
        
        <TabsContent value="special-offers" className="space-y-6">
          <SpecialOffersManager />
        </TabsContent>
        
        <TabsContent value="weekly-events" className="space-y-6">
          <WeeklyEventsManager />
        </TabsContent>
        
        <TabsContent value="recommendations" className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium mb-4">Recommended Movies & Events</h2>
            <p className="text-gray-500">Configure what content appears in the recommendations section.</p>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">This feature will be available soon</p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-6">
          <NotificationSettings />
        </TabsContent>
        
        <TabsContent value="system" className="space-y-6">
          <SystemSettings />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminSettings;
