
import { ReactNode } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QrCode, CheckCircle2 } from 'lucide-react';

interface PaymentMethodTabsProps {
  defaultValue: string;
  onValueChange: (value: string) => void;
  upiContent: ReactNode;
  manualContent: ReactNode;
}

const PaymentMethodTabs = ({
  defaultValue,
  onValueChange,
  upiContent,
  manualContent,
}: PaymentMethodTabsProps) => {
  return (
    <Tabs defaultValue={defaultValue} onValueChange={onValueChange}>
      <TabsList className="grid grid-cols-2 mb-6">
        <TabsTrigger value="upi">
          <QrCode className="h-4 w-4 mr-2" />
          UPI Payment
        </TabsTrigger>
        <TabsTrigger value="manual">
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Manual Verification
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="upi">
        {upiContent}
      </TabsContent>
      
      <TabsContent value="manual">
        {manualContent}
      </TabsContent>
    </Tabs>
  );
};

export default PaymentMethodTabs;
