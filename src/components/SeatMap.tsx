import { useState, useEffect } from 'react';
import { supabase, getSeatLayoutByEventId } from '@/integrations/supabase/client';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Seat } from '@/types/events';

interface SeatMapProps {
  eventId: string;
  selectedCategory: string;
  onSeatSelect: (seatIds: string[]) => void;
  maxSeats: number;
  isAdmin?: boolean;
}

const SeatMap = ({ eventId, selectedCategory, onSeatSelect, maxSeats, isAdmin = false }: SeatMapProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seatLayout, setSeatLayout] = useState<any>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [categories, setCategories] = useState<{[key: string]: {color: string, price: number}}>({}); 
  
  // Fetch seat categories and layout
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch seat categories first
        const { data: categoryData, error: categoryError } = await supabase
          .from('seat_categories')
          .select('*');
        
        if (categoryError) throw categoryError;
        
        // Create a lookup object for categories
        const categoryLookup = {};
        categoryData?.forEach(cat => {
          categoryLookup[cat.name.toLowerCase()] = {
            color: cat.color,
            price: cat.price
          };
        });
        setCategories(categoryLookup);
        
        // Now fetch the seat layout
        const { data, error } = await getSeatLayoutByEventId(eventId);
        if (error) throw error;
        
        if (!data) {
          const defaultLayout = generateDefaultSeatLayout(selectedCategory, categoryLookup);
          setSeatLayout(defaultLayout);
        } else {
          setSeatLayout(data.layout_data);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load seating layout.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [eventId, selectedCategory]);
  
  const generateDefaultSeatLayout = (
    category: string, 
    categoryLookup: {[key: string]: {color: string, price: number}}
  ) => {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const seatsPerRow = 20;
    
    // Default categories if no database categories exist
    const defaultCategories = {
      premium: { rows: ['A', 'B', 'C'], price: 10000, color: '#FF2366' },
      gold: { rows: ['D', 'E', 'F'], price: 5000, color: '#FFD700' },
      silver: { rows: ['G', 'H', 'I', 'J'], price: 900, color: '#C0C0C0' }
    };
    
    const seats: Seat[] = [];
    
    rows.forEach((row) => {
      let seatCategory = 'silver';
      let price = 900;
      
      // Determine category based on row
      for (const [cat, conf] of Object.entries(defaultCategories)) {
        if (conf.rows.includes(row)) {
          seatCategory = cat;
          
          // Use price from database if available, otherwise use default
          if (categoryLookup[cat]) {
            price = categoryLookup[cat].price;
          } else {
            price = conf.price;
          }
          break;
        }
      }
      
      for (let i = 1; i <= seatsPerRow; i++) {
        const isUnavailable = Math.random() < 0.1;
        seats.push({
          id: `${row}${i}`,
          row,
          number: i,
          status: isUnavailable ? 'unavailable' : 'available',
          price,
          category: seatCategory
        });
      }
    });
    
    return {
      venue: 'Default Venue',
      seats
    };
  };
  
  const handleSeatClick = (seatId: string) => {
    const seat = seatLayout.seats.find((s: Seat) => s.id === seatId);
    
    if (isAdmin) {
      setSelectedSeats((prev) => {
        if (prev.includes(seatId)) {
          return prev.filter(id => id !== seatId);
        } else {
          if (prev.length >= maxSeats) {
            toast.error(`You can only select up to ${maxSeats} seats.`);
            return prev;
          }
          return [...prev, seatId];
        }
      });
      return;
    }
    
    if (!seat || seat.status === 'unavailable' || seat.status === 'booked') {
      return;
    }
    
    if (seat.category !== selectedCategory) {
      toast.error(`You can only select seats from the ${selectedCategory} category.`);
      return;
    }
    
    setSelectedSeats((prev) => {
      if (prev.includes(seatId)) {
        return prev.filter(id => id !== seatId);
      } else {
        if (prev.length >= maxSeats) {
          toast.error(`You can only select up to ${maxSeats} seats.`);
          return prev;
        }
        return [...prev, seatId];
      }
    });
  };
  
  useEffect(() => {
    onSeatSelect(selectedSeats);
  }, [selectedSeats, onSeatSelect]);
  
  const getSeatStatus = (seat: Seat): 'available' | 'unavailable' | 'selected' | 'booked' => {
    if (selectedSeats.includes(seat.id)) return 'selected';
    if (seat.status === 'booked' || seat.status === 'unavailable') return seat.status;
    if (!isAdmin && seat.category !== selectedCategory) return 'unavailable';
    return 'available';
  };
  
  const getSeatColor = (seat: Seat, status: string): string => {
    if (status === 'selected') return '#FF2366';
    if (status === 'unavailable' || status === 'booked') return '#aaaaaa';
    
    // For available seats, use category color if found in our categories object
    const category = seat.category.toLowerCase();
    if (categories[category]) {
      // Lighten the color for better visibility
      return `${categories[category].color}33`; // Adding 33 for transparency
    }
    
    // Fallback colors by category
    switch(category) {
      case 'premium': return '#FF236633';
      case 'gold': return '#FFD70033';
      case 'silver': return '#C0C0C033';
      default: return '#E2E8F033';
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-book-primary" />
      </div>
    );
  }
  
  if (error || !seatLayout) {
    return (
      <div className="flex items-center justify-center p-10 text-center">
        <div>
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to load seat map</h3>
          <p className="text-gray-600">{error || 'Seat layout not available.'}</p>
        </div>
      </div>
    );
  }
  
  if (seatLayout.image_url && !isAdmin) {
    return (
      <div className="pb-10">
        <div className="relative mb-10">
          <div className="w-3/4 h-8 bg-gray-300 mx-auto rounded-t-full transform perspective-[500px] rotate-x-12"></div>
          <p className="text-center text-sm text-gray-500 mt-2">SCREEN</p>
        </div>
        
        <div className="text-center mb-8">
          <img 
            src={seatLayout.image_url} 
            alt="Venue Layout" 
            className="max-w-full mx-auto rounded-lg border border-gray-200"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
              e.currentTarget.alt = 'Venue layout unavailable';
            }}
          />
          <p className="text-sm text-gray-500 mt-2">
            Venue layout for reference only. Please select your seats below.
          </p>
        </div>
        
        <div className="w-full overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="space-y-2">
              {Object.keys(seatLayout.seats.reduce((acc: {[key: string]: Seat[]}, seat: Seat) => {
                if (!acc[seat.row]) acc[seat.row] = [];
                acc[seat.row].push(seat);
                return acc;
              }, {})).sort().map((row) => (
                <div key={row} className="flex items-center justify-center gap-1">
                  <div className="w-6 text-center font-medium text-gray-700">{row}</div>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {seatLayout.seats
                      .filter((s: Seat) => s.row === row)
                      .sort((a: Seat, b: Seat) => a.number - b.number)
                      .map((seat: Seat) => {
                        const status = getSeatStatus(seat);
                        const bgColor = getSeatColor(seat, status);
                        
                        return (
                          <button
                            key={seat.id}
                            className={`w-7 h-7 text-xs flex items-center justify-center rounded-t-md transition-colors ${
                              status === 'available' 
                                ? 'hover:opacity-80 text-gray-800 cursor-pointer'
                                : status === 'selected'
                                  ? 'bg-book-primary text-white cursor-pointer'
                                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                            style={status === 'available' ? { backgroundColor: bgColor } : {}}
                            onClick={() => handleSeatClick(seat.id)}
                            disabled={status === 'unavailable' || status === 'booked'}
                            aria-label={`Seat ${seat.row}${seat.number}`}
                          >
                            {seat.number}
                          </button>
                        );
                      })}
                  </div>
                  <div className="w-6 text-center font-medium text-gray-700">{row}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center gap-6 mt-10">
          {Object.entries(categories).map(([category, { color }]) => (
            <div key={category} className="flex items-center gap-2">
              <div 
                className="w-5 h-5 rounded-t-md border border-gray-200" 
                style={{ backgroundColor: `${color}33` }}
              ></div>
              <span className="text-sm capitalize">{category}</span>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-book-primary rounded-t-md"></div>
            <span className="text-sm">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gray-200 rounded-t-md"></div>
            <span className="text-sm">Unavailable</span>
          </div>
        </div>
        
        {selectedSeats.length > 0 && (
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Selected Seats: {selectedSeats.length}</h3>
            <div className="flex flex-wrap gap-2">
              {selectedSeats.map(seatId => {
                const seat = seatLayout.seats.find((s: Seat) => s.id === seatId);
                return (
                  <div key={seatId} className="px-3 py-1 bg-book-primary/10 text-book-primary rounded-full text-sm">
                    {seat.row}{seat.number}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }
  
  const seatsByRow = seatLayout.seats.reduce((acc: {[key: string]: Seat[]}, seat: Seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {});
  
  const sortedRows = Object.keys(seatsByRow).sort();
  
  return (
    <div className="pb-10">
      <div className="w-full overflow-x-auto">
        <div className="min-w-[600px]">
          <div className="space-y-2">
            {sortedRows.map((row) => (
              <div key={row} className="flex items-center justify-center gap-1">
                <div className="w-6 text-center font-medium text-gray-700">{row}</div>
                <div className="flex flex-wrap gap-1 justify-center">
                  {seatsByRow[row]
                    .sort((a: Seat, b: Seat) => a.number - b.number)
                    .map((seat: Seat) => {
                      const status = getSeatStatus(seat);
                      const bgColor = getSeatColor(seat, status);
                      
                      return (
                        <button
                          key={seat.id}
                          className={`w-7 h-7 text-xs flex items-center justify-center rounded-t-md transition-colors ${
                            status === 'available' 
                              ? 'hover:opacity-80 text-gray-800 cursor-pointer'
                              : status === 'selected'
                                ? 'bg-book-primary text-white cursor-pointer'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                          style={status === 'available' ? { backgroundColor: bgColor } : {}}
                          onClick={() => handleSeatClick(seat.id)}
                          disabled={!isAdmin && (status === 'unavailable' || status === 'booked')}
                          aria-label={`Seat ${seat.row}${seat.number}`}
                        >
                          {seat.number}
                        </button>
                      );
                    })}
                </div>
                <div className="w-6 text-center font-medium text-gray-700">{row}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap justify-center gap-6 mt-10">
        {Object.entries(categories).map(([category, { color }]) => (
          <div key={category} className="flex items-center gap-2">
            <div 
              className="w-5 h-5 rounded-t-md border border-gray-200" 
              style={{ backgroundColor: `${color}33` }}
            ></div>
            <span className="text-sm capitalize">{category}</span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-book-primary rounded-t-md"></div>
          <span className="text-sm">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gray-200 rounded-t-md"></div>
          <span className="text-sm">Unavailable</span>
        </div>
      </div>
      
      {selectedSeats.length > 0 && (
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium mb-2">Selected Seats: {selectedSeats.length}</h3>
          <div className="flex flex-wrap gap-2">
            {selectedSeats.map(seatId => {
              const seat = seatLayout.seats.find((s: Seat) => s.id === seatId);
              return (
                <div key={seatId} className="px-3 py-1 bg-book-primary/10 text-book-primary rounded-full text-sm">
                  {seat.row}{seat.number}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatMap;
