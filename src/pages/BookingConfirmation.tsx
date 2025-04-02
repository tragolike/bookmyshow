
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { getEventById } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Download, 
  Calendar, 
  Clock, 
  MapPin, 
  TicketIcon, 
  AlertTriangle,
  ArrowLeft,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingDetails] = useState(location.state || {});
  
  useEffect(() => {
    // If no booking details are present, redirect to home
    if (!location.state || !location.state.bookingId) {
      navigate('/');
      toast.error('No booking information found');
      return;
    }
    
    const fetchEventDetails = async () => {
      try {
        if (location.state?.eventId) {
          const { data, error } = await getEventById(location.state.eventId);
          if (error) throw error;
          setEvent(data);
        }
      } catch (error) {
        console.error('Error fetching event details:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEventDetails();
  }, [location.state, navigate]);
  
  const handleDownloadTicket = () => {
    // In a real app, this would generate a PDF
    toast.success('Ticket download started...');
    
    // Mock download by creating a timeout
    setTimeout(() => {
      toast.info('Tickets have also been emailed to your registered email address');
    }, 2000);
  };
  
  const formatSeatNumbers = (seats: string[] = []) => {
    if (!seats || seats.length === 0) return 'N/A';
    return seats.join(', ');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-book-primary border-t-transparent rounded-full animate-spin" />
            <h2 className="text-xl font-semibold">Loading booking details...</h2>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-gradient-to-b from-gray-50 to-white py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
              <TicketIcon className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Your tickets have been booked successfully!</h1>
            <p className="text-gray-600">Your e-tickets have been sent to your email address</p>
          </div>
          
          <Card className="overflow-hidden border-0 shadow-lg mb-8">
            <div className="bg-gradient-to-r from-book-primary to-indigo-600 text-white py-4 px-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Booking Details</h2>
                <span className="text-sm bg-white/20 py-1 px-3 rounded-full">#{bookingDetails.bookingId?.slice(-8) || '00000000'}</span>
              </div>
            </div>
            
            <CardContent className="p-0">
              <div className="divide-y">
                {/* Event Details */}
                <div className="p-6">
                  <h3 className="font-semibold text-lg mb-4">{event?.title || 'Event'}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="font-medium">{event?.date || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Time</p>
                        <p className="font-medium">{event?.time || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Venue</p>
                        <p className="font-medium">{event?.venue || 'N/A'}, {event?.city || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <TicketIcon className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Category</p>
                        <p className="font-medium">{bookingDetails.category || 'Standard'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Ticket Details */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold">Ticket Information</h3>
                      <p className="text-sm text-gray-500">Show this QR code at the venue</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Booked On</p>
                      <p className="font-medium">{new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-6">
                    <div>
                      <div className="border-2 border-book-primary p-3 rounded-lg bg-white mb-4 w-36 h-36 mx-auto">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=TICKET:${bookingDetails.bookingId || 'DEMO'}`}
                          alt="Ticket QR Code" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Number of Tickets:</span>
                          <span className="font-medium">{bookingDetails.seats || 0}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Seat Numbers:</span>
                          <span className="font-medium">{formatSeatNumbers(bookingDetails.seatNumbers)}</span>
                        </div>
                        
                        <div className="flex justify-between border-t pt-2 mt-2">
                          <span className="text-gray-700 font-medium">Amount Paid:</span>
                          <span className="font-bold text-lg">₹{bookingDetails.amount?.toLocaleString() || '0'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Important Information */}
                <div className="p-6 bg-gray-50">
                  <h3 className="font-semibold mb-3">Important Information</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">1</span>
                      Please arrive at least 45 minutes before the event starts.
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">2</span>
                      Carry a valid ID proof for verification purposes.
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">3</span>
                      Outside food and beverages are not allowed inside the venue.
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="bg-red-100 text-red-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">4</span>
                      Tickets once booked cannot be cancelled or refunded.
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
            
            <Button
              onClick={() => navigate('/my-bookings')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              View My Bookings
            </Button>
            
            <Button
              onClick={handleDownloadTicket}
              className="flex items-center gap-2 bg-book-primary hover:bg-book-primary/90"
            >
              <Download className="w-4 h-4" />
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
