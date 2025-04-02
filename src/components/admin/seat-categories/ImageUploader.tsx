
import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Upload, Image as ImageIcon, Loader2, Check } from 'lucide-react';
import { uploadFile, ensureBucketExists } from '@/integrations/supabase/client';

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
      // First make sure the bucket exists
      const { success, error: bucketError } = await ensureBucketExists('venue_layouts', 'Venue Layouts');
      
      if (!success) {
        throw new Error('Failed to create storage bucket: ' + bucketError?.message);
      }
      
      // Upload the file to the now-confirmed bucket
      const result = await uploadFile(selectedFile, 'venue_layouts', 'layouts');
      
      if (result.error) {
        throw result.error;
      }
      
      if (!result.url) {
        throw new Error('Failed to get upload URL');
      }
      
      toast.success('Venue layout uploaded successfully');
      setUploadSuccess(true);
      
      // Copy the URL to clipboard
      navigator.clipboard.writeText(result.url)
        .then(() => toast.success('URL copied to clipboard'))
        .catch(() => toast.error('Failed to copy URL'));
      
    } catch (error: any) {
      console.error('Error uploading venue layout:', error);
      toast.error(`Upload failed: ${error.message || 'Unknown error'}`);
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
