
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase, upsertSeatLayout } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Plus, Minus, Info, Upload, Image, Loader2 } from 'lucide-react';
import SeatMap from '@/components/SeatMap';

interface SeatLayoutEditorProps {
  eventId: string;
}

interface SeatCategory {
  id: string;
  name: string;
  price: number;
  color: string;
}

const SeatLayoutEditor = ({ eventId }: SeatLayoutEditorProps) => {
  const [editMode, setEditMode] = useState<'single' | 'row'>('single');
  const [selectedCategory, setSelectedCategory] = useState<string>('premium');
  const [categories, setCategories] = useState<SeatCategory[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [seatLayout, setSeatLayout] = useState<any>(null);
  const [layoutImageUrl, setLayoutImageUrl] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Fetch seat categories and layout on component mount
  useEffect(() => {
    fetchCategories();
    fetchLayout();
  }, [eventId]);

  const fetchCategories = async () => {
    try {
      console.log('Fetching seat categories...');
      const { data, error } = await supabase
        .from('seat_categories')
        .select('*')
        .order('price', { ascending: false });

      if (error) throw error;

      console.log('Categories fetched:', data);
      
      if (data && data.length > 0) {
        setCategories(data);
        setSelectedCategory(data[0].name.toLowerCase());
      } else {
        // Default categories if none exist
        setCategories([
          { id: '1', name: 'Premium', price: 5000, color: '#FF2366' },
          { id: '2', name: 'Gold', price: 3000, color: '#FFD700' },
          { id: '3', name: 'Silver', price: 1500, color: '#C0C0C0' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load seat categories');
    }
  };

  const fetchLayout = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching seat layout for event:', eventId);
      const { data, error } = await supabase
        .from('seat_layouts')
        .select('*')
        .eq('event_id', eventId)
        .maybeSingle();

      if (error) throw error;

      console.log('Layout data:', data);

      if (data) {
        setSeatLayout(data.layout_data);
        setLayoutImageUrl(data.layout_data.image_url || '');
      } else {
        // Initialize default layout
        setSeatLayout({
          venue: 'Default Venue',
          seats: [],
          image_url: ''
        });
      }
    } catch (error) {
      console.error('Error fetching layout:', error);
      toast.error('Failed to load seating layout');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeatSelection = (seatIds: string[]) => {
    setSelectedSeats(seatIds);
  };

  const updateSeatsCategory = () => {
    if (!seatLayout || selectedSeats.length === 0) return;

    const categoryToApply = selectedCategory.toLowerCase();
    const categoryPrice = categories.find(
      cat => cat.name.toLowerCase() === categoryToApply
    )?.price || 0;

    const updatedSeats = seatLayout.seats.map((seat: any) => {
      if (selectedSeats.includes(seat.id)) {
        return {
          ...seat,
          category: categoryToApply,
          price: categoryPrice
        };
      }
      return seat;
    });

    setSeatLayout({
      ...seatLayout,
      seats: updatedSeats
    });

    toast.success(`Updated ${selectedSeats.length} seats to ${categoryToApply}`);
    setSelectedSeats([]);
  };

  const addRow = () => {
    if (!seatLayout) return;

    // Find the next row letter
    const existingRows = seatLayout.seats
      .map((seat: any) => seat.row)
      .filter((value: any, index: number, self: any) => self.indexOf(value) === index)
      .sort();

    const lastRow = existingRows.length > 0 ? existingRows[existingRows.length - 1] : '@';
    const nextRow = String.fromCharCode(lastRow.charCodeAt(0) + 1);

    // Find the number of seats in previous rows
    const seatsInPreviousRow = seatLayout.seats.filter((seat: any) => seat.row === lastRow).length;
    const seatsToAdd = seatsInPreviousRow > 0 ? seatsInPreviousRow : 20;

    // Add the new row of seats
    const newSeats = Array.from({ length: seatsToAdd }, (_, i) => ({
      id: `${nextRow}${i + 1}`,
      row: nextRow,
      number: i + 1,
      status: 'available',
      price: 0,
      category: selectedCategory.toLowerCase()
    }));

    setSeatLayout({
      ...seatLayout,
      seats: [...seatLayout.seats, ...newSeats]
    });

    toast.success(`Added row ${nextRow} with ${seatsToAdd} seats`);
  };

  const removeRow = () => {
    if (!seatLayout) return;

    // Find the last row
    const existingRows = seatLayout.seats
      .map((seat: any) => seat.row)
      .filter((value: any, index: number, self: any) => self.indexOf(value) === index)
      .sort();

    if (existingRows.length === 0) {
      toast.error('No rows to remove');
      return;
    }

    const lastRow = existingRows[existingRows.length - 1];
    
    // Remove the last row
    const filteredSeats = seatLayout.seats.filter((seat: any) => seat.row !== lastRow);
    
    setSeatLayout({
      ...seatLayout,
      seats: filteredSeats
    });

    toast.success(`Removed row ${lastRow}`);
  };

  const saveLayout = async () => {
    if (!seatLayout) return;

    setIsSaving(true);
    try {
      console.log('Saving layout:', seatLayout);
      const { data, error, isNew } = await upsertSeatLayout(eventId, {
        ...seatLayout,
        image_url: layoutImageUrl // Ensure the image URL is included
      });

      if (error) throw error;

      console.log('Layout saved:', data);
      toast.success(isNew ? 'Seating layout created' : 'Seating layout updated');
      
      // Refresh the layout data
      fetchLayout();
    } catch (error: any) {
      console.error('Error saving layout:', error);
      toast.error(`Failed to save layout: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      // Upload to venue_layouts bucket
      const timestamp = new Date().getTime();
      const filePath = `venue_layouts/${eventId}-${timestamp}.${file.name.split('.').pop()}`;

      // Ensure bucket exists
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.id === 'venue_layouts');
      
      if (!bucketExists) {
        await supabase.storage.createBucket('venue_layouts', {
          public: true
        });
      }

      const { data, error } = await supabase.storage
        .from('venue_layouts')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('venue_layouts')
        .getPublicUrl(data.path);

      console.log('Image uploaded:', urlData.publicUrl);
      setLayoutImageUrl(urlData.publicUrl);
      
      // Update layout with image URL
      setSeatLayout(prev => ({
        ...prev,
        image_url: urlData.publicUrl
      }));

      toast.success('Venue layout image uploaded');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(`Failed to upload image: ${error.message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="h-10 w-10 animate-spin text-book-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4" />
        <AlertTitle>Seating Layout Editor</AlertTitle>
        <AlertDescription>
          Design your venue's seating arrangement by setting categories for each seat or row. 
          You can also upload a venue layout image for visual reference.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Seat Layout Editor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Edit Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Edit Mode</Label>
              <ToggleGroup type="single" value={editMode} onValueChange={(value) => value && setEditMode(value as 'single' | 'row')}>
                <ToggleGroupItem value="single" className="flex-1">Single Seat</ToggleGroupItem>
                <ToggleGroupItem value="row" className="flex-1">Entire Row</ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.name.toLowerCase()}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        ></div>
                        {category.name} (₹{category.price})
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col">
              <Label className="mb-2">Actions</Label>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={updateSeatsCategory}
                  disabled={selectedSeats.length === 0}
                >
                  Apply Category
                </Button>
                <Button variant="outline" className="flex-grow-0" onClick={addRow}>
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">Add Row</span>
                </Button>
                <Button variant="outline" className="flex-grow-0" onClick={removeRow}>
                  <Minus className="h-4 w-4" />
                  <span className="sr-only">Remove Row</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Venue Image Upload */}
          <Card className="bg-slate-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Venue Layout Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      id="layout-image"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                    />
                    {uploadingImage && <Loader2 className="h-4 w-4 animate-spin" />}
                  </div>
                  <p className="text-sm text-gray-500">
                    Upload an image of your venue's seating layout to help customers visualize the seating arrangement.
                  </p>
                </div>
                <div className="flex justify-center">
                  {layoutImageUrl ? (
                    <div className="border rounded-md p-2 max-w-full max-h-[200px] overflow-hidden">
                      <img 
                        src={layoutImageUrl} 
                        alt="Venue Layout" 
                        className="max-w-full max-h-[180px] object-contain"
                      />
                    </div>
                  ) : (
                    <div className="border border-dashed border-gray-200 rounded-md flex items-center justify-center p-6 h-[150px] w-full">
                      <div className="text-center text-gray-500">
                        <Image className="h-8 w-8 mx-auto text-gray-400" />
                        <p className="mt-2 text-sm">No layout image</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seat Map Preview */}
          <div className="mt-6 bg-slate-50 p-4 rounded-md">
            <div className="text-center mb-4">
              <div className="w-3/4 h-8 bg-gray-300 mx-auto rounded-t-full"></div>
              <p className="text-sm text-gray-500 mt-1">SCREEN</p>
            </div>
            <SeatMap 
              eventId={eventId}
              selectedCategory={selectedCategory}
              onSeatSelect={handleSeatSelection}
              maxSeats={100}
              isAdmin={true}
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button 
              onClick={saveLayout} 
              disabled={isSaving}
              className="bg-[#ff2366] hover:bg-[#e01f59] text-white"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Layout'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SeatLayoutEditor;
