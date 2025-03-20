
import { useState } from 'react';
import { ChevronDown, ChevronUp, CreditCard, Wallet } from 'lucide-react';

interface PaymentDetails {
  ticketPrice: number;
  ticketCount: number;
  convenienceFee: number;
  discount?: number;
  total: number;
}

interface PaymentSummaryProps {
  details: PaymentDetails;
  onProceed: () => void;
}

const PaymentSummary = ({ details, onProceed }: PaymentSummaryProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<string>('card');
  
  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'upi', name: 'UPI', icon: <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/1200px-UPI-Logo-vector.svg.png" className="w-5 h-5" alt="UPI" /> },
    { id: 'wallet', name: 'Wallet', icon: <Wallet className="w-5 h-5" /> },
  ];
  
  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Booking Summary</h3>
          <button 
            className="text-book-primary flex items-center"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? (
              <>
                <span className="text-sm mr-1">Hide Details</span>
                <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                <span className="text-sm mr-1">View Details</span>
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
        
        {showDetails && (
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span>{details.ticketPrice.toLocaleString()} × {details.ticketCount} Tickets</span>
              <span>₹ {(details.ticketPrice * details.ticketCount).toLocaleString()}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Convenience Fee</span>
              <span>₹ {details.convenienceFee.toLocaleString()}</span>
            </div>
            
            {details.discount && (
              <div className="flex items-center justify-between text-green-600">
                <span>Discount</span>
                <span>- ₹ {details.discount.toLocaleString()}</span>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="p-4 bg-gray-50 flex items-center justify-between">
        <span className="font-semibold">Amount Payable</span>
        <span className="font-bold text-lg">₹ {details.total.toLocaleString()}</span>
      </div>
      
      <div className="p-4 border-t">
        <h3 className="font-semibold mb-3">Payment Method</h3>
        
        <div className="space-y-2">
          {paymentMethods.map(method => (
            <div 
              key={method.id}
              className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer ${
                selectedPayment === method.id ? 'border-book-primary bg-book-primary/5' : 'border-gray-200'
              }`}
              onClick={() => setSelectedPayment(method.id)}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                  {method.icon}
                </div>
                <span>{method.name}</span>
              </div>
              
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedPayment === method.id ? 'border-book-primary' : 'border-gray-300'
              }`}>
                {selectedPayment === method.id && (
                  <div className="w-3 h-3 rounded-full bg-book-primary" />
                )}
              </div>
            </div>
          ))}
        </div>
        
        <button 
          className="w-full btn-primary mt-6"
          onClick={onProceed}
        >
          Proceed to Pay
        </button>
      </div>
    </div>
  );
};

export default PaymentSummary;
