
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Upload, Trash2, ImageIcon, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface BrandSettings {
  id?: string;
  site_name: string;
  logo_url?: string;
  favicon_url?: string;
  primary_color?: string;
  updated_at?: string;
  updated_by?: string;
}

const BrandingSettings = () => {
  const [settings, setSettings] = useState<BrandSettings>({
    site_name: 'ShowTix',
    primary_color: '#ff3366'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      // Try to fetch from brand_settings table
      const { data, error } = await supabase
        .from('brand_settings')
        .select('*')
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        setSettings({
          id: data.id,
          site_name: data.site_name,
          primary_color: data.primary_color,
          logo_url: data.logo_url,
          favicon_url: data.favicon_url
        });
        
        if (data.logo_url) {
          setLogoPreview(data.logo_url);
        }
        
        if (data.favicon_url) {
          setFaviconPreview(data.favicon_url);
        }
      } else {
        // No settings found, use defaults
        setSettings({
          site_name: 'ShowTix',
          primary_color: '#ff3366'
        });
      }
    } catch (error) {
      console.error('Error fetching brand settings:', error);
      toast.error('Failed to load branding settings');
    } finally {
      setIsLoading(false);
    }
  };

  const createBrandAssetsBucket = async () => {
    try {
      // Check if bucket exists
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(b => b.name === 'brand_assets');
      
      if (!bucketExists) {
        const { error } = await supabase.storage.createBucket('brand_assets', {
          public: true,
          fileSizeLimit: 5242880 // 5MB
        });
        
        if (error) throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Error creating bucket:', error);
      return false;
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

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setSettings(prev => ({ ...prev, logo_url: undefined }));
  };

  const handleRemoveFavicon = () => {
    setFaviconFile(null);
    setFaviconPreview(null);
    setSettings(prev => ({ ...prev, favicon_url: undefined }));
  };

  const uploadFile = async (file: File, path: string) => {
    try {
      // Ensure bucket exists
      const bucketCreated = await createBrandAssetsBucket();
      if (!bucketCreated) {
        throw new Error('Could not ensure storage bucket exists');
      }
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${path}/${fileName}`;
      
      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('brand_assets')
        .upload(filePath, file, { upsert: true });
      
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('brand_assets')
        .getPublicUrl(filePath);
      
      return publicUrl;
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
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
      
      // Upload logo if changed
      if (logoFile) {
        try {
          const logoUrl = await uploadFile(logoFile, 'logos');
          updatedSettings.logo_url = logoUrl;
        } catch (error) {
          console.error('Logo upload error:', error);
          toast.error('Failed to upload logo');
          // Continue with other operations
        }
      }
      
      // Upload favicon if changed
      if (faviconFile) {
        try {
          const faviconUrl = await uploadFile(faviconFile, 'favicons');
          updatedSettings.favicon_url = faviconUrl;
        } catch (error) {
          console.error('Favicon upload error:', error);
          toast.error('Failed to upload favicon');
          // Continue with other operations
        }
      }
      
      // Update or insert to brand_settings table
      let response;
      if (settings.id) {
        // Update existing record
        response = await supabase
          .from('brand_settings')
          .update({
            site_name: updatedSettings.site_name,
            primary_color: updatedSettings.primary_color,
            logo_url: updatedSettings.logo_url,
            favicon_url: updatedSettings.favicon_url,
            updated_by: user?.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', settings.id);
      } else {
        // Insert new record
        response = await supabase
          .from('brand_settings')
          .insert({
            site_name: updatedSettings.site_name,
            primary_color: updatedSettings.primary_color,
            logo_url: updatedSettings.logo_url,
            favicon_url: updatedSettings.favicon_url,
            updated_by: user?.id
          });
      }
      
      if (response.error) throw response.error;
      
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
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-book-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Branding Settings</h2>
          <p className="text-gray-500">Customize your booking platform's appearance</p>
        </div>
        
        <Button 
          type="submit" 
          disabled={isSaving}
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
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Site Identity</CardTitle>
            <CardDescription>
              Customize how your booking platform appears to users
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="site-name">Site Name</Label>
              <Input 
                id="site-name"
                value={settings.site_name}
                onChange={(e) => setSettings(prev => ({ ...prev, site_name: e.target.value }))}
                placeholder="Enter your site name"
              />
              <p className="text-sm text-gray-500">
                The name will be displayed in browser tabs and across the platform
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="primary-color">Primary Color</Label>
              <div className="flex gap-3">
                <div
                  className="w-10 h-10 rounded border"
                  style={{ backgroundColor: settings.primary_color }}
                ></div>
                <Input 
                  id="primary-color"
                  type="color"
                  value={settings.primary_color}
                  onChange={(e) => setSettings(prev => ({ ...prev, primary_color: e.target.value }))}
                  className="w-full"
                />
              </div>
              <p className="text-sm text-gray-500">
                This color will be used for buttons, links, and highlights
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Logo & Favicon</CardTitle>
            <CardDescription>
              Upload your brand assets for display across the platform
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Logo</Label>
              <div className="flex items-center gap-4">
                <div className="h-24 w-40 rounded-md border border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                  {logoPreview || settings.logo_url ? (
                    <img 
                      src={logoPreview || settings.logo_url}
                      alt="Site Logo"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-gray-400 flex flex-col items-center">
                      <ImageIcon className="h-10 w-10 mb-1" />
                      <span className="text-xs">No logo uploaded</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('logo-upload')?.click()}
                      className="flex items-center gap-1"
                    >
                      <Upload className="h-4 w-4" />
                      Upload Logo
                    </Button>
                    
                    {(logoPreview || settings.logo_url) && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleRemoveLogo}
                        className="flex items-center gap-1 text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </Button>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    Recommend size: 200x60px. Max size: 2MB<br />
                    Accepted formats: PNG, JPG, SVG
                  </p>
                </div>
                
                <input 
                  id="logo-upload"
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  className="hidden"
                  onChange={handleLogoChange}
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <Label>Favicon</Label>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-md border border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                  {faviconPreview || settings.favicon_url ? (
                    <img 
                      src={faviconPreview || settings.favicon_url}
                      alt="Favicon"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-gray-400 flex flex-col items-center">
                      <ImageIcon className="h-8 w-8 mb-1" />
                      <span className="text-xs">No favicon</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('favicon-upload')?.click()}
                      className="flex items-center gap-1"
                    >
                      <Upload className="h-4 w-4" />
                      Upload Favicon
                    </Button>
                    
                    {(faviconPreview || settings.favicon_url) && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleRemoveFavicon}
                        className="flex items-center gap-1 text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </Button>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    Recommend size: 32x32px. Max size: 1MB<br />
                    Accepted formats: PNG, ICO, SVG
                  </p>
                </div>
                
                <input 
                  id="favicon-upload"
                  type="file"
                  accept="image/png,image/x-icon,image/svg+xml"
                  className="hidden"
                  onChange={handleFaviconChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
};

export default BrandingSettings;
