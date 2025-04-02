
import { useState } from 'react';
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

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('branding');

  return (
    <AdminLayout title="Settings">
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="w-full sm:w-auto bg-transparent p-0 mb-4">
          <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground overflow-auto sm:overflow-visible">
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
