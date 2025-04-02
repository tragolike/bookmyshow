
import { Loader2 } from 'lucide-react';

interface PaymentSummaryProps {
  details: {
    ticketPrice: number;
    ticketCount: number;
    convenienceFee: number;
    total: number;
  };
  onProceed: () => void;
  isLoading?: boolean;
}

const PaymentSummary = ({ details, onProceed, isLoading = false }: PaymentSummaryProps) => {
  const { ticketPrice, ticketCount, convenienceFee, total } = details;
  
  return (
    <div className="sticky top-20 rounded-lg border overflow-hidden">
      <div className="p-4 bg-gray-50 border-b">
        <h3 className="font-semibold">Price Summary</h3>
      </div>
      
      <div className="p-4">
        <div className="space-y-3 mb-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Ticket Price</span>
            <span className="font-medium">₹{ticketPrice.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Quantity</span>
            <span className="font-medium">{ticketCount}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">₹{(ticketPrice * ticketCount).toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Convenience Fee</span>
            <span className="font-medium">₹{convenienceFee.toLocaleString()}</span>
          </div>
        </div>
        
        <div className="flex justify-between pt-4 border-t mb-6">
          <span className="font-semibold">Total Amount</span>
          <span className="font-bold text-lg">₹{total.toLocaleString()}</span>
        </div>
        
        <button 
          onClick={onProceed}
          disabled={isLoading}
          className="w-full py-2 px-4 bg-book-primary text-white rounded-md hover:bg-book-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
              Processing...
            </>
          ) : (
            'Proceed to Pay'
          )}
        </button>
        
        <div className="flex items-center justify-center mt-4 gap-2">
          <img 
            src="https://cdn.razorpay.com/static/assets/homepage/visa-card.png" 
            alt="Visa" 
            className="h-6"
          />
          <img 
            src="https://cdn.razorpay.com/static/assets/homepage/master-card.png" 
            alt="MasterCard" 
            className="h-6"
          />
          <img 
            src="https://cdn.razorpay.com/static/assets/homepage/rupay-card.png" 
            alt="RuPay" 
            className="h-6"
          />
          <img 
            src="https://cdn.razorpay.com/static/assets/homepage/upi.png" 
            alt="UPI" 
            className="h-6"
          />
        </div>
      </div>
    </div>
  );
};

export default PaymentSummary;
