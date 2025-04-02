import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Film, Music, Ticket, Calendar, ChevronRight } from 'lucide-react';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import EventCard, { EventProps } from '@/components/EventCard';
import MovieCard, { MovieProps } from '@/components/MovieCard';
import CategoryFilter from '@/components/CategoryFilter';
import LanguageSelector from '@/components/LanguageSelector';
import { db, EventStatus } from '@/integrations/supabase/client';
import { toast } from 'sonner';
const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('kolkata');
  const [selectedLanguage, setSelectedLanguage] = useState('english');
  const [events, setEvents] = useState<EventProps[]>([]);
  const [movies, setMovies] = useState<MovieProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const categoryOptions = [{
    id: 'all',
    label: 'All Categories'
  }, {
    id: 'movies',
    label: 'Movies',
    icon: <Film className="w-4 h-4" />
  }, {
    id: 'concerts',
    label: 'Concerts',
    icon: <Music className="w-4 h-4" />
  }, {
    id: 'sports',
    label: 'Sports',
    icon: <Ticket className="w-4 h-4" />
  }, {
    id: 'comedy',
    label: 'Comedy Shows'
  }, {
    id: 'theatre',
    label: 'Theatre'
  }, {
    id: 'activities',
    label: 'Activities'
  }];
  const cityOptions = [{
    id: 'kolkata',
    label: 'Kolkata'
  }, {
    id: 'mumbai',
    label: 'Mumbai'
  }, {
    id: 'delhi',
    label: 'Delhi'
  }, {
    id: 'bangalore',
    label: 'Bangalore'
  }, {
    id: 'chennai',
    label: 'Chennai'
  }, {
    id: 'hyderabad',
    label: 'Hyderabad'
  }];
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch events
        const {
          data: eventsData,
          error: eventsError
        } = await db.events().select('*').order('interested', {
          ascending: false
        }).limit(4);
        if (eventsError) throw eventsError;

        // Fetch movies
        const {
          data: moviesData,
          error: moviesError
        } = await db.movies().select('*').order('rating', {
          ascending: false
        }).limit(4);
        if (moviesError) throw moviesError;

        // Set events with proper type casting for status
        if (eventsData) {
          const typedEvents = eventsData.map(event => ({
            ...event,
            status: event.status as EventStatus || 'available'
          }));
          setEvents(typedEvents);
        }
        setMovies(moviesData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load content');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);
  return <div className="min-h-screen flex flex-col">
      <Header transparent={true} />
      
      <main className="flex-1">
        <HeroSection />
        
        <div className="page-container pt-10">
          {/* Language Selector */}
          <div className="mb-8">
            <LanguageSelector onSelectLanguage={setSelectedLanguage} defaultLanguage={selectedLanguage} />
          </div>
          
          {/* Coming Soon Section */}
          <div className="mb-8">
            <div className="glass-card rounded-xl p-4 bg-gradient-to-r from-red-500 to-red-600 text-white flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-1">Coming Soon</h2>
                <p>Explore Upcoming Movies</p>
              </div>
              <ChevronRight className="w-6 h-6" />
            </div>
          </div>
          
          {/* City & Category Filters */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <h2 className="section-title"></h2>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <CategoryFilter options={cityOptions} onChange={setSelectedCity} defaultSelected="kolkata" />
              
              <CategoryFilter options={categoryOptions} onChange={setSelectedCategory} />
            </div>
          </div>
          
          {/* Popular Events */}
          <section className="mb-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {isLoading ?
            // Loading skeletons
            Array.from({
              length: 4
            }).map((_, index) => <div key={index} className="animate-pulse">
                    <div className="rounded-lg bg-gray-200 h-48 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>) : events.map(event => <EventCard key={event.id} {...event} />)}
            </div>
            
            <div className="text-center mt-8">
              <Link to="/live-events" className="btn-secondary">
                View All Events
              </Link>
            </div>
          </section>
          
          {/* Special Offers */}
          <section className="mb-12">
            <h2 className="section-title">Special Offers</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-200">
              <div className="relative rounded-2xl overflow-hidden aspect-[21/9]">
                <img src="/lovable-uploads/a6f58909-a0b4-48f4-929b-2a3f51d568ce.png" alt="Get 24 free tickets with credit card" className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
                  <h3 className="text-white text-xl font-bold mb-2">Your next credit card gets you 24 free tickets!</h3>
                  <p className="text-white/80 mb-4">Apply now and get exclusive discounts on your bookings</p>
                  <button className="btn-primary w-full md:w-auto">Apply Now</button>
                </div>
              </div>
              
              <div className="relative rounded-2xl overflow-hidden aspect-[21/9]">
                <img src="/lovable-uploads/5ec570bc-cd94-4965-9f1f-2de8132737b8.png" alt="Live theatre play" className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
                  <h3 className="text-white text-xl font-bold mb-2">Humare Ram - A LIVE Theatre Play</h3>
                  <p className="text-white/80 mb-4">A New Perspective on the Ramayana!</p>
                  <button className="btn-primary w-full md:w-auto">Book Now</button>
                </div>
              </div>
            </div>
          </section>
          
          {/* Recommended Movies */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="section-title">Recommended Movies</h2>
              <Link to="/movies" className="text-book-primary font-medium flex items-center">
                <span>See All</span>
                <ChevronRight className="w-5 h-5 ml-1" />
              </Link>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {isLoading ?
            // Loading skeletons
            Array.from({
              length: 5
            }).map((_, index) => <div key={index} className="animate-pulse">
                    <div className="rounded-lg bg-gray-200 h-64 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>) : movies.map(movie => <MovieCard key={movie.id} {...movie} />)}
            </div>
          </section>
          
          {/* Event Categories */}
          <section className="mb-12">
            <h2 className="section-title">Explore by Category</h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-2">
                  <Film className="w-12 h-12 text-white" />
                </div>
                <span className="font-medium">Movies</span>
              </div>
              
              <div className="text-center">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center mb-2">
                  <Music className="w-12 h-12 text-white" />
                </div>
                <span className="font-medium">Concerts</span>
              </div>
              
              <div className="text-center">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center mb-2">
                  <Ticket className="w-12 h-12 text-white" />
                </div>
                <span className="font-medium">Sports</span>
              </div>
              
              <div className="text-center">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-2">
                  <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 17.929H3C2.448 17.929 2 17.481 2 16.929V13.2868C2 12.9946 2.148 12.7242 2.393 12.5634L3.5 11.929M8 17.929H16M8 17.929V13.929C8 12.8245 8.89543 11.929 10 11.929H14C15.1046 11.929 16 12.8245 16 13.929V17.929M16 17.929H21C21.5523 17.929 22 17.4814 22 16.929V13.2868C22 12.9946 21.852 12.7242 21.607 12.5634L20.5 11.929M13 11.929V9.92896C13 8.82439 12.1046 7.92896 11 7.92896C9.89543 7.92896 9 8.82439 9 9.92896M14.5 7.92896C14.5 6.55582 13.3789 5.42896 12 5.42896C10.6211 5.42896 9.5 6.55582 9.5 7.92896C9.5 9.30211 10.6211 10.429 12 10.429C13.3789 10.429 14.5 9.30211 14.5 7.92896Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="font-medium">Comedy</span>
              </div>
              
              <div className="text-center">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center mb-2">
                  <Calendar className="w-12 h-12 text-white" />
                </div>
                <span className="font-medium">Theatre</span>
              </div>
              
              <div className="text-center">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-2">
                  <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 5V7M15 11V13M15 17V19M5 5C5 6.10457 5.89543 7 7 7H11C12.1046 7 13 6.10457 13 5C13 3.89543 12.1046 3 11 3H7C5.89543 3 5 3.89543 5 5ZM5 19C5 20.1046 5.89543 21 7 21H11C12.1046 21 13 20.1046 13 19C13 17.8954 12.1046 17 11 17H7C5.89543 17 5 17.8954 5 19ZM5 12C5 13.1046 5.89543 14 7 14H11C12.1046 14 13 13.1046 13 12C13 10.8954 12.1046 10 11 10H7C5.89543 10 5 10.8954 5 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M19 12C19 10.8954 18.1046 10 17 10C15.8954 10 15 10.8954 15 12C15 13.1046 15.8954 14 17 14C18.1046 14 19 13.1046 19 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="font-medium">Activities</span>
              </div>
            </div>
          </section>
          
          {/* Best Events This Week */}
          <section className="mb-12">
            <h2 className="section-title">Best Events This Week</h2>
            <p className="text-gray-600 mb-6">Monday to Sunday, we got you covered</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-pink-100 rounded-lg overflow-hidden relative">
                <img src="/lovable-uploads/0fd32f0a-9c12-4231-9802-96980d536ed7.png" alt="Plan for Today" className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-4 bg-gradient-to-t from-pink-600/80 via-pink-600/50 to-transparent">
                  <h3 className="text-2xl font-bold mb-1">PLAN FOR TODAY</h3>
                  <p className="text-lg font-medium">6 Events</p>
                </div>
              </div>
              
              <div className="bg-green-100 rounded-lg overflow-hidden relative">
                <img src="/lovable-uploads/de56d65d-b22e-441f-93bf-405beb74b0c1.png" alt="Plan for Tomorrow" className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-4 bg-gradient-to-t from-green-600/80 via-green-600/50 to-transparent">
                  <h3 className="text-2xl font-bold mb-1">PLAN FOR TOMORROW</h3>
                  <p className="text-lg font-medium">25+ Events</p>
                </div>
              </div>
              
              <div className="bg-blue-100 rounded-lg overflow-hidden relative">
                <img src="/lovable-uploads/08aa6b44-d684-4348-944e-67a3e4d2a992.png" alt="Weekend Plans" className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-4 bg-gradient-to-t from-blue-600/80 via-blue-600/50 to-transparent">
                  <h3 className="text-2xl font-bold mb-1">WEEKEND PLANS</h3>
                  <p className="text-lg font-medium">110+ Events</p>
                </div>
              </div>
            </div>
          </section>
          
          {/* Download App Banner */}
          <section className="rounded-2xl overflow-hidden bg-gradient-to-r from-book-dark to-purple-900 mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-6 md:p-12 flex flex-col justify-center">
                <h2 className="text-white text-3xl font-bold mb-4">Download the Book My Show App</h2>
                <p className="text-white/80 mb-6">Get the best experience on your phone. Book tickets, explore events, and more!</p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <a href="#" className="inline-block">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Google_Play_Store_badge_EN.svg/2560px-Google_Play_Store_badge_EN.svg.png" alt="Get it on Google Play" className="h-12" />
                  </a>
                  <a href="#" className="inline-block">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Download_on_the_App_Store_Badge.svg/2560px-Download_on_the_App_Store_Badge.svg.png" alt="Download on App Store" className="h-12" />
                  </a>
                </div>
              </div>
              
              <div className="hidden md:flex items-center justify-center p-12">
                <img alt="App QR Code" className="max-h-60" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXqzmafEsSnqftFi6w33hGSpkcLE70MZzO7kUsyqCk9TOH5nsgRLUHhSZdCa74HxNwEIk&usqp=CAU" />
              </div>
            </div>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>;
};
export default Index;