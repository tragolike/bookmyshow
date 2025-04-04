import { createClient } from '@supabase/supabase-js';
import type { EventStatus } from '@/types/events';

// Initialize the Supabase client with better error handling
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gfmxvjxgjswbxbtkseap.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmbXh2anhnanN3YnhidGtzZWFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1OTg2OTEsImV4cCI6MjA1OTE3NDY5MX0.ajBWfE7Ici2KiCBL3Hnl24ocJS4-1MZLX8ehvHX9b6c';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'showtix-auth'
  },
  global: {
    headers: {
      'x-application-name': 'showtix'
    }
  }
});

// Re-export EventStatus from types
export type { EventStatus };

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

// Improved function to ensure a bucket exists before uploading
export const ensureBucketExists = async (bucketId: string, bucketName: string) => {
  try {
    console.log(`Checking if bucket exists: ${bucketId}`);
    
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error checking buckets:', listError);
      // Don't throw, just return the error
      return { success: false, error: listError };
    }
    
    // Check if our bucket exists in the list
    const bucketExists = buckets?.some(bucket => bucket.id === bucketId);
    
    // If bucket doesn't exist, create it
    if (!bucketExists) {
      console.log(`Creating bucket: ${bucketId}`);
      const { error: createError } = await supabase.storage.createBucket(bucketId, {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/svg+xml', 'image/gif', 'image/webp', 'image/x-icon', 'image/vnd.microsoft.icon']
      });
      
      if (createError) {
        console.error(`Error creating bucket ${bucketId}:`, createError);
        if (createError.message?.includes('already exists')) {
          console.log(`Bucket ${bucketId} already exists despite list not showing it`);
          return { success: true, error: null, already_exists: true };
        }
        return { success: false, error: createError };
      }
      
      console.log(`Successfully created bucket: ${bucketId}`);
    } else {
      console.log(`Bucket ${bucketId} already exists`);
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error in ensureBucketExists:', error);
    return { success: false, error };
  }
};

// Improved upload file to Supabase Storage with better error handling and admin functionality
export const uploadFile = async (file: File, bucketId: string, folderPath: string = '') => {
  try {
    // First ensure the bucket exists
    const bucketResult = await ensureBucketExists(bucketId, bucketId.replace('_', ' '));
    
    if (!bucketResult.success && !bucketResult.already_exists) {
      console.warn('Proceeding with upload despite bucket creation issue');
    }
    
    // Create a unique file name
    const timestamp = new Date().getTime();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
    
    // Construct the file path
    const filePath = folderPath ? `${folderPath}/${fileName}` : fileName;
    
    console.log(`Uploading file to ${bucketId}/${filePath}`);
    
    // Get session to check if user is admin
    const { data: { session } } = await supabase.auth.getSession();
    const userEmail = session?.user?.email;
    
    if (!userEmail || !isUserAdmin(userEmail)) {
      console.warn('User is not an admin, upload may fail due to permissions');
    }
    
    // Upload the file
    const { data, error } = await supabase.storage
      .from(bucketId)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
      
    if (error) {
      console.error('Error uploading file:', error);
      return { error, url: null, path: null };
    }
    
    // Generate the public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketId)
      .getPublicUrl(data?.path || filePath);
    
    console.log(`File uploaded successfully, public URL: ${publicUrl}`);
    
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

// Fix: Don't use .then() which breaks the query builder chain
export const getBrandSettings = async (skipCache = false) => {
  try {
    console.log('Fetching brand settings, skipCache:', skipCache);
    
    // Create the query without chaining .then()
    let query = supabase
      .from('brand_settings')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1);
    
    // Execute the query
    const { data, error } = await query.maybeSingle();
    
    // Optional logging for debugging
    if (skipCache) {
      console.log('Brand settings fetch response:', { data, error });
    }
      
    if (error) {
      console.error('Error fetching brand settings:', error);
      // Return default settings in case of error
      return { 
        data: {
          site_name: 'ShowTix',
          primary_color: '#ff3366',
          logo_url: '',
          favicon_url: ''
        }, 
        error: null 
      };
    }
    
    if (!data) {
      // Return default settings if no data is found
      return { 
        data: {
          site_name: 'ShowTix',
          primary_color: '#ff3366',
          logo_url: '',
          favicon_url: ''
        }, 
        error: null 
      };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching brand settings:', error);
    // Return default settings in case of exception
    return { 
      data: {
        site_name: 'ShowTix',
        primary_color: '#ff3366',
        logo_url: '',
        favicon_url: ''
      }, 
      error 
    };
  }
};

// Improved function to update brand settings with better error handling and admin check
export const updateBrandSettings = async (settings: any) => {
  try {
    // Check if user is admin
    const { data: { session } } = await supabase.auth.getSession();
    const userEmail = session?.user?.email;
    
    if (!userEmail || !isUserAdmin(userEmail)) {
      console.error('Non-admin user attempted to update brand settings');
      return { data: null, error: new Error('Permission denied: Admin access required') };
    }
    
    // Check if we already have settings
    const { data: existingData, error: checkError } = await supabase
      .from('brand_settings')
      .select('id')
      .limit(1)
      .maybeSingle();
      
    if (checkError) {
      console.error('Error checking existing brand settings:', checkError);
      return { data: null, error: checkError };
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
      console.error('Error updating brand settings:', result.error);
      return { data: null, error: result.error };
    }
    
    console.log('Brand settings updated successfully:', result.data);
    return { data: result.data, error: null };
  } catch (error) {
    console.error('Error updating brand settings:', error);
    return { data: null, error };
  }
};

// Improved getPaymentSettings function
export const getPaymentSettings = async (skipCache = false) => {
  try {
    console.log('Fetching payment settings, skipCache:', skipCache);
    
    // Check if the payment_settings table exists
    const { data: tableExists, error: tableCheckError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'payment_settings')
      .eq('table_schema', 'public')
      .single();
    
    if (tableCheckError) {
      console.error('Error checking if payment_settings table exists:', tableCheckError);
      return { 
        data: {
          upi_id: 'showtix@upi',
          qr_code_url: '',
          payment_instructions: 'Please make the payment using any UPI app and enter the UTR number for verification.'
        },
        error: null 
      };
    }
    
    if (!tableExists) {
      console.warn('payment_settings table does not exist');
      return { 
        data: {
          upi_id: 'showtix@upi',
          qr_code_url: '',
          payment_instructions: 'Please make the payment using any UPI app and enter the UTR number for verification.'
        },
        error: null 
      };
    }
    
    // Create the query
    let query = supabase
      .from('payment_settings')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1);
    
    // Execute the query
    const { data, error } = await query.maybeSingle();
    
    console.log('Payment settings fetch response:', { data, error });
      
    if (error) {
      console.error('Error fetching payment settings:', error);
      // Return default settings in case of error
      return { 
        data: {
          upi_id: 'showtix@upi',
          qr_code_url: '',
          payment_instructions: 'Please make the payment using any UPI app and enter the UTR number for verification.'
        }, 
        error: null 
      };
    }
    
    if (!data) {
      console.log('No payment settings found in database, returning defaults');
      // Return default settings if no data is found
      return { 
        data: {
          upi_id: 'showtix@upi',
          qr_code_url: '',
          payment_instructions: 'Please make the payment using any UPI app and enter the UTR number for verification.'
        }, 
        error: null 
      };
    }
    
    console.log('Payment settings data loaded:', data);
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching payment settings:', error);
    // Return default settings in case of exception
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

// Improved function to update payment settings
export const updatePaymentSettings = async (settings: any) => {
  try {
    console.log('Attempting to update payment settings:', settings);
    
    // Check if user is admin
    const { data: { session } } = await supabase.auth.getSession();
    const userEmail = session?.user?.email;
    
    if (!userEmail || !isUserAdmin(userEmail)) {
      console.error('Non-admin user attempted to update payment settings');
      return { data: null, error: new Error('Permission denied: Admin access required') };
    }
    
    // Check if payment_settings table exists
    const { data: tableExists, error: tableCheckError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'payment_settings')
      .eq('table_schema', 'public')
      .single();
    
    if (tableCheckError) {
      console.error('Error checking if payment_settings table exists:', tableCheckError);
      return { data: null, error: tableCheckError };
    }
    
    if (!tableExists) {
      console.warn('payment_settings table does not exist');
      return { data: null, error: new Error('payment_settings table does not exist') };
    }
    
    // Check if we already have settings
    const { data: existingData, error: checkError } = await supabase
      .from('payment_settings')
      .select('id')
      .limit(1)
      .maybeSingle();
      
    if (checkError) {
      console.error('Error checking existing payment settings:', checkError);
      return { data: null, error: checkError };
    }
    
    console.log('Existing payment settings check result:', existingData);
    
    // Prepare data with timestamp
    const dataToUpdate = {
      upi_id: settings.upi_id,
      qr_code_url: settings.qr_code_url,
      payment_instructions: settings.payment_instructions,
      updated_by: settings.updated_by,
      updated_at: new Date().toISOString()
    };
    
    let result;
    if (existingData?.id) {
      // Update existing settings
      console.log('Updating existing payment settings with ID:', existingData.id);
      result = await supabase
        .from('payment_settings')
        .update(dataToUpdate)
        .eq('id', existingData.id)
        .select();
    } else {
      // Insert new settings
      console.log('Inserting new payment settings');
      result = await supabase
        .from('payment_settings')
        .insert(dataToUpdate)
        .select();
    }
    
    if (result.error) {
      console.error('Error updating payment settings:', result.error);
      return { data: null, error: result.error };
    }
    
    console.log('Payment settings updated successfully:', result.data);
    return { data: result.data[0], error: null };
  } catch (error) {
    console.error('Error updating payment settings:', error);
    return { data: null, error };
  }
};

// Fetch hero slides with improved error handling and caching control
export const getHeroSlides = async (skipCache = false, activeOnly = false) => {
  try {
    console.log('Fetching hero slides, skipCache:', skipCache, 'activeOnly:', activeOnly);
    
    // Create the query without chaining .then()
    let query = supabase
      .from('hero_slides')
      .select('*')
      .order('sort_order', { ascending: true });
    
    if (activeOnly) {
      query = query.eq('is_active', true);
    }
    
    // Execute the query
    const { data, error } = await query;
    
    // Optional logging for debugging
    if (skipCache) {
      console.log('Hero slides fetch response:', { data, error });
    }
      
    if (error) {
      console.error('Error fetching hero slides:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching hero slides:', error);
    return { data: null, error };
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
