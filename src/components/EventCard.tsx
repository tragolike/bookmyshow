
import { Link } from 'react-router-dom';
import { Clock, MapPin, Calendar } from 'lucide-react';
import { EventStatus } from '@/types/events';

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
  status?: EventStatus;
  interested?: number;
  onClick?: () => void;
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
  interested,
  onClick
}: EventProps) => {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <Link to={`/events/${id}`} className="event-card block" onClick={handleClick}>
      <div className="relative aspect-[3/4] rounded-xl overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg';
          }}
        />
        
        {status === 'fast-filling' && (
          <span className="absolute top-2 right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
            Fast Filling
          </span>
        )}
        
        {status === 'sold-out' && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            Sold Out
          </span>
        )}
        
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent pt-12 px-4 pb-4">
          <h3 className="text-white font-bold text-lg truncate">{title}</h3>
          <p className="text-gray-300 text-sm">{category}</p>
        </div>
      </div>
      
      <div className="mt-3 space-y-2">
        <div className="flex items-center text-gray-600 text-sm">
          <Calendar className="h-4 w-4 mr-2 text-book-primary" />
          <span>{date}</span>
          <span className="mx-1">•</span>
          <Clock className="h-4 w-4 mr-1 text-book-primary" />
          <span>{time}</span>
        </div>
        
        <div className="flex items-center text-gray-600 text-sm">
          <MapPin className="h-4 w-4 mr-2 text-book-primary" />
          <span className="truncate">{venue}, {city}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="font-bold text-book-primary">
            ₹{price.toLocaleString()}
          </div>
          {interested && (
            <div className="text-sm text-gray-500">
              {interested.toLocaleString()} interested
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
