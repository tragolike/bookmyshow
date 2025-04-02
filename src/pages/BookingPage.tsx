import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import SeatSelection from '@/components/SeatSelection';
import SeatMap from '@/components/SeatMap';
import UpiPayment from '@/components/payment/UpiPayment';
import PaymentSummary from '@/components/PaymentSummary';
import { db, createBooking } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

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
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [ticketCount, setTicketCount] = useState(2);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [event, setEvent] = useState<any>(null);
  
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
  
  const handleSeatSelect = (seatIds: string[]) => {
    setSelectedSeats(seatIds);
    setTicketCount(seatIds.length);
  };
  
  const handleProceedToPayment = () => {
    if (!selectedSeats.length) {
      toast.error('Please select at least one seat to continue');
      return;
    }
    
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
      setIsProcessing(true);
      
      const bookingRef = `TX-${Math.floor(Math.random() * 1000000)}`;
      
      const totalAmount = selectedCategory ? selectedCategory.price * selectedSeats.length : 0;
      
      const { data, error } = await createBooking({
        user_id: user.id,
        event_id: id!,
        seat_numbers: selectedSeats,
        total_amount: totalAmount,
        payment_status: 'completed',
        booking_status: 'confirmed',
        utr_number: 'DEMO' + Math.floor(Math.random() * 10000000000)
      });
      
      if (error) {
        throw error;
      }
      
      toast.success('Booking successful! Redirecting to confirmation page...');
      
      navigate('/booking-confirmation', { 
        state: { 
          bookingId: data?.id,
          eventId: id,
          seats: selectedSeats.length,
          seatNumbers: selectedSeats,
          category: selectedCategory?.name,
          amount: totalAmount
        } 
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Something went wrong with the booking process. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const getPaymentDetails = () => {
    if (!selectedCategory) return null;
    
    const ticketPrice = selectedCategory.price;
    const subtotal = ticketPrice * selectedSeats.length;
    const convenienceFee = Math.round(subtotal * 0.03);
    const total = subtotal + convenienceFee;
    
    return {
      ticketPrice,
      ticketCount: selectedSeats.length,
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
        if (!selectedCategory || !id) return null;
        
        return (
          <div className="container mx-auto px-4 py-8">
            <h2 className="text-xl font-bold mb-2">{event.title}</h2>
            <p className="text-gray-600 mb-6">{event.venue}, {event.city} | {event.date} • {event.time}</p>
            
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${selectedCategory.color}`}></div>
                <h3 className="font-medium">{selectedCategory.name}</h3>
                <span className="text-gray-500">• ₹{selectedCategory.price.toLocaleString()} per ticket</span>
              </div>
              
              <p className="text-sm text-gray-600">Please select your seats from the seating layout below.</p>
            </div>
            
            <SeatMap 
              eventId={id}
              selectedCategory={selectedCategory.id}
              onSeatSelect={handleSeatSelect}
              maxSeats={10}
            />
          </div>
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
                        <div className="text-gray-500">{selectedSeats.length} Seats: {selectedSeats.join(', ')}</div>
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
                
                <UpiPayment 
                  amount={paymentDetails.total}
                  reference={`BOOK-${Math.floor(Math.random() * 1000000)}`}
                  onComplete={handlePayment}
                />
              </div>
              
              <div>
                <PaymentSummary 
                  details={paymentDetails}
                  onProceed={() => {}}
                  isLoading={isProcessing}
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
    
    const isDisabled = selectedSeats.length === 0;
    
    return (
      <div className="sticky bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            {selectedCategory && (
              <div>
                <div className="font-semibold text-lg">₹{(selectedCategory.price * selectedSeats.length).toLocaleString()}</div>
                <div className="text-sm text-gray-500">{selectedSeats.length} {selectedSeats.length === 1 ? 'seat' : 'seats'}</div>
              </div>
            )}
          </div>
          
          <button 
            className={`btn-primary ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleProceedToPayment}
            disabled={isDisabled}
          >
            {isDisabled ? 'Select seats to continue' : 'Continue to Payment'}
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
