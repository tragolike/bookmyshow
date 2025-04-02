
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { db } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SeatLayoutEditor from './SeatLayoutEditor';

interface EventEditorProps {
  eventId?: string;
}

const EventEditor = ({ eventId }: EventEditorProps) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [event, setEvent] = useState({
    title: '',
    category: 'concert',
    date: '',
    time: '',
    venue: '',
    city: 'Mumbai',
    price: 0,
    image: '',
    status: 'available'
  });
  
  // Fetch cities for dropdown
  const [cities, setCities] = useState<{id: number, name: string}[]>([]);
  
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const { data, error } = await db.cities().select('*');
        if (error) throw error;
        setCities(data);
      } catch (error) {
        console.error('Error fetching cities:', error);
        toast.error('Failed to load cities');
      }
    };
    
    fetchCities();
  }, []);
  
  // If eventId is provided, fetch event details
  useEffect(() => {
    if (!eventId) return;
    
    const fetchEvent = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await db.events()
          .select('*')
          .eq('id', eventId)
          .single();
          
        if (error) throw error;
        
        setEvent(data);
      } catch (error) {
        console.error('Error fetching event:', error);
        toast.error('Failed to load event details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEvent();
  }, [eventId]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setEvent(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) : value
    }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setEvent(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSaving(true);
    try {
      if (eventId) {
        // Update existing event
        const { error } = await db.events()
          .update(event)
          .eq('id', eventId);
          
        if (error) throw error;
        
        toast.success('Event updated successfully');
      } else {
        // Create new event
        const { data, error } = await db.events()
          .insert(event)
          .select()
          .single();
          
        if (error) throw error;
        
        toast.success('Event created successfully');
        navigate(`/admin/events?edit=${data.id}`);
      }
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Failed to save event');
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-book-primary" />
      </div>
    );
  }
  
  return (
    <Card className="p-6">
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="details">Event Details</TabsTrigger>
          {eventId && <TabsTrigger value="seating">Seating Layout</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="details">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={event.title}
                  onChange={handleChange}
                  placeholder="Enter event title"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={event.category}
                  onValueChange={(value) => handleSelectChange('category', value)}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="concert">Concert</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="theater">Theater</SelectItem>
                    <SelectItem value="comedy">Comedy</SelectItem>
                    <SelectItem value="festival">Festival</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  name="date"
                  type="text"
                  value={event.date}
                  onChange={handleChange}
                  placeholder="e.g. Oct 15, 2023"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  name="time"
                  type="text"
                  value={event.time}
                  onChange={handleChange}
                  placeholder="e.g. 7:30 PM"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="venue">Venue</Label>
                <Input
                  id="venue"
                  name="venue"
                  value={event.venue}
                  onChange={handleChange}
                  placeholder="Enter venue name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Select
                  value={event.city}
                  onValueChange={(value) => handleSelectChange('city', value)}
                >
                  <SelectTrigger id="city">
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map(city => (
                      <SelectItem key={city.id} value={city.name}>{city.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={event.price}
                  onChange={handleChange}
                  placeholder="Enter base ticket price"
                  required
                  min="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={event.status}
                  onValueChange={(value) => handleSelectChange('status', value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="fast-filling">Fast Filling</SelectItem>
                    <SelectItem value="sold-out">Sold Out</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  name="image"
                  value={event.image}
                  onChange={handleChange}
                  placeholder="Enter image URL"
                  required
                />
                
                {event.image && (
                  <div className="mt-2 border rounded-md p-2 max-w-xs">
                    <img 
                      src={event.image} 
                      alt={event.title}
                      className="w-full h-auto rounded"
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/events')}
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {eventId ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  eventId ? 'Update Event' : 'Create Event'
                )}
              </Button>
            </div>
          </form>
        </TabsContent>
        
        {eventId && (
          <TabsContent value="seating">
            <SeatLayoutEditor eventId={eventId} />
          </TabsContent>
        )}
      </Tabs>
    </Card>
  );
};

export default EventEditor;
