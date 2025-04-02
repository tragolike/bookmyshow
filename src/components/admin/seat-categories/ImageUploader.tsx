
import { useState } from 'react';
import { Upload, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const ImageUploader = () => {
  const [uploading, setUploading] = useState(false);
  const [image, setImage] = useState<File | null>(null);

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

    setUploading(true);
    try {
      const timestamp = new Date().getTime();
      const filePath = `seat_categories/${timestamp}-${image.name}`;

      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, image, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${data.path}`;
      toast.success('Image uploaded successfully!');
    } catch (error: any) {
      toast.error(`Error uploading image: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Category Image</CardTitle>
        <CardDescription>Upload an image for a seat category.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Input type="file" id="image" onChange={handleImageChange} />
          <Button onClick={uploadImage} disabled={uploading}>
            {uploading ? (
              <>Uploading... <Loader className="w-4 h-4 ml-2 animate-spin" /></>
            ) : (
              <>Upload Image <Upload className="w-4 h-4 ml-2" /></>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageUploader;
