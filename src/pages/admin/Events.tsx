
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  MoreVertical, 
  FilmIcon, 
  Calendar 
} from 'lucide-react';
import { toast } from 'sonner';

interface Event {
  id: string;
  title: string;
  category: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  price: number;
  status: string;
  image: string;
  created_at: string;
}

interface Movie {
  id: string;
  title: string;
  language: string;
  genre: string;
  rating: number | null;
  format: string | null;
  image: string;
  created_at: string;
}

const AdminEvents = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('events');
  const [events, setEvents] = useState<Event[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        navigate('/login');
        return;
      }
      
      // In a real app, you would check if the user has admin privileges
    };
    
    checkAdmin();
  }, [user, navigate]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        if (activeTab === 'events') {
          const { data, error } = await supabase
            .from('events')
            .select('*')
            .order('created_at', { ascending: false });
            
          if (error) throw error;
          setEvents(data || []);
        } else {
          const { data, error } = await supabase
            .from('movies')
            .select('*')
            .order('created_at', { ascending: false });
            
          if (error) throw error;
          setMovies(data || []);
        }
      } catch (error) {
        console.error(`Error fetching ${activeTab}:`, error);
        toast.error(`Failed to load ${activeTab}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      fetchData();
    }
  }, [user, activeTab]);
  
  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.city.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredMovies = movies.filter(movie => 
    movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movie.genre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movie.language.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleDeleteEvent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setEvents(events.filter(event => event.id !== id));
      toast.success('Event deleted successfully');
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };
  
  const handleDeleteMovie = async (id: string) => {
    try {
      const { error } = await supabase
        .from('movies')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setMovies(movies.filter(movie => movie.id !== id));
      toast.success('Movie deleted successfully');
    } catch (error) {
      console.error('Error deleting movie:', error);
      toast.error('Failed to delete movie');
    }
  };
  
  return (
    <AdminLayout title="Events & Movies Management">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b">
          <div className="flex">
            <button
              className={`px-6 py-4 font-medium ${
                activeTab === 'events'
                  ? 'text-book-primary border-b-2 border-book-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('events')}
            >
              Events
            </button>
            <button
              className={`px-6 py-4 font-medium ${
                activeTab === 'movies'
                  ? 'text-book-primary border-b-2 border-book-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('movies')}
            >
              Movies
            </button>
          </div>
        </div>
        
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div className="relative w-full sm:w-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                className="pl-10 pr-4 py-2 border rounded-lg w-full sm:w-80"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button className="btn-outline px-4 py-2 flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </button>
              
              <button className="btn-primary px-4 py-2 flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>{activeTab === 'events' ? 'Add Event' : 'Add Movie'}</span>
              </button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-book-primary"></div>
            </div>
          ) : activeTab === 'events' ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Venue
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredEvents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                        No events found
                      </td>
                    </tr>
                  ) : (
                    filteredEvents.map((event) => (
                      <tr key={event.id}>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-md overflow-hidden">
                              <img 
                                src={event.image} 
                                alt={event.title}
                                className="h-10 w-10 object-cover"
                              />
                            </div>
                            <div className="ml-4">
                              <div className="font-medium text-gray-900 truncate max-w-xs">
                                {event.title}
                              </div>
                              <div className="text-gray-500 text-sm">
                                ID: {event.id.slice(0, 8)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {event.category}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <div>{event.date}</div>
                          <div className="text-gray-500">{event.time}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <div>{event.venue}</div>
                          <div className="text-gray-500">{event.city}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          ₹{event.price.toLocaleString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            event.status === 'available' 
                              ? 'bg-green-100 text-green-800' 
                              : event.status === 'fast-filling'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}>
                            {event.status.charAt(0).toUpperCase() + event.status.slice(1).replace('-', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center space-x-2">
                            <button className="p-1 text-blue-600 hover:text-blue-800">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              className="p-1 text-red-600 hover:text-red-800"
                              onClick={() => handleDeleteEvent(event.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <button className="p-1 text-gray-600 hover:text-gray-800">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Movie
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Language
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Genre
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Format
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredMovies.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                        No movies found
                      </td>
                    </tr>
                  ) : (
                    filteredMovies.map((movie) => (
                      <tr key={movie.id}>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-8 rounded-md overflow-hidden">
                              <img 
                                src={movie.image} 
                                alt={movie.title}
                                className="h-12 w-8 object-cover"
                              />
                            </div>
                            <div className="ml-4">
                              <div className="font-medium text-gray-900 truncate max-w-xs">
                                {movie.title}
                              </div>
                              <div className="text-gray-500 text-sm">
                                ID: {movie.id.slice(0, 8)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {movie.language}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {movie.genre}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {movie.rating ? (
                            <div className="flex items-center">
                              <span className="text-yellow-500">★</span>
                              <span className="ml-1">{movie.rating}/10</span>
                            </div>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {movie.format || '2D'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center space-x-2">
                            <button className="p-1 text-blue-600 hover:text-blue-800">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              className="p-1 text-red-600 hover:text-red-800"
                              onClick={() => handleDeleteMovie(movie.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <button className="p-1 text-gray-600 hover:text-gray-800">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminEvents;
