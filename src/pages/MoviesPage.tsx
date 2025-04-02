
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import MovieCard, { MovieProps } from '@/components/MovieCard';
import LanguageSelector from '@/components/LanguageSelector';
import CitySelector from '@/components/CitySelector';
import { Search, Filter, Calendar, ChevronRight } from 'lucide-react';
import { db } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const MoviesPage = () => {
  const [movies, setMovies] = useState<MovieProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentCity, setCurrentCity] = useState('Kolkata');
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('english');
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await db.movies()
          .select('*');
          
        if (error) {
          throw error;
        }
        
        if (data) {
          const formattedMovies = data.map(movie => ({
            id: movie.id,
            title: movie.title,
            image: movie.image,
            rating: movie.rating || 0,
            language: movie.language,
            genre: movie.genre,
            format: movie.format || '2D'
          }));
          
          setMovies(formattedMovies);
        }
      } catch (error) {
        console.error('Error fetching movies:', error);
        toast.error('Failed to load movies');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMovies();
  }, []);
  
  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language);
    // Filter movies by language if needed
  };
  
  const handleCityChange = (city: string) => {
    setCurrentCity(city.charAt(0).toUpperCase() + city.slice(1));
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="sticky top-0 z-30 bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Now Showing</h1>
              <button 
                className="flex items-center text-gray-600 text-sm" 
                onClick={() => setShowCitySelector(true)}
              >
                {currentCity} | {movies.length} Movies
              </button>
            </div>
            
            <button className="p-2 rounded-full bg-gray-100">
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <LanguageSelector onSelectLanguage={handleLanguageSelect} defaultLanguage={selectedLanguage} />
          </div>
          
          <div className="mb-8">
            <div className="glass-card rounded-xl p-4 bg-gradient-to-r from-red-500 to-red-600 text-white flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-1">Coming Soon</h2>
                <p>Explore Upcoming Movies</p>
              </div>
              <ChevronRight className="w-6 h-6" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 10 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="rounded-lg bg-gray-200 h-64 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))
            ) : (
              movies.map(movie => (
                <MovieCard key={movie.id} {...movie} />
              ))
            )}
          </div>
          
          <div className="sticky bottom-16 left-0 right-0 py-4 bg-gradient-to-t from-white via-white to-transparent">
            <button className="w-full bg-book-primary text-white rounded-full py-3 flex items-center justify-center gap-2">
              <Filter className="w-4 h-4" />
              <span>Browse by Cinemas</span>
            </button>
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

export default MoviesPage;
