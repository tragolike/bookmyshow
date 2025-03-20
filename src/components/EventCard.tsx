
import { Link } from 'react-router-dom';
import { Clock, MapPin, Calendar } from 'lucide-react';

export interface EventProps {
  id: string;
  title: string;
  image: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  category: string;
  price: number;
  status?: 'fast-filling' | 'sold-out' | 'available';
  interested?: number;
}

const EventCard = ({ 
  id, 
  title, 
  image, 
  date, 
  time, 
  venue, 
  city, 
  category, 
  price, 
  status = 'available',
  interested 
}: EventProps) => {
  return (
    <Link to={`/events/${id}`} className="event-card block">
      <div className="relative aspect-[3/4] rounded-xl overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          loading="lazy"
        />
        
        {/* Overlay and category */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
          <div className="absolute top-3 left-3">
            <span className="chip bg-book-primary text-white">
              {category}
            </span>
          </div>
          
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">{title}</h3>
            
            <div className="flex items-center gap-1 text-white/80 text-xs mb-1">
              <Calendar className="w-3 h-3" />
              <span>{date}</span>
            </div>
            
            <div className="flex items-center gap-1 text-white/80 text-xs mb-1">
              <Clock className="w-3 h-3" />
              <span>{time}</span>
            </div>
            
            <div className="flex items-center gap-1 text-white/80 text-xs mb-3">
              <MapPin className="w-3 h-3" />
              <span>{venue}, {city}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="price-badge text-white">
                ₹{price.toLocaleString()}
                {status === 'fast-filling' && (
                  <span className="fast-filling text-xs block">Filling Fast</span>
                )}
                {status === 'sold-out' && (
                  <span className="sold-out text-xs block">Sold Out</span>
                )}
              </div>
              
              {interested && (
                <div className="text-xs text-white/80">
                  {interested.toLocaleString()} interested
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
