
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaymentErrorStateProps {
  onRefresh: () => void;
}

const PaymentErrorState = ({ onRefresh }: PaymentErrorStateProps) => {
  return (
    <div className="p-6 text-center border border-red-200 rounded-lg bg-red-50">
      <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-2" />
      <p className="text-red-600 mb-3">Payment system is not properly configured. Please refresh or contact support.</p>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onRefresh}
        className="mx-auto flex items-center gap-1"
      >
        <RefreshCw className="h-3 w-3" />
        <span>Refresh</span>
      </Button>
    </div>
  );
};

export default PaymentErrorState;
