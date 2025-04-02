
import { Button } from '@/components/ui/button';
import UpiQrCode from './UpiQrCode';
import UpiIdDisplay from './UpiIdDisplay';
import PaymentSummaryCard from './PaymentSummaryCard';
import { PaymentSettings } from './types';

interface UpiPaymentViewProps {
  paymentSettings: PaymentSettings;
  amount: number;
  reference: string;
  upiLink: string;
  onContinue: () => void;
}

const UpiPaymentView = ({ 
  paymentSettings, 
  amount, 
  reference, 
  upiLink,
  onContinue 
}: UpiPaymentViewProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* QR Code */}
      <div className="flex-1 flex flex-col items-center">
        <UpiQrCode qrCodeUrl={paymentSettings.qr_code_url} />
        
        <div className="text-center w-full">
          <p className="text-sm text-gray-600 mb-1">Pay using UPI ID</p>
          <UpiIdDisplay upiId={paymentSettings.upi_id} />
          
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
        <PaymentSummaryCard amount={amount} reference={reference} />
        
        <Button 
          onClick={onContinue}
          className="w-full mt-4"
          variant="outline"
        >
          I've Completed the Payment
        </Button>
      </div>
    </div>
  );
};

export default UpiPaymentView;
