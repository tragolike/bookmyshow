
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo image must be less than 2MB');
      return;
    }
    
    if (!['image/png', 'image/jpeg', 'image/svg+xml'].includes(file.type)) {
      toast.error('Only PNG, JPEG, and SVG files are allowed');
      return;
    }
    
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 1 * 1024 * 1024) {
      toast.error('Favicon image must be less than 1MB');
      return;
    }
    
    if (!['image/png', 'image/x-icon', 'image/svg+xml'].includes(file.type)) {
      toast.error('Only PNG, ICO, and SVG files are allowed for favicon');
      return;
    }
    
    setFaviconFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setFaviconPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!settings.site_name?.trim()) {
      toast.error('Please enter a site name');
      return;
    }
    
    setIsSaving(true);
    try {
      let updatedSettings = { ...settings };
      
      // Ensure the brand_assets bucket exists
      const { success, error: bucketError } = await ensureBucketExists('brand_assets', 'Brand Assets');
      
      if (!success) {
        throw new Error('Failed to create or check storage bucket: ' + bucketError?.message);
      }
      
      // Upload logo if changed
      if (logoFile) {
        try {
          const result = await uploadFile(logoFile, 'brand_assets', 'logos');
          if (result.error) throw result.error;
          if (result.url) updatedSettings.logo_url = result.url;
        } catch (error) {
          console.error('Logo upload error:', error);
          toast.error('Failed to upload logo');
          // Continue with other operations
        }
      }
      
      // Upload favicon if changed
      if (faviconFile) {
        try {
          const result = await uploadFile(faviconFile, 'brand_assets', 'favicons');
          if (result.error) throw result.error;
          if (result.url) updatedSettings.favicon_url = result.url;
        } catch (error) {
          console.error('Favicon upload error:', error);
          toast.error('Failed to upload favicon');
          // Continue with other operations
        }
      }
      
      // Update in the database
      const { error } = await updateBrandSettings({
        site_name: updatedSettings.site_name,
        primary_color: updatedSettings.primary_color,
        logo_url: updatedSettings.logo_url,
        favicon_url: updatedSettings.favicon_url,
        updated_by: user?.id,
        updated_at: new Date().toISOString()
      });
      
      if (error) throw error;
      
      setSettings(updatedSettings);
      toast.success('Branding settings updated successfully');
      
    } catch (error) {
      console.error('Error updating brand settings:', error);
      toast.error('Failed to update branding settings');
    } finally {
      setIsSaving(false);
    }
  };
