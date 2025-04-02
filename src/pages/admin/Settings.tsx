
import AdminLayout from '@/components/admin/AdminLayout';
import PaymentSettings from '@/components/admin/PaymentSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 text-amber-700">
            System settings will be available in a future update.
          </div>
        </TabsContent>
        
        <TabsContent value="notifications">
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 text-amber-700">
            Notification settings will be available in a future update.
          </div>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}

export default Settings;
