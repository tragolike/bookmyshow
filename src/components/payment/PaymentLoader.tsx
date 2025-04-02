
import { Loader2 } from 'lucide-react';

const PaymentLoader = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-book-primary" />
      <p>Loading payment details...</p>
    </div>
  );
};

export default PaymentLoader;
