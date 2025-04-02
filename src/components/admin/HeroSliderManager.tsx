import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase, uploadFile } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Pencil, Trash2, Image, Move, Eye, EyeOff, Plus, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Local types
interface HeroSlide {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  link: string;
  sort_order: number;
  is_active: boolean;
}

const HeroSliderManager = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSlide, setCurrentSlide] = useState<HeroSlide | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  // Fetch slides
  const { data, isLoading, error } = useQuery({
    queryKey: ['heroSlides'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Update slides when data changes
  useEffect(() => {
    if (data) {
      setSlides(data);
    }
  }, [data]);

  // Create slide mutation
  const createSlideMutation = useMutation({
    mutationFn: async (slide: Omit<HeroSlide, 'id'>) => {
      const { data, error } = await supabase
        .from('hero_slides')
        .insert(slide)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heroSlides'] });
      toast.success('Slide created successfully');
      resetForm();
    },
    onError: (error) => {
      console.error('Error creating slide:', error);
      toast.error('Failed to create slide');
    }
  });

  // Update slide mutation
  const updateSlideMutation = useMutation({
    mutationFn: async (slide: HeroSlide) => {
      const { data, error } = await supabase
        .from('hero_slides')
        .update(slide)
        .eq('id', slide.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heroSlides'] });
      toast.success('Slide updated successfully');
      resetForm();
    },
    onError: (error) => {
      console.error('Error updating slide:', error);
      toast.error('Failed to update slide');
    }
  });

  // Delete slide mutation
  const deleteSlideMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('hero_slides')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heroSlides'] });
      toast.success('Slide deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting slide:', error);
      toast.error('Failed to delete slide');
    }
  });

  // Update slide order mutation
  const updateOrderMutation = useMutation({
    mutationFn: async (updatedSlides: HeroSlide[]) => {
      // Create an array of update operations
      const updates = updatedSlides.map((slide) => ({
        id: slide.id,
        sort_order: slide.sort_order
      }));

      // Use upsert to update multiple rows
      const { data, error } = await supabase
        .from('hero_slides')
        .upsert(updates);
      
      if (error) throw error;
      return updatedSlides;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heroSlides'] });
      toast.success('Slide order updated');
    },
    onError: (error) => {
      console.error('Error updating slide order:', error);
      toast.error('Failed to update slide order');
    }
  });

  // Toggle slide active status
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { data, error } = await supabase
        .from('hero_slides')
        .update({ is_active: isActive })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heroSlides'] });
    },
    onError: (error) => {
      console.error('Error toggling slide status:', error);
      toast.error('Failed to update slide status');
    }
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentSlide) return;
    
    if (!currentSlide.title.trim()) {
      toast.error('Title is required');
      return;
    }
    
    if (!currentSlide.image_url) {
      toast.error('Image is required');
      return;
    }
    
    if (!currentSlide.link.trim()) {
      toast.error('Link is required');
      return;
    }
    
    if (isEditing && currentSlide.id) {
      updateSlideMutation.mutate(currentSlide);
    } else {
      // For new slides, calculate the next sort order
      const maxOrder = slides.length > 0 
        ? Math.max(...slides.map(s => s.sort_order))
        : 0;
      
      createSlideMutation.mutate({
        ...currentSlide,
        sort_order: maxOrder + 1
      });
    }
  };

  // Reset form
  const resetForm = () => {
    setCurrentSlide(null);
    setIsEditing(false);
  };

  // Edit slide
  const editSlide = (slide: HeroSlide) => {
    setCurrentSlide({ ...slide });
    setIsEditing(true);
  };

  // Add new slide
  const addNewSlide = () => {
    setCurrentSlide({
      id: '',
      title: '',
      subtitle: '',
      image_url: '',
      link: '',
      sort_order: 0,
      is_active: true
    });
    setIsEditing(false);
  };

  // Handle image upload
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
      
      const result = await uploadFile(file, 'hero_slides', 'images');
      
      if (result.error) throw result.error;
      
      // Handle the result based on its structure
      let imageUrl = '';
      if (result.url) {
        imageUrl = result.url;
      } else if (result.data) {
        // Get the public URL from data
        const { data: { publicUrl } } = supabase.storage
          .from('hero_slides')
          .getPublicUrl(result.data.path || result.path || '');
          
        imageUrl = publicUrl;
      }
      
      if (currentSlide) {
        setCurrentSlide({
          ...currentSlide,
          image_url: imageUrl
        });
      }
      
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle drag and drop reordering
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(slides);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update sort_order values
    const updatedItems = items.map((item, index) => ({
      ...item,
      sort_order: index + 1
    }));
    
    setSlides(updatedItems);
    updateOrderMutation.mutate(updatedItems);
  };

  // Move slide up or down
  const moveSlide = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === slides.length - 1)
    ) {
      return;
    }
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const items = Array.from(slides);
    const [movedItem] = items.splice(index, 1);
    items.splice(newIndex, 0, movedItem);
    
    // Update sort_order values
    const updatedItems = items.map((item, idx) => ({
      ...item,
      sort_order: idx + 1
    }));
    
    setSlides(updatedItems);
    updateOrderMutation.mutate(updatedItems);
  };

  // Toggle slide active status
  const toggleActive = (id: string, currentStatus: boolean) => {
    toggleActiveMutation.mutate({
      id,
      isActive: !currentStatus
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded-md">
        <h3 className="text-red-700 font-medium mb-2">Error loading slides</h3>
        <p className="text-sm text-red-600">Please try refreshing the page.</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Refresh Page
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hero Slider Management</CardTitle>
          <CardDescription>
            Manage the slides that appear in the hero section of the homepage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium">
              {slides.length} {slides.length === 1 ? 'Slide' : 'Slides'}
            </h3>
            <Button 
              onClick={addNewSlide}
              className="bg-[#ff2366] hover:bg-[#e01f59] text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Slide
            </Button>
          </div>
          
          {slides.length === 0 ? (
            <div className="text-center p-8 border border-dashed rounded-md">
              <p className="text-muted-foreground">No slides found. Add your first slide to get started.</p>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="slides">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-4"
                  >
                    {slides.map((slide, index) => (
                      <Draggable key={slide.id} draggableId={slide.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="flex items-center gap-4 p-4 border rounded-md bg-card"
                          >
                            <div 
                              {...provided.dragHandleProps}
                              className="cursor-move text-muted-foreground hover:text-foreground"
                            >
                              <Move className="h-5 w-5" />
                            </div>
                            
                            <div className="h-16 w-24 relative overflow-hidden rounded-md border">
                              {slide.image_url ? (
                                <img 
                                  src={slide.image_url} 
                                  alt={slide.title}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = '/placeholder.svg';
                                  }}
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center bg-muted">
                                  <Image className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">{slide.title}</h4>
                              <p className="text-sm text-muted-foreground truncate">
                                {slide.subtitle || 'No subtitle'}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
                                  Order: {slide.sort_order}
                                </span>
                                <span className={cn(
                                  "text-xs px-2 py-0.5 rounded-full",
                                  slide.is_active 
                                    ? "bg-green-100 text-green-800" 
                                    : "bg-amber-100 text-amber-800"
                                )}>
                                  {slide.is_active ? 'Active' : 'Hidden'}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => toggleActive(slide.id, slide.is_active)}
                                title={slide.is_active ? 'Hide slide' : 'Show slide'}
                              >
                                {slide.is_active ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => moveSlide(index, 'up')}
                                disabled={index === 0}
                                title="Move up"
                              >
                                <ArrowUp className="h-4 w-4" />
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => moveSlide(index, 'down')}
                                disabled={index === slides.length - 1}
                                title="Move down"
                              >
                                <ArrowDown className="h-4 w-4" />
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => editSlide(slide)}
                                title="Edit slide"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  if (window.confirm('Are you sure you want to delete this slide?')) {
                                    deleteSlideMutation.mutate(slide.id);
                                  }
                                }}
                                className="text-destructive hover:bg-destructive/10"
                                title="Delete slide"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </CardContent>
      </Card>
      
      {currentSlide && (
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? 'Edit Slide' : 'Add New Slide'}</CardTitle>
            <CardDescription>
              {isEditing 
                ? 'Update the details of this slide' 
                : 'Create a new slide for the hero section'}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={currentSlide.title}
                  onChange={(e) => setCurrentSlide({
                    ...currentSlide,
                    title: e.target.value
                  })}
                  placeholder="Enter slide title"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle (Optional)</Label>
                <Textarea
                  id="subtitle"
                  value={currentSlide.subtitle || ''}
                  onChange={(e) => setCurrentSlide({
                    ...currentSlide,
                    subtitle: e.target.value
                  })}
                  placeholder="Enter slide subtitle"
                  rows={2}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="link">Link URL</Label>
                <Input
                  id="link"
                  value={currentSlide.link}
                  onChange={(e) => setCurrentSlide({
                    ...currentSlide,
                    link: e.target.value
                  })}
                  placeholder="e.g., /events/123 or https://example.com"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Enter a relative path (e.g., /events/123) or full URL
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Image</Label>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('slide-image')?.click()}
                      disabled={isUploading}
                      className="w-full sm:w-auto"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Image className="h-4 w-4 mr-2" />
                          {currentSlide.image_url ? 'Change Image' : 'Upload Image'}
                        </>
                      )}
                    </Button>
                    <input
                      id="slide-image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                    
                    {currentSlide.image_url && (
                      <Input
                        value={currentSlide.image_url}
                        onChange={(e) => setCurrentSlide({
                          ...currentSlide,
                          image_url: e.target.value
                        })}
                        placeholder="Image URL"
                        className="flex-1"
                      />
                    )}
                  </div>
                  
                  {currentSlide.image_url && (
                    <div className="relative h-40 w-full sm:w-80 border rounded-md overflow-hidden">
                      <img
                        src={currentSlide.image_url}
                        alt="Slide preview"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                          e.currentTarget.alt = 'Failed to load image';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is-active"
                  checked={currentSlide.is_active}
                  onCheckedChange={(checked) => setCurrentSlide({
                    ...currentSlide,
                    is_active: checked
                  })}
                />
                <Label htmlFor="is-active">Active</Label>
                <p className="text-sm text-muted-foreground ml-2">
                  {currentSlide.is_active 
                    ? 'This slide will be visible on the homepage' 
                    : 'This slide will be hidden from the homepage'}
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-[#ff2366] hover:bg-[#e01f59] text-white"
                disabled={isUploading || createSlideMutation.isPending || updateSlideMutation.isPending}
              >
                {(createSlideMutation.isPending || updateSlideMutation.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {isEditing ? 'Update Slide' : 'Create Slide'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}
    </div>
  );
};

export default HeroSliderManager;
