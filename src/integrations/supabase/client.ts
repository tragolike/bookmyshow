import { createClient } from '@supabase/supabase-js';
import { PostgrestError } from '@supabase/supabase-js';

// Get Supabase URL and Anon Key from environment variables
const envSupabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const envSupabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fallback values in case environment variables are not available
const fallbackUrl = 'https://gfmxvjxgjswbxbtkseap.supabase.co';
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmbXh2anhnanN3YnhidGtzZWFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1OTg2OTEsImV4cCI6MjA1OTE3NDY5MX0.ajBWfE7Ici2KiCBL3Hnl24ocJS4-1MZLX8ehvHX9b6c';

// Use fallback values if environment variables are not available or invalid
const supabaseUrl = (!envSupabaseUrl || typeof envSupabaseUrl !== 'string' || !envSupabaseUrl.startsWith('http')) 
  ? fallbackUrl 
  : envSupabaseUrl;

const supabaseAnonKey = (!envSupabaseKey || typeof envSupabaseKey !== 'string' || envSupabaseKey.trim() === '') 
  ? fallbackKey 
  : envSupabaseKey;

// Log the Supabase URL and key being used for debugging purposes
console.info('Initializing Supabase with URL:', supabaseUrl);
console.info('Using Supabase Anon Key:', supabaseAnonKey.substring(0, 10) + '...');

// Initialize the Supabase client with explicit options for auth behavior
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage
  }
});

// Define types for status enums
export type EventStatus = 'available' | 'fast-filling' | 'sold-out';
export type BookingStatus = 'confirmed' | 'pending' | 'cancelled';
export type PaymentStatus = 'completed' | 'pending' | 'failed' | 'refunded';

// Check if a user is an admin based on their email
export const isUserAdmin = (email?: string | null): boolean => {
  if (!email) return false;
  
  const adminEmails = [
    'admin@showtix.com',
    'admin@example.com',
    'ritikpaswal79984@gmail.com'
  ];
  
  return adminEmails.includes(email.toLowerCase());
};

// Supabase database helpers
export const db = {
  profiles: () => supabase.from('profiles'),
  events: () => supabase.from('events'),
  movies: () => supabase.from('movies'),
  bookings: () => supabase.from('bookings'),
  seatLayouts: () => supabase.from('seat_layouts'),
  paymentSettings: () => supabase.from('payment_settings'),
  cities: () => supabase.from('cities'),
  ticketTypes: () => supabase.from('ticket_types'),
};

// Function to get payment settings
export const getPaymentSettings = async () => {
  return await db.paymentSettings()
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
};

// Function to update payment settings
export const updatePaymentSettings = async (data: {
  upi_id: string;
  qr_code_url?: string;
  payment_instructions?: string;
  updated_by?: string;
}) => {
  // Check if any settings exist
  const { data: existingSettings, error: checkError } = await db.paymentSettings()
    .select('id')
    .limit(1)
    .maybeSingle();

  if (checkError) {
    return { error: checkError, data: null };
  }

  // If settings exist, update them, otherwise insert new settings
  if (existingSettings) {
    return await db.paymentSettings()
      .update(data)
      .eq('id', existingSettings.id)
      .select()
      .maybeSingle();
  } else {
    return await db.paymentSettings()
      .insert(data)
      .select()
      .maybeSingle();
  }
};

// Function to get event by ID
export const getEventById = async (id: string) => {
  return await db.events()
    .select('*')
    .eq('id', id)
    .maybeSingle();
};

// Function to get events by city
export const getEventsByCity = async (city: string) => {
  return await db.events()
    .select('*')
    .ilike('city', `%${city}%`)
    .order('date', { ascending: true });
};

// Function to get seat layout by event ID
export const getSeatLayoutByEventId = async (eventId: string) => {
  return await db.seatLayouts()
    .select('*')
    .eq('event_id', eventId)
    .maybeSingle();
};

// Function to create or update seat layout
export const upsertSeatLayout = async (eventId: string, layoutData: any) => {
  // Check if a layout already exists for this event
  const { data: existingLayout, error: checkError } = await db.seatLayouts()
    .select('id')
    .eq('event_id', eventId)
    .maybeSingle();
  
  if (checkError) {
    return { error: checkError, data: null, isNew: false };
  }
  
  // If the layout exists, update it, otherwise create a new one
  if (existingLayout) {
    const { data, error } = await db.seatLayouts()
      .update({
        layout_data: layoutData,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingLayout.id)
      .select()
      .maybeSingle();
      
    return { data, error, isNew: false };
  } else {
    const { data, error } = await db.seatLayouts()
      .insert({
        event_id: eventId,
        layout_data: layoutData
      })
      .select()
      .maybeSingle();
      
    return { data, error, isNew: true };
  }
};

// Function to create a new booking with UTR support
export const createBooking = async (bookingData: {
  user_id: string;
  event_id: string;
  seat_numbers: string[];
  total_amount: number;
  payment_status: PaymentStatus;
  booking_status: BookingStatus;
  utr_number?: string;
}) => {
  return await db.bookings()
    .insert(bookingData)
    .select()
    .single();
};

// Function to verify UTR and confirm booking
export const verifyUtrAndConfirmBooking = async (bookingId: string, utrNumber: string) => {
  return await db.bookings()
    .update({
      payment_status: 'completed',
      booking_status: 'confirmed', 
      utr_number: utrNumber,
      verified_at: new Date().toISOString()
    })
    .eq('id', bookingId)
    .select()
    .single();
};

// Get all ticket types
export const getTicketTypes = async () => {
  return await db.ticketTypes()
    .select('*')
    .order('created_at', { ascending: false });
};

// Create or update a ticket type
export const upsertTicketType = async (data: {
  id?: string;
  category: string;
  base_price: number;
  surge_price?: number;
  color?: string;
}) => {
  if (data.id) {
    return await db.ticketTypes()
      .update({
        category: data.category,
        base_price: data.base_price,
        surge_price: data.surge_price,
        color: data.color
      })
      .eq('id', data.id)
      .select()
      .single();
  } else {
    return await db.ticketTypes()
      .insert({
        category: data.category,
        base_price: data.base_price,
        surge_price: data.surge_price,
        color: data.color
      })
      .select()
      .single();
  }
};
