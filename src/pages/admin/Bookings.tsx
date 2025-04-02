
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { db, BookingStatus } from '@/integrations/supabase/client';
import { 
  Filter, 
  Search, 
  Mail, 
  Phone, 
  Calendar, 
  Check, 
  X,
  MoreVertical,
  Clock,
  MapPin
} from 'lucide-react';
import { toast } from 'sonner';

// Define proper types for bookings and related data
interface Booking {
  id: string;
  user_id: string;
  event_id: string | null;
  movie_id: string | null;
  seat_numbers: string[];
  total_amount: number;
  payment_status: string;
  booking_status: BookingStatus;
  booking_date: string;
  created_at: string;
  event?: {
    title: string;
    venue: string;
    date: string;
    time: string;
  } | null;
  movie?: {
    title: string;
  } | null;
  profiles: {
    first_name: string;
    last_name: string;
    phone_number: string | null;
  };
}

interface AdminBookingsProps {}

const AdminBookings = (props: AdminBookingsProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        navigate('/login');
        return;
      }
      
      // In a real app, you would check if user has admin privileges
    };
    
    checkAdmin();
  }, [user, navigate]);
  
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setIsLoading(true);
        
        // Get bookings with event and user data
        const { data, error } = await db.bookings()
          .select(`
            *,
            events(*),
            movies(*),
            profiles(*)
          `)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        // Transform data to match our Booking type
        if (data) {
          const formattedBookings = data.map(booking => {
            return {
              ...booking,
              event: booking.events,
              movie: booking.movies,
              profiles: booking.profiles || {
                first_name: 'Unknown',
                last_name: 'User',
                phone_number: null
              }
            } as Booking;
          });
          
          setBookings(formattedBookings);
        }
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
  
  const handleUpdateStatus = async (id: string, status: BookingStatus) => {
    try {
      const { error } = await db.bookings()
        .update({ booking_status: status })
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      setBookings(bookings.map(booking => 
        booking.id === id ? { ...booking, booking_status: status } : booking
      ));
      
      toast.success(`Booking status updated to ${status}`);
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Failed to update booking status');
    }
  };
  
  const filteredBookings = bookings.filter(booking => {
    const eventTitle = booking.event?.title?.toLowerCase() || '';
    const movieTitle = booking.movie?.title?.toLowerCase() || '';
    const userName = `${booking.profiles?.first_name} ${booking.profiles?.last_name}`.toLowerCase();
    const bookingId = booking.id.toLowerCase();
    const searchTermLower = searchTerm.toLowerCase();
    
    return eventTitle.includes(searchTermLower) ||
           movieTitle.includes(searchTermLower) ||
           userName.includes(searchTermLower) ||
           bookingId.includes(searchTermLower);
  });
  
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
            
            <button className="btn-outline px-4 py-2 flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </button>
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
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event/Movie
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booking Date
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
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {booking.id.slice(0, 8)}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="ml-4">
                              <div className="font-medium text-gray-900">
                                {booking.profiles?.first_name} {booking.profiles?.last_name}
                              </div>
                              <div className="text-gray-500 text-sm">
                                <Mail className="h-4 w-4 inline-block mr-1" />
                                {booking.profiles?.phone_number || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {booking.event ? (
                              <>
                                <div>{booking.event.title}</div>
                                <div className="text-gray-500 text-xs">
                                  <Calendar className="h-3 w-3 inline-block mr-1" />
                                  {booking.event.date}
                                  <Clock className="h-3 w-3 inline-block mx-1" />
                                  {booking.event.time}
                                </div>
                                <div className="text-gray-500 text-xs">
                                  <MapPin className="h-3 w-3 inline-block mr-1" />
                                  {booking.event.venue}
                                </div>
                              </>
                            ) : booking.movie ? (
                              <div>{booking.movie.title}</div>
                            ) : (
                              'N/A'
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(booking.booking_date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            ₹{booking.total_amount.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            booking.booking_status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            booking.booking_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {booking.booking_status === 'confirmed' && <Check className="w-3 h-3 mr-1" />}
                            {booking.booking_status === 'pending' && <X className="w-3 h-3 mr-1" />}
                            {booking.booking_status === 'cancelled' && <X className="w-3 h-3 mr-1" />}
                            {booking.booking_status}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center space-x-2">
                            <button 
                              className="p-1 text-green-600 hover:text-green-800"
                              onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                              disabled={booking.booking_status === 'confirmed'}
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button 
                              className="p-1 text-yellow-600 hover:text-yellow-800"
                              onClick={() => handleUpdateStatus(booking.id, 'pending')}
                              disabled={booking.booking_status === 'pending'}
                            >
                              <Clock className="h-4 w-4" />
                            </button>
                            <button 
                              className="p-1 text-red-600 hover:text-red-800"
                              onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                              disabled={booking.booking_status === 'cancelled'}
                            >
                              <X className="h-4 w-4" />
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

export default AdminBookings;
