import { useState, useEffect } from 'react';
import { Info, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
  return <div className="flex flex-col h-full">
      {/* Timer Warning */}
      <div className="bg-red-500 text-white py-2">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-center md:justify-between gap-2 px-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span>You have approximately</span>
            <span className="font-bold bg-white text-red-500 px-2 py-0.5 rounded">{formatTime(remainingTime)}</span> 
            <span>to select your seats.</span>
          </div>
          <p className="text-sm">Please don't click on 'back' or close this page, else you will have to start afresh.</p>
        </div>
      </div>
      
      {/* Venue Layout */}
      <div className="container mx-auto px-4 py-6 flex-1">
        <h2 className="text-xl font-bold mb-1">{eventName}</h2>
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
            <img alt="Venue Layout" className="w-full h-auto object-contain" src="data:image/jpeg;base64,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" />
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">Please select category of your choice</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {seatCategories.map(category => <div key={category.id} className={`flex items-center justify-between p-4 border rounded-lg transition-all ${selectedCategory?.id === category.id ? 'border-book-primary bg-book-primary/5' : 'border-gray-200 hover:border-book-primary hover:bg-gray-50'} ${!category.available && 'opacity-60'}`} onClick={() => category.available && onCategorySelect(category)}>
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${selectedCategory?.id === category.id ? 'bg-book-primary' : category.color}`} />
                  <div>
                    <div className="font-medium">{category.name}</div>
                    <div className="text-xl font-bold">₹ {category.price.toLocaleString()}</div>
                  </div>
                </div>
                
                <div className="text-sm">
                  {category.available ? category.price > 3000 ? <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
                        Fast Filling
                      </Badge> : <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                        Available
                      </Badge> : <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                      Sold Out
                    </Badge>}
                </div>
              </div>)}
          </div>
        </div>
      </div>
    </div>;
};
export default SeatSelection;