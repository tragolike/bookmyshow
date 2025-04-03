
import { useState, useEffect } from 'react';
import { Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import PaymentCountdown from './PaymentCountdown';
import { UtrVerificationProps } from './types';

interface ExtendedUtrVerificationProps extends UtrVerificationProps {
  savedUtrNumber?: string;
}

const UtrVerification = ({ amount, upiId, countdown, onVerify, savedUtrNumber = '' }: ExtendedUtrVerificationProps) => {
  const [utrNumber, setUtrNumber] = useState('');
  const [utrError, setUtrError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Use the saved UTR number if available
  useEffect(() => {
    if (savedUtrNumber) {
      setUtrNumber(savedUtrNumber);
    }
  }, [savedUtrNumber]);
  
  // UTR validation regex
  const utrRegex = /^[A-Z0-9]{12,22}$/;
  
  const handleUtrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setUtrNumber(value);
    
    if (value && !utrRegex.test(value)) {
      setUtrError('Invalid UTR format. Must be 12-22 alphanumeric characters.');
    } else {
      setUtrError('');
    }
  };
  
  const handleVerify = () => {
    if (!utrNumber) {
      setUtrError('Please enter your UTR number');
      return;
    }
    
    if (!utrRegex.test(utrNumber)) {
      setUtrError('Invalid UTR format. Must be 12-22 alphanumeric characters.');
      return;
    }
    
    setIsVerifying(true);
    
    // Simulate verification delay for better UX
    setTimeout(() => {
      setIsVerifying(false);
      onVerify(utrNumber);
    }, 1500);
  };
  
  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-4 bg-gradient-to-r from-green-50 to-blue-50">
        <h3 className="font-semibold mb-2 text-green-800 flex items-center">
          <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
          Payment Complete?
        </h3>
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
            {savedUtrNumber && (
              <p className="text-xs text-green-600 mt-1">
                We've prefilled your last UTR number for convenience.
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              You can find the UTR in your bank/UPI application payment history.
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <PaymentCountdown initialTime={countdown} />
            <span className="text-sm text-gray-500">Payment Amount: ₹{amount.toLocaleString()}</span>
          </div>
        </div>
      </div>
      
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Need Help?</AlertTitle>
        <AlertDescription>
          <p className="mb-2">If you're facing issues, you can:</p>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li>Double check your payment status in your UPI app</li>
            <li>Ensure you've entered the correct UPI ID: <span className="font-mono">{upiId}</span></li>
            <li>If amount was deducted but payment failed, it will be refunded within 5-7 business days</li>
          </ul>
        </AlertDescription>
      </Alert>

      <Button 
        onClick={handleVerify}
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
          <>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Verify & Complete Payment
          </>
        )}
      </Button>
    </div>
  );
};

export default UtrVerification;
