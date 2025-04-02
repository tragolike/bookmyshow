
import type { Session, User } from '@supabase/supabase-js';

export type Profile = {
  id: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  avatar_url?: string;
};

export type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<boolean>;
  signOut: () => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  updatePassword: (password: string) => Promise<boolean>;
  updateProfile: (data: { first_name?: string; last_name?: string; phone_number?: string; avatar_url?: string }) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
};

export type PaymentSettingsType = {
  id: string;
  upi_id: string;
  qr_code_url?: string;
  payment_instructions?: string;
  updated_at?: string;
  updated_by?: string;
};

export type TicketType = {
  id: string;
  category: string; 
  base_price: number;
  surge_price?: number;
  color?: string;
  created_at?: string;
};

export type BookingType = {
  id: string;
  user_id: string;
  event_id?: string;
  movie_id?: string;
  seat_numbers: string[];
  total_amount: number;
  payment_status: 'completed' | 'pending' | 'failed' | 'refunded';
  booking_status: 'confirmed' | 'pending' | 'cancelled';
  utr_number?: string;
  verified_at?: string;
  booking_date?: string;
  created_at?: string;
};
