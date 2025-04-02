
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Share2, Heart, ChevronRight, Users, Info } from 'lucide-react';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import { getEventById } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isInterested, setIsInterested] = useState(false);
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!id) return;
      
      setIsLoading(true);
      const { data, error } = await getEventById(id);
      
      if (error || !data) {
        console.error('Error fetching event:', error);
        setError('Event not found or an error occurred');
        toast.error('Could not load event details');
      } else {
        setEvent(data);
      }
      
      setIsLoading(false);
    };
    
    fetchEventDetails();
  }, [id]);
  
  const handleToggleInterest = () => {
    setIsInterested(!isInterested);
    toast.success(`${isInterested ? 'Removed from' : 'Added to'} your interests`);
  };
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title,
        text: event?.subtitle,
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
  if (error || !event) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Event Not Found</h1>
            <p className="text-gray-600 mb-8">The event you're looking for doesn't exist or has been removed.</p>
            <button 
              onClick={() => navigate('/live-events')}
              className="btn-primary"
            >
              Browse All Events
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  // Render the mock data for demo purposes if there's no actual data yet
  const eventData = event || {
    id: 'kkr-vs-rcb',
    title: 'Kolkata Knight Riders vs Royal Challengers Bengaluru',
    subtitle: 'The Champions are back! The IPL 2025 season opener sees the champions face the Royal Challengers Bengaluru at Eden Gardens.',
    image: '/lovable-uploads/933af9b9-e587-4f31-9e71-7474b68aa224.png',
    date: 'Sat 22 Mar 2025',
    time: '7:30 PM',
    duration: '4 Hours',
    venue: 'Eden Gardens',
    city: 'Kolkata',
    category: 'Cricket',
    language: 'English',
    ageLimit: '2yrs +',
    price: {
      min: 900,
      max: 10000
    },
    interested: 20900,
    status: 'fast-filling'
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <div className="relative bg-book-dark">
          <div className="absolute inset-0 overflow-hidden">
            <img 
              src={eventData.image} 
              alt={eventData.title} 
              className="w-full h-full object-cover opacity-40"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.svg";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-book-dark to-transparent" />
          </div>
          
          <div className="container mx-auto px-4 py-8 relative z-10">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Event Image */}
              <div className="md:w-1/3 flex-shrink-0">
                <div className="rounded-xl overflow-hidden shadow-xl aspect-[3/4] bg-white/5 backdrop-blur-sm border border-white/10">
                  <img 
                    src={eventData.image} 
                    alt={eventData.title} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                </div>
              </div>
              
              {/* Event Details */}
              <div className="md:w-2/3 text-white">
                <div className="mb-6">
                  <span className="chip bg-book-primary mb-3">
                    {eventData.category}
                  </span>
                  <h1 className="text-3xl md:text-4xl font-bold mb-4">
                    {eventData.title}
                  </h1>
                  <p className="text-lg text-white/80 mb-6">
                    {eventData.subtitle}
                  </p>
                </div>
                
                {/* Event Meta Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-book-primary mt-0.5" />
                      <div>
                        <div className="font-semibold">{eventData.date}</div>
                        <div className="text-sm text-white/70">Date</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-book-primary mt-0.5" />
                      <div>
                        <div className="font-semibold">{eventData.time}</div>
                        <div className="text-sm text-white/70">Time</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-book-primary mt-0.5" />
                      <div>
                        <div className="font-semibold">{eventData.venue}</div>
                        <div className="text-sm text-white/70">{eventData.city}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-book-primary mt-0.5" />
                      <div>
                        <div className="font-semibold">{eventData.ageLimit}</div>
                        <div className="text-sm text-white/70">Age Limit</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-book-primary mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                      </svg>
                      <div>
                        <div className="font-semibold">{eventData.language}</div>
                        <div className="text-sm text-white/70">Language</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-book-primary mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <div className="font-semibold">{eventData.duration}</div>
                        <div className="text-sm text-white/70">Duration</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Price and CTA */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                  <div>
                    <div className="text-lg">Ticket Price</div>
                    <div className="text-2xl font-bold">
                      ₹{eventData.price?.min?.toLocaleString()} - ₹{eventData.price?.max?.toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button 
                      className="btn-secondary flex items-center gap-2"
                      onClick={handleToggleInterest}
                    >
                      <Heart className={`w-5 h-5 ${isInterested ? 'fill-book-primary text-book-primary' : ''}`} />
                      <span>{isInterested ? 'Interested' : 'Interest'}</span>
                    </button>
                    
                    <button 
                      className="btn-secondary flex items-center gap-2"
                      onClick={handleShare}
                    >
                      <Share2 className="w-5 h-5" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
                
                {/* Book Now */}
                <div className="mt-auto">
                  {eventData.status === 'fast-filling' && (
                    <p className="text-yellow-400 flex items-center gap-2 mb-4">
                      <Info className="w-4 h-4" />
                      <span>Bookings are filling fast for {eventData.city}</span>
                    </p>
                  )}
                  
                  <button 
                    className="btn-primary w-full flex items-center justify-center gap-2"
                    onClick={handleBookNow}
                  >
                    <span>Book Now</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Event Details */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h2 className="section-title">About The Event</h2>
              
              <div className="prose max-w-none">
                <p className="mb-4">
                  Get ready for an electrifying encounter as the Kolkata Knight Riders take on the Royal Challengers Bengaluru in the opening match of the IPL 2025 season at the iconic Eden Gardens in Kolkata.
                </p>
                
                <p className="mb-4">
                  The atmosphere will be electric as two of the most passionate fanbases in the IPL come together to witness the beginning of another exciting season of cricket. Witness the stars of both teams battle it out in what promises to be a thrilling contest.
                </p>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">Team Information:</h3>
                
                <p className="mb-2">
                  <strong>Kolkata Knight Riders:</strong> Led by their charismatic captain, KKR will be looking to start their campaign with a win in front of their home crowd. With a balanced squad of explosive batsmen, crafty spinners, and express pace bowlers, they are a formidable unit in the IPL.
                </p>
                
                <p className="mb-6">
                  <strong>Royal Challengers Bengaluru:</strong> RCB is always a crowd favorite with their star-studded lineup. Known for their batting prowess, RCB will be aiming to overcome their previous setbacks and start the season on a high note.
                </p>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">Venue Information:</h3>
                
                <p className="mb-4">
                  Eden Gardens is one of the most iconic cricket stadiums in the world, with a rich history and an electric atmosphere. The stadium has a seating capacity of over 66,000 and is known for its passionate supporters who create an intimidating environment for visiting teams.
                </p>
              </div>
              
              <h2 className="section-title mt-12">Terms & Conditions</h2>
              
              <div className="prose max-w-none">
                <ul className="space-y-2 list-disc pl-5">
                  <li>Tickets once booked cannot be exchanged or refunded.</li>
                  <li>We recommend that you arrive at least 45 minutes before the match starts.</li>
                  <li>Parking is limited, so we recommend using public transport.</li>
                  <li>No outside food and beverages are allowed inside the stadium.</li>
                  <li>Children above the age of 2 years will need a separate ticket.</li>
                  <li>Please carry a valid ID proof along with your ticket.</li>
                </ul>
              </div>
            </div>
            
            <div>
              <div className="sticky top-20">
                <h2 className="section-title">Venue</h2>
                
                <div className="rounded-xl overflow-hidden mb-6">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3684.364128332756!2d88.3411!3d22.5646!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a0276dcad2e531d%3A0xb444e402bf95506c!2sEden%20Gardens!5e0!3m2!1sen!2sin!4v1645167128175!5m2!1sen!2sin" 
                    width="100%" 
                    height="250" 
                    style={{ border: 0 }} 
                    allowFullScreen={true} 
                    loading="lazy"
                    title="Venue Map"
                  ></iframe>
                </div>
                
                <div className="glass-card rounded-xl p-5">
                  <h3 className="font-semibold text-lg mb-3">Eden Gardens</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Eden Gardens, Kolkata, West Bengal 700021
                  </p>
                  
                  <h4 className="font-medium text-sm uppercase text-gray-500 mb-2">How to reach</h4>
                  <ul className="space-y-3 mb-4">
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 rounded-full text-blue-600">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                      <div className="text-sm">
                        <strong>Metro:</strong> Esplanade Metro Station (0.8 km)
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-green-100 rounded-full text-green-600">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                      <div className="text-sm">
                        <strong>Bus:</strong> Multiple bus routes available
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-yellow-100 rounded-full text-yellow-600">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                      <div className="text-sm">
                        <strong>Taxi/Cab:</strong> Available throughout the city
                      </div>
                    </li>
                  </ul>
                  
                  <button className="btn-secondary w-full flex items-center justify-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>View on Google Maps</span>
                  </button>
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

export default EventDetail;
