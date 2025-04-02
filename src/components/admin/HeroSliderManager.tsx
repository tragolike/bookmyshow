
import { useState, useEffect } from 'react';
import { supabase, ensureBucketExists, uploadFile } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Trash2, Plus, MoveUp, MoveDown, Upload, Image, Loader2, Link } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface HeroSlide {
  id?: string;
  title: string;
  subtitle?: string;
  image_url: string;
  link: string;
  is_active: boolean;
  sort_order: number;
}

const HeroSliderManager = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentSlide, setCurrentSlide] = useState<HeroSlide | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .order('sort_order', { ascending: true });
        
      if (error) throw error;
      
      setSlides(data || []);
    } catch (error) {
      console.error('Error fetching slides:', error);
      toast.error('Failed to load hero slides');
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleAddSlide = () => {
    setCurrentSlide({
      title: '',
      subtitle: '',
      image_url: '',
      link: '/',
      is_active: true,
      sort_order: slides.length,
    });
    setIsEditing(true);
  };

  const handleEditSlide = (slide: HeroSlide) => {
    setCurrentSlide({...slide});
    setIsEditing(true);
  };

  const handleSaveSlide = async () => {
    if (!currentSlide) return;
    
    if (!currentSlide.title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    
    if (!currentSlide.image_url) {
      toast.error('Please upload an image');
      return;
    }
    
    if (!currentSlide.link.trim()) {
      toast.error('Please enter a link');
      return;
    }
    
    setIsSaving(true);
    try {
      let result;
      
      if (currentSlide.id) {
        // Update existing slide
        result = await supabase
          .from('hero_slides')
          .update({
            title: currentSlide.title,
            subtitle: currentSlide.subtitle,
            image_url: currentSlide.image_url,
            link: currentSlide.link,
            is_active: currentSlide.is_active,
            sort_order: currentSlide.sort_order,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentSlide.id);
      } else {
        // Create a new slide
        result = await supabase
          .from('hero_slides')
          .insert({
            title: currentSlide.title,
            subtitle: currentSlide.subtitle,
            image_url: currentSlide.image_url,
            link: currentSlide.link,
            is_active: currentSlide.is_active,
            sort_order: currentSlide.sort_order
          });
      }
      
      if (result.error) throw result.error;
      
      toast.success(currentSlide.id ? 'Slide updated successfully' : 'Slide created successfully');
      fetchSlides();
      setCurrentSlide(null);
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error saving slide:', error);
      toast.error(`Failed to save slide: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSlide = async (id: string) => {
    try {
      const { error } = await supabase
        .from('hero_slides')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success('Slide deleted successfully');
      fetchSlides();
    } catch (error: any) {
      console.error('Error deleting slide:', error);
      toast.error(`Failed to delete slide: ${error.message}`);
    }
  };

  const handleMoveSlide = async (id: string, direction: 'up' | 'down') => {
    const slideIndex = slides.findIndex(slide => slide.id === id);
    if (slideIndex === -1) return;
    
    const newSlides = [...slides];
    
    if (direction === 'up' && slideIndex > 0) {
      const temp = newSlides[slideIndex].sort_order;
      newSlides[slideIndex].sort_order = newSlides[slideIndex - 1].sort_order;
      newSlides[slideIndex - 1].sort_order = temp;
      
      // Swap positions in the array
      [newSlides[slideIndex], newSlides[slideIndex - 1]] = [newSlides[slideIndex - 1], newSlides[slideIndex]];
    } else if (direction === 'down' && slideIndex < newSlides.length - 1) {
      const temp = newSlides[slideIndex].sort_order;
      newSlides[slideIndex].sort_order = newSlides[slideIndex + 1].sort_order;
      newSlides[slideIndex + 1].sort_order = temp;
      
      // Swap positions in the array
      [newSlides[slideIndex], newSlides[slideIndex + 1]] = [newSlides[slideIndex + 1], newSlides[slideIndex]];
    } else {
      return; // No movement needed
    }
    
    setSlides(newSlides);
    
    try {
      // Update both slides in the database
      const updates = newSlides
        .filter((_, index) => index === slideIndex || 
          (direction === 'up' && index === slideIndex - 1) || 
          (direction === 'down' && index === slideIndex + 1))
        .map(slide => ({
          id: slide.id,
          sort_order: slide.sort_order
        }));
      
      for (const update of updates) {
        const { error } = await supabase
          .from('hero_slides')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id);
          
        if (error) throw error;
      }
    } catch (error: any) {
      console.error('Error reordering slides:', error);
      toast.error(`Failed to reorder slides: ${error.message}`);
      fetchSlides(); // Reload original order
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('hero_slides')
        .update({ is_active: isActive })
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success(`Slide ${isActive ? 'activated' : 'deactivated'}`);
      
      // Update local state
      setSlides(slides.map(slide => 
        slide.id === id ? { ...slide, is_active: isActive } : slide
      ));
    } catch (error: any) {
      console.error('Error toggling slide status:', error);
      toast.error(`Failed to update slide status: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Hero Slider</CardTitle>
            <CardDescription>
              Manage the hero slider images on your homepage
            </CardDescription>
          </div>
          <Button
            onClick={handleAddSlide}
            className="bg-[#ff2366] hover:bg-[#e01f59] text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Slide
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-6">
              <Loader2 className="h-8 w-8 animate-spin text-book-primary" />
            </div>
          ) : isEditing ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={currentSlide?.title || ''}
                    onChange={(e) => setCurrentSlide(prev => prev ? {...prev, title: e.target.value} : null)}
                    placeholder="Enter slide title"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subtitle">Subtitle (Optional)</Label>
                  <Input
                    id="subtitle"
                    value={currentSlide?.subtitle || ''}
                    onChange={(e) => setCurrentSlide(prev => prev ? {...prev, subtitle: e.target.value} : null)}
                    placeholder="Enter slide subtitle"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="link">Link URL</Label>
                  <div className="flex items-center space-x-2">
                    <Link className="h-4 w-4 text-gray-400" />
                    <Input
                      id="link"
                      value={currentSlide?.link || ''}
                      onChange={(e) => setCurrentSlide(prev => prev ? {...prev, link: e.target.value} : null)}
                      placeholder="e.g. /events/123"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Active Status</Label>
                  <div className="flex items-center space-x-2 h-10 px-3">
                    <Switch
                      checked={currentSlide?.is_active || false}
                      onCheckedChange={(checked) => setCurrentSlide(prev => prev ? {...prev, is_active: checked} : null)}
                    />
                    <span>{currentSlide?.is_active ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="image">Slide Image</Label>
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center space-x-2">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                    {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
                  </div>
                  
                  {currentSlide?.image_url && (
                    <div className="border rounded-md p-2">
                      <img 
                        src={currentSlide.image_url} 
                        alt={currentSlide.title} 
                        className="h-48 object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentSlide(null);
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-[#ff2366] hover:bg-[#e01f59] text-white"
                  onClick={handleSaveSlide}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Slide'
                  )}
                </Button>
              </div>
            </div>
          ) : slides.length === 0 ? (
            <div className="text-center py-8 border border-dashed rounded-md">
              <Image className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold">No slides found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new slide.
              </p>
              <div className="mt-6">
                <Button
                  onClick={handleAddSlide}
                  className="bg-[#ff2366] hover:bg-[#e01f59] text-white"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Slide
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {slides.map((slide, index) => (
                <div
                  key={slide.id}
                  className="flex flex-col sm:flex-row items-center gap-4 p-4 border rounded-md"
                >
                  <div className="w-full sm:w-24 h-16 overflow-hidden rounded-md bg-gray-100 shrink-0">
                    <img
                      src={slide.image_url}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <h3 className="font-medium text-lg truncate">{slide.title}</h3>
                      <div className={`px-2 py-0.5 text-xs rounded-full ${
                        slide.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {slide.is_active ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                    {slide.subtitle && (
                      <p className="text-sm text-gray-600 truncate">{slide.subtitle}</p>
                    )}
                    <p className="text-xs text-gray-500 truncate">Link: {slide.link}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2 self-end sm:self-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleActive(slide.id!, !slide.is_active)}
                      title={slide.is_active ? 'Deactivate' : 'Activate'}
                      className="h-8 w-8"
                    >
                      <Switch checked={slide.is_active} />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleMoveSlide(slide.id!, 'up')}
                      disabled={index === 0}
                      title="Move up"
                      className="h-8 w-8"
                    >
                      <MoveUp className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleMoveSlide(slide.id!, 'down')}
                      disabled={index === slides.length - 1}
                      title="Move down"
                      className="h-8 w-8"
                    >
                      <MoveDown className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditSlide(slide)}
                      title="Edit"
                      className="h-8 w-8"
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M11.8536 1.14645C11.6583 0.951184 11.3417 0.951184 11.1465 1.14645L3.71455 8.57836C3.62459 8.66832 3.55263 8.77461 3.50251 8.89155L2.04044 12.303C1.9599 12.491 2.00189 12.709 2.14646 12.8536C2.29103 12.9981 2.50905 13.0401 2.69697 12.9596L6.10847 11.4975C6.2254 11.4474 6.3317 11.3754 6.42166 11.2855L13.8536 3.85355C14.0488 3.65829 14.0488 3.34171 13.8536 3.14645L11.8536 1.14645ZM4.42166 9.28547L11.5 2.20711L12.7929 3.5L5.71455 10.5784L4.21924 11.2192L3.78081 10.7808L4.42166 9.28547Z"
                          fill="currentColor"
                          fillRule="evenodd"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete slide?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this slide
                            from the hero slider.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteSlide(slide.id!)}
                            className="bg-red-500 hover:bg-red-600 text-white"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HeroSliderManager;
