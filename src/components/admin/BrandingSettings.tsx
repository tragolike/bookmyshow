
import { useState, useEffect } from 'react';
import { supabase, getBrandSettings, updateBrandSettings, ensureBucketExists, uploadFile } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, Upload, AlertCircle } from 'lucide-react';

const BrandingSettings = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    site_name: 'ShowTix',
    primary_color: '#ff3366',
    logo_url: '',
    favicon_url: ''
  });
  
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [faviconPreview, setFaviconPreview] = useState<string>('');
  
  useEffect(() => {
    fetchSettings();
  }, []);
  
  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await getBrandSettings();
      
      if (error) throw error;
      
      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching brand settings:', error);
      toast.error('Failed to load branding settings');
    } finally {
      setIsLoading(false);
    }
  };
  
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
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin text-book-primary" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Branding Settings</CardTitle>
        <CardDescription>
          Customize the look and feel of your ticketing platform
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="site_name">Site Name</Label>
              <Input 
                id="site_name" 
                value={settings.site_name}
                onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                placeholder="Your site name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="primary_color">Primary Color</Label>
              <div className="flex space-x-2">
                <Input 
                  id="primary_color" 
                  type="text"
                  value={settings.primary_color}
                  onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                  placeholder="#ff3366"
                  className="flex-1"
                />
                <div 
                  className="h-10 w-10 rounded-md border"
                  style={{ backgroundColor: settings.primary_color }}
                ></div>
                <Input
                  type="color"
                  value={settings.primary_color}
                  onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                  className="w-10 p-1 h-10"
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="logo">Logo Image</Label>
              <div className="flex flex-col space-y-2">
                <Input
                  id="logo"
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  onChange={handleLogoChange}
                  className="flex-1"
                />
                
                <div className="flex items-center space-x-4">
                  {(logoPreview || settings.logo_url) && (
                    <div className="border rounded p-2 bg-white max-w-[180px] h-16 flex items-center justify-center">
                      <img 
                        src={logoPreview || settings.logo_url} 
                        alt="Logo preview" 
                        className="max-h-full max-w-full" 
                        onError={(e) => {
                          // If image fails to load, show error placeholder
                          e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23ff3366' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cline x1='12' y1='8' x2='12' y2='12'%3E%3C/line%3E%3Cline x1='12' y1='16' x2='12.01' y2='16'%3E%3C/line%3E%3C/svg%3E";
                        }}
                      />
                    </div>
                  )}
                  <div className="text-sm text-gray-500">
                    <p>Recommended size: 240x80 px</p>
                    <p>Max file size: 2MB</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="favicon">Favicon</Label>
              <div className="flex flex-col space-y-2">
                <Input
                  id="favicon"
                  type="file"
                  accept="image/png,image/x-icon,image/svg+xml"
                  onChange={handleFaviconChange}
                  className="flex-1"
                />
                
                <div className="flex items-center space-x-4">
                  {(faviconPreview || settings.favicon_url) && (
                    <div className="border rounded p-2 bg-white w-16 h-16 flex items-center justify-center">
                      <img 
                        src={faviconPreview || settings.favicon_url} 
                        alt="Favicon preview" 
                        className="max-h-full max-w-full" 
                        onError={(e) => {
                          // If image fails to load, show error placeholder
                          e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23ff3366' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cline x1='12' y1='8' x2='12' y2='12'%3E%3C/line%3E%3Cline x1='12' y1='16' x2='12.01' y2='16'%3E%3C/line%3E%3C/svg%3E";
                        }}
                      />
                    </div>
                  )}
                  <div className="text-sm text-gray-500">
                    <p>Recommended size: 32x32 px</p>
                    <p>Max file size: 1MB</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end">
          <Button
            type="submit"
            disabled={isSaving}
            className="bg-[#ff2366] hover:bg-[#e01f59] text-white"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default BrandingSettings;
