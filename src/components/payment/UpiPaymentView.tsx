
import { Button } from '@/components/ui/button';
import UpiQrCode from './UpiQrCode';
import UpiIdDisplay from './UpiIdDisplay';
import PaymentSummaryCard from './PaymentSummaryCard';
import { UpiPaymentViewProps } from './types';
import { ArrowRight, ExternalLink, Smartphone } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const UpiPaymentView = ({ 
  paymentSettings, 
  amount, 
  reference, 
  upiLink,
  onContinue 
}: UpiPaymentViewProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`flex flex-col ${isMobile ? 'gap-6' : 'md:flex-row md:gap-6'}`}>
      {/* QR Code */}
      <div className="flex-1 flex flex-col items-center">
        <UpiQrCode qrCodeUrl={paymentSettings.qr_code_url} />
        
        <div className="text-center w-full">
          <p className="text-sm text-gray-600 mb-1">Pay using UPI ID</p>
          <UpiIdDisplay upiId={paymentSettings.upi_id} />
          
          <a 
            href={upiLink}
            className="inline-flex items-center justify-center gap-2 bg-book-primary text-white py-2 px-4 rounded-md hover:bg-book-primary/90 transition-colors w-full mt-2"
          >
            <Smartphone className="h-4 w-4" />
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
          <span>I've Completed the Payment</span>
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default UpiPaymentView;
