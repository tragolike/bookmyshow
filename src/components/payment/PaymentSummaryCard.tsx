
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface PaymentSummaryCardProps {
  amount: number;
  reference: string;
}

const PaymentSummaryCard = ({ amount, reference }: PaymentSummaryCardProps) => {
  return (
    <div className="space-y-4">
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
    </div>
  );
};

export default PaymentSummaryCard;
