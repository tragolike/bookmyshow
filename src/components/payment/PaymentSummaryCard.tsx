
import { CreditCard, Calendar, Landmark } from 'lucide-react';

interface PaymentSummaryCardProps {
  amount: number;
  reference: string;
}

const PaymentSummaryCard = ({ amount, reference }: PaymentSummaryCardProps) => {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 p-4">
        <h3 className="font-medium">Payment Summary</h3>
      </div>
      
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Amount</span>
          <span className="font-semibold">₹{amount.toLocaleString()}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Reference ID</span>
          <span className="font-medium text-gray-800">{reference.slice(-8)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Payment Mode</span>
          <span className="font-medium text-gray-800">UPI</span>
        </div>
        
        <div className="pt-3 border-t border-gray-200 mt-3">
          <div className="flex justify-between items-center text-lg">
            <span className="font-medium">Total</span>
            <span className="font-bold text-book-primary">₹{amount.toLocaleString()}</span>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <CreditCard className="h-4 w-4 text-gray-400" />
          <span>Secure Payment</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span>Tickets will be sent to your email</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Landmark className="h-4 w-4 text-gray-400" />
          <span>Report payment issues at support@showtix.com</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentSummaryCard;
