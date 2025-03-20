
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Menu, X, User, ChevronDown, LogOut, Ticket } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  transparent?: boolean;
}

export const Header = ({ transparent = false }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <header className={`sticky top-0 left-0 right-0 z-50 border-b ${
      transparent ? 'bg-transparent border-transparent' : 'bg-white border-gray-200'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center">
            <img
              src="/lovable-uploads/933af9b9-e587-4f31-9e71-7474b68aa224.png"
              alt="BookMyShow"
              className="h-12 w-auto"
            />
          </Link>
          
          {/* Desktop Search */}
          <div className="hidden md:block flex-1 max-w-md mx-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-book-primary focus:border-book-primary sm:text-sm"
                placeholder="Search for Movies, Events, Plays, Sports and Activities"
              />
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center text-gray-800 hover:text-book-primary transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 mr-2">
                    {profile?.first_name ? profile.first_name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium">
                    {profile?.first_name || user.email?.split('@')[0]}
                  </span>
                  <ChevronDown className="w-4 h-4 ml-1" />
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                    <Link
                      to="/my-bookings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Ticket className="w-4 h-4 mr-2" />
                      My Bookings
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        setIsUserMenuOpen(false);
                      }}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`text-sm font-medium ${
                    isActive('/login') ? 'text-book-primary' : 'text-gray-800 hover:text-book-primary'
                  } transition-colors`}
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="btn-primary"
                >
                  Register
                </Link>
              </>
            )}
          </nav>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-book-primary hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-book-primary"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <div className="px-3 py-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-book-primary focus:border-book-primary sm:text-sm"
                  placeholder="Search"
                />
              </div>
            </div>
            
            <Link
              to="/"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/') ? 'bg-book-primary/10 text-book-primary' : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={toggleMenu}
            >
              Home
            </Link>
            
            <Link
              to="/movies"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/movies') ? 'bg-book-primary/10 text-book-primary' : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={toggleMenu}
            >
              Movies
            </Link>
            
            <Link
              to="/events"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/events') ? 'bg-book-primary/10 text-book-primary' : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={toggleMenu}
            >
              Events
            </Link>
            
            <Link
              to="/plays"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/plays') ? 'bg-book-primary/10 text-book-primary' : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={toggleMenu}
            >
              Plays
            </Link>
            
            <Link
              to="/activities"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/activities') ? 'bg-book-primary/10 text-book-primary' : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={toggleMenu}
            >
              Activities
            </Link>
            
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                  onClick={toggleMenu}
                >
                  Profile
                </Link>
                <Link
                  to="/my-bookings"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                  onClick={toggleMenu}
                >
                  My Bookings
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    toggleMenu();
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                  onClick={toggleMenu}
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium text-book-primary"
                  onClick={toggleMenu}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
