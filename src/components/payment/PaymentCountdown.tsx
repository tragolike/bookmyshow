
import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { PaymentCountdownProps } from './types';

const PaymentCountdown = ({ initialTime, onExpire }: PaymentCountdownProps) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  
  useEffect(() => {
    if (timeLeft <= 0) {
      onExpire?.();
      return;
    }
    
    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [timeLeft, onExpire]);
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  return (
    <div className="flex items-center">
      <Clock className="h-4 w-4 mr-1 text-amber-600" />
      <span className="text-sm text-amber-700">Time remaining: {formatTime(timeLeft)}</span>
    </div>
  );
};

export default PaymentCountdown;
