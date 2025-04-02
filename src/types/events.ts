
export type EventStatus = 'available' | 'fast-filling' | 'sold-out';

export interface Event {
  id: string;
  title: string;
  category: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  price: number;
  image: string;
  status: EventStatus;
  interested?: number;
  created_at?: string;
}

export interface MovieEvent extends Event {
  movie_id: string;
}

export interface SeatCategory {
  id: string;
  name: string;
  price: number;
  color: string;
}

export interface Seat {
  id: string;
  row: string;
  number: number;
  status: 'available' | 'unavailable' | 'selected' | 'booked';
  price: number;
  category: string;
}

export interface SeatLayout {
  id?: string;
  event_id: string;
  layout_data: {
    venue: string;
    seats: Seat[];
    image_url?: string;
  };
}
