
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Film, Ticket, User } from 'lucide-react';

const MainNavigation = () => {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState(() => {
    const path = location.pathname;
    if (path.includes('/movies')) return 'movies';
    if (path.includes('/live-events')) return 'events';
    if (path.includes('/profile')) return 'profile';
    return 'home';
  });
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t py-2 z-50">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <Link 
            to="/" 
            className={`flex flex-col items-center p-2 ${activeItem === 'home' ? 'text-book-primary' : 'text-gray-500'}`}
            onClick={() => setActiveItem('home')}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          
          <Link 
            to="/movies" 
            className={`flex flex-col items-center p-2 ${activeItem === 'movies' ? 'text-book-primary' : 'text-gray-500'}`}
            onClick={() => setActiveItem('movies')}
          >
            <Film className="w-6 h-6" />
            <span className="text-xs mt-1">Movies</span>
          </Link>
          
          <Link 
            to="/live-events" 
            className={`flex flex-col items-center p-2 ${activeItem === 'events' ? 'text-book-primary' : 'text-gray-500'}`}
            onClick={() => setActiveItem('events')}
          >
            <Ticket className="w-6 h-6" />
            <span className="text-xs mt-1">Live Events</span>
          </Link>
          
          <Link 
            to="/profile" 
            className={`flex flex-col items-center p-2 ${activeItem === 'profile' ? 'text-book-primary' : 'text-gray-500'}`}
            onClick={() => setActiveItem('profile')}
          >
            <User className="w-6 h-6" />
            <span className="text-xs mt-1">Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MainNavigation;
