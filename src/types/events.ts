
export type EventStatus = 'available' | 'sold_out' | 'cancelled' | 'postponed' | 'ongoing' | 'fast-filling';

export interface Event {
  id: string;
  title: string;
  image: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  price: number;
  category: string;
  status: EventStatus;
  interested?: number;
  created_at?: string;
}

export interface Seat {
  id: string;
  row: string;
  number: number;
  status: 'available' | 'unavailable' | 'booked';
  price: number;
  category: string;
}
