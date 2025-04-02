
import { useState, useEffect } from 'react';
import { Slider } from "@/components/ui/slider";
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from '@/integrations/supabase/client';
import { Eye } from 'lucide-react';

const HeroSectionSettings = () => {
  const [overlayOpacity, setOverlayOpacity] = useState<number[]>([60]); // Default 60%
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .eq('key', 'hero_overlay_opacity')
          .single();
          
        if (error) {
          console.error('Error fetching overlay opacity:', error);
          return;
        }
        
        if (data) {
          setOverlayOpacity([parseInt(data.value)]);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSettings();
  }, []);

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert(
          { key: 'hero_overlay_opacity', value: overlayOpacity[0].toString() },
          { onConflict: 'key' }
        );
      
      if (error) {
        throw error;
      }
      
      toast.success('Hero section opacity saved successfully');
    } catch (error) {
      console.error('Error saving overlay opacity:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hero Section Overlay</CardTitle>
          <CardDescription>
            Adjust the opacity of the dark overlay on the hero section slider
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="overlay-opacity">
                  Overlay Opacity: {overlayOpacity[0]}%
                </Label>
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  <div 
                    className="w-6 h-6 rounded" 
                    style={{ backgroundColor: `rgba(0, 0, 0, ${overlayOpacity[0]/100})` }}
                  />
                </div>
              </div>
              <Slider
                id="overlay-opacity"
                min={0}
                max={100}
                step={5}
                value={overlayOpacity}
                onValueChange={setOverlayOpacity}
                disabled={isLoading}
              />
              <p className="text-sm text-gray-500">
                Controls how dark the overlay on the hero slider appears. Higher values make it darker.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={saveSettings} 
              disabled={isLoading || isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HeroSectionSettings;
