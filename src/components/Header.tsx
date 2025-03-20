
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, User } from 'lucide-react';

interface HeaderProps {
  transparent?: boolean;
}

export const Header = ({ transparent = false }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [city, setCity] = useState('Kolkata');
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled || !transparent 
          ? 'bg-white shadow-sm dark:bg-book-dark' 
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-book-primary">ShowTix</span>
            </Link>
            
            <div className="hidden md:flex items-center text-sm font-medium">
              <span className="text-book-dark-gray">{city}</span>
              <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="rounded-full p-2 text-book-dark-gray hover:bg-book-light-gray transition-colors">
              <Search className="w-5 h-5" />
            </button>
            
            <Link to="/profile" className="rounded-full p-2 text-book-dark-gray hover:bg-book-light-gray transition-colors">
              <User className="w-5 h-5" />
            </Link>
            
            <Link 
              to="/auth" 
              className="hidden md:block bg-book-primary text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
