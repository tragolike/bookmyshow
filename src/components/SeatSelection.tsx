
import { useState, useEffect } from 'react';
import { Info } from 'lucide-react';

interface SeatCategory {
  id: string;
  name: string;
  price: number;
  color: string;
  available: boolean;
}

interface SeatSelectionProps {
  venueName: string;
  eventName: string;
  seatCategories: SeatCategory[];
  onCategorySelect: (category: SeatCategory) => void;
  selectedCategory: SeatCategory | null;
}

const SeatSelection = ({ 
  venueName, 
  eventName, 
  seatCategories, 
  onCategorySelect,
  selectedCategory
}: SeatSelectionProps) => {
  const [remainingTime, setRemainingTime] = useState(240); // 4 minutes in seconds
  
  useEffect(() => {
    if (remainingTime <= 0) return;
    
    const timer = setInterval(() => {
      setRemainingTime(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [remainingTime]);
  
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Timer Warning */}
      <div className="timer-warning">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-center md:justify-between gap-2">
          <div className="flex items-center gap-2">
            <span>You have approximately</span>
            <span className="font-bold">{formatTime(remainingTime)}</span> 
            <span>to select your seats.</span>
          </div>
          <p className="text-sm">Please don't click on 'back' or close this page, else you will have to start afresh.</p>
        </div>
      </div>
      
      {/* Venue Layout */}
      <div className="container mx-auto px-4 py-6 flex-1">
        <h2 className="text-lg font-bold mb-1">{eventName}</h2>
        <p className="text-sm text-gray-600 mb-6">{venueName}</p>
        
        <div className="relative mb-8">
          <div className="absolute top-4 right-4">
            <button className="flex items-center justify-center w-16 h-8 rounded-full border border-book-primary text-book-primary">
              <Info className="w-4 h-4 mr-1" />
              <span className="text-sm">Info</span>
            </button>
          </div>
          
          {/* Stadium/Venue Image */}
          <div className="bg-gray-100 rounded-lg overflow-hidden">
            <img 
              src="/lovable-uploads/9a53974e-0a7c-4d42-aa9e-0396a3887b7e.png" 
              alt="Venue Layout" 
              className="w-full h-auto"
            />
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">Please select category of your choice</h3>
          
          <div className="space-y-4">
            {seatCategories.map(category => (
              <div 
                key={category.id}
                className={`flex items-center justify-between p-4 border rounded-lg transition-all ${
                  selectedCategory?.id === category.id 
                    ? 'border-book-primary bg-book-primary/5' 
                    : 'border-gray-200 hover:border-book-primary hover:bg-gray-50'
                } ${!category.available && 'opacity-60'}`}
                onClick={() => category.available && onCategorySelect(category)}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className={`w-4 h-4 rounded-full ${selectedCategory?.id === category.id ? 'bg-book-primary' : category.color}`}
                  />
                  <div className="font-medium">₹ {category.price.toLocaleString()}</div>
                </div>
                
                <div className="text-sm">
                  {category.available ? (
                    category.price > 3000 ? 'Fast Filling' : 'Available'
                  ) : 'Sold Out'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;
