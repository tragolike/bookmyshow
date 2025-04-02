import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Search, Menu, User, LogOut, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import MainNavigation from '@/components/MainNavigation';
import CitySelector from '@/components/CitySelector';
interface HeaderProps {
  transparent?: boolean;
}
export const Header = ({
  transparent = false
}: HeaderProps) => {
  const {
    user,
    profile,
    signOut,
    isAdmin
  } = useAuth();
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
  return <>
      <header className={`sticky top-0 z-40 w-full 
        ${transparent && !isScrolled ? 'bg-transparent text-white' : 'bg-white border-b'} transition-colors duration-200`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0">
                <img alt="BookMyShow" src="data:image/png;base64,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" className="h-8 object-fill" />
              </Link>
              <button className="ml-4 text-sm flex items-center" onClick={() => setShowCitySelector(true)}>
                {currentCity} <span className="ml-1">▼</span>
              </button>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input type="text" placeholder="Search for movies, events, plays, sports and activities" className="pl-10 pr-4 py-2 border rounded-lg w-80" />
              </div>
              
              {user ? <div className="relative">
                  <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      {profile?.avatar_url ? <img src={profile.avatar_url} alt="User profile" className="w-8 h-8 rounded-full object-cover" /> : <User className="w-4 h-4 text-gray-500" />}
                    </div>
                  </button>
                  
                  {isMenuOpen && <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                      <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsMenuOpen(false)}>
                        Profile
                      </Link>
                      <Link to="/my-bookings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsMenuOpen(false)}>
                        My Bookings
                      </Link>
                      {isAdmin && <Link to="/admin" className="block px-4 py-2 text-sm text-indigo-600 hover:bg-gray-100" onClick={() => setIsMenuOpen(false)}>
                          <div className="flex items-center">
                            <Shield className="w-4 h-4 mr-2" />
                            Admin Panel
                          </div>
                        </Link>}
                      <button onClick={handleSignOut} className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100">
                        Sign Out
                      </button>
                    </div>}
                </div> : <div className="flex items-center gap-2">
                  <Link to="/login" className="btn-primary">
                    Sign In
                  </Link>
                  <Link to="/admin/login" className="text-sm text-gray-600 hover:text-indigo-600 flex items-center">
                    <Shield className="w-4 h-4 mr-1" />
                    Admin
                  </Link>
                </div>}
            </div>
            
            <div className="flex md:hidden">
              <button onClick={() => navigate('/search')} className="p-2 rounded-full bg-gray-100 mr-2">
                <Search className="w-5 h-5" />
              </button>
              
              {user ? <button onClick={() => navigate('/profile')} className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  {profile?.avatar_url ? <img src={profile.avatar_url} alt="User profile" className="w-8 h-8 rounded-full object-cover" /> : <User className="w-4 h-4 text-gray-500" />}
                </button> : <div className="flex items-center gap-2">
                  <Link to="/login" className="btn-primary text-sm py-1 px-3">
                    Sign In
                  </Link>
                  <Link to="/admin/login" className="p-1">
                    <Shield className="w-4 h-4 text-gray-600" />
                  </Link>
                </div>}
            </div>
          </div>
        </div>
      </header>
      
      <CitySelector isOpen={showCitySelector} onClose={() => setShowCitySelector(false)} onSelectCity={handleCityChange} currentCity={currentCity} />
      
      <div className="block md:hidden">
        <MainNavigation />
      </div>
    </>;
};