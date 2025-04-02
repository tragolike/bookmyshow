
import { useState } from 'react';
import { Copy, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface UpiIdDisplayProps {
  upiId: string;
}

const UpiIdDisplay = ({ upiId }: UpiIdDisplayProps) => {
  const [copied, setCopied] = useState(false);
  
  const copyUpiId = () => {
    if (!upiId) return;
    
    navigator.clipboard.writeText(upiId)
      .then(() => {
        setCopied(true);
        toast.success('UPI ID copied to clipboard');
        
        setTimeout(() => setCopied(false), 3000);
      })
      .catch(err => {
        console.error('Failed to copy UPI ID:', err);
        toast.error('Failed to copy UPI ID');
      });
  };
  
  return (
    <div className="flex items-center justify-center gap-2 mb-3">
      <code className="bg-gray-100 px-3 py-2 rounded font-medium w-full text-center border border-gray-200 truncate">
        {upiId || 'No UPI ID available'}
      </code>
      <button 
        onClick={copyUpiId}
        className="text-book-primary hover:text-book-primary/80 p-2 bg-gray-100 rounded border border-gray-200"
        aria-label="Copy UPI ID"
        disabled={!upiId}
      >
        {copied ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
      </button>
    </div>
  );
};

export default UpiIdDisplay;
