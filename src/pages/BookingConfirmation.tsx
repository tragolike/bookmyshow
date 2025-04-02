
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Download, ArrowLeft, Eye, Ticket, AlertCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { db } from '@/integrations/supabase/client';

interface BookingInfo {
  bookingId: string;
  eventId: string;
  seatNumbers: string[];
  category: string;
  amount: number;
}

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookingData, setBookingData] = useState<any | null>(null);
  const [eventData, setEventData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bookingInfo = location.state as BookingInfo;
    
    if (!bookingInfo) {
      toast.error('No booking information found');
      navigate('/');
      return;
    }
    
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch booking details
        const { data: bookingData, error: bookingError } = await db.bookings()
          .select('*')
          .eq('id', bookingInfo.bookingId)
          .single();
          
        if (bookingError) throw bookingError;
        
        // Fetch event details
        const { data: eventData, error: eventError } = await db.events()
          .select('*')
          .eq('id', bookingInfo.eventId)
          .single();
          
        if (eventError) throw eventError;
        
        setBookingData(bookingData);
        setEventData(eventData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load booking details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [location.state, navigate]);
  
  const handleDownloadTicket = () => {
    // In a real implementation, this would generate and download a PDF ticket
    toast.success('Ticket download started');
  };
  
  const handleBackToHome = () => {
    navigate('/');
  };
  
  const handleViewBookings = () => {
    navigate('/my-bookings');
  };
  
  // Generate booking reference code
  const bookingRef = location.state?.bookingId 
    ? `#${location.state.bookingId.substring(0, 8).toUpperCase()}`
    : '#UNKNOWN';
  
  const bookingDate = new Date().toLocaleDateString('en-GB');
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-book-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold">Loading booking details...</h2>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <Header />
      
      <main className="flex-1 flex flex-col py-6">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Success Banner */}
          <div className="mb-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
              <Ticket className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">Your tickets have been booked successfully!</h1>
            <p className="text-gray-300">Your e-tickets have been sent to your email address</p>
          </div>
          
          {/* Booking Details Card */}
          <div className="bg-gray-800 rounded-xl overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-3 flex justify-between items-center">
              <h2 className="font-bold">Booking Details</h2>
              <span className="text-sm font-mono">{bookingRef}</span>
            </div>
            
            <div className="p-5">
              {/* Event Details */}
              <h3 className="text-xl font-bold mb-1">{eventData?.title}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-book-primary" />
                    <div>
                      <div className="text-gray-300 text-sm">Date</div>
                      <div>{eventData?.date}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-book-primary" />
                    <div>
                      <div className="text-gray-300 text-sm">Time</div>
                      <div>{eventData?.time}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-book-primary" />
                    <div>
                      <div className="text-gray-300 text-sm">Venue</div>
                      <div>{eventData?.venue}, {eventData?.city}</div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="text-gray-300 text-sm">Category</div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span>{location.state?.category || 'Standard'}</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-gray-300 text-sm">Number of Tickets</div>
                    <div>{location.state?.seatNumbers?.length || 0}</div>
                  </div>
                  
                  <div>
                    <div className="text-gray-300 text-sm">Seat Numbers</div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {location.state?.seatNumbers?.map((seat: string) => (
                        <span key={seat} className="bg-gray-700 px-2 py-0.5 rounded text-sm">
                          {seat}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-gray-300 text-sm">Amount Paid</div>
                    <div className="text-xl font-bold">₹{location.state?.amount?.toLocaleString() || '0'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Ticket Information */}
          <div className="bg-gray-800 rounded-xl overflow-hidden mb-8">
            <div className="p-5">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-shrink-0 bg-white p-3 rounded-lg">
                  <QRCodeSVG
                    value={`SHOWTIX:${location.state?.bookingId || 'unknown'}`}
                    size={150}
                    includeMargin={true}
                    level="H"
                  />
                </div>
                
                <div className="flex-grow space-y-4">
                  <h3 className="font-semibold">Ticket Information</h3>
                  <p className="text-gray-300 text-sm">Show this QR code at the venue</p>
                  
                  <div className="text-right">
                    <div className="text-gray-300 text-sm">Booked On</div>
                    <div>{bookingDate}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Important Information */}
          <div className="bg-gray-800 rounded-xl overflow-hidden mb-8">
            <div className="p-5">
              <h3 className="font-semibold mb-4">Important Information</h3>
              
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <div className="bg-blue-500 text-white rounded-full h-5 w-5 flex-shrink-0 flex items-center justify-center text-xs">1</div>
                  <span>Please arrive at least 45 minutes before the event starts.</span>
                </li>
                <li className="flex gap-3">
                  <div className="bg-blue-500 text-white rounded-full h-5 w-5 flex-shrink-0 flex items-center justify-center text-xs">2</div>
                  <span>Carry a valid ID proof for verification purposes.</span>
                </li>
                <li className="flex gap-3">
                  <div className="bg-blue-500 text-white rounded-full h-5 w-5 flex-shrink-0 flex items-center justify-center text-xs">3</div>
                  <span>Outside food and beverages are not allowed inside the venue.</span>
                </li>
                <li className="flex gap-3">
                  <div className="bg-blue-500 text-white rounded-full h-5 w-5 flex-shrink-0 flex items-center justify-center text-xs">4</div>
                  <span>Tickets once booked cannot be cancelled or refunded.</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="outline" 
              onClick={handleBackToHome}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleViewBookings}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              View My Bookings
            </Button>
            
            <Button 
              onClick={handleDownloadTicket}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Tickets
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BookingConfirmation;
