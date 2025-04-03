
import { Button } from '@/components/ui/button';
import UpiQrCode from './UpiQrCode';
import UpiIdDisplay from './UpiIdDisplay';
import PaymentSummaryCard from './PaymentSummaryCard';
import { UpiPaymentViewProps } from './types';
import { ArrowRight, ExternalLink, Smartphone, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Alert, AlertDescription } from '@/components/ui/alert';

const UpiPaymentView = ({ 
  paymentSettings, 
  amount, 
  reference, 
  upiLink,
  onContinue 
}: UpiPaymentViewProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`flex flex-col ${isMobile ? 'gap-6' : 'md:flex-row md:gap-8'}`}>
      {/* QR Code */}
      <div className="flex-1 flex flex-col items-center">
        {paymentSettings.qr_code_url ? (
          <UpiQrCode qrCodeUrl={paymentSettings.qr_code_url} />
        ) : (
          <div className="w-full max-w-[200px] h-[200px] border border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
            <div className="text-center p-4">
              <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-2" />
              <p className="text-sm text-gray-500">QR code not available</p>
            </div>
          </div>
        )}
        
        <div className="text-center w-full mt-4">
          <p className="text-sm text-gray-600 mb-1">Pay using UPI ID</p>
          <UpiIdDisplay upiId={paymentSettings.upi_id} />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
            <a 
              href={upiLink}
              className="inline-flex items-center justify-center gap-2 bg-book-primary text-white py-3 px-4 rounded-lg hover:bg-book-primary/90 transition-colors"
            >
              <Smartphone className="h-4 w-4" />
              <span>Open in UPI App</span>
            </a>
            
            <Button 
              onClick={onContinue}
              className="py-3"
              variant="outline"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              <span>Payment Complete</span>
            </Button>
          </div>
          
          {paymentSettings.payment_instructions ? (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-medium text-sm mb-2">Payment Instructions</h3>
              <p className="text-sm text-gray-600">{paymentSettings.payment_instructions}</p>
            </div>
          ) : (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-medium text-sm mb-2">Payment Instructions</h3>
              <p className="text-sm text-gray-600">
                Please make the payment using any UPI app and enter the UTR number for verification.
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Payment details */}
      <div className="flex-1 space-y-4">
        <PaymentSummaryCard amount={amount} reference={reference} />
        
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-blue-800">
          <h3 className="font-medium mb-2">Ticket Booking</h3>
          <p className="text-sm">
            Your tickets will be confirmed immediately after payment verification.
            You'll receive confirmation on your registered email and mobile number.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UpiPaymentView;
