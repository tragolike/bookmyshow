
import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { toast } from 'sonner';

interface CountdownProps {
  initialTime: number;
  onExpire?: () => void;
}

const PaymentCountdown = ({ initialTime, onExpire }: CountdownProps) => {
  const [countdown, setCountdown] = useState(initialTime);
  
  useEffect(() => {
    if (countdown <= 0) {
      toast.error('Payment time expired. Please try again.');
      onExpire?.();
      return;
    }
    
    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [countdown, onExpire]);
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  return (
    <div className="flex items-center">
      <Clock className="inline-block w-4 h-4 mr-1 text-amber-600" />
      <span className="text-sm text-amber-700">Time remaining: {formatTime(countdown)}</span>
    </div>
  );
};

export default PaymentCountdown;
