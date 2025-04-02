
import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and Anon Key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

// Initialize the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Check if a user is an admin based on their email
export const isUserAdmin = (email?: string | null): boolean => {
  if (!email) return false;
  
  const adminEmails = [
    'admin@showtix.com',
    'admin@example.com',
    'ritikpaswal79984@gmail.com'
  ];
  
  return adminEmails.includes(email);
};

// Supabase database helpers
export const db = {
  profiles: () => supabase.from('profiles'),
  events: () => supabase.from('events'),
  movies: () => supabase.from('movies'),
  bookings: () => supabase.from('bookings'),
  seatLayouts: () => supabase.from('seat_layouts'),
  paymentSettings: () => supabase.from('payment_settings'),
};
