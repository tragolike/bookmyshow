
import { useEffect, useState } from 'react';
import { getPaymentSettings } from '@/integrations/supabase/client';
import { Loader2, Copy, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface UpiPaymentProps {
  amount: number;
  reference: string;
  onComplete: () => void;
}

const UpiPayment = ({ amount, reference, onComplete }: UpiPaymentProps) => {
  const [paymentSettings, setPaymentSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [countdown, setCountdown] = useState(300); // 5 minutes countdown
  const [copied, setCopied] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await getPaymentSettings();
        if (error) throw error;
        setPaymentSettings(data);
      } catch (error) {
        console.error('Error fetching payment settings:', error);
        toast.error('Failed to load payment information');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSettings();
  }, [refreshTrigger]);
  
  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) {
      toast.error('Payment time expired. Please try again.');
      return;
    }
    
    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [countdown]);
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  const copyUpiId = () => {
    if (!paymentSettings?.upi_id) return;
    
    navigator.clipboard.writeText(paymentSettings.upi_id);
    setCopied(true);
    toast.success('UPI ID copied to clipboard');
    
    setTimeout(() => setCopied(false), 3000);
  };
  
  const refreshPaymentSettings = () => {
    setRefreshTrigger(prev => prev + 1);
    toast.info('Refreshing payment information...');
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-book-primary" />
        <p>Loading payment details...</p>
      </div>
    );
  }
  
  // If payment settings are not properly configured
  if (!paymentSettings || !paymentSettings.upi_id) {
    return (
      <div className="p-6 text-center border border-red-200 rounded-lg bg-red-50">
        <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-2" />
        <p className="text-red-600 mb-3">Payment system is not properly configured. Please contact support.</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refreshPaymentSettings}
          className="mx-auto flex items-center gap-1"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Refresh</span>
        </Button>
      </div>
    );
  }
  
  const upiLink = `upi://pay?pa=${paymentSettings.upi_id}&pn=ShowTix&am=${amount}&cu=INR&tn=${reference}`;
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Complete Your Payment</h2>
        <div className="flex items-center justify-center gap-2 text-gray-600">
          <span>Please complete the payment within</span>
          <span className="font-semibold px-2 py-1 bg-red-100 text-red-600 rounded-md">{formatTime(countdown)}</span>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
        {/* QR Code */}
        <div className="flex-1 flex flex-col items-center">
          {paymentSettings.qr_code_url ? (
            <div className="border-2 border-book-primary p-2 rounded-xl mb-4">
              <img 
                src={paymentSettings.qr_code_url} 
                alt="UPI QR Code" 
                className="w-64 h-64 object-contain"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                  e.currentTarget.alt = 'Failed to load QR code';
                }}
              />
            </div>
          ) : (
            <div className="border-2 border-gray-200 p-2 rounded-xl mb-4 w-64 h-64 flex items-center justify-center">
              <p className="text-gray-500 text-center">QR code not available.<br/>Please use the UPI ID below.</p>
            </div>
          )}
          
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Or pay using UPI ID</p>
            <div className="flex items-center justify-center gap-2">
              <code className="bg-gray-100 px-3 py-1 rounded font-medium">
                {paymentSettings.upi_id}
              </code>
              <button 
                onClick={copyUpiId}
                className="text-book-primary hover:text-book-primary/80"
                aria-label="Copy UPI ID"
              >
                {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            
            <a 
              href={upiLink}
              className="mt-4 inline-flex items-center text-sm text-book-primary hover:underline"
            >
              <span>Open in UPI App</span>
            </a>
          </div>
        </div>
        
        {/* Payment details */}
        <div className="flex-1 space-y-6 w-full">
          <div className="space-y-4 border-b pb-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-semibold">₹{amount.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Reference:</span>
              <span className="font-mono text-sm">{reference}</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-medium text-yellow-800 mb-1">Important</h3>
              <ul className="text-sm text-yellow-700 space-y-1 list-disc pl-4">
                <li>Use your registered name for payment</li>
                <li>Add the reference number in the remarks</li>
                <li>Do not close this page until payment is complete</li>
              </ul>
            </div>
            
            <button 
              onClick={onComplete}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              I've Completed the Payment
            </button>
            
            <p className="text-xs text-center text-gray-500">
              By clicking this button, you confirm that you've made the payment of ₹{amount.toLocaleString()} to the UPI ID.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpiPayment;
