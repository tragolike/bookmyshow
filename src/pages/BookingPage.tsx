
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import SeatSelection from '@/components/SeatSelection';
import TicketCounter from '@/components/TicketCounter';
import PaymentSummary from '@/components/PaymentSummary';
import { db } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

// Define steps for the booking process
const BOOKING_STEPS = {
  SELECT_CATEGORY: 0,
  SELECT_SEATS: 1,
  PAYMENT: 2
};

interface SeatCategory {
  id: string;
  name: string;
  price: number;
  color: string;
  available: boolean;
}

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(BOOKING_STEPS.SELECT_CATEGORY);
  const [selectedCategory, setSelectedCategory] = useState<SeatCategory | null>(null);
  const [ticketCount, setTicketCount] = useState(2);
  const [isLoading, setIsLoading] = useState(true);
  const [event, setEvent] = useState<any>(null);
  
  // Mock seat categories
  const seatCategories: SeatCategory[] = [
    { id: 'premium', name: 'D Block - RR KABEL PAVL', price: 10000, color: 'bg-blue-500', available: true },
    { id: 'platinum', name: 'E Block - BKT TYRES PAVILION', price: 5000, color: 'bg-cyan-500', available: true },
    { id: 'gold', name: 'F Block - JIO PAVILION', price: 2000, color: 'bg-green-500', available: true },
    { id: 'silver', name: 'G Block - VIKRAM SOLAR PAVILION', price: 900, color: 'bg-purple-500', available: false },
  ];
  
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setIsLoading(true);
        if (!id) return;
        
        const { data, error } = await db.events()
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) {
          throw error;
        }
        
        setEvent(data);
      } catch (error) {
        console.error('Error fetching event details:', error);
        toast.error('Failed to load event details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEvent();
  }, [id]);
  
  const handleCategorySelect = (category: SeatCategory) => {
    setSelectedCategory(category);
    setCurrentStep(BOOKING_STEPS.SELECT_SEATS);
  };
  
  const handleTicketCountChange = (count: number) => {
    setTicketCount(count);
  };
  
  const handleProceedToPayment = () => {
    if (!user) {
      toast.error('Please log in to continue with your booking');
      navigate('/login');
      return;
    }
    setCurrentStep(BOOKING_STEPS.PAYMENT);
  };
  
  const handlePayment = async () => {
    if (!user) {
      toast.error('Please log in to continue with your booking');
      navigate('/login');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Generate fake seat numbers
      const seatNumbers = Array.from({ length: ticketCount }, (_, i) => 
        `${selectedCategory?.id.charAt(0).toUpperCase()}${Math.floor(Math.random() * 20) + 1}-${Math.floor(Math.random() * 20) + 1}`
      );
      
      // Calculate total amount
      const totalAmount = selectedCategory ? selectedCategory.price * ticketCount : 0;
      
      // Create booking in Supabase
      const { data, error } = await db.bookings()
        .insert({
          user_id: user.id,
          event_id: id,
          seat_numbers: seatNumbers,
          total_amount: totalAmount,
          payment_status: 'completed',
          booking_status: 'confirmed'
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      toast.success('Booking successful! Redirecting to confirmation page...');
      
      // Navigate to confirmation page with booking details
      navigate('/booking-confirmation', { 
        state: { 
          bookingId: data?.id,
          eventId: id,
          seats: ticketCount,
          seatNumbers,
          category: selectedCategory?.name,
          amount: totalAmount
        } 
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Something went wrong with the booking process. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const getPaymentDetails = () => {
    if (!selectedCategory) return null;
    
    const ticketPrice = selectedCategory.price;
    const subtotal = ticketPrice * ticketCount;
    const convenienceFee = Math.round(subtotal * 0.03); // 3% convenience fee
    const total = subtotal + convenienceFee;
    
    return {
      ticketPrice,
      ticketCount,
      convenienceFee,
      total
    };
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-book-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold">Loading booking details...</h2>
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
        <main className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Event not found</h2>
            <button 
              onClick={() => navigate('/')}
              className="btn-primary"
            >
              Back to Home
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  const renderCurrentStep = () => {
    switch (currentStep) {
      case BOOKING_STEPS.SELECT_CATEGORY:
        return (
          <SeatSelection 
            venueName={`${event.venue}: ${event.city}`}
            eventName={event.title}
            seatCategories={seatCategories}
            onCategorySelect={handleCategorySelect}
            selectedCategory={selectedCategory}
          />
        );
        
      case BOOKING_STEPS.SELECT_SEATS:
        return (
          <TicketCounter 
            maxTickets={10} 
            onChange={handleTicketCountChange} 
            defaultValue={ticketCount}
          />
        );
        
      case BOOKING_STEPS.PAYMENT:
        const paymentDetails = getPaymentDetails();
        if (!paymentDetails) return null;
        
        return (
          <div className="container mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-6">Payment</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <div className="rounded-lg border overflow-hidden mb-6">
                  <div className="p-4 bg-gray-50 border-b">
                    <h3 className="font-semibold">Booking Details</h3>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div>
                        <h3 className="font-medium text-lg">{event.title}</h3>
                        <p className="text-gray-500">{event.date} | {event.time}</p>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-medium">{selectedCategory?.name}</div>
                        <div className="text-gray-500">{ticketCount} Tickets</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <svg className="w-4 h-4 text-book-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Tickets once booked cannot be cancelled, exchanged or refunded</span>
                    </div>
                  </div>
                </div>
                
                {/* Additional Features (just for display) */}
                <div className="glass-card rounded-lg p-4 mb-6">
                  <h3 className="font-medium mb-3">Add-ons</h3>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium">Ticket Protection</div>
                        <div className="text-sm text-gray-600">Cover cancellations due to illness & more</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="font-medium">₹99</span>
                      <div className="w-5 h-5 rounded-full border border-gray-300"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <PaymentSummary 
                  details={paymentDetails} 
                  onProceed={handlePayment}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  const renderStepIndicator = () => {
    if (currentStep === BOOKING_STEPS.SELECT_CATEGORY) return null;
    
    return (
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center">
          <button 
            className="text-book-primary font-medium"
            onClick={() => setCurrentStep(currentStep - 1)}
          >
            ← Back
          </button>
          
          <div className="ml-auto flex items-center gap-2">
            {Object.values(BOOKING_STEPS).map((step, index) => (
              <div 
                key={index}
                className={`w-2 h-2 rounded-full ${
                  step <= currentStep ? 'bg-book-primary' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  const renderActionButton = () => {
    if (currentStep === BOOKING_STEPS.SELECT_CATEGORY || currentStep === BOOKING_STEPS.PAYMENT) return null;
    
    return (
      <div className="sticky bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            {selectedCategory && (
              <div>
                <div className="font-semibold text-lg">₹{(selectedCategory.price * ticketCount).toLocaleString()}</div>
                <div className="text-sm text-gray-500">{ticketCount} seats</div>
              </div>
            )}
          </div>
          
          <button 
            className="btn-primary"
            onClick={handleProceedToPayment}
          >
            Continue
          </button>
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {renderStepIndicator()}
        {renderCurrentStep()}
        {renderActionButton()}
      </main>
      
      <Footer />
    </div>
  );
};

export default BookingPage;
