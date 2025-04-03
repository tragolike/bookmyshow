
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import UpiPayment from '@/components/payment/UpiPayment';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  // Get payment details from location state
  const paymentDetails = location.state;
  
  // If no payment details are provided, redirect to home
  useEffect(() => {
    if (!paymentDetails || !paymentDetails.totalAmount) {
      toast.error('Payment information not found');
      navigate('/');
    }
    
    if (!user) {
      toast.error('Please login to continue with payment');
      navigate('/login', { state: { from: '/payment' } });
    }
  }, [paymentDetails, navigate, user]);
  
  const handlePaymentComplete = () => {
    // Navigate to confirmation page with payment details
    navigate('/booking-confirmation', { 
      state: { 
        ...paymentDetails,
        paymentCompleted: true 
      } 
    });
  };
  
  if (!paymentDetails) {
    return null; // Preventing rendering before redirect
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span>Back</span>
          </button>
          
          <h1 className="text-2xl font-bold mt-4">Complete Your Payment</h1>
          <p className="text-gray-600">
            Event: {paymentDetails.eventName} | Seats: {paymentDetails.seatNumbers?.join(', ')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <UpiPayment 
              amount={paymentDetails.totalAmount} 
              reference={paymentDetails.eventId + '-' + Date.now().toString().slice(-6)} 
              onComplete={handlePaymentComplete}
            />
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-6">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Event</span>
                  <span className="font-medium">{paymentDetails.eventName}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Venue</span>
                  <span className="font-medium">{paymentDetails.venueName}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Category</span>
                  <span className="font-medium">{paymentDetails.categoryName}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Seats</span>
                  <span className="font-medium">{paymentDetails.seatNumbers?.join(', ')}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Tickets</span>
                  <span className="font-medium">{paymentDetails.ticketCount}</span>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Amount</span>
                    <span className="font-bold text-xl text-book-primary">₹{paymentDetails.totalAmount?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PaymentPage;
