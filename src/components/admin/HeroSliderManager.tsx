
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, Trash2, ArrowUp, ArrowDown, Upload, Image as ImageIcon } from 'lucide-react';
import { uploadFile, ensureBucketExists } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  link: string;
  sort_order: number;
  is_active: boolean;
}

const HeroSliderManager = () => {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [newSlide, setNewSlide] = useState({
    title: '',
    subtitle: '',
    image_url: '',
    link: '',
    is_active: true
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch hero slides
  const { data: slides, isLoading: slidesLoading, error } = useQuery({
    queryKey: ['heroSlides'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as HeroSlide[];
    }
  });

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    
    // Create preview URL
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  // Upload image
  const handleImageUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select an image first');
      return;
    }

    setIsUploading(true);

    try {
      // Ensure bucket exists
      await ensureBucketExists('hero_images', 'Hero Slider Images');
      
      // Upload the file
      const { url, error } = await uploadFile(
        selectedFile,
        'hero_images',
        'slides'
      );

      if (error) throw error;

      if (url) {
        toast.success('Image uploaded successfully');
        setNewSlide({...newSlide, image_url: url});
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Add new slide
  const addSlide = useMutation({
    mutationFn: async () => {
      if (!newSlide.title || !newSlide.image_url || !newSlide.link) {
        throw new Error('Title, image, and link are required');
      }

      // Get highest sort order
      let maxSort = 0;
      if (slides && slides.length > 0) {
        maxSort = Math.max(...slides.map(slide => slide.sort_order));
      }

      const { data, error } = await supabase
        .from('hero_slides')
        .insert({
          ...newSlide,
          sort_order: maxSort + 1
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Slide added successfully');
      setNewSlide({
        title: '',
        subtitle: '',
        image_url: '',
        link: '',
        is_active: true
      });
      setSelectedFile(null);
      setPreviewUrl(null);
      queryClient.invalidateQueries({ queryKey: ['heroSlides'] });
    },
    onError: (error: any) => {
      toast.error(`Failed to add slide: ${error.message}`);
    }
  });

  // Delete slide
  const deleteSlide = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('hero_slides')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      toast.success('Slide deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['heroSlides'] });
    },
    onError: (error: any) => {
      toast.error(`Failed to delete slide: ${error.message}`);
    }
  });

  // Move slide up or down
  const moveSlide = useMutation({
    mutationFn: async ({ id, direction }: { id: string; direction: 'up' | 'down' }) => {
      if (!slides) return;
      
      const currentIndex = slides.findIndex(slide => slide.id === id);
      if (currentIndex === -1) return;
      
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= slides.length) return;
      
      const targetSlide = slides[newIndex];
      const currentSlide = slides[currentIndex];
      
      // Swap sort orders
      const { error: error1 } = await supabase
        .from('hero_slides')
        .update({ sort_order: targetSlide.sort_order })
        .eq('id', currentSlide.id);
      
      const { error: error2 } = await supabase
        .from('hero_slides')
        .update({ sort_order: currentSlide.sort_order })
        .eq('id', targetSlide.id);
      
      if (error1 || error2) throw error1 || error2;
      return { id, direction };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heroSlides'] });
    },
    onError: (error: any) => {
      toast.error(`Failed to reorder slides: ${error.message}`);
    }
  });

  // Toggle slide active status
  const toggleSlideActive = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('hero_slides')
        .update({ is_active: isActive })
        .eq('id', id);
      
      if (error) throw error;
      return { id, isActive };
    },
    onSuccess: ({ id, isActive }) => {
      toast.success(`Slide ${isActive ? 'activated' : 'deactivated'} successfully`);
      queryClient.invalidateQueries({ queryKey: ['heroSlides'] });
    },
    onError: (error: any) => {
      toast.error(`Failed to update slide: ${error.message}`);
    }
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hero Section Slides</CardTitle>
          <CardDescription>
            Manage the slides that appear in the homepage hero section
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Subtitle</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slidesLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : slides && slides.length > 0 ? (
                  slides.map((slide, index) => (
                    <TableRow key={slide.id}>
                      <TableCell>
                        <div className="h-16 w-16 rounded overflow-hidden">
                          <img 
                            src={slide.image_url} 
                            alt={slide.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{slide.title}</TableCell>
                      <TableCell>{slide.subtitle}</TableCell>
                      <TableCell>{slide.link}</TableCell>
                      <TableCell>
                        <Button
                          variant={slide.is_active ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleSlideActive.mutate({ 
                            id: slide.id, 
                            isActive: !slide.is_active 
                          })}
                        >
                          {slide.is_active ? "Active" : "Inactive"}
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            disabled={index === 0}
                            onClick={() => moveSlide.mutate({ id: slide.id, direction: 'up' })}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            disabled={index === slides.length - 1}
                            onClick={() => moveSlide.mutate({ id: slide.id, direction: 'down' })}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this slide?')) {
                                deleteSlide.mutate(slide.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      No slides found. Add your first hero slide below.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add New Slide</CardTitle>
          <CardDescription>
            Create a new slide for the homepage hero section
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newSlide.title}
                    onChange={(e) => setNewSlide({...newSlide, title: e.target.value})}
                    placeholder="Enter slide title"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Textarea
                    id="subtitle"
                    value={newSlide.subtitle}
                    onChange={(e) => setNewSlide({...newSlide, subtitle: e.target.value})}
                    placeholder="Enter slide subtitle"
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="link">Link</Label>
                  <Input
                    id="link"
                    value={newSlide.link}
                    onChange={(e) => setNewSlide({...newSlide, link: e.target.value})}
                    placeholder="Enter slide link (e.g., /events/concert)"
                  />
                  <p className="text-sm text-muted-foreground">
                    The URL where users will be directed when clicking the slide
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Slide Image</Label>
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-2">
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="cursor-pointer"
                      />
                      <Button
                        type="button"
                        onClick={handleImageUpload}
                        disabled={!selectedFile || isUploading}
                        className="flex items-center gap-2"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4" />
                            Upload Image
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {newSlide.image_url && (
                      <Input
                        value={newSlide.image_url}
                        onChange={(e) => setNewSlide({...newSlide, image_url: e.target.value})}
                        placeholder="Image URL"
                      />
                    )}

                    {(previewUrl || newSlide.image_url) && (
                      <div className="border rounded-md overflow-hidden aspect-video">
                        <img 
                          src={previewUrl || newSlide.image_url} 
                          alt="Slide Preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {!previewUrl && !newSlide.image_url && (
                      <div className="border border-dashed rounded-md p-6 flex flex-col items-center justify-center bg-gray-50">
                        <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500 text-center">
                          Upload or enter a URL for the slide image
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <Button
              onClick={() => addSlide.mutate()}
              disabled={!newSlide.title || !newSlide.image_url || !newSlide.link || addSlide.isPending}
              className="w-full sm:w-auto"
            >
              {addSlide.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Slide...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Slide
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HeroSliderManager;
