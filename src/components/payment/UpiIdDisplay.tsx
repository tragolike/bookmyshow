
import { Copy, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface UpiIdDisplayProps {
  upiId: string;
}

const UpiIdDisplay = ({ upiId }: UpiIdDisplayProps) => {
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = async () => {
    if (!upiId || upiId === 'default@upi') {
      toast.error('No valid UPI ID to copy');
      return;
    }
    
    try {
      await navigator.clipboard.writeText(upiId);
      setCopied(true);
      toast.success('UPI ID copied to clipboard');
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Could not copy to clipboard. Please copy manually.');
    }
  };
  
  return (
    <div 
      className="flex items-center justify-center gap-2 bg-gray-100 rounded-lg py-2 px-4 cursor-pointer transition-colors hover:bg-gray-200"
      onClick={copyToClipboard}
      aria-label="Click to copy UPI ID"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          copyToClipboard();
        }
      }}
    >
      <span className="font-medium text-gray-800">{upiId || 'default@upi'}</span>
      {copied ? (
        <CheckCircle2 className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4 text-gray-500" />
      )}
    </div>
  );
};

export default UpiIdDisplay;
