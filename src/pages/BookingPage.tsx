
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getEventById, supabase, isUserAdmin } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import SeatSelection from '@/components/SeatSelection';
import SeatMap from '@/components/SeatMap';
import TicketCounter from '@/components/TicketCounter';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { ArrowLeft, AlertTriangle, Ticket, ShoppingCart, Loader2 } from 'lucide-react';

interface SeatCategory {
  id: string;
  name: string;
  price: number;
  color: string;
  available: boolean;
}

interface Event {
  id: string;
  title: string;
  category: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  price: number;
  status: string;
  image: string;
}

const BookingPage = () => {
  const { id: eventId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [ticketCount, setTicketCount] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) {
        toast.error('No event ID provided');
        navigate('/');
        return;
      }
      
      setIsLoading(true);
      try {
        const { data, error } = await getEventById(eventId);
        if (error) {
          console.error('Error fetching event:', error);
          throw error;
        }
        
        if (!data) {
          toast.error('Event not found');
          navigate('/');
          return;
        }
        
        setEvent(data);
        
        if (user?.email) {
          setIsAdmin(isUserAdmin(user.email));
        }
      } catch (error: any) {
        console.error('Error fetching event:', error);
        toast.error('Failed to load event details: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEvent();
  }, [eventId, navigate, user]);

  const handleCategorySelect = (category: any) => {
    setSelectedCategory(category);
    setSelectedSeats([]);
  };
  
  const handleTicketCountChange = (count: number) => {
    setTicketCount(count);
  };
  
  const handleSelectedSeatsChange = (seats: string[]) => {
    setSelectedSeats(seats);
  };
  
  useEffect(() => {
    if (selectedCategory && selectedSeats.length > 0) {
      setTotalAmount(selectedCategory.price * selectedSeats.length);
    } else {
      setTotalAmount(0);
    }
  }, [selectedCategory, selectedSeats]);
  
  const handleProceed = () => {
    if (!user) {
      toast.error('Please login to continue with booking');
      navigate('/login', { state: { from: `/events/${eventId}/booking` } });
      return;
    }
    
    if (!selectedCategory) {
      toast.error('Please select a seat category');
      return;
    }
    
    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat');
      return;
    }
    
    if (selectedSeats.length !== ticketCount) {
      toast.error(`Please select exactly ${ticketCount} ${ticketCount === 1 ? 'seat' : 'seats'}`);
      return;
    }
    
    navigate(`/payment`, {
      state: {
        eventId,
        eventName: event.title,
        venueName: event.venue,
        categoryName: selectedCategory.name,
        seatNumbers: selectedSeats,
        totalAmount,
        ticketCount: selectedSeats.length
      }
    });
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-book-primary" />
            <p className="mt-4 text-gray-600">Loading event details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!event) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-red-500">Event Not Found</h1>
            <p className="mt-4 text-gray-600">The event you're looking for doesn't exist or has been removed.</p>
            <Button 
              onClick={() => navigate('/')} 
              className="mt-6 bg-book-primary hover:bg-book-primary/90"
            >
              Return to Home
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col space-y-8">
          <div>
            <button 
              onClick={() => navigate(`/events/${eventId}`)}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span>Back to Event</span>
            </button>
            
            <h1 className="text-2xl font-bold mt-4">{event.title}</h1>
            <div className="flex items-center text-gray-600 mt-1">
              <Ticket className="h-4 w-4 mr-2" />
              <span>{event.venue}, {event.city}</span>
            </div>
            <div className="flex items-center text-gray-600 mt-1">
              <ShoppingCart className="h-4 w-4 mr-2" />
              <span>{event.date} | {event.time}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <SeatSelection
                venueName={event.venue}
                eventName={event.title}
                seatCategories={[
                  {
                    id: 'premium',
                    name: 'Premium',
                    price: 10000,
                    color: 'bg-blue-500',
                    available: true
                  },
                  {
                    id: 'platinum',
                    name: 'Platinum',
                    price: 5000,
                    color: 'bg-cyan-500',
                    available: true
                  },
                  {
                    id: 'gold',
                    name: 'Gold',
                    price: 2000,
                    color: 'bg-green-500',
                    available: true
                  },
                  {
                    id: 'silver',
                    name: 'Silver',
                    price: 900,
                    color: 'bg-purple-500',
                    available: true
                  },
                ]}
                onCategorySelect={handleCategorySelect}
                selectedCategory={selectedCategory}
                isAdmin={isAdmin}
              />
              
              {selectedCategory && (
                <div className="rounded-lg overflow-hidden">
                  <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                    <h3 className="font-medium">Select Your Seats</h3>
                  </div>
                  <div className="p-4 bg-white border border-gray-200 rounded-b-lg">
                    <div className="mb-4">
                      <TicketCounter
                        value={ticketCount}
                        onChange={handleTicketCountChange}
                        max={10}
                      />
                    </div>
                    
                    <SeatMap
                      eventId={eventId || ''}
                      selectedCategory={selectedCategory.id}
                      onSeatSelect={handleSelectedSeatsChange}
                      maxSeats={ticketCount}
                      isAdmin={isAdmin}
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-4 py-3 bg-gray-100 border-b border-gray-200">
                  <h3 className="font-medium">Booking Summary</h3>
                </div>
                <div className="p-4">
                  {selectedCategory ? (
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category</span>
                        <span className="font-medium">{selectedCategory.name}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price per Ticket</span>
                        <span className="font-medium">₹{selectedCategory.price.toLocaleString()}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Selected Seats</span>
                        <span className="font-medium">
                          {selectedSeats.length > 0 
                            ? selectedSeats.join(', ')
                            : 'None selected'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Number of Tickets</span>
                        <span className="font-medium">{selectedSeats.length}</span>
                      </div>
                      
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex justify-between">
                          <span className="font-medium">Total Amount</span>
                          <span className="font-bold text-xl">₹{totalAmount.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <Button 
                        className="w-full py-6 bg-book-primary hover:bg-book-primary-dark"
                        onClick={handleProceed}
                        disabled={selectedSeats.length === 0 || selectedSeats.length !== ticketCount}
                      >
                        Proceed to Payment
                      </Button>
                      
                      {selectedSeats.length !== ticketCount && (
                        <div className="flex items-start gap-2 text-orange-700 bg-orange-50 p-3 rounded-md text-sm">
                          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                          <span>
                            Please select {ticketCount} {ticketCount === 1 ? 'seat' : 'seats'} to continue.
                            {selectedSeats.length > 0 && ` (${selectedSeats.length} selected)`}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      Please select a category to continue
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-700">
                <h4 className="font-medium mb-2">Important Information</h4>
                <ul className="space-y-2 list-disc pl-5">
                  <li>Seats once booked cannot be changed or cancelled</li>
                  <li>Please verify your seat selection before proceeding to payment</li>
                  <li>Booking is only confirmed after successful payment</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BookingPage;
