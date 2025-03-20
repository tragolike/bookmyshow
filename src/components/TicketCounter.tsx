
import { useState, useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';

interface TicketCounterProps {
  maxTickets: number;
  onChange: (count: number) => void;
  defaultValue?: number;
}

const TicketCounter = ({ 
  maxTickets = 10, 
  onChange,
  defaultValue = 1 
}: TicketCounterProps) => {
  const [count, setCount] = useState(defaultValue);
  
  useEffect(() => {
    // Update count if defaultValue changes
    setCount(defaultValue);
  }, [defaultValue]);
  
  const increment = () => {
    if (count < maxTickets) {
      const newCount = count + 1;
      setCount(newCount);
      onChange(newCount);
    }
  };
  
  const decrement = () => {
    if (count > 1) {
      const newCount = count - 1;
      setCount(newCount);
      onChange(newCount);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">How many tickets?</h2>
      
      <div className="max-w-md mx-auto">
        <div className="glass-card rounded-lg p-6">
          <p className="text-center mb-8 text-gray-600">
            Select the number of tickets you want to book. You can book up to {maxTickets} tickets in a single transaction.
          </p>
          
          <div className="flex items-center justify-center space-x-6">
            <button
              onClick={decrement}
              disabled={count <= 1}
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                count <= 1 
                  ? 'bg-gray-100 text-gray-400' 
                  : 'bg-book-primary/10 text-book-primary hover:bg-book-primary/20'
              }`}
            >
              <Minus className="w-6 h-6" />
            </button>
            
            <div className="text-center">
              <div className="text-4xl font-bold">{count}</div>
              <div className="text-sm text-gray-500">Tickets</div>
            </div>
            
            <button
              onClick={increment}
              disabled={count >= maxTickets}
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                count >= maxTickets
                  ? 'bg-gray-100 text-gray-400'
                  : 'bg-book-primary/10 text-book-primary hover:bg-book-primary/20'
              }`}
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
          
          <div className="mt-8 text-center text-sm text-gray-500">
            * You will select your seats in the next step
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketCounter;
