
import { useState, useEffect } from 'react';
import { MapPin, X, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface City {
  id: string;
  name: string;
  icon?: string;
  isPopular?: boolean;
}

const POPULAR_CITIES: City[] = [
  { id: 'mumbai', name: 'Mumbai', isPopular: true },
  { id: 'delhi-ncr', name: 'Delhi-NCR', isPopular: true },
  { id: 'bengaluru', name: 'Bengaluru', isPopular: true },
  { id: 'hyderabad', name: 'Hyderabad', isPopular: true },
  { id: 'chandigarh', name: 'Chandigarh', isPopular: true },
  { id: 'ahmedabad', name: 'Ahmedabad', isPopular: true },
  { id: 'chennai', name: 'Chennai', isPopular: true },
  { id: 'pune', name: 'Pune', isPopular: true },
  { id: 'kolkata', name: 'Kolkata', isPopular: true },
  { id: 'kochi', name: 'Kochi', isPopular: true },
];

const OTHER_CITIES: City[] = [
  { id: 'aalo', name: 'Aalo' },
  { id: 'abohar', name: 'Abohar' },
  { id: 'abu-road', name: 'Abu Road' },
  { id: 'achampet', name: 'Achampet' },
  { id: 'acharapakkam', name: 'Acharapakkam' },
  // Add more cities as needed
];

interface CitySelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCity: (city: string) => void;
  currentCity: string;
}

const CitySelector = ({ isOpen, onClose, onSelectCity, currentCity }: CitySelectorProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dbCities, setDbCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch cities from database if available
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await db.cities().select('*');
        
        if (error) {
          console.error('Error fetching cities:', error);
          return;
        }
        
        if (data && data.length > 0) {
          const formattedCities = data.map(city => ({
            id: city.name.toLowerCase().replace(/\s+/g, '-'),
            name: city.name
          }));
          setDbCities(formattedCities);
        }
      } catch (error) {
        console.error('Error in fetchCities:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isOpen) {
      fetchCities();
    }
  }, [isOpen]);

  const handleCitySelect = (cityId: string) => {
    // Find the city name by ID
    const selectedCity = [...POPULAR_CITIES, ...OTHER_CITIES, ...dbCities].find(
      city => city.id.toLowerCase() === cityId.toLowerCase()
    );
    
    if (selectedCity) {
      onSelectCity(selectedCity.name);
      // Store selected city in localStorage for persistence
      localStorage.setItem('selectedCity', selectedCity.name);
    } else {
      onSelectCity(cityId);
      localStorage.setItem('selectedCity', cityId);
    }
    
    onClose();
    
    // Use a short timeout to allow state updates to complete
    setTimeout(() => {
      // Navigate to events page with the new city
      navigate('/live-events');
    }, 100);
  };
  
  // Filter all cities based on search term
  const allCities = [...POPULAR_CITIES, ...OTHER_CITIES, ...dbCities];
  const filteredCities = allCities.filter(city => 
    city.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get unique cities (in case there are duplicates between hardcoded and DB cities)
  const uniqueCities = Array.from(
    new Map(filteredCities.map(city => [city.id, city])).values()
  );
  
  // Split into popular and other cities
  const popularFilteredCities = uniqueCities.filter(city => city.isPopular);
  const otherFilteredCities = uniqueCities.filter(city => !city.isPopular);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-auto">
      <div className="sticky top-0 bg-white z-10 border-b">
        <div className="flex items-center p-4">
          <button onClick={onClose} className="mr-4">
            <X className="w-6 h-6 text-gray-500" />
          </button>
          <h2 className="text-2xl font-semibold">Select City</h2>
        </div>
        
        <div className="px-4 pb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search for your city"
              className="w-full py-3 pl-10 pr-4 border rounded-lg bg-gray-50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <button 
          className="flex items-center text-book-primary font-medium mb-6"
          onClick={() => {
            // This would typically use geolocation
            // For demo purposes, we'll use a default city
            handleCitySelect('kolkata');
            toast.success('Location detected: Kolkata');
          }}
        >
          <MapPin className="w-5 h-5 mr-2" />
          <span>Detect my location</span>
        </button>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-book-primary"></div>
          </div>
        ) : (
          <>
            <h3 className="text-gray-500 font-semibold mb-4">POPULAR CITIES</h3>
            
            <div className="grid grid-cols-3 gap-4 mb-8">
              {popularFilteredCities.map(city => (
                <div 
                  key={city.id}
                  className={`flex flex-col items-center p-3 cursor-pointer ${
                    city.name.toLowerCase() === currentCity.toLowerCase() ? 'text-book-primary' : ''
                  }`}
                  onClick={() => handleCitySelect(city.id)}
                >
                  <div className="w-16 h-16 mb-2">
                    <img 
                      src={city.icon || `/city-icons/${city.id}.svg`} 
                      alt={city.name}
                      className="w-full h-full opacity-70"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://via.placeholder.com/64?text=${city.name[0]}`;
                      }}
                    />
                  </div>
                  <span className="text-center text-sm">
                    {city.name}
                    {city.name.toLowerCase() === currentCity.toLowerCase() && (
                      <span className="block">
                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1" />
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
            
            {otherFilteredCities.length > 0 && (
              <>
                <h3 className="text-gray-500 font-semibold mb-4">OTHER CITIES</h3>
                
                <div className="divide-y">
                  {otherFilteredCities.map(city => (
                    <div 
                      key={city.id}
                      className="py-4 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleCitySelect(city.id)}
                    >
                      {city.name}
                      {city.name.toLowerCase() === currentCity.toLowerCase() && (
                        <span className="ml-2 inline-block w-2 h-2 bg-green-500 rounded-full" />
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CitySelector;
