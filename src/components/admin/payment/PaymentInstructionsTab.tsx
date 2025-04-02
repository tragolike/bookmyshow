
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { HelpCircle } from 'lucide-react';
import { useEffect } from 'react';

interface PaymentInstructionsTabProps {
  instructions: string;
  onInstructionsChange: (value: string) => void;
}

const PaymentInstructionsTab = ({
  instructions,
  onInstructionsChange
}: PaymentInstructionsTabProps) => {
  
  // Log when props change for debugging
  useEffect(() => {
    console.log('PaymentInstructionsTab received instructions:', instructions);
  }, [instructions]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Instructions</CardTitle>
        <CardDescription>
          Customize the instructions that will be shown to users during payment
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="payment-instructions">Payment Instructions</Label>
          <Textarea
            id="payment-instructions"
            value={instructions}
            onChange={(e) => {
              console.log('Instruction changed to:', e.target.value);
              onInstructionsChange(e.target.value);
            }}
            placeholder="Enter any additional payment instructions or information for users"
            className="min-h-[150px]"
          />
          <p className="text-sm text-gray-500">
            These instructions will be displayed to users on the payment page
          </p>
        </div>
        
        <div className="mt-6">
          <Alert>
            <HelpCircle className="h-4 w-4" />
            <AlertTitle>UTR Verification Process</AlertTitle>
            <AlertDescription>
              <p className="mb-2">When users make UPI payments, they will be asked to provide the UTR (Unique Transaction Reference) for verification.</p>
              <p>You will be able to verify these UTR numbers in the Bookings section under "Pending Payments" tab.</p>
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentInstructionsTab;
