
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-url.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

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

// Custom function to fetch payment settings
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
