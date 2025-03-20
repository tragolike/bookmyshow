
import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Download, ArrowLeft } from 'lucide-react';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';

interface BookingDetails {
  eventId: string;
  seats: number;
  category: string;
  amount: number;
}

const BookingConfirmation = () => {
  const location = useLocation();
  const bookingDetails = location.state as BookingDetails;
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Generate a random booking ID
  const bookingId = Math.random().toString(36).substring(2, 10).toUpperCase();
  
  if (!bookingDetails) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <div className="text-5xl mb-6">🤔</div>
            <h1 className="text-2xl font-bold mb-4">No booking information found</h1>
            <p className="text-gray-600 mb-8">It seems you arrived here directly without completing a booking.</p>
            <Link to="/" className="btn-primary">
              Browse Events
            </Link>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            {/* Success Banner */}
            <div className="text-center mb-8 animate-fade-in">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              
              <h1 className="text-2xl font-bold mb-2">Booking Confirmed!</h1>
              <p className="text-gray-600">Your tickets have been booked successfully.</p>
            </div>
            
            {/* Booking Details Card */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="p-6 border-b">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Booking Details</h2>
                  <span className="text-sm text-gray-500">#{bookingId}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Event</div>
                    <div className="font-medium">Kolkata Knight Riders vs Royal Challengers Bengaluru</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Date & Time</div>
                    <div className="font-medium">Sat 22 Mar 2025, 7:30 PM</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Venue</div>
                    <div className="font-medium">Eden Gardens, Kolkata</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Category</div>
                    <div className="font-medium">{bookingDetails.category}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Number of Tickets</div>
                    <div className="font-medium">{bookingDetails.seats}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Amount Paid</div>
                    <div className="font-medium">₹{bookingDetails.amount.toLocaleString()}</div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Booked On</div>
                    <div className="font-medium">{new Date().toLocaleDateString()}</div>
                  </div>
                  
                  <button className="btn-secondary flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    <span>Download Tickets</span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* QR Code */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden p-6 text-center mb-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <h3 className="font-bold mb-4">Show this QR code at the venue</h3>
              
              <div className="mb-4 flex justify-center">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/1200px-QR_code_for_mobile_English_Wikipedia.svg.png" 
                  alt="Booking QR Code" 
                  className="w-48 h-48"
                />
              </div>
              
              <div className="text-sm text-gray-600">
                Your tickets have also been sent to your email address
              </div>
            </div>
            
            {/* Additional Info */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <div className="p-6">
                <h3 className="font-bold mb-4">Important Information</h3>
                
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center mt-0.5">
                      <span className="text-blue-600 text-xs font-bold">1</span>
                    </div>
                    <span>Please arrive at least 45 minutes before the event starts.</span>
                  </li>
                  
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center mt-0.5">
                      <span className="text-blue-600 text-xs font-bold">2</span>
                    </div>
                    <span>Carry a valid ID proof for verification purposes.</span>
                  </li>
                  
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center mt-0.5">
                      <span className="text-blue-600 text-xs font-bold">3</span>
                    </div>
                    <span>Outside food and beverages are not allowed inside the venue.</span>
                  </li>
                  
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center mt-0.5">
                      <span className="text-blue-600 text-xs font-bold">4</span>
                    </div>
                    <span>Tickets once booked cannot be cancelled or refunded.</span>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: '0.8s' }}>
              <Link to="/" className="btn-secondary flex-1 flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </Link>
              
              <Link to="/my-bookings" className="btn-primary flex-1 flex items-center justify-center gap-2">
                <span>View My Bookings</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BookingConfirmation;
