
import AdminLayout from '@/components/admin/AdminLayout';
import PaymentSettings from '@/components/admin/PaymentSettings';
import SystemSettings from '@/components/admin/SystemSettings';
import NotificationSettings from '@/components/admin/NotificationSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Settings = () => {
  return (
    <AdminLayout title="Settings">
      <Tabs defaultValue="payment" className="space-y-6">
        <TabsList>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="payment" className="space-y-6">
          <PaymentSettings />
        </TabsContent>
        
        <TabsContent value="system">
          <SystemSettings />
        </TabsContent>
        
        <TabsContent value="notifications">
          <NotificationSettings />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}

export default Settings;
