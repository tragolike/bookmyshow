
import { AlertTriangle } from 'lucide-react';

interface PaymentSummaryCardProps {
  amount: number;
  reference: string;
}

const PaymentSummaryCard = ({ amount, reference }: PaymentSummaryCardProps) => {
  return (
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
      
      <div className="mt-4 bg-amber-50 border border-amber-200 rounded p-3">
        <div className="flex items-start">
          <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-amber-800 text-sm">Important</h4>
            <ul className="text-xs mt-1 space-y-1 list-disc list-inside text-amber-700">
              <li>Use your registered name for payment</li>
              <li>Add the reference number in the remarks</li>
              <li>Do not close this page until payment is complete</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSummaryCard;
