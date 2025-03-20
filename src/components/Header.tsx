
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Search, Menu, User, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import MainNavigation from '@/components/MainNavigation';
import CitySelector from '@/components/CitySelector';

interface HeaderProps {
  transparent?: boolean;
}

export const Header = ({ transparent = false }: HeaderProps) => {
  const { user, profile, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [currentCity, setCurrentCity] = useState('Kolkata');
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setIsMenuOpen(false);
    navigate('/login');
  };

  const handleCityChange = (city: string) => {
    setCurrentCity(city.charAt(0).toUpperCase() + city.slice(1));
    setShowCitySelector(false);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full 
        ${transparent && !isScrolled 
          ? 'bg-transparent text-white' 
          : 'bg-white border-b'
        } transition-colors duration-200`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0">
                <img 
                  src="/lovable-uploads/90179a48-cf6a-49a2-b3cf-4042fa501b89.png" 
                  alt="BookMyShow" 
                  className="h-8"
                />
              </Link>
              <button 
                className="ml-4 text-sm flex items-center"
                onClick={() => setShowCitySelector(true)}
              >
                {currentCity} <span className="ml-1">▼</span>
              </button>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search for movies, events, plays, sports and activities"
                  className="pl-10 pr-4 py-2 border rounded-lg w-80"
                />
              </div>
              
              {user ? (
                <div className="relative">
                  <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center space-x-2"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      {profile?.avatar_url ? (
                        <img 
                          src={profile.avatar_url} 
                          alt="User profile" 
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-4 h-4 text-gray-500" />
                      )}
                    </div>
                  </button>
                  
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        to="/my-bookings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        My Bookings
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="btn-primary">
                  Sign In
                </Link>
              )}
            </div>
            
            <div className="flex md:hidden">
              <button
                onClick={() => navigate('/search')}
                className="p-2 rounded-full bg-gray-100 mr-2"
              >
                <Search className="w-5 h-5" />
              </button>
              
              {user ? (
                <button
                  onClick={() => navigate('/profile')}
                  className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
                >
                  {profile?.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt="User profile" 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              ) : (
                <Link to="/login" className="btn-primary text-sm py-1 px-3">
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <CitySelector 
        isOpen={showCitySelector}
        onClose={() => setShowCitySelector(false)}
        onSelectCity={handleCityChange}
        currentCity={currentCity}
      />
      
      <div className="block md:hidden">
        <MainNavigation />
      </div>
    </>
  );
};
