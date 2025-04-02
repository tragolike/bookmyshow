
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getPaymentSettings } from '@/integrations/supabase/client';
import PaymentErrorState from './PaymentErrorState';
import UpiPaymentView from './UpiPaymentView';
import UtrVerification from './UtrVerification';
import { UpiPaymentProps, PaymentSettings } from './types';

const UpiPayment = ({ amount, reference, onComplete }: UpiPaymentProps) => {
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [countdown, setCountdown] = useState(900); // 15 minutes countdown
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'manual'>('upi');
  
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await getPaymentSettings();
        
        if (error) {
          console.error('Error fetching payment settings:', error);
          throw error;
        }
        
        // If no data is returned or UPI ID is missing, use fallback values
        if (!data || !data.upi_id) {
          setPaymentSettings({
            upi_id: 'showtix@upi',
            qr_code_url: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg',
            payment_instructions: 'Please make the payment using any UPI app and enter the UTR number for verification.'
          });
          console.log('Using fallback payment settings');
        } else {
          setPaymentSettings(data);
          console.log('Loaded payment settings from database:', data);
        }
      } catch (error) {
        console.error('Error fetching payment settings:', error);
        // Set fallback values on error
        setPaymentSettings({
          upi_id: 'showtix@upi',
          qr_code_url: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg',
          payment_instructions: 'Please make the payment using any UPI app and enter the UTR number for verification.'
        });
        toast.error('Using default payment information');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSettings();
  }, [refreshTrigger]);
  
  const refreshPaymentSettings = () => {
    setRefreshTrigger(prev => prev + 1);
    toast.info('Refreshing payment information...');
  };
  
  const verifyUtrAndComplete = (utrNumber: string) => {
    // Simulate UTR verification
    toast.success('UTR verified successfully!');
    onComplete();
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-book-primary" />
        <p>Loading payment details...</p>
      </div>
    );
  }
  
  // If payment settings are not properly configured, show a refresh option
  if (!paymentSettings || !paymentSettings.upi_id) {
    return <PaymentErrorState onRefresh={refreshPaymentSettings} />;
  }
  
  const upiLink = `upi://pay?pa=${paymentSettings.upi_id}&pn=ShowTix&am=${amount}&cu=INR&tn=${reference}`;
  
  return (
    <Card className="bg-white shadow-lg overflow-hidden border-0">
      <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Complete Your Payment</CardTitle>
            <p className="text-white/80 mt-1">Time remaining: <span className="font-semibold">{Math.floor(countdown / 60)}:{countdown % 60 < 10 ? '0' : ''}{countdown % 60}</span></p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-full py-1 px-3 text-white">
            <span className="text-sm">Order ID: #{reference.slice(-8)}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <Tabs defaultValue="upi" onValueChange={(value) => setPaymentMethod(value as 'upi' | 'manual')}>
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="upi">UPI Payment</TabsTrigger>
            <TabsTrigger value="manual">Manual Verification</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upi">
            <UpiPaymentView 
              paymentSettings={paymentSettings}
              amount={amount}
              reference={reference}
              upiLink={upiLink}
              onContinue={() => setPaymentMethod('manual')}
            />
          </TabsContent>
          
          <TabsContent value="manual">
            <UtrVerification 
              amount={amount}
              upiId={paymentSettings.upi_id}
              countdown={countdown}
              onVerify={verifyUtrAndComplete}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex flex-col gap-4">
        {paymentMethod === 'manual' ? (
          <p className="text-xs text-center text-gray-500">
            By verifying your UTR, you confirm that you've made the payment of ₹{amount.toLocaleString()} to the UPI ID.
          </p>
        ) : (
          <Button 
            onClick={() => setPaymentMethod('manual')}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            size="lg"
          >
            I've Completed the Payment
          </Button>
        )}
        
        <p className="text-xs text-center text-gray-500">
          By clicking this button, you confirm that you've made the payment of ₹{amount.toLocaleString()} to the UPI ID.
        </p>
      </CardFooter>
    </Card>
  );
};

export default UpiPayment;
