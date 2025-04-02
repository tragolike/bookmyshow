
import { QrCode, Image } from 'lucide-react';

interface UpiQrCodeProps {
  qrCodeUrl?: string;
}

const UpiQrCode = ({ qrCodeUrl }: UpiQrCodeProps) => {
  if (!qrCodeUrl) {
    return (
      <div className="border-2 border-gray-200 p-2 rounded-xl mb-4 w-64 h-64 flex flex-col items-center justify-center bg-gray-50">
        <QrCode className="w-20 h-20 text-gray-300 mb-2" />
        <p className="text-gray-400 text-sm text-center">QR code not available</p>
      </div>
    );
  }
  
  return (
    <div className="border-2 border-book-primary p-2 rounded-xl mb-4 bg-white relative">
      <img 
        src={qrCodeUrl} 
        alt="UPI QR Code" 
        className="w-64 h-64 object-contain"
        onError={(e) => {
          console.error("Failed to load QR code image:", qrCodeUrl);
          e.currentTarget.style.display = 'none';
          const parent = e.currentTarget.parentElement;
          if (parent) {
            const fallback = document.createElement('div');
            fallback.className = 'w-64 h-64 flex flex-col items-center justify-center';
            fallback.innerHTML = `
              <div class="text-red-500 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M10.5 20.5 3 13l7.5-7.5"/>
                  <path d="m13.5 20.5 7.5-7.5-7.5-7.5"/>
                </svg>
              </div>
              <p class="text-sm text-center text-gray-700">QR code failed to load</p>
            `;
            parent.appendChild(fallback);
          }
        }}
      />
    </div>
  );
};

export default UpiQrCode;
