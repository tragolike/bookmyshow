
import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

export interface TicketCounterProps {
  value: number; // Changed from 'count' to 'value' for consistency
  onChange: (count: number) => void;
  max: number;
  min?: number;
}

const TicketCounter = ({ value, onChange, max, min = 1 }: TicketCounterProps) => {
  const increment = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };
  
  const decrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };
  
  return (
    <div className="flex items-center">
      <span className="mr-3 text-sm font-medium">Number of tickets:</span>
      <div className="flex items-center border border-gray-300 rounded-md">
        <button
          type="button"
          onClick={decrement}
          disabled={value <= min}
          className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Decrease ticket count"
        >
          <Minus className="h-4 w-4" />
        </button>
        
        <span className="px-4 py-1 text-center min-w-[3rem]">{value}</span>
        
        <button
          type="button"
          onClick={increment}
          disabled={value >= max}
          className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Increase ticket count"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default TicketCounter;
