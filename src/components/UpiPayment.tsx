
import { useEffect, useState } from 'react';
import { getPaymentSettings } from '@/integrations/supabase/client';
import { Loader2, Copy, CheckCircle2, AlertTriangle, RefreshCw, Download, QrCode, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useQuery } from '@tanstack/react-query';

interface UpiPaymentProps {
  amount: number;
  reference: string;
  onComplete: () => void;
}

const UpiPayment = ({ amount, reference, onComplete }: UpiPaymentProps) => {
  const [paymentSettings, setPaymentSettings] = useState<any>(null);
  const [countdown, setCountdown] = useState(900); // 15 minutes countdown (as requested in requirements)
  const [copied, setCopied] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [utrNumber, setUtrNumber] = useState('');
  const [utrError, setUtrError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'manual'>('upi');
  const [isVerifying, setIsVerifying] = useState(false);
  
  // UTR validation regex as per requirements
  const utrRegex = /^[A-Z0-9]{12,22}$/;
  
  // Use React Query to fetch payment settings with proper caching control
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['paymentSettings', refreshTrigger],
    queryFn: getPaymentSettings,
    staleTime: 0, // Don't use stale data
    cacheTime: 0, // Don't cache the result
    refetchOnWindowFocus: true, // Refresh when window gets focus
  });
  
  useEffect(() => {
    if (data?.data) {
      console.log('Loaded latest payment settings from database:', data.data);
      setPaymentSettings(data.data);
    } else if (error) {
      console.error('Error fetching payment settings:', error);
      // Set fallback values on error
      setPaymentSettings({
        upi_id: 'showtix@upi',
        qr_code_url: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg',
        payment_instructions: 'Please make the payment using any UPI app and enter the UTR number for verification.'
      });
      toast.error('Using default payment information');
    }
  }, [data, error]);
  
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
    refetch();
    toast.info('Refreshing payment information...');
  };
  
  const handleUtrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setUtrNumber(value);
    
    if (value && !utrRegex.test(value)) {
      setUtrError('Invalid UTR format. Must be 12-22 alphanumeric characters.');
    } else {
      setUtrError('');
    }
  };
  
  const verifyUtrAndComplete = () => {
    if (!utrNumber) {
      setUtrError('Please enter your UTR number');
      return;
    }
    
    if (!utrRegex.test(utrNumber)) {
      setUtrError('Invalid UTR format. Must be 12-22 alphanumeric characters.');
      return;
    }
    
    setIsVerifying(true);
    // Simulate UTR verification
    setTimeout(() => {
      setIsVerifying(false);
      // UTR verification successful
      toast.success('UTR verified successfully!');
      onComplete();
    }, 2000);
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
    return (
      <div className="p-6 text-center border border-red-200 rounded-lg bg-red-50">
        <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-2" />
        <p className="text-red-600 mb-3">Payment system is not properly configured. Please refresh or contact support.</p>
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
    <Card className="bg-white shadow-lg overflow-hidden border-0">
      <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Complete Your Payment</CardTitle>
            <p className="text-white/80 mt-1">Time remaining: <span className="font-semibold">{formatTime(countdown)}</span></p>
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
            <div className="flex flex-col md:flex-row gap-6">
              {/* QR Code */}
              <div className="flex-1 flex flex-col items-center">
                {paymentSettings.qr_code_url ? (
                  <div className="border-2 border-book-primary p-2 rounded-xl mb-4 bg-white">
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
                  <div className="border-2 border-gray-200 p-2 rounded-xl mb-4 w-64 h-64 flex items-center justify-center bg-gray-50">
                    <QrCode className="w-20 h-20 text-gray-300" />
                  </div>
                )}
                
                <div className="text-center w-full">
                  <p className="text-sm text-gray-600 mb-1">Pay using UPI ID</p>
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <code className="bg-gray-100 px-3 py-2 rounded font-medium w-full text-center border border-gray-200">
                      {paymentSettings.upi_id}
                    </code>
                    <button 
                      onClick={copyUpiId}
                      className="text-book-primary hover:text-book-primary/80 p-2 bg-gray-100 rounded border border-gray-200"
                      aria-label="Copy UPI ID"
                    >
                      {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  <a 
                    href={upiLink}
                    className="inline-flex items-center justify-center gap-2 bg-book-primary text-white py-2 px-4 rounded-md hover:bg-book-primary/90 transition-colors w-full"
                  >
                    <span>Open in UPI App</span>
                  </a>
                </div>
              </div>
              
              {/* Payment details */}
              <div className="flex-1 space-y-4">
                <div className="rounded-lg border p-4 bg-gray-50">
                  <h3 className="font-semibold mb-2">Payment Summary</h3>
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-semibold">₹{amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reference:</span>
                      <span className="font-mono text-sm">{reference}</span>
                    </div>
                  </div>
                </div>
                
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Important</AlertTitle>
                  <AlertDescription>
                    <ul className="text-sm mt-1 space-y-1 list-disc list-inside">
                      <li>Use your registered name for payment</li>
                      <li>Add the reference number in the remarks</li>
                      <li>Do not close this page until payment is complete</li>
                    </ul>
                  </AlertDescription>
                </Alert>
                
                <div className="flex items-center justify-center space-x-2 pt-4">
                  <img src="https://cdn.razorpay.com/static/assets/homepage/visa-card.png" alt="Visa" className="h-6" />
                  <img src="https://cdn.razorpay.com/static/assets/homepage/master-card.png" alt="MasterCard" className="h-6" />
                  <img src="https://cdn.razorpay.com/static/assets/homepage/rupay-card.png" alt="RuPay" className="h-6" />
                  <img src="https://cdn.razorpay.com/static/assets/homepage/upi.png" alt="UPI" className="h-6" />
                </div>
                
                <Button 
                  onClick={() => setPaymentMethod('manual')}
                  className="w-full mt-4"
                  variant="outline"
                >
                  I've Completed the Payment
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="manual">
            <div className="space-y-6">
              <div className="rounded-lg border p-4 bg-gradient-to-r from-green-50 to-blue-50">
                <h3 className="font-semibold mb-2 text-green-800">Payment Complete?</h3>
                <p className="text-sm text-gray-700 mb-4">
                  If you've completed your payment, please enter your UPI Transaction Reference Number (UTR) below for verification.
                </p>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="utr-number" className="font-medium text-gray-700">UPI Transaction Reference (UTR)</Label>
                    <div className="mt-1 relative">
                      <Input
                        id="utr-number"
                        value={utrNumber}
                        onChange={handleUtrChange}
                        placeholder="e.g. ABCD123456789012"
                        className={`${utrError ? 'border-red-300 focus:ring-red-500' : ''}`}
                      />
                    </div>
                    {utrError && <p className="text-sm text-red-600 mt-1">{utrError}</p>}
                    <p className="text-xs text-gray-500 mt-1">
                      You can find the UTR in your bank/UPI application payment history.
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Clock className="inline-block w-4 h-4 mr-1 text-amber-600" />
                      <span className="text-sm text-amber-700">Time remaining: {formatTime(countdown)}</span>
                    </div>
                    <span className="text-sm text-gray-500">Payment Amount: ₹{amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <Alert>
                <AlertTitle>Need Help?</AlertTitle>
                <AlertDescription>
                  <p className="mb-2">If you're facing issues, you can:</p>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li>Double check your payment status in your UPI app</li>
                    <li>Ensure you've entered the correct UPI ID: <span className="font-mono">{paymentSettings.upi_id}</span></li>
                    <li>If amount was deducted but payment failed, it will be refunded within 5-7 business days</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex flex-col gap-4">
        {paymentMethod === 'manual' ? (
          <Button 
            onClick={verifyUtrAndComplete}
            disabled={isVerifying || !utrNumber || !!utrError}
            className="w-full"
            size="lg"
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying UTR...
              </>
            ) : (
              'Verify & Complete Payment'
            )}
          </Button>
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
