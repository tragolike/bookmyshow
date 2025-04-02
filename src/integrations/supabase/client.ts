
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-url.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Types
export type EventStatus = 'available' | 'fast-filling' | 'sold-out';

// Database interface
export const db = {
  events: () => supabase.from('events'),
  bookings: () => supabase.from('bookings'),
  movies: () => supabase.from('movies'),
  profiles: () => supabase.from('profiles'),
  cities: () => supabase.from('cities'),
  countries: () => supabase.from('countries'),
  ticketTypes: () => supabase.from('ticket_types'),
  seatCategories: () => supabase.from('seat_categories'),
  seatLayouts: () => supabase.from('seat_layouts'),
  heroSlides: () => supabase.from('hero_slides'),
  brandSettings: () => supabase.from('brand_settings'),
  paymentSettings: () => supabase.from('payment_settings')
};

// Function to check if a user is an admin
export const isUserAdmin = (email?: string | null): boolean => {
  if (!email) return false;
  const adminEmails = ['admin@showtix.com', 'admin@example.com', 'ritikpaswal79984@gmail.com'];
  return adminEmails.includes(email.toLowerCase());
};

// Function to ensure a bucket exists before uploading
export const ensureBucketExists = async (bucketId: string, bucketName: string) => {
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error checking buckets:', listError);
      throw listError;
    }
    
    // Check if our bucket exists in the list
    const bucketExists = buckets.some(bucket => bucket.id === bucketId);
    
    // If bucket doesn't exist, create it
    if (!bucketExists) {
      console.log(`Creating bucket: ${bucketId}`);
      const { error: createError } = await supabase.storage.createBucket(bucketId, {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/svg+xml', 'image/gif', 'image/webp']
      });
      
      if (createError) {
        console.error(`Error creating bucket ${bucketId}:`, createError);
        throw createError;
      }
      
      console.log(`Successfully created bucket: ${bucketId}`);
    } else {
      console.log(`Bucket ${bucketId} already exists`);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error in ensureBucketExists:', error);
    return { success: false, error };
  }
};

// Upload file to Supabase Storage
export const uploadFile = async (file: File, bucketId: string, folderPath: string = '') => {
  try {
    // First ensure the bucket exists
    await ensureBucketExists(bucketId, bucketId.replace('_', ' '));
    
    // Create a unique file name
    const timestamp = new Date().getTime();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
    
    // Construct the file path
    const filePath = folderPath ? `${folderPath}/${fileName}` : fileName;
    
    // Upload the file
    const { data, error } = await supabase.storage
      .from(bucketId)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
      
    if (error) {
      console.error('Error uploading file:', error);
      return { error };
    }
    
    // Generate the public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketId)
      .getPublicUrl(data?.path || filePath);
    
    return {
      url: publicUrl,
      path: data?.path || filePath,
      error: null
    };
  } catch (error) {
    console.error('Upload error:', error);
    return { url: null, path: null, error };
  }
};

// Custom function to fetch brand settings
export const getBrandSettings = async () => {
  try {
    const { data, error } = await supabase
      .from('brand_settings')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();
      
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching brand settings:', error);
    return { data: null, error };
  }
};

// Custom function to update brand settings
export const updateBrandSettings = async (settings: any) => {
  try {
    // Check if we already have settings
    const { data: existingData, error: checkError } = await supabase
      .from('brand_settings')
      .select('id')
      .limit(1)
      .single();
      
    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }
    
    let result;
    if (existingData?.id) {
      // Update existing settings
      result = await supabase
        .from('brand_settings')
        .update(settings)
        .eq('id', existingData.id)
        .select();
    } else {
      // Insert new settings
      result = await supabase
        .from('brand_settings')
        .insert(settings)
        .select();
    }
    
    if (result.error) {
      throw result.error;
    }
    
    return { data: result.data, error: null };
  } catch (error) {
    console.error('Error updating brand settings:', error);
    return { data: null, error };
  }
};

// Get payment settings
export const getPaymentSettings = async () => {
  try {
    const { data, error } = await supabase
      .from('payment_settings')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();
      
    if (error) {
      // If the error is that no rows were returned, return default settings
      if (error.code === 'PGRST116') {
        return { 
          data: {
            upi_id: 'showtix@upi',
            qr_code_url: '',
            payment_instructions: 'Please make the payment using any UPI app and enter the UTR number for verification.'
          }, 
          error: null 
        };
      }
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching payment settings:', error);
    return { 
      data: {
        upi_id: 'showtix@upi',
        qr_code_url: '',
        payment_instructions: 'Please make the payment using any UPI app and enter the UTR number for verification.'
      }, 
      error: null 
    };
  }
};

// Get event by ID
export const getEventById = async (eventId: string) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();
      
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching event:', error);
    return { data: null, error };
  }
};

// Get events by city
export const getEventsByCity = async (city?: string) => {
  try {
    let query = supabase.from('events').select('*');
    
    if (city && city !== 'all') {
      query = query.eq('city', city);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching events by city:', error);
    return { data: null, error };
  }
};

// Get seat layout by event ID
export const getSeatLayoutByEventId = async (eventId: string) => {
  try {
    const { data, error } = await supabase
      .from('seat_layouts')
      .select('*')
      .eq('event_id', eventId)
      .maybeSingle();
      
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching seat layout:', error);
    return { data: null, error };
  }
};

// Get ticket types
export const getTicketTypes = async () => {
  try {
    const { data, error } = await supabase
      .from('ticket_types')
      .select('*')
      .order('price', { ascending: false });
      
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching ticket types:', error);
    return { data: null, error };
  }
};

// Upsert ticket type
export const upsertTicketType = async (typeData: any) => {
  try {
    let result;
    
    if (typeData.id) {
      // Update existing type
      result = await supabase
        .from('ticket_types')
        .update({
          category: typeData.category,
          base_price: typeData.base_price,
          surge_price: typeData.surge_price,
          color: typeData.color
        })
        .eq('id', typeData.id)
        .select();
    } else {
      // Insert new type
      result = await supabase
        .from('ticket_types')
        .insert({
          category: typeData.category,
          base_price: typeData.base_price,
          surge_price: typeData.surge_price,
          color: typeData.color
        })
        .select();
    }
    
    if (result.error) throw result.error;
    
    return { data: result.data[0], error: null };
  } catch (error) {
    console.error('Error upserting ticket type:', error);
    return { data: null, error };
  }
};

// Upsert seat layout
export const upsertSeatLayout = async (eventId: string, layoutData: any) => {
  try {
    // Check if the layout already exists
    const { data: existingLayout, error: checkError } = await supabase
      .from('seat_layouts')
      .select('id')
      .eq('event_id', eventId)
      .maybeSingle();
      
    if (checkError) throw checkError;
    
    let result;
    let isNew = false;
    
    if (existingLayout?.id) {
      // Update the existing layout
      result = await supabase
        .from('seat_layouts')
        .update({
          layout_data: layoutData,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingLayout.id)
        .select();
    } else {
      // Create a new layout
      isNew = true;
      result = await supabase
        .from('seat_layouts')
        .insert({
          event_id: eventId,
          layout_data: layoutData
        })
        .select();
    }
    
    if (result.error) throw result.error;
    
    return { data: result.data[0], error: null, isNew };
  } catch (error) {
    console.error('Error upserting seat layout:', error);
    return { data: null, error, isNew: false };
  }
};
