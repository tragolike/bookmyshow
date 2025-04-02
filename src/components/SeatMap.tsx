
import { useState, useEffect } from 'react';
import { getSeatLayoutByEventId } from '@/integrations/supabase/client';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface SeatMapProps {
  eventId: string;
  selectedCategory: string;
  onSeatSelect: (seatIds: string[]) => void;
  maxSeats: number;
}

interface Seat {
  id: string;
  row: string;
  number: number;
  status: 'available' | 'unavailable' | 'selected' | 'booked';
  price: number;
  category: string;
}

const SeatMap = ({ eventId, selectedCategory, onSeatSelect, maxSeats }: SeatMapProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seatLayout, setSeatLayout] = useState<any>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  
  useEffect(() => {
    const fetchSeatLayout = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error } = await getSeatLayoutByEventId(eventId);
        if (error) throw error;
        
        if (!data) {
          // If no seat layout exists, create a default one
          const defaultLayout = generateDefaultSeatLayout(selectedCategory);
          setSeatLayout(defaultLayout);
        } else {
          setSeatLayout(data.layout_data);
        }
      } catch (err) {
        console.error('Error fetching seat layout:', err);
        setError('Failed to load seating layout.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSeatLayout();
  }, [eventId, selectedCategory]);
  
  const generateDefaultSeatLayout = (category: string) => {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const seatsPerRow = 20;
    
    const categories = {
      premium: { rows: ['A', 'B', 'C'], price: 10000 },
      platinum: { rows: ['D', 'E', 'F'], price: 5000 },
      gold: { rows: ['G', 'H'], price: 2000 },
      silver: { rows: ['I', 'J'], price: 900 }
    };
    
    const seats: Seat[] = [];
    
    rows.forEach((row) => {
      let seatCategory = 'silver';
      let price = 900;
      
      // Determine category and price based on row
      Object.entries(categories).forEach(([cat, conf]) => {
        if (conf.rows.includes(row)) {
          seatCategory = cat;
          price = conf.price;
        }
      });
      
      for (let i = 1; i <= seatsPerRow; i++) {
        // Add some random unavailable seats
        const isUnavailable = Math.random() < 0.1; // 10% chance of being unavailable
        
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
    
    // Ignore if seat is not available
    if (!seat || seat.status === 'unavailable' || seat.status === 'booked') {
      return;
    }
    
    // If seat is not in the selected category, don't allow selection
    if (seat.category !== selectedCategory) {
      toast.error(`You can only select seats from the ${selectedCategory} category.`);
      return;
    }
    
    setSelectedSeats((prev) => {
      if (prev.includes(seatId)) {
        // Deselect the seat
        return prev.filter(id => id !== seatId);
      } else {
        // Don't allow selecting more than maxSeats
        if (prev.length >= maxSeats) {
          toast.error(`You can only select up to ${maxSeats} seats.`);
          return prev;
        }
        // Select the seat
        return [...prev, seatId];
      }
    });
  };
  
  useEffect(() => {
    // Update parent component with selected seats
    onSeatSelect(selectedSeats);
  }, [selectedSeats, onSeatSelect]);
  
  const getSeatStatus = (seat: Seat): 'available' | 'unavailable' | 'selected' | 'booked' => {
    if (selectedSeats.includes(seat.id)) return 'selected';
    if (seat.status === 'booked' || seat.status === 'unavailable') return seat.status;
    if (seat.category !== selectedCategory) return 'unavailable';
    return 'available';
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
  
  // Group seats by row
  const seatsByRow = seatLayout.seats.reduce((acc: {[key: string]: Seat[]}, seat: Seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {});
  
  // Sort rows
  const sortedRows = Object.keys(seatsByRow).sort();
  
  return (
    <div className="pb-10">
      <div className="w-full overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Screen */}
          <div className="relative mb-10">
            <div className="w-3/4 h-8 bg-gray-300 mx-auto rounded-t-full transform perspective-[500px] rotate-x-12"></div>
            <p className="text-center text-sm text-gray-500 mt-2">SCREEN</p>
          </div>
          
          {/* Seat Map */}
          <div className="space-y-2">
            {sortedRows.map((row) => (
              <div key={row} className="flex items-center justify-center gap-1">
                <div className="w-6 text-center font-medium text-gray-700">{row}</div>
                <div className="flex flex-wrap gap-1 justify-center">
                  {seatsByRow[row]
                    .sort((a: Seat, b: Seat) => a.number - b.number)
                    .map((seat: Seat) => {
                      const status = getSeatStatus(seat);
                      return (
                        <button
                          key={seat.id}
                          className={`w-7 h-7 text-xs flex items-center justify-center rounded-t-md transition-colors ${
                            status === 'available' 
                              ? 'bg-green-100 hover:bg-green-200 text-green-800 cursor-pointer'
                              : status === 'selected'
                                ? 'bg-book-primary text-white cursor-pointer'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
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
      
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-6 mt-10">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-green-100 rounded-t-md"></div>
          <span className="text-sm">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-book-primary rounded-t-md"></div>
          <span className="text-sm">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gray-200 rounded-t-md"></div>
          <span className="text-sm">Unavailable</span>
        </div>
      </div>
      
      {/* Selected Seats */}
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
