
import { useState } from 'react';
import AdminLayout from "@/components/admin/AdminLayout";
import PaymentSettings from "@/components/admin/PaymentSettings";
import NotificationSettings from "@/components/admin/NotificationSettings";
import SystemSettings from "@/components/admin/SystemSettings";
import TicketTypeManager from "@/components/admin/TicketTypeManager";
import BrandingSettings from "@/components/admin/BrandingSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Bell, Settings2, Ticket, PaintBucket } from "lucide-react";

const AdminSettingsPage = () => {
  const [activeTab, setActiveTab] = useState("payment");

  return (
    <AdminLayout
      title="Settings"
      subtitle="Configure your booking platform"
    >
      <Tabs
        defaultValue="payment"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-8 w-full max-w-full overflow-x-auto justify-start">
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span>Payment</span>
          </TabsTrigger>
          <TabsTrigger value="tickets" className="flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            <span>Ticket Types</span>
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <PaintBucket className="h-4 w-4" />
            <span>Branding</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            <span>System</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payment" className="space-y-4">
          <PaymentSettings />
        </TabsContent>
        
        <TabsContent value="tickets" className="space-y-4">
          <TicketTypeManager />
        </TabsContent>
        
        <TabsContent value="branding" className="space-y-4">
          <BrandingSettings />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <NotificationSettings />
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <SystemSettings />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminSettingsPage;
