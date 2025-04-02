
import { useState, useEffect } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UpiPaymentProps } from './types';
import PaymentErrorState from './PaymentErrorState';
import UpiPaymentView from './UpiPaymentView';
import UtrVerification from './UtrVerification';
import PaymentLoader from './PaymentLoader';
import PaymentMethodTabs from './PaymentMethodTabs';
import { usePaymentSettings } from '@/hooks/usePaymentSettings';

const UpiPayment = ({ amount, reference, onComplete }: UpiPaymentProps) => {
  const [isManualFetch, setIsManualFetch] = useState(false);
  const [countdown, setCountdown] = useState(900); // 15 minutes countdown
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'manual'>('upi');
  
  const { 
    paymentSettings, 
    isLoading, 
    error, 
    refreshPaymentSettings 
  } = usePaymentSettings(isManualFetch);
  
  // Handle countdown timer
  useEffect(() => {
    if (countdown <= 0) {
      toast.error('Payment time expired. Please try again.');
      return;
    }
    
    const timer = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [countdown]);
  
  const refreshPaymentInfo = async () => {
    setIsManualFetch(true);
    const success = await refreshPaymentSettings();
    setIsManualFetch(false);
    
    if (!success) {
      toast.error('Failed to refresh payment information');
    }
  };
  
  const verifyUtrAndComplete = (utrNumber: string) => {
    // Simulate UTR verification
    toast.success('UTR verified successfully!');
    onComplete();
  };
  
  if (isLoading && !isManualFetch) {
    return <PaymentLoader />;
  }
  
  // If payment settings are not properly configured, show a refresh option
  if (!paymentSettings || !paymentSettings.upi_id) {
    return <PaymentErrorState onRefresh={refreshPaymentInfo} />;
  }
  
  const upiLink = `upi://pay?pa=${paymentSettings.upi_id}&pn=ShowTix&am=${amount}&cu=INR&tn=${reference}`;
  
  return (
    <Card className="bg-white shadow-lg overflow-hidden border-0">
      <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <CardTitle className="text-xl">Complete Your Payment</CardTitle>
        <p className="text-white/80 mt-1">
          Time remaining: <span className="font-semibold">{Math.floor(countdown / 60)}:{countdown % 60 < 10 ? '0' : ''}{countdown % 60}</span>
        </p>
        <div className="bg-white/20 backdrop-blur-sm rounded-full py-1 px-3 text-white mt-2">
          <span className="text-sm">Order ID: #{reference.slice(-8)}</span>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <PaymentMethodTabs
          defaultValue="upi"
          onValueChange={(value) => setPaymentMethod(value as 'upi' | 'manual')}
          upiContent={
            <UpiPaymentView 
              paymentSettings={paymentSettings}
              amount={amount}
              reference={reference}
              upiLink={upiLink}
              onContinue={() => setPaymentMethod('manual')}
            />
          }
          manualContent={
            <UtrVerification 
              amount={amount}
              upiId={paymentSettings.upi_id}
              countdown={countdown}
              onVerify={verifyUtrAndComplete}
            />
          }
        />
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
            <CheckCircle2 className="mr-2 h-4 w-4" />
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
