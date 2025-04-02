
import { useState, useEffect, useRef } from 'react';
import { getSeatLayoutByEventId, upsertSeatLayout, uploadFile } from '@/integrations/supabase/client';
import { Loader2, Save, Plus, Minus, AlertCircle, Check, Upload, Image, FileImage } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SeatLayoutEditorProps {
  eventId: string;
}

interface Seat {
  id: string;
  row: string;
  number: number;
  status: 'available' | 'unavailable' | 'booked';
  price: number;
  category: string;
}

const SeatLayoutEditor = ({ eventId }: SeatLayoutEditorProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seatLayout, setSeatLayout] = useState<any>(null);
  const [editMode, setEditMode] = useState<'seat' | 'row' | 'section'>('seat');
  const [selectedCategory, setSelectedCategory] = useState('premium');
  const [activeTab, setActiveTab] = useState('editor');
  const [layoutImage, setLayoutImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const categories = [
    { id: 'premium', name: 'Premium', color: 'bg-blue-500' },
    { id: 'platinum', name: 'Platinum', color: 'bg-cyan-500' },
    { id: 'gold', name: 'Gold', color: 'bg-green-500' },
    { id: 'silver', name: 'Silver', color: 'bg-purple-500' },
  ];
  
  useEffect(() => {
    const fetchSeatLayout = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error } = await getSeatLayoutByEventId(eventId);
        if (error) throw error;
        
        if (!data) {
          // If no seat layout exists, create a default one
          const defaultLayout = generateDefaultSeatLayout();
          setSeatLayout(defaultLayout);
        } else {
          setSeatLayout(data.layout_data);
          if (data.layout_data.image_url) {
            setLayoutImage(data.layout_data.image_url);
          }
        }
      } catch (err) {
        console.error('Error fetching seat layout:', err);
        setError('Failed to load seating layout.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSeatLayout();
  }, [eventId]);
  
  const generateDefaultSeatLayout = () => {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const seatsPerRow = 20;
    
    const categories = {
      premium: { rows: ['A', 'B', 'C'], price: 10000 },
      platinum: { rows: ['D', 'E', 'F'], price: 5000 },
      gold: { rows: ['G', 'H'], price: 2000 },
      silver: { rows: ['I', 'J'], price: 900 }
    };
    
    const seats: Seat[] = [];
    
    rows.forEach((row) => {
      let seatCategory = 'silver';
      let price = 900;
      
      // Determine category and price based on row
      Object.entries(categories).forEach(([cat, conf]) => {
        if (conf.rows.includes(row)) {
          seatCategory = cat;
          price = conf.price;
        }
      });
      
      for (let i = 1; i <= seatsPerRow; i++) {
        // Add some random unavailable seats
        const isUnavailable = Math.random() < 0.1; // 10% chance of being unavailable
        
        seats.push({
          id: `${row}${i}`,
          row,
          number: i,
          status: isUnavailable ? 'unavailable' : 'available',
          price,
          category: seatCategory
        });
      }
    });
    
    return {
      venue: 'Default Venue',
      seats
    };
  };
  
  const handleSeatClick = (seatId: string) => {
    if (!seatLayout) return;
    
    setSeatLayout((prev: any) => {
      const updatedSeats = prev.seats.map((seat: Seat) => {
        if (seat.id === seatId) {
          if (editMode === 'seat') {
            // Toggle seat status
            const newStatus = seat.status === 'available' ? 'unavailable' : 'available';
            return { ...seat, status: newStatus };
          } else if (editMode === 'row') {
            // Mark all seats in the row with new category
            return { ...seat, category: selectedCategory };
          } else {
            // Category change for individual seat
            return { ...seat, category: selectedCategory };
          }
        }
        
        // If in row mode, update all seats in the same row
        if (editMode === 'row') {
          const clickedSeat = prev.seats.find((s: Seat) => s.id === seatId);
          if (clickedSeat && seat.row === clickedSeat.row) {
            return { ...seat, category: selectedCategory };
          }
        }
        
        return seat;
      });
      
      return { ...prev, seats: updatedSeats };
    });
  };
  
  const handleUploadImage = async (file: File) => {
    if (!file) return;
    
    setIsUploading(true);
    try {
      // Upload the file to Supabase storage
      const { url, error } = await uploadFile(file, 'venue-layouts', eventId);
      
      if (error) throw error;
      
      if (url) {
        // Update the seat layout with the image URL
        setLayoutImage(url);
        setSeatLayout((prev: any) => ({
          ...prev,
          image_url: url
        }));
        toast.success('Layout image uploaded successfully');
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };
  
  const saveLayout = async () => {
    if (!seatLayout) return;
    
    setIsSaving(true);
    try {
      // Include the layout image in the data if available
      const layoutData = {
        ...seatLayout,
        image_url: layoutImage
      };
      
      const { error, isNew } = await upsertSeatLayout(eventId, layoutData);
      if (error) throw error;
      
      toast.success(isNew ? 'Seat layout created successfully!' : 'Seat layout updated successfully!');
    } catch (err) {
      console.error('Error saving seat layout:', err);
      toast.error('Failed to save seat layout.');
    } finally {
      setIsSaving(false);
    }
  };
  
  const addRow = () => {
    if (!seatLayout) return;
    
    setSeatLayout((prev: any) => {
      // Find the last row
      const rows = [...new Set(prev.seats.map((seat: Seat) => seat.row))].sort();
      const lastRow = rows[rows.length - 1];
      
      // Get the new row letter (next in alphabet)
      // Fix: Add type assertion to ensure lastRow is treated as a string
      const nextRow = String.fromCharCode((lastRow as string).charCodeAt(0) + 1);
      
      // Get number of seats in the last row
      const seatsInLastRow = prev.seats.filter((seat: Seat) => seat.row === lastRow).length;
      
      // Create new seats for the new row
      const newSeats = Array.from({ length: seatsInLastRow }).map((_, i) => ({
        id: `${nextRow}${i + 1}`,
        row: nextRow,
        number: i + 1,
        status: 'available',
        price: 900, // Default price
        category: 'silver' // Default category
      }));
      
      return {
        ...prev,
        seats: [...prev.seats, ...newSeats]
      };
    });
    
    toast.success('Row added successfully!');
  };
  
  const removeRow = () => {
    if (!seatLayout) return;
    
    setSeatLayout((prev: any) => {
      // Find all rows
      const rows = [...new Set(prev.seats.map((seat: Seat) => seat.row))].sort();
      
      if (rows.length <= 1) {
        toast.error("Can't remove the last row!");
        return prev;
      }
      
      // Get the last row
      const lastRow = rows[rows.length - 1];
      
      // Filter out seats from the last row
      const updatedSeats = prev.seats.filter((seat: Seat) => seat.row !== lastRow);
      
      return {
        ...prev,
        seats: updatedSeats
      };
    });
    
    toast.success('Row removed successfully!');
  };
  
  const getSeatsByRow = () => {
    if (!seatLayout) return {};
    
    return seatLayout.seats.reduce((acc: {[key: string]: Seat[]}, seat: Seat) => {
      if (!acc[seat.row]) acc[seat.row] = [];
      acc[seat.row].push(seat);
      return acc;
    }, {});
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleUploadImage(files[0]);
    }
  };
  
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-book-primary" />
      </div>
    );
  }
  
  if (error || !seatLayout) {
    return (
      <div className="flex items-center justify-center p-10 text-center">
        <div>
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to load seat layout</h3>
          <p className="text-gray-600">{error || 'Seat layout not available.'}</p>
        </div>
      </div>
    );
  }
  
  const seatsByRow = getSeatsByRow();
  const sortedRows = Object.keys(seatsByRow).sort();
  
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Seat Layout Editor</h2>
          <p className="text-sm text-gray-500">Design your venue's seating arrangement</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={addRow}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Row
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={removeRow}
          >
            <Minus className="h-4 w-4 mr-1" /> Remove Row
          </Button>
          <Button 
            onClick={saveLayout}
            disabled={isSaving}
          >
            {isSaving ? (
              <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Saving</>
            ) : (
              <><Save className="h-4 w-4 mr-1" /> Save Layout</>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="editor">Seat Editor</TabsTrigger>
          <TabsTrigger value="image">Layout Image</TabsTrigger>
        </TabsList>
        
        <TabsContent value="editor" className="space-y-6">
          <div className="flex flex-wrap gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Edit Mode</label>
              <div className="flex border rounded-md overflow-hidden">
                <button 
                  onClick={() => setEditMode('seat')}
                  className={`px-3 py-1 text-sm ${
                    editMode === 'seat' ? 'bg-book-primary text-white' : 'bg-white text-gray-700'
                  }`}
                >
                  Single Seat
                </button>
                <button 
                  onClick={() => setEditMode('row')}
                  className={`px-3 py-1 text-sm ${
                    editMode === 'row' ? 'bg-book-primary text-white' : 'bg-white text-gray-700'
                  }`}
                >
                  Entire Row
                </button>
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium">Category</label>
              <Select 
                value={selectedCategory} 
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="w-full overflow-x-auto">
            <div className="min-w-[600px]">
              <div className="relative mb-10">
                <div className="w-3/4 h-8 bg-gray-300 mx-auto rounded-t-full transform perspective-[500px] rotate-x-12"></div>
                <p className="text-center text-sm text-gray-500 mt-2">SCREEN</p>
              </div>
              
              <div className="space-y-2">
                {sortedRows.map((row) => (
                  <div key={row} className="flex items-center justify-center gap-1">
                    <div className="w-6 text-center font-medium text-gray-700">{row}</div>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {seatsByRow[row]
                        .sort((a: Seat, b: Seat) => a.number - b.number)
                        .map((seat: Seat) => {
                          const categoryObj = categories.find(c => c.id === seat.category);
                          const categoryColor = categoryObj ? categoryObj.color : 'bg-gray-300';
                          
                          return (
                            <button
                              key={seat.id}
                              className={`w-7 h-7 text-xs flex items-center justify-center rounded-t-md transition-colors ${
                                seat.status === 'available' 
                                  ? `${categoryColor} hover:opacity-80 text-white cursor-pointer`
                                  : 'bg-gray-200 text-gray-400 cursor-pointer'
                              }`}
                              onClick={() => handleSeatClick(seat.id)}
                              aria-label={`Seat ${seat.row}${seat.number}`}
                            >
                              {seat.number}
                            </button>
                          );
                        })}
                    </div>
                    <div className="w-6 text-center font-medium text-gray-700">{row}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 mt-10">
            {categories.map(category => (
              <div key={category.id} className="flex items-center gap-2">
                <div className={`w-5 h-5 ${category.color} rounded-t-md`}></div>
                <span className="text-sm">{category.name}</span>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gray-200 rounded-t-md"></div>
              <span className="text-sm">Unavailable</span>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="image" className="space-y-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <div className="flex flex-col items-center gap-4">
              <h3 className="text-lg font-medium">Venue Layout Image</h3>
              <p className="text-sm text-gray-500 text-center max-w-md">
                Upload an image of your venue layout to help attendees visualize the seating arrangement. This image will be displayed to customers during the booking process.
              </p>
              
              {layoutImage ? (
                <div className="relative group">
                  <img 
                    src={layoutImage} 
                    alt="Venue Layout" 
                    className="max-w-full max-h-[400px] rounded-lg border border-gray-200 object-contain"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                    <Button 
                      variant="secondary"
                      onClick={triggerFileInput}
                    >
                      <FileImage className="w-4 h-4 mr-2" />
                      Change Image
                    </Button>
                  </div>
                </div>
              ) : (
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 w-full max-w-md flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={triggerFileInput}
                >
                  <Image className="h-12 w-12 text-gray-400 mb-2" />
                  <p className="font-medium text-gray-700">Click to upload layout image</p>
                  <p className="text-sm text-gray-500 mt-1">or drag and drop</p>
                  <p className="text-xs text-gray-400 mt-2">PNG, JPG, GIF up to 5MB</p>
                </div>
              )}
              
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              
              {!layoutImage && (
                <Button 
                  variant="outline"
                  onClick={triggerFileInput}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading...</>
                  ) : (
                    <><Upload className="h-4 w-4 mr-2" /> Upload Image</>
                  )}
                </Button>
              )}
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <Check className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h3 className="font-medium text-blue-800">Tips for venue layout images</h3>
                <ul className="text-sm text-blue-700 space-y-1 list-disc pl-4 mt-2">
                  <li>Use high-resolution, clear images of your venue</li>
                  <li>Make sure seat numbers and sections are clearly visible</li>
                  <li>Include important landmarks (stage, entrances, etc.)</li>
                  <li>After uploading, save the layout to apply changes</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={saveLayout}
              disabled={isSaving}
            >
              {isSaving ? (
                <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Saving</>
              ) : (
                <><Save className="h-4 w-4 mr-1" /> Save Layout</>
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="mt-1">
            <Check className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h3 className="font-medium text-blue-800">How to use the editor</h3>
            <ul className="text-sm text-blue-700 space-y-1 list-disc pl-4 mt-2">
              <li>Click on any seat to toggle between available and unavailable</li>
              <li>Use "Entire Row" mode to change the category of all seats in a row at once</li>
              <li>Add or remove rows as needed for your venue</li>
              <li>Upload a venue layout image to help attendees visualize the seating</li>
              <li>Don't forget to save your changes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatLayoutEditor;
