
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Trash2, Upload, Plus, GripVertical, Check, X, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { supabase, uploadFile } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from '@/components/ui/skeleton';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

// Hero slide type
interface HeroSlide {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  link: string;
  sort_order: number;
  is_active: boolean;
}

type HeroSlideFormData = Omit<HeroSlide, 'id' | 'sort_order'> & {
  id?: string;
  imageFile?: File | null;
};

const HeroSliderManager = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState<HeroSlideFormData>({
    title: '',
    subtitle: '',
    image_url: '',
    link: '',
    is_active: true,
    imageFile: null
  });
  const [isEditing, setIsEditing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const queryClient = useQueryClient();

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
      console.error('Error fetching hero slides:', error);
      toast.error('Failed to load hero slides');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentSlide(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggleChange = (checked: boolean) => {
    setCurrentSlide(prev => ({
      ...prev,
      is_active: checked
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Only JPEG, PNG and WEBP images are allowed');
      return;
    }

    setCurrentSlide(prev => ({
      ...prev,
      imageFile: file
    }));

    // Create a preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Clean up preview URL when component unmounts
    return () => URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setCurrentSlide({
      title: '',
      subtitle: '',
      image_url: '',
      link: '',
      is_active: true,
      imageFile: null
    });
    setPreviewUrl(null);
    setIsEditing(false);
  };

  const handleAddSlide = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleEditSlide = (slide: HeroSlide) => {
    setCurrentSlide({
      id: slide.id,
      title: slide.title,
      subtitle: slide.subtitle || '',
      image_url: slide.image_url,
      link: slide.link,
      is_active: slide.is_active
    });
    setPreviewUrl(slide.image_url);
    setIsEditing(true);
    setDialogOpen(true);
  };

  const uploadImage = async (file: File): Promise<string> => {
    try {
      const result = await uploadFile(file, 'hero_images', 'slides');
      
      if (result.error) throw result.error;
      
      return result.url || '';
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imageUrl = currentSlide.image_url;

      // Upload image if provided
      if (currentSlide.imageFile) {
        imageUrl = await uploadImage(currentSlide.imageFile);
      } else if (!currentSlide.image_url && !isEditing) {
        throw new Error('Please select an image');
      }

      const slideData = {
        title: currentSlide.title,
        subtitle: currentSlide.subtitle || null,
        image_url: imageUrl,
        link: currentSlide.link,
        is_active: currentSlide.is_active
      };

      if (isEditing && currentSlide.id) {
        // Update existing slide
        const { error } = await supabase
          .from('hero_slides')
          .update(slideData)
          .eq('id', currentSlide.id);
        
        if (error) throw error;
        
        toast.success('Slide updated successfully');
      } else {
        // Calculate the next sort order
        const maxOrder = slides.length > 0 
          ? Math.max(...slides.map(s => s.sort_order))
          : 0;
        
        // Create new slide
        const { error } = await supabase
          .from('hero_slides')
          .insert({
            ...slideData,
            sort_order: maxOrder + 1
          });
        
        if (error) throw error;
        
        toast.success('Slide added successfully');
      }

      // Reset form and fetch updated slides
      resetForm();
      setDialogOpen(false);
      fetchSlides();
    } catch (error: any) {
      console.error('Error saving slide:', error);
      toast.error(error.message || 'Failed to save slide');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSlide = async (id: string) => {
    if (!confirm('Are you sure you want to delete this slide?')) return;

    try {
      const { error } = await supabase
        .from('hero_slides')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Slide deleted successfully');
      fetchSlides();
    } catch (error) {
      console.error('Error deleting slide:', error);
      toast.error('Failed to delete slide');
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('hero_slides')
        .update({ is_active: !isActive })
        .eq('id', id);
      
      if (error) throw error;
      
      setSlides(slides.map(slide => 
        slide.id === id 
          ? { ...slide, is_active: !isActive } 
          : slide
      ));
      
      toast.success(`Slide ${!isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error toggling slide status:', error);
      toast.error('Failed to update slide status');
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(slides);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update the order in the UI
    setSlides(items);
    
    // Update sort_order in the database
    try {
      const updates = items.map((item, index) => ({
        id: item.id,
        sort_order: index + 1
      }));
      
      // Use a transaction to update all slides at once
      for (const update of updates) {
        const { error } = await supabase
          .from('hero_slides')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id);
        
        if (error) throw error;
      }
      
      toast.success('Slide order updated successfully');
    } catch (error) {
      console.error('Error updating slide order:', error);
      toast.error('Failed to update slide order');
      // Revert to original order
      fetchSlides();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hero Slider Management</CardTitle>
        <CardDescription>
          Manage the hero slider images shown on the homepage
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-md" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <Button 
              onClick={handleAddSlide}
              className="mb-6"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Slide
            </Button>
            
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="slides">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-3"
                  >
                    {slides.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 border border-dashed border-gray-300 rounded-lg">
                        <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-gray-500">No slides added yet</p>
                        <Button 
                          variant="link" 
                          onClick={handleAddSlide}
                          className="mt-2"
                        >
                          Add your first slide
                        </Button>
                      </div>
                    ) : (
                      slides.map((slide, index) => (
                        <Draggable key={slide.id} draggableId={slide.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`flex items-center p-3 rounded-lg border ${slide.is_active ? 'bg-white' : 'bg-gray-50'}`}
                            >
                              <div 
                                {...provided.dragHandleProps}
                                className="mr-3 cursor-grab text-gray-400"
                              >
                                <GripVertical className="h-5 w-5" />
                              </div>
                              
                              <div className="h-14 w-24 bg-gray-100 rounded-md overflow-hidden mr-4 flex-shrink-0">
                                <img 
                                  src={slide.image_url}
                                  alt={slide.title}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = '/placeholder.svg';
                                  }}
                                />
                              </div>
                              
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">{slide.title}</h4>
                                {slide.subtitle && (
                                  <p className="text-xs text-gray-500">{slide.subtitle}</p>
                                )}
                                <a 
                                  href={slide.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs flex items-center text-blue-600 hover:underline mt-1"
                                >
                                  {slide.link} 
                                  <ExternalLink className="h-3 w-3 ml-1" />
                                </a>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={slide.is_active}
                                  onCheckedChange={() => handleToggleActive(slide.id, slide.is_active)}
                                />
                                
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditSlide(slide)}
                                >
                                  Edit
                                </Button>
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteSlide(slide.id)}
                                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </>
        )}
      </CardContent>
      
      <CardFooter className="border-t pt-4 text-sm text-gray-500">
        <p>
          Drag and drop slides to reorder. Toggle the switch to show/hide slides.
        </p>
      </CardFooter>
      
      {/* Add/Edit Slide Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Slide' : 'Add New Slide'}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? 'Update the details for this slide' 
                : 'Add a new slide to the homepage hero slider'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={currentSlide.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="subtitle">Subtitle (Optional)</Label>
                <Input
                  id="subtitle"
                  name="subtitle"
                  value={currentSlide.subtitle || ''}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="link">Link URL</Label>
                <Input
                  id="link"
                  name="link"
                  value={currentSlide.link}
                  onChange={handleInputChange}
                  placeholder="e.g., /events/123"
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label>Slide Image</Label>
                <div className="flex flex-col items-center gap-4">
                  {previewUrl ? (
                    <div className="w-full h-[200px] bg-gray-100 rounded-md overflow-hidden relative">
                      <img 
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewUrl(null);
                          setCurrentSlide(prev => ({
                            ...prev,
                            imageFile: null,
                            image_url: ''
                          }));
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-full h-[200px] bg-gray-100 rounded-md flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Upload an image</p>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG or WebP (max 5MB)</p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="image-upload"
                      className="flex flex-col items-center justify-center w-full cursor-pointer"
                    >
                      <Button 
                        type="button"
                        variant={previewUrl ? "outline" : "secondary"}
                        className="w-full"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {previewUrl ? 'Change Image' : 'Upload Image'}
                      </Button>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is-active"
                  checked={currentSlide.is_active}
                  onCheckedChange={handleToggleChange}
                />
                <Label htmlFor="is-active">Active</Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  setDialogOpen(false);
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : isEditing ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Update Slide
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Slide
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default HeroSliderManager;
