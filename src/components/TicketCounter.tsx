
import { useState } from 'react';

interface TicketCounterProps {
  maxTickets?: number;
  onChange: (count: number) => void;
}

const TicketCounter = ({ maxTickets = 10, onChange }: TicketCounterProps) => {
  const [ticketCount, setTicketCount] = useState(2);
  
  const handleChange = (newCount: number) => {
    if (newCount >= 1 && newCount <= maxTickets) {
      setTicketCount(newCount);
      onChange(newCount);
    }
  };
  
  const ticketOptions = Array.from({ length: maxTickets }, (_, i) => i + 1);
  
  return (
    <div className="py-8">
      <h3 className="text-xl text-center font-semibold mb-6">How many seats?</h3>
      
      <div className="flex justify-center mb-6">
        <img 
          src="/lovable-uploads/eea662e5-9aaf-4417-a39c-fa0e1fb354e4.png" 
          alt="Ticket Icon" 
          className="h-24"
        />
      </div>
      
      <div className="flex justify-center gap-3 flex-wrap">
        {ticketOptions.map(num => (
          <button
            key={num}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-medium transition-all ${
              ticketCount === num 
                ? 'bg-book-primary text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => handleChange(num)}
          >
            {num}
          </button>
        ))}
      </div>
      
      <div className="text-center mt-6 text-gray-500 text-sm">
        <span className="inline-flex items-center">
          <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 7V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="12" cy="16" r="1" fill="currentColor" />
          </svg>
          You can add upto {maxTickets} tickets.
        </span>
      </div>
    </div>
  );
};

export default TicketCounter;
