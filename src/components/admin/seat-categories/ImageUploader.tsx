
import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Upload, Image as ImageIcon, Loader2, Check } from 'lucide-react';
import { uploadFile, ensureBucketExists } from '@/integrations/supabase/client';
import { supabase } from '@/integrations/supabase/client';

const ImageUploader = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setUploadSuccess(false);
    
    // Create preview URL
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    setIsUploading(true);
    setUploadSuccess(false);

    try {
      // First check if bucket exists in storage
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.id === 'venue_layouts');
      
      // Create bucket if it doesn't exist
      if (!bucketExists) {
        const { data, error } = await supabase.storage.createBucket('venue_layouts', {
          public: true
        });
        
        if (error) {
          console.error('Error creating venue_layouts bucket:', error);
          throw new Error('Failed to create bucket. Please try again.');
        }
        
        console.log('Created venue_layouts bucket:', data);
        
        // Create public policy for viewing files
        const { error: policyError } = await supabase.rpc('create_storage_policy', {
          bucket_id: 'venue_layouts',
          policy_name: 'Public Access',
          definition: 'bucket_id = \'venue_layouts\''
        });
        
        if (policyError) {
          console.warn('Failed to create storage policy:', policyError);
          // Continue anyway, as this is not critical
        }
      }
      
      // Upload the file with custom path
      const timestamp = Date.now();
      const fileName = `${timestamp}-${selectedFile.name}`;
      
      const { data, error } = await supabase.storage
        .from('venue_layouts')
        .upload(`layouts/${fileName}`, selectedFile, {
          cacheControl: 'public, max-age=31536000',
          upsert: true
        });
      
      if (error) throw error;
      
      if (data) {
        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('venue_layouts')
          .getPublicUrl(`layouts/${fileName}`);
        
        toast.success('Venue layout uploaded successfully');
        setUploadSuccess(true);
        
        // Copy the URL to clipboard
        navigator.clipboard.writeText(publicUrl)
          .then(() => toast.success('URL copied to clipboard'))
          .catch(() => toast.error('Failed to copy URL'));
      }
    } catch (error: any) {
      console.error('Error uploading venue layout:', error);
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Venue Layout</CardTitle>
        <CardDescription>
          Upload venue layout images to use in the seat map editor.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="layout-image">Venue Layout Image</Label>
          <Input
            ref={fileInputRef}
            id="layout-image"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="cursor-pointer"
          />
        </div>

        {previewUrl && (
          <div className="relative border rounded-md overflow-hidden">
            <img 
              src={previewUrl} 
              alt="Layout Preview" 
              className="w-full h-auto max-h-64 object-contain bg-gray-100"
            />
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={handleUpload} 
            disabled={!selectedFile || isUploading || uploadSuccess}
            className="flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : uploadSuccess ? (
              <>
                <Check className="h-4 w-4" />
                Uploaded
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload Layout
              </>
            )}
          </Button>
          
          {(selectedFile || uploadSuccess) && (
            <Button 
              variant="outline" 
              onClick={handleReset}
              className="flex items-center gap-2"
            >
              Reset
            </Button>
          )}
        </div>

        <div className="text-sm text-muted-foreground">
          <p>Supported formats: JPEG, PNG, SVG, GIF</p>
          <p>Maximum file size: 5MB</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageUploader;
