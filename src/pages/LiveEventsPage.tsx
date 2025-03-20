
import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import EventCard, { EventProps } from '@/components/EventCard';
import CitySelector from '@/components/CitySelector';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CategoryProps {
  id: string;
  name: string;
  image: string;
}

const categories: CategoryProps[] = [
  { id: 'sports', name: 'Sports', image: '/lovable-uploads/418f6774-bc15-454e-a87d-f6a6367ae422.png' },
  { id: 'music', name: 'Music Shows', image: '/lovable-uploads/0fd32f0a-9c12-4231-9802-96980d536ed7.png' },
  { id: 'comedy', name: 'Comedy Shows', image: '/lovable-uploads/801097ab-d933-47d7-912a-6f6c478bdcdb.png' },
  { id: 'amusement', name: 'Amusement Parks', image: '/lovable-uploads/90179a48-cf6a-49a2-b3cf-4042fa501b89.png' },
];

const LiveEventsPage = () => {
  const [events, setEvents] = useState<EventProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentCity, setCurrentCity] = useState('Kolkata');
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        let query = supabase.from('events').select('*');
        
        if (selectedCategory) {
          query = query.eq('category', selectedCategory);
        }
        
        if (currentCity) {
          query = query.eq('city', currentCity);
        }
        
        const { data, error } = await query;
        
        if (error) {
          throw error;
        }
        
        const formattedEvents = data.map(event => ({
          id: event.id,
          title: event.title,
          image: event.image,
          date: event.date,
          time: event.time,
          venue: event.venue,
          city: event.city,
          category: event.category,
          price: event.price,
          status: event.status || 'available',
          interested: event.interested || 0
        }));
        
        setEvents(formattedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
        toast.error('Failed to load events');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEvents();
  }, [selectedCategory, currentCity]);
  
  const handleCityChange = (city: string) => {
    setCurrentCity(city.charAt(0).toUpperCase() + city.slice(1));
  };
  
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="sticky top-0 z-30 bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ChevronLeft className="w-6 h-6 mr-2" />
              <div>
                <h1 className="text-2xl font-bold">Live Events</h1>
                <button 
                  className="flex items-center text-gray-600 text-sm" 
                  onClick={() => setShowCitySelector(true)}
                >
                  {currentCity}
                </button>
              </div>
            </div>
            
            <button className="p-2 rounded-full bg-gray-100">
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      <main className="flex-1 bg-gray-50">
        <div className="overflow-x-auto py-4 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex space-x-6">
              {categories.map(category => (
                <div 
                  key={category.id}
                  className="flex flex-col items-center space-y-2"
                  onClick={() => handleCategorySelect(category.id)}
                >
                  <div className={`relative w-16 h-16 rounded-lg overflow-hidden ${selectedCategory === category.id ? 'ring-2 ring-book-primary' : ''}`}>
                    <img 
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs text-center whitespace-nowrap">{category.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="py-6 bg-black text-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-2">Things To Do In Your City</h2>
            <p className="text-gray-300 mb-4">Here's what everyone is booking</p>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              </div>
            ) : events.length > 0 ? (
              <div className="relative">
                <div className="swiper-container overflow-hidden">
                  <div className="flex items-center">
                    <button className="absolute left-0 z-10 p-2 rounded-full bg-white/10 text-white">
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    
                    <div className="flex-1 relative">
                      {events.slice(0, 1).map(event => (
                        <div key={event.id} className="flex flex-col md:flex-row bg-black">
                          <div className="md:w-1/3">
                            <img 
                              src={event.image} 
                              alt={event.title}
                              className="w-full h-56 object-cover"
                            />
                          </div>
                          
                          <div className="md:w-2/3 p-4">
                            <h3 className="text-xl font-bold mb-1">{event.title}</h3>
                            <div className="text-gray-300 mb-1">Cricket</div>
                            <p className="mb-4 line-clamp-2">
                              The Champions are back! The IPL 2025 season opener sees the champions face the Royal...
                            </p>
                            
                            <div className="font-bold mb-4">₹ {event.price} onwards</div>
                            
                            <button className="w-full py-3 bg-book-primary text-white rounded-md">
                              Book Now
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <button className="absolute right-0 z-10 p-2 rounded-full bg-white/10 text-white">
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-center mt-4 space-x-1">
                  {[0, 1, 2, 3, 4].map(index => (
                    <div 
                      key={index}
                      className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-white' : 'bg-gray-500'}`}
                    ></div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-10">
                <p>No events found in {currentCity}</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="py-6">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-2">Choices Vast But Filling Fast</h2>
            <p className="text-gray-600 mb-6">Hurry, explore our range of fun events</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-100 rounded-lg overflow-hidden h-48 relative">
                <img 
                  src="/lovable-uploads/2f7d1b63-2b3c-4d46-af86-639b91ec42b6.png"
                  alt="Must Attend"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-end p-4 bg-gradient-to-t from-green-700/70 via-green-700/30 to-transparent">
                  <h3 className="text-white text-2xl font-bold">MUST-ATTEND</h3>
                </div>
              </div>
              
              <div className="bg-red-100 rounded-lg overflow-hidden h-48 relative">
                <img 
                  src="/lovable-uploads/83fb9133-34d0-4512-9e36-03d7ab6e58cc.png"
                  alt="Fast Filling"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-end p-4 bg-gradient-to-t from-red-700/70 via-red-700/30 to-transparent">
                  <h3 className="text-white text-2xl font-bold">FAST-FILLING</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <CitySelector 
        isOpen={showCitySelector}
        onClose={() => setShowCitySelector(false)}
        onSelectCity={handleCityChange}
        currentCity={currentCity}
      />
      
      <Footer />
    </div>
  );
};

export default LiveEventsPage;
