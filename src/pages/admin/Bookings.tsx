
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, 
  Filter, 
  Download, 
  Edit, 
  RefreshCw, 
  MoreVertical 
} from 'lucide-react';
import { toast } from 'sonner';

interface Booking {
  id: string;
  booking_date: string;
  user_id: string;
  event_id: string | null;
  movie_id: string | null;
  seat_numbers: string[];
  total_amount: number;
  payment_status: string;
  booking_status: string;
  events?: {
    title: string;
    venue: string;
    city: string;
    date: string;
    time: string;
    image: string;
  };
  movies?: {
    title: string;
    image: string;
  };
  profiles?: {
    first_name: string;
    last_name: string;
    phone_number: string | null;
  };
}

const AdminBookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
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
    const fetchBookings = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            events:event_id (*),
            movies:movie_id (*),
            profiles:user_id (first_name, last_name, phone_number)
          `)
          .order('booking_date', { ascending: false });
          
        if (error) throw error;
        
        setBookings(data || []);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast.error('Failed to load bookings');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      fetchBookings();
    }
  }, [user]);
  
  const filteredBookings = bookings.filter(booking => {
    const searchMatch = 
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.events?.title.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (booking.movies?.title.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (booking.profiles && 
        `${booking.profiles.first_name} ${booking.profiles.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()));
        
    const statusMatch = statusFilter ? booking.booking_status === statusFilter : true;
    
    return searchMatch && statusMatch;
  });
  
  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ booking_status: newStatus })
        .eq('id', bookingId);
        
      if (error) throw error;
      
      setBookings(bookings.map(booking => 
        booking.id === bookingId ? { ...booking, booking_status: newStatus } : booking
      ));
      
      toast.success(`Booking ${bookingId.slice(0, 8).toUpperCase()} updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Failed to update booking status');
    }
  };
  
  return (
    <AdminLayout title="Booking Management">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div className="relative w-full sm:w-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search bookings..."
                className="pl-10 pr-4 py-2 border rounded-lg w-full sm:w-80"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select 
                className="border rounded-lg px-3 py-2"
                value={statusFilter || ''}
                onChange={(e) => setStatusFilter(e.target.value || null)}
              >
                <option value="">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
                <option value="pending">Pending</option>
              </select>
              
              <button className="btn-outline px-4 py-2 flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>More Filters</span>
              </button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-book-primary"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booking ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event/Movie
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
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
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                        No bookings found
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((booking) => (
                      <tr key={booking.id}>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          #{booking.id.slice(0, 8).toUpperCase()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {booking.profiles ? (
                            <div>
                              <div className="font-medium">
                                {booking.profiles.first_name} {booking.profiles.last_name}
                              </div>
                              <div className="text-gray-500 text-sm">
                                {booking.profiles.phone_number || 'No phone'}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-500">User not found</span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-md overflow-hidden">
                              {booking.events ? (
                                <img 
                                  src={booking.events.image} 
                                  alt={booking.events.title}
                                  className="h-10 w-10 object-cover"
                                />
                              ) : booking.movies ? (
                                <img 
                                  src={booking.movies.image} 
                                  alt={booking.movies.title}
                                  className="h-10 w-10 object-cover"
                                />
                              ) : (
                                <div className="h-10 w-10 bg-gray-200"></div>
                              )}
                            </div>
                            <div className="ml-4 max-w-xs truncate">
                              <div className="font-medium">
                                {booking.events?.title || booking.movies?.title || 'Unknown Event/Movie'}
                              </div>
                              {booking.events && (
                                <div className="text-gray-500 text-sm truncate">
                                  {booking.events.venue}, {booking.events.city}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <div>
                            {new Date(booking.booking_date).toLocaleDateString()}
                          </div>
                          <div className="text-gray-500">
                            {new Date(booking.booking_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          ₹{booking.total_amount.toLocaleString()}
                          <div className="text-gray-500 text-xs">
                            {booking.seat_numbers.length} {booking.seat_numbers.length === 1 ? 'ticket' : 'tickets'}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            booking.booking_status === 'confirmed' 
                              ? 'bg-green-100 text-green-800' 
                              : booking.booking_status === 'cancelled'
                                ? 'bg-red-100 text-red-800'
                                : booking.booking_status === 'refunded'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {booking.booking_status.charAt(0).toUpperCase() + booking.booking_status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center space-x-2">
                            <button className="p-1 text-blue-600 hover:text-blue-800">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="p-1 text-green-600 hover:text-green-800">
                              <Download className="h-4 w-4" />
                            </button>
                            <div className="relative">
                              <button className="p-1 text-gray-600 hover:text-gray-800">
                                <MoreVertical className="h-4 w-4" />
                              </button>
                              
                              {/* Dropdown menu would go here in a real app */}
                            </div>
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

export default AdminBookings;
