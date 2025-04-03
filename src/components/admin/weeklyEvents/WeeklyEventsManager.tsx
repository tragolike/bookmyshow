
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Star, Trash2, ExternalLink, RefreshCw } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Event } from '@/types/events';

interface WeeklyEvent {
  id?: string;
  event_id: string;
  is_featured: boolean;
  event_name?: string;
  event_date?: string;
  event_venue?: string;
  event_city?: string;
  event_image?: string;
  event_price?: number;
}

// Define the type for the raw response data from Supabase
interface RawWeeklyEventResponse {
  id: string;
  event_id: string;
  is_featured: boolean;
  events: {
    id: string;
    title: string;
    date: string;
    venue: string;
    city: string;
    image: string;
    price: number;
  } | null;
}

const fetchWeeklyEvents = async () => {
  try {
    console.log('Fetching weekly events...');
    
    const { data: tableExists, error: tableCheckError } = await supabase.from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'weekly_events')
      .eq('table_schema', 'public')
      .single();
      
    if (tableCheckError) {
      console.error('Error checking if weekly_events table exists:', tableCheckError);
      return [];
    }
    
    if (!tableExists) {
      console.warn('weekly_events table does not exist');
      return [];
    }
    
    const { data, error } = await supabase
      .from('weekly_events')
      .select(`
        id, 
        event_id,
        is_featured,
        events:event_id (
          id, 
          title,
          date,
          venue,
          city,
          image,
          price
        )
      `)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching weekly events:', error);
      return [];
    }
    
    console.log('Successfully fetched weekly events:', data);
    
    // Map the raw response to the WeeklyEvent format
    return (data as unknown as RawWeeklyEventResponse[] || []).map(item => ({
      id: item.id,
      event_id: item.event_id,
      is_featured: item.is_featured,
      event_name: item.events?.title,
      event_date: item.events?.date,
      event_venue: item.events?.venue,
      event_city: item.events?.city,
      event_image: item.events?.image,
      event_price: item.events?.price
    }));
  } catch (error) {
    console.error('Error in fetchWeeklyEvents:', error);
    return [];
  }
};

const fetchAllEvents = async (): Promise<Event[]> => {
  try {
    console.log('Fetching all events for dropdown...');
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });
      
    if (error) {
      console.error('Error fetching all events:', error);
      return [];
    }
    
    console.log('Successfully fetched all events:', data);
    return data || [];
  } catch (error) {
    console.error('Error in fetchAllEvents:', error);
    return [];
  }
};

const WeeklyEventsManager = () => {
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const { data: weeklyEvents, isLoading, error } = useQuery({
    queryKey: ['weeklyEvents', retryCount],
    queryFn: fetchWeeklyEvents,
    retry: 3,
    retryDelay: 1000
  });
  
  const { data: allEvents, isLoading: isLoadingEvents } = useQuery({
    queryKey: ['allEvents'],
    queryFn: fetchAllEvents,
    retry: 3
  });
  
  const addEventMutation = useMutation({
    mutationFn: async (weeklyEvent: WeeklyEvent) => {
      console.log('Adding event to weekly events:', weeklyEvent);
      const { data, error } = await supabase
        .from('weekly_events')
        .insert(weeklyEvent)
        .select();
        
      if (error) {
        console.error('Error adding weekly event:', error);
        throw error;
      }
      
      console.log('Successfully added weekly event:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weeklyEvents'] });
      toast.success('Event added to weekly events successfully');
      setSelectedEventId('');
      setIsFeatured(false);
    },
    onError: (error: any) => {
      console.error('Error adding event to weekly events:', error);
      toast.error(`Failed to add event to weekly events: ${error.message || 'Unknown error'}`);
    }
  });
  
  const updateEventMutation = useMutation({
    mutationFn: async ({ id, is_featured }: { id: string, is_featured: boolean }) => {
      console.log('Updating weekly event:', { id, is_featured });
      const { data, error } = await supabase
        .from('weekly_events')
        .update({ is_featured })
        .eq('id', id)
        .select();
        
      if (error) {
        console.error('Error updating weekly event:', error);
        throw error;
      }
      
      console.log('Successfully updated weekly event:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weeklyEvents'] });
      toast.success('Weekly event updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating weekly event:', error);
      toast.error(`Failed to update weekly event: ${error.message || 'Unknown error'}`);
    }
  });
  
  const removeEventMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Removing event from weekly events:', id);
      const { error } = await supabase
        .from('weekly_events')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error('Error removing weekly event:', error);
        throw error;
      }
      
      console.log('Successfully removed weekly event');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weeklyEvents'] });
      toast.success('Event removed from weekly events');
    },
    onError: (error: any) => {
      console.error('Error removing event from weekly events:', error);
      toast.error(`Failed to remove event from weekly events: ${error.message || 'Unknown error'}`);
    }
  });
  
  const handleAddEvent = () => {
    if (!selectedEventId) {
      toast.error('Please select an event');
      return;
    }
    
    addEventMutation.mutate({
      event_id: selectedEventId,
      is_featured: isFeatured
    });
  };
  
  const handleToggleFeatured = (id: string, currentValue: boolean) => {
    updateEventMutation.mutate({
      id,
      is_featured: !currentValue
    });
  };
  
  const handleRemoveEvent = (id: string) => {
    if (window.confirm('Are you sure you want to remove this event from the weekly events list?')) {
      removeEventMutation.mutate(id);
    }
  };
  
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    queryClient.invalidateQueries({ queryKey: ['weeklyEvents'] });
    toast.info('Retrying to load weekly events');
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Best Events This Week</CardTitle>
        <CardDescription>
          Manage events that are featured on the homepage in the "Best Events This Week" section
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-4">
            <div className="flex items-center">
              <RefreshCw className="h-5 w-5 mr-2" />
              <p className="flex-1">Error loading weekly events. Try again or check database configuration.</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRetry}
                className="ml-4"
              >
                Retry Loading Weekly Events
              </Button>
            </div>
          </div>
        )}
        
        <div className="p-4 bg-slate-50 rounded-md">
          <h3 className="font-medium mb-3">Add Event to Weekly Section</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="event">Select Event</Label>
              <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                <SelectTrigger id="event">
                  <SelectValue placeholder="Select an event" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingEvents ? (
                    <SelectItem value="loading" disabled>Loading events...</SelectItem>
                  ) : allEvents && allEvents.length > 0 ? (
                    allEvents.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.title} - {event.date}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>No events available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="featured-switch"
                  checked={isFeatured}
                  onCheckedChange={setIsFeatured}
                />
                <Label htmlFor="featured-switch">Featured Event</Label>
              </div>
              
              <Button 
                onClick={handleAddEvent} 
                disabled={!selectedEventId || addEventMutation.isPending}
              >
                {addEventMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add to Weekly Events
              </Button>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-3">Current Weekly Events</h3>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </div>
          ) : weeklyEvents && weeklyEvents.length > 0 ? (
            <div className="overflow-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="text-left py-2 px-4 font-medium text-gray-700">Event</th>
                    <th className="text-left py-2 px-4 font-medium text-gray-700">Date</th>
                    <th className="text-left py-2 px-4 font-medium text-gray-700">Venue</th>
                    <th className="text-left py-2 px-4 font-medium text-gray-700">Featured</th>
                    <th className="text-right py-2 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {weeklyEvents.map((event) => (
                    <tr key={event.id} className="border-b border-gray-200">
                      <td className="py-3 px-4">{event.event_name}</td>
                      <td className="py-3 px-4">{event.event_date}</td>
                      <td className="py-3 px-4">{event.event_venue}, {event.event_city}</td>
                      <td className="py-3 px-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleFeatured(event.id!, event.is_featured)}
                        >
                          <Star 
                            className={`h-5 w-5 ${event.is_featured ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} 
                          />
                        </Button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            asChild
                          >
                            <a href={`/admin/events?id=${event.event_id}`} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 text-blue-500" />
                            </a>
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleRemoveEvent(event.id!)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-md">
              <p className="text-gray-500">No weekly events found</p>
              <p className="text-sm text-gray-400 mt-1">Select an event above to add it to the weekly events section</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyEventsManager;
