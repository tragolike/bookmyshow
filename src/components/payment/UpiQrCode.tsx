
import { QrCode } from 'lucide-react';

interface UpiQrCodeProps {
  qrCodeUrl?: string;
}

const UpiQrCode = ({ qrCodeUrl }: UpiQrCodeProps) => {
  if (!qrCodeUrl) {
    return (
      <div className="border-2 border-gray-200 p-2 rounded-xl mb-4 w-64 h-64 flex items-center justify-center bg-gray-50">
        <QrCode className="w-20 h-20 text-gray-300" />
      </div>
    );
  }
  
  return (
    <div className="border-2 border-book-primary p-2 rounded-xl mb-4 bg-white">
      <img 
        src={qrCodeUrl} 
        alt="UPI QR Code" 
        className="w-64 h-64 object-contain"
        onError={(e) => {
          e.currentTarget.src = '/placeholder.svg';
          e.currentTarget.alt = 'Failed to load QR code';
        }}
      />
    </div>
  );
};

export default UpiQrCode;
