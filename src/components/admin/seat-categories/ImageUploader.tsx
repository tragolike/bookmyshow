
import { useState, useRef } from 'react';
import { Upload, Loader2, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const ImageUploader = () => {
  const [uploading, setUploading] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('category');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setImage(null);
      return;
    }
    const file = e.target.files[0];
    setImage(file);
  };

  const uploadImage = async () => {
    if (!image) {
      toast.error('Please select an image to upload.');
      return;
    }

    if (image.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB.');
      return;
    }

    setUploading(true);
    try {
      const timestamp = new Date().getTime();
      const bucketId = activeTab === 'category' ? 'images' : 'venue_layouts';
      const filePath = `${activeTab === 'category' ? 'seat_categories' : 'venue_layouts'}/${timestamp}-${image.name}`;

      // Check if the bucket exists, create if it doesn't
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.id === bucketId);
      
      if (!bucketExists) {
        console.log(`Creating bucket: ${bucketId}`);
        await supabase.storage.createBucket(bucketId, {
          public: true
        });
      }

      console.log(`Uploading to bucket: ${bucketId}, path: ${filePath}`);
      const { data, error } = await supabase.storage
        .from(bucketId)
        .upload(filePath, image, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      if (!data || !data.path) {
        throw new Error('No data returned from upload');
      }

      const { data: urlData } = supabase.storage
        .from(bucketId)
        .getPublicUrl(data.path);

      setUploadedImageUrl(urlData.publicUrl);
      toast.success(`${activeTab === 'category' ? 'Category' : 'Venue layout'} image uploaded successfully!`);
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setImage(null);
    } catch (error: any) {
      console.error('Error details:', error);
      toast.error(`Error uploading image: ${error.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Images</CardTitle>
        <CardDescription>Upload images for seat categories or venue layouts.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs 
          defaultValue="category" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="category">Category Image</TabsTrigger>
            <TabsTrigger value="venue">Venue Layout</TabsTrigger>
          </TabsList>
          
          <TabsContent value="category" className="space-y-4">
            <div className="py-2">
              <p className="text-sm text-gray-500">
                Upload an image for a seat category that will be displayed to customers.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="venue" className="space-y-4">
            <div className="py-2">
              <p className="text-sm text-gray-500">
                Upload a seating chart image of your venue. This will be displayed to customers during seat selection.
              </p>
            </div>
          </TabsContent>

          <div className="space-y-4 mt-4">
            <div className="grid gap-4">
              <Input 
                type="file" 
                id="image" 
                ref={fileInputRef}
                onChange={handleImageChange} 
                accept=".jpg,.jpeg,.png,.svg"
              />
              
              {image && (
                <p className="text-sm text-gray-500">
                  Selected file: {image.name} ({(image.size / 1024).toFixed(2)} KB)
                </p>
              )}
              
              {uploadedImageUrl && (
                <div className="border rounded-md p-2">
                  <p className="text-sm font-medium mb-2">Uploaded Image:</p>
                  <div className="max-w-xs mx-auto">
                    <img 
                      src={uploadedImageUrl} 
                      alt="Uploaded" 
                      className="w-full h-auto rounded-md"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2 break-all">
                    URL: {uploadedImageUrl}
                  </p>
                </div>
              )}
            </div>

            <Button 
              onClick={uploadImage} 
              disabled={uploading || !image} 
              className="w-full"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload {activeTab === 'category' ? 'Category' : 'Venue'} Image
                </>
              )}
            </Button>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ImageUploader;
