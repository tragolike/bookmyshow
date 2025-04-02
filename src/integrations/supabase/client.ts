
import { createClient } from '@supabase/supabase-js';
import { PostgrestError } from '@supabase/supabase-js';
import { PaymentSettings } from '@/components/payment/types';

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
  brandSettings: () => supabase.from('brand_settings'),
};

// Function to ensure a bucket exists
export const ensureBucketExists = async (bucketId: string, bucketName: string) => {
  try {
    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.id === bucketId);
    
    if (!bucketExists) {
      const { error } = await supabase.storage.createBucket(bucketId, {
        public: true,
        fileSizeLimit: 5242880 // 5MB
      });
      
      if (error) {
        console.error(`Error creating ${bucketName} bucket:`, error);
        return false;
      }
      console.info(`Created ${bucketName} bucket successfully`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error ensuring ${bucketName} bucket exists:`, error);
    return false;
  }
};

// Function to upload file to storage
export const uploadFile = async (file: File, bucketId: string, path: string) => {
  try {
    // Ensure bucket exists
    const bucketCreated = await ensureBucketExists(bucketId, 'Storage Bucket');
    if (!bucketCreated) {
      throw new Error(`Could not ensure ${bucketId} bucket exists`);
    }
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = path ? `${path}/${fileName}` : fileName;
    
    // Upload the file
    const { error: uploadError, data } = await supabase.storage
      .from(bucketId)
      .upload(filePath, file, { upsert: true });
    
    if (uploadError) throw uploadError;
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketId)
      .getPublicUrl(filePath);
    
    return { url: publicUrl, path: filePath, error: null };
  } catch (error) {
    console.error('File upload error:', error);
    return { url: null, path: null, error };
  }
};

// Function to get payment settings
export const getPaymentSettings = async () => {
  try {
    console.log('Fetching payment settings...');
    const { data, error } = await db.paymentSettings()
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
      
    if (error) {
      console.error('Error in getPaymentSettings:', error);
      throw error;
    }
    
    console.log('Payment settings fetched:', data);
    return { data, error: null };
  } catch (error) {
    console.error('Exception in getPaymentSettings:', error);
    return { data: null, error: error as PostgrestError };
  }
};

// Function to update payment settings
export const updatePaymentSettings = async (data: PaymentSettings) => {
  try {
    console.log('Updating payment settings with data:', data);
    // Check if any settings exist
    const { data: existingSettings, error: checkError } = await db.paymentSettings()
      .select('id')
      .limit(1)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing settings:', checkError);
      return { error: checkError, data: null };
    }

    // If settings exist, update them, otherwise insert new settings
    let result;
    if (existingSettings) {
      console.log('Updating existing payment settings with ID:', existingSettings.id);
      result = await db.paymentSettings()
        .update(data)
        .eq('id', existingSettings.id)
        .select()
        .maybeSingle();
    } else {
      console.log('Creating new payment settings entry');
      result = await db.paymentSettings()
        .insert(data)
        .select()
        .maybeSingle();
    }
    
    if (result.error) {
      console.error('Error updating payment settings:', result.error);
    } else {
      console.log('Payment settings updated successfully:', result.data);
    }
    
    return result;
  } catch (error) {
    console.error('Exception in updatePaymentSettings:', error);
    return { data: null, error: error as PostgrestError };
  }
};

// Function to get brand settings
export const getBrandSettings = async () => {
  try {
    console.log('Fetching brand settings...');
    const { data, error } = await db.brandSettings()
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
      
    if (error) {
      console.error('Error in getBrandSettings:', error);
      throw error;
    }
    
    console.log('Brand settings fetched:', data);
    return { data, error: null };
  } catch (error) {
    console.error('Exception in getBrandSettings:', error);
    return { data: null, error: error as PostgrestError };
  }
};

// Function to update brand settings
export const updateBrandSettings = async (data: any) => {
  try {
    console.log('Updating brand settings with data:', data);
    // Check if any settings exist
    const { data: existingSettings, error: checkError } = await db.brandSettings()
      .select('id')
      .limit(1)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing brand settings:', checkError);
      return { error: checkError, data: null };
    }

    // If settings exist, update them, otherwise insert new settings
    let result;
    if (existingSettings) {
      console.log('Updating existing brand settings with ID:', existingSettings.id);
      result = await db.brandSettings()
        .update(data)
        .eq('id', existingSettings.id)
        .select()
        .maybeSingle();
    } else {
      console.log('Creating new brand settings entry');
      result = await db.brandSettings()
        .insert(data)
        .select()
        .maybeSingle();
    }
    
    if (result.error) {
      console.error('Error updating brand settings:', result.error);
    } else {
      console.log('Brand settings updated successfully:', result.data);
    }
    
    return result;
  } catch (error) {
    console.error('Exception in updateBrandSettings:', error);
    return { data: null, error: error as PostgrestError };
  }
};

// Function to get event by ID
export const getEventById = async (id: string) => {
  try {
    console.log('Fetching event with ID:', id);
    const result = await db.events()
      .select('*')
      .eq('id', id)
      .maybeSingle();
      
    if (result.error) {
      console.error('Error in getEventById:', result.error);
    } else if (result.data) {
      console.log('Event fetched successfully:', result.data.title);
    } else {
      console.warn('No event found with ID:', id);
    }
    
    return result;
  } catch (error) {
    console.error('Exception in getEventById:', error);
    return { data: null, error: error as PostgrestError };
  }
};

// Function to get events by city
export const getEventsByCity = async (city: string) => {
  try {
    const result = await db.events()
      .select('*')
      .ilike('city', `%${city}%`)
      .order('date', { ascending: true });
      
    if (result.error) {
      console.error('Error in getEventsByCity:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('Exception in getEventsByCity:', error);
    return { data: [], error: error as PostgrestError };
  }
};

// Function to get seat layout by event ID
export const getSeatLayoutByEventId = async (eventId: string) => {
  try {
    const result = await db.seatLayouts()
      .select('*')
      .eq('event_id', eventId)
      .maybeSingle();
      
    if (result.error) {
      console.error('Error in getSeatLayoutByEventId:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('Exception in getSeatLayoutByEventId:', error);
    return { data: null, error: error as PostgrestError };
  }
};

// Function to create or update seat layout
export const upsertSeatLayout = async (eventId: string, layoutData: any) => {
  try {
    // Check if a layout already exists for this event
    const { data: existingLayout, error: checkError } = await db.seatLayouts()
      .select('id')
      .eq('event_id', eventId)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking existing layout:', checkError);
      return { error: checkError, data: null, isNew: false };
    }
    
    // If the layout exists, update it, otherwise create a new one
    let result;
    if (existingLayout) {
      result = await db.seatLayouts()
        .update({
          layout_data: layoutData,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingLayout.id)
        .select()
        .maybeSingle();
        
      return { ...result, isNew: false };
    } else {
      result = await db.seatLayouts()
        .insert({
          event_id: eventId,
          layout_data: layoutData
        })
        .select()
        .maybeSingle();
        
      return { ...result, isNew: true };
    }
  } catch (error) {
    console.error('Exception in upsertSeatLayout:', error);
    return { data: null, error: error as PostgrestError, isNew: false };
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
  try {
    const result = await db.bookings()
      .insert(bookingData)
      .select()
      .single();
      
    if (result.error) {
      console.error('Error in createBooking:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('Exception in createBooking:', error);
    return { data: null, error: error as PostgrestError };
  }
};

// Function to verify UTR and confirm booking
export const verifyUtrAndConfirmBooking = async (bookingId: string, utrNumber: string) => {
  try {
    const result = await db.bookings()
      .update({
        payment_status: 'completed',
        booking_status: 'confirmed', 
        utr_number: utrNumber,
        verified_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select()
      .single();
      
    if (result.error) {
      console.error('Error in verifyUtrAndConfirmBooking:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('Exception in verifyUtrAndConfirmBooking:', error);
    return { data: null, error: error as PostgrestError };
  }
};

// Get all ticket types
export const getTicketTypes = async () => {
  try {
    const result = await db.ticketTypes()
      .select('*')
      .order('created_at', { ascending: false });
      
    if (result.error) {
      console.error('Error in getTicketTypes:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('Exception in getTicketTypes:', error);
    return { data: [], error: error as PostgrestError };
  }
};

// Create or update a ticket type
export const upsertTicketType = async (data: {
  id?: string;
  category: string;
  base_price: number;
  surge_price?: number;
  color?: string;
}) => {
  try {
    let result;
    
    if (data.id) {
      result = await db.ticketTypes()
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
      result = await db.ticketTypes()
        .insert({
          category: data.category,
          base_price: data.base_price,
          surge_price: data.surge_price,
          color: data.color
        })
        .select()
        .single();
    }
    
    if (result.error) {
      console.error('Error in upsertTicketType:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('Exception in upsertTicketType:', error);
    return { data: null, error: error as PostgrestError };
  }
};
