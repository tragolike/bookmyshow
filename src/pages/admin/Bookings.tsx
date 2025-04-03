
import { useState } from 'react';
import AdminLayout from "@/components/admin/AdminLayout";
import PendingPayments from "@/components/admin/PendingPayments";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, CheckCircle, XCircle, FileText } from 'lucide-react';

const AdminBookingsPage = () => {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <AdminLayout title="Bookings">
      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-8 w-full max-w-full overflow-x-auto justify-start">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>All Bookings</span>
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Pending Payments</span>
          </TabsTrigger>
          <TabsTrigger value="confirmed" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            <span>Confirmed</span>
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            <span>Cancelled</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
            <h3 className="text-lg font-medium mb-2">All Bookings</h3>
            <p className="text-gray-500">This tab would display all bookings from the system</p>
          </div>
        </TabsContent>
        
        <TabsContent value="pending" className="space-y-4">
          <PendingPayments />
        </TabsContent>
        
        <TabsContent value="confirmed" className="space-y-4">
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
            <h3 className="text-lg font-medium mb-2">Confirmed Bookings</h3>
            <p className="text-gray-500">This tab would display all confirmed bookings</p>
          </div>
        </TabsContent>
        
        <TabsContent value="cancelled" className="space-y-4">
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
            <h3 className="text-lg font-medium mb-2">Cancelled Bookings</h3>
            <p className="text-gray-500">This tab would display all cancelled bookings</p>
          </div>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminBookingsPage;
