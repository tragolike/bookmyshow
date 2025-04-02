
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Share2, Heart, ChevronRight, Users, Info } from 'lucide-react';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import { getEventById } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isInterested, setIsInterested] = useState(false);
  
  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event', id],
    queryFn: () => getEventById(id || ''),
    enabled: !!id,
    retry: 2,
    // Instead of using onError directly, we'll use onSettled in the meta object
    meta: {
      onError: (err: Error) => {
        console.error('Error fetching event:', err);
        toast.error('Could not load event details');
      }
    },
  });
  
  const handleToggleInterest = () => {
    setIsInterested(!isInterested);
    toast.success(`${isInterested ? 'Removed from' : 'Added to'} your interests`);
  };
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.data?.title,
        text: 'Check out this event!',
        url: window.location.href,
      }).catch(err => {
        console.error('Error sharing:', err);
      });
    } else {
      // Fallback copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };
  
  const handleBookNow = () => {
    navigate(`/events/${id}/booking`);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/3">
                <div className="aspect-[3/4] bg-gray-300 rounded-xl"></div>
              </div>
              <div className="md:w-2/3 space-y-4">
                <div className="h-8 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-gray-300 rounded"></div>
                        <div className="space-y-1">
                          <div className="h-4 bg-gray-300 rounded w-24"></div>
                          <div className="h-3 bg-gray-200 rounded w-16"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  // Show error state
  if (error || !event?.data) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center justify-center">
          <div className="text-center">
            <h1 className="text-9xl font-bold text-book-primary">404</h1>
            <h2 className="text-4xl font-bold mt-4">Page not found</h2>
            <p className="mt-4 text-gray-600 text-lg max-w-md">
              The event you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
            <Button 
              onClick={() => navigate('/')} 
              className="mt-8 bg-book-primary hover:bg-book-primary/90"
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
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Event Image */}
            <div className="md:w-1/3">
              <div className="rounded-xl overflow-hidden shadow-lg">
                <img 
                  src={event.data.image} 
                  alt={event.data.title}
                  className="w-full h-auto"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
              </div>
              
              <div className="flex gap-2 mt-4">
                <button 
                  onClick={handleShare}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 py-2 rounded-md flex items-center justify-center gap-1"
                >
                  <Share2 className="w-5 h-5" />
                  <span>Share</span>
                </button>
                
                <button 
                  onClick={handleToggleInterest}
                  className={`flex-1 py-2 rounded-md flex items-center justify-center gap-1 ${
                    isInterested ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isInterested ? 'fill-pink-600 text-pink-600' : ''}`} />
                  <span>{isInterested ? 'Interested' : 'Interest'}</span>
                </button>
              </div>
            </div>
            
            {/* Event Details */}
            <div className="md:w-2/3">
              <div className="flex items-center gap-2 text-sm text-book-primary mb-2">
                <span className="uppercase">{event.data.category}</span>
              </div>
              
              <h1 className="text-3xl font-bold mb-2">{event.data.title}</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Date & Time</h4>
                      <p className="text-gray-600">{event.data.date}, {event.data.time}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Venue</h4>
                      <p className="text-gray-600">{event.data.venue}, {event.data.city}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Status</h4>
                      <div className="flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-2 ${
                          event.data.status === 'available' ? 'bg-green-500' : 
                          event.data.status === 'fast-filling' ? 'bg-amber-500' : 'bg-red-500'
                        }`}></span>
                        <p className="text-gray-600 capitalize">{event.data.status.replace('-', ' ')}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Price</span>
                      <span className="font-bold">₹ {event.data.price}</span>
                    </div>
                    
                    <button 
                      onClick={handleBookNow}
                      className="w-full py-3 bg-book-primary text-white rounded-md hover:bg-book-primary/90 transition-colors"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-5 h-5 text-amber-500" />
                  <h3 className="font-medium">Important Information</h3>
                </div>
                <ul className="list-disc list-inside text-gray-600 space-y-1 pl-2">
                  <li>Please arrive at least 15 minutes before the event.</li>
                  <li>Tickets once booked cannot be exchanged or refunded.</li>
                  <li>Children above the age of 5 require a separate ticket.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default EventDetail;
