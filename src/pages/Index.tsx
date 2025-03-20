
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Film, Music, Ticket, Calendar } from 'lucide-react';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import EventCard, { EventProps } from '@/components/EventCard';
import MovieCard, { MovieProps } from '@/components/MovieCard';
import CategoryFilter from '@/components/CategoryFilter';

// Mock data
const trendingEvents: EventProps[] = [
  {
    id: 'kkr-vs-rcb',
    title: 'Kolkata Knight Riders vs Royal Challengers Bengaluru',
    image: '/lovable-uploads/933af9b9-e587-4f31-9e71-7474b68aa224.png',
    date: 'Sat 22 Mar 2025',
    time: '7:30 PM',
    venue: 'Eden Gardens',
    city: 'Kolkata',
    category: 'Cricket',
    price: 900,
    status: 'fast-filling',
    interested: 20900
  },
  {
    id: 'arijit-singh-concert',
    title: 'Arijit Singh Live in Concert',
    image: '/lovable-uploads/0717f399-6c25-40d2-ab0c-e8dce44e2e91.png',
    date: 'Fri 15 Apr 2025',
    time: '6:00 PM',
    venue: 'Jawaharlal Nehru Stadium',
    city: 'Delhi',
    category: 'Music',
    price: 2500,
    status: 'available',
    interested: 15800
  },
  {
    id: 'standup-comedy',
    title: 'Comedy Night with Vir Das',
    image: '/lovable-uploads/16d0f852-d124-40f8-9ce8-998d21e53155.png',
    date: 'Sat 05 Apr 2025',
    time: '8:00 PM',
    venue: 'The Comedy Club',
    city: 'Mumbai',
    category: 'Comedy',
    price: 1200,
    status: 'available',
    interested: 8500
  },
  {
    id: 'csk-vs-mi',
    title: 'Chennai Super Kings vs Mumbai Indians',
    image: 'https://assets-in.bmscdn.com/discovery-catalog/events/tr:w-400,h-600,bg-CCCCCC:w-400.0,h-660.0,cm-pad_resize,bg-000000,fo-top:ote-U2F0LCAyMyBNYXI%3D,ots-29,otc-FFFFFF,oy-612,ox-24:q-80/et00384210-xlkrftdpeb-portrait.jpg',
    date: 'Sat 29 Mar 2025',
    time: '7:30 PM',
    venue: 'M.A. Chidambaram Stadium',
    city: 'Chennai',
    category: 'Cricket',
    price: 1100,
    status: 'fast-filling',
    interested: 18700
  },
];

const upcomingMovies: MovieProps[] = [
  {
    id: 'movie-1',
    title: 'Khadaan',
    image: 'https://assets-in.bmscdn.com/discovery-catalog/events/tr:w-400,h-600,bg-CCCCCC:w-400.0,h-660.0,cm-pad_resize,bg-000000,fo-top:oi-discovery-catalog@@icons@@star-icon-202203010609.png,ox-24,oy-615,ow-29:ote-OS4xLzEwICAyMDIuNUsgVm90ZXM%3D,ots-29,otc-FFFFFF,oy-612,ox-70:q-80/et00338629-adeyjbxpah-portrait.jpg',
    rating: 9.1,
    language: 'Hindi',
    genre: 'Action/Thriller',
    format: '2D'
  },
  {
    id: 'movie-2',
    title: 'Love Story 2025',
    image: 'https://assets-in.bmscdn.com/discovery-catalog/events/tr:w-400,h-600,bg-CCCCCC:w-400.0,h-660.0,cm-pad_resize,bg-000000,fo-top:oi-discovery-catalog@@icons@@star-icon-202203010609.png,ox-24,oy-615,ow-29:ote-OC4zLzEwICA0OS45SyBWb3Rlcw%3D%3D,ots-29,otc-FFFFFF,oy-612,ox-70:q-80/et00385216-aumbjdskjv-portrait.jpg',
    rating: 8.3,
    language: 'Hindi',
    genre: 'Romance',
    format: '2D'
  },
  {
    id: 'movie-3',
    title: 'The Diplomat',
    image: 'https://assets-in.bmscdn.com/discovery-catalog/events/tr:w-400,h-600,bg-CCCCCC:w-400.0,h-660.0,cm-pad_resize,bg-000000,fo-top:oi-discovery-catalog@@icons@@star-icon-202203010609.png,ox-24,oy-615,ow-29:ote-OC41LzEwICA3LjVLIFZvdGVz,ots-29,otc-FFFFFF,oy-612,ox-70:q-80/et00384544-kkqnzebezl-portrait.jpg',
    rating: 8.5,
    language: 'English',
    genre: 'Thriller/Drama',
    format: 'IMAX'
  },
  {
    id: 'movie-4',
    title: 'The Godfather',
    image: 'https://assets-in.bmscdn.com/discovery-catalog/events/tr:w-400,h-600,bg-CCCCCC:w-400.0,h-660.0,cm-pad_resize,bg-000000,fo-top:oi-discovery-catalog@@icons@@star-icon-202203010609.png,ox-24,oy-615,ow-29:ote-OS40LzEwICA3LjlLIFZvdGVz,ots-29,otc-FFFFFF,oy-612,ox-70:q-80/et00310790-nmwsnukkhg-portrait.jpg',
    rating: 9.4,
    language: 'English',
    genre: 'Crime/Drama',
    format: '4DX'
  },
];

const categoryOptions = [
  { id: 'all', label: 'All Categories' },
  { id: 'movies', label: 'Movies', icon: <Film className="w-4 h-4" /> },
  { id: 'concerts', label: 'Concerts', icon: <Music className="w-4 h-4" /> },
  { id: 'sports', label: 'Sports', icon: <Ticket className="w-4 h-4" /> },
  { id: 'comedy', label: 'Comedy Shows' },
  { id: 'theatre', label: 'Theatre' },
  { id: 'activities', label: 'Activities' },
];

const cityOptions = [
  { id: 'kolkata', label: 'Kolkata' },
  { id: 'mumbai', label: 'Mumbai' },
  { id: 'delhi', label: 'Delhi' },
  { id: 'bangalore', label: 'Bangalore' },
  { id: 'chennai', label: 'Chennai' },
  { id: 'hyderabad', label: 'Hyderabad' },
];

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('kolkata');
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header transparent={true} />
      
      <main className="flex-1">
        <HeroSection />
        
        <div className="page-container pt-10">
          {/* City & Category Filters */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <h2 className="section-title">Events in your city</h2>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <CategoryFilter 
                options={cityOptions} 
                onChange={setSelectedCity}
                defaultSelected="kolkata"
              />
              
              <CategoryFilter 
                options={categoryOptions} 
                onChange={setSelectedCategory} 
              />
            </div>
          </div>
          
          {/* Popular Events */}
          <section className="mb-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {trendingEvents.map((event) => (
                <EventCard key={event.id} {...event} />
              ))}
            </div>
            
            <div className="text-center mt-8">
              <Link to="/events" className="btn-secondary">
                View All Events
              </Link>
            </div>
          </section>
          
          {/* Special Offers */}
          <section className="mb-12">
            <h2 className="section-title">Special Offers</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative rounded-2xl overflow-hidden aspect-[21/9]">
                <img 
                  src="https://assets-in.bmscdn.com/promotions/cms/creatives/1707307798397_webnew.jpg" 
                  alt="Get 10% off with HSBC Cards" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
                  <h3 className="text-white text-xl font-bold mb-2">Get 10% off with HSBC Cards</h3>
                  <p className="text-white/80 mb-4">Apply now and get exclusive discounts on your bookings</p>
                  <button className="btn-primary w-full md:w-auto">Book Now</button>
                </div>
              </div>
              
              <div className="relative rounded-2xl overflow-hidden aspect-[21/9]">
                <img 
                  src="https://assets-in.bmscdn.com/promotions/cms/creatives/1708597481425_offernew.jpg" 
                  alt="Your next credit card gets you 24 free tickets!" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
                  <h3 className="text-white text-xl font-bold mb-2">Your next credit card gets you 24 free tickets!</h3>
                  <p className="text-white/80 mb-4">Apply now for amazing benefits</p>
                  <button className="btn-primary w-full md:w-auto">Apply Now</button>
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
                <svg className="w-5 h-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {upcomingMovies.map((movie) => (
                <MovieCard key={movie.id} {...movie} />
              ))}
            </div>
          </section>
          
          {/* Premier Venues */}
          <section className="mb-12">
            <h2 className="section-title">Premier Venues</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="glass-card rounded-xl p-4">
                <img 
                  src="https://assets-in.bmscdn.com/iedb/venues/1/0/0/0/7/7/100077-inox-r-city-ghatkopar-w_1680x420.jpg" 
                  alt="INOX: R City Mall" 
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
                <h3 className="font-medium text-lg mb-1">INOX: R City Mall</h3>
                <p className="text-sm text-gray-500 mb-3">Ghatkopar West, Mumbai</p>
                <div className="flex flex-wrap gap-2">
                  <span className="chip bg-gray-100 text-gray-800">
                    4K
                  </span>
                  <span className="chip bg-gray-100 text-gray-800">
                    IMAX
                  </span>
                  <span className="chip bg-gray-100 text-gray-800">
                    Dolby Atmos
                  </span>
                </div>
              </div>
              
              <div className="glass-card rounded-xl p-4">
                <img 
                  src="https://assets-in.bmscdn.com/iedb/venues/1/0/0/0/1/8/100018-pvr-forum-koramangala_1680x420.jpg" 
                  alt="PVR: Forum Mall" 
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
                <h3 className="font-medium text-lg mb-1">PVR: Forum Mall</h3>
                <p className="text-sm text-gray-500 mb-3">Koramangala, Bangalore</p>
                <div className="flex flex-wrap gap-2">
                  <span className="chip bg-gray-100 text-gray-800">
                    Dolby Atmos
                  </span>
                  <span className="chip bg-gray-100 text-gray-800">
                    4DX
                  </span>
                  <span className="chip bg-gray-100 text-gray-800">
                    Recliners
                  </span>
                </div>
              </div>
              
              <div className="glass-card rounded-xl p-4">
                <img 
                  src="https://assets-in.bmscdn.com/iedb/venues/1/0/0/0/8/0/100080-inox-nehru-place_1680x420.jpg" 
                  alt="INOX: Nehru Place" 
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
                <h3 className="font-medium text-lg mb-1">INOX: Nehru Place</h3>
                <p className="text-sm text-gray-500 mb-3">Delhi</p>
                <div className="flex flex-wrap gap-2">
                  <span className="chip bg-gray-100 text-gray-800">
                    IMAX
                  </span>
                  <span className="chip bg-gray-100 text-gray-800">
                    MX4D
                  </span>
                  <span className="chip bg-gray-100 text-gray-800">
                    Premium Seating
                  </span>
                </div>
              </div>
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
                    <path d="M8 17.929H3C2.448 17.929 2 17.481 2 16.929V13.2868C2 12.9946 2.148 12.7242 2.393 12.5634L3.5 11.929M8 17.929H16M8 17.929V13.929C8 12.8245 8.89543 11.929 10 11.929H14C15.1046 11.929 16 12.8245 16 13.929V17.929M16 17.929H21C21.5523 17.929 22 17.4814 22 16.929V13.2868C22 12.9946 21.852 12.7242 21.607 12.5634L20.5 11.929M13 11.929V9.92896C13 8.82439 12.1046 7.92896 11 7.92896C9.89543 7.92896 9 8.82439 9 9.92896M14.5 7.92896C14.5 6.55582 13.3789 5.42896 12 5.42896C10.6211 5.42896 9.5 6.55582 9.5 7.92896C9.5 9.30211 10.6211 10.429 12 10.429C13.3789 10.429 14.5 9.30211 14.5 7.92896Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                    <path d="M15 5V7M15 11V13M15 17V19M5 5C5 6.10457 5.89543 7 7 7H11C12.1046 7 13 6.10457 13 5C13 3.89543 12.1046 3 11 3H7C5.89543 3 5 3.89543 5 5ZM5 19C5 20.1046 5.89543 21 7 21H11C12.1046 21 13 20.1046 13 19C13 17.8954 12.1046 17 11 17H7C5.89543 17 5 17.8954 5 19ZM5 12C5 13.1046 5.89543 14 7 14H11C12.1046 14 13 13.1046 13 12C13 10.8954 12.1046 10 11 10H7C5.89543 10 5 10.8954 5 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M19 12C19 10.8954 18.1046 10 17 10C15.8954 10 15 10.8954 15 12C15 13.1046 15.8954 14 17 14C18.1046 14 19 13.1046 19 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="font-medium">Activities</span>
              </div>
            </div>
          </section>
          
          {/* Download App Banner */}
          <section className="rounded-2xl overflow-hidden bg-gradient-to-r from-book-dark to-purple-900 mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-6 md:p-12 flex flex-col justify-center">
                <h2 className="text-white text-3xl font-bold mb-4">Download the ShowTix App</h2>
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
                <img 
                  src="https://assets-in.bmscdn.com/webin/dev-app-image/appCTA/app-qr-code.png" 
                  alt="App QR Code" 
                  className="max-h-60"
                />
              </div>
            </div>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
