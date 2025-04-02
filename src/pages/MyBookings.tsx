import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/integrations/supabase/client';
import { CalendarCheck, Loader2, ChevronRight, Download, Tag, MapPin } from 'lucide-react';

const MyBookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchBookings = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await db.bookings()
          .select(`
            *,
            events:event_id (*),
            movies:movie_id (*)
          `)
          .eq('user_id', user.id)
          .order('booking_date', { ascending: false });

        if (error) {
          throw error;
        }

        setBookings(data || []);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50 py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold mb-6">My Bookings</h1>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-book-primary" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <CalendarCheck className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
              <p className="text-gray-500 mb-6">You haven't made any bookings yet.</p>
              <Link to="/" className="btn-primary">
                Browse Events
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking) => {
                const isEvent = booking.event_id !== null;
                const item = isEvent ? booking.events : booking.movies;

                return (
                  <div
                    key={booking.id}
                    className="bg-white rounded-lg shadow-sm overflow-hidden"
                  >
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/4 flex-shrink-0">
                        <img
                          src={item?.image || 'https://via.placeholder.com/400x600'}
                          alt={item?.title || 'Booking item'}
                          className="h-full w-full object-cover md:max-h-36 lg:max-h-48"
                        />
                      </div>

                      <div className="p-4 md:p-6 flex-1">
                        <div className="flex flex-col md:flex-row md:items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="chip bg-green-100 text-green-800">
                                {isEvent ? 'Event' : 'Movie'}
                              </span>
                              <span className="chip bg-blue-100 text-blue-800">
                                {booking.booking_status}
                              </span>
                            </div>

                            <h2 className="text-xl font-semibold mb-1">{item?.title}</h2>
                            
                            {isEvent && (
                              <div className="flex items-center text-gray-600 text-sm mb-1">
                                <CalendarCheck className="w-4 h-4 mr-1" />
                                <span>{item?.date} | {item?.time}</span>
                              </div>
                            )}
                            
                            {isEvent && (
                              <div className="flex items-center text-gray-600 text-sm">
                                <MapPin className="w-4 h-4 mr-1" />
                                <span>{item?.venue}, {item?.city}</span>
                              </div>
                            )}
                          </div>

                          <div className="mt-4 md:mt-0 md:text-right">
                            <div className="flex items-center text-gray-600 text-sm md:justify-end">
                              <Tag className="w-4 h-4 mr-1" />
                              <span>
                                {booking.seat_numbers.length} {booking.seat_numbers.length === 1 ? 'Ticket' : 'Tickets'}
                              </span>
                            </div>
                            <div className="text-lg font-bold">₹{booking.total_amount.toLocaleString()}</div>
                            <div className="text-xs text-gray-500">
                              Booked on {new Date(booking.booking_date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 items-center justify-between mt-4 pt-4 border-t">
                          <div className="text-gray-600 text-sm">
                            <span className="font-medium">Booking ID:</span> #{booking.id.slice(0, 8).toUpperCase()}
                          </div>
                          <div className="flex items-center gap-2">
                            <button className="btn-secondary flex items-center gap-1 py-1 px-3 text-sm">
                              <Download className="w-4 h-4" />
                              <span>Tickets</span>
                            </button>
                            <Link 
                              to={`/booking-details/${booking.id}`} 
                              className="btn-primary flex items-center gap-1 py-1 px-3 text-sm"
                            >
                              <span>View Details</span>
                              <ChevronRight className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MyBookings;
