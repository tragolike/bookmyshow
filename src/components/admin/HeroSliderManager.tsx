
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }
    
    try {
      setIsUploading(true);
      toast.info('Uploading image...');
      
      // Ensure the hero_slides bucket exists
      const { success, error: bucketError } = await ensureBucketExists('hero_slides', 'Hero Slides');
      
      if (!success) {
        throw new Error('Failed to create or check storage bucket: ' + bucketError?.message);
      }
      
      const result = await uploadFile(file, 'hero_slides', 'images');
      
      if (result.error) throw result.error;
      
      if (result.url) {
        if (currentSlide) {
          setCurrentSlide({
            ...currentSlide,
            image_url: result.url
          });
        }
        toast.success('Image uploaded successfully');
      } else {
        throw new Error('Failed to get upload URL');
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(`Failed to upload image: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };
