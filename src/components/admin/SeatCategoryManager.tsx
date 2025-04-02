
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { upsertTicketType, getTicketTypes } from '@/integrations/supabase/client';
import { 
  Edit, 
  Trash2, 
  Plus, 
  Loader2, 
  CheckCircle, 
  Save, 
  CircleDashed 
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface TicketType {
  id?: string;
  category: string;
  base_price: number;
  surge_price?: number;
  color?: string;
}

const SeatCategoryManager = () => {
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentTicketType, setCurrentTicketType] = useState<TicketType>({
    category: '',
    base_price: 0,
    surge_price: 0,
    color: '#3B82F6'
  });
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    fetchTicketTypes();
  }, []);
  
  const fetchTicketTypes = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await getTicketTypes();
      if (error) throw error;
      
      setTicketTypes(data || []);
    } catch (error) {
      console.error('Error fetching ticket types:', error);
      toast.error('Failed to load seat categories');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddCategory = () => {
    setCurrentTicketType({
      category: '',
      base_price: 0,
      surge_price: 0,
      color: '#3B82F6'
    });
    setIsEditing(false);
    setDialogOpen(true);
  };
  
  const handleEditCategory = (category: TicketType) => {
    setCurrentTicketType({ ...category });
    setIsEditing(true);
    setDialogOpen(true);
  };
  
  const handleSaveCategory = async () => {
    if (!currentTicketType.category) {
      toast.error('Category name is required');
      return;
    }
    
    if (currentTicketType.base_price <= 0) {
      toast.error('Base price must be greater than 0');
      return;
    }
    
    setIsSaving(true);
    try {
      const { data, error } = await upsertTicketType(currentTicketType);
      
      if (error) throw error;
      
      setDialogOpen(false);
      
      // If it was a new category, add it to the list, otherwise update the existing one
      if (!isEditing) {
        setTicketTypes([...ticketTypes, data]);
        toast.success('Seat category added successfully');
      } else {
        setTicketTypes(ticketTypes.map(category => 
          category.id === data.id ? data : category
        ));
        toast.success('Seat category updated successfully');
      }
    } catch (error) {
      console.error('Error saving ticket type:', error);
      toast.error('Failed to save seat category');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('ticket_types')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setTicketTypes(ticketTypes.filter(category => category.id !== id));
      toast.success('Seat category deleted successfully');
    } catch (error) {
      console.error('Error deleting ticket type:', error);
      toast.error('Failed to delete seat category');
    }
  };
  
  const getContrastColor = (hexColor: string) => {
    // Remove the leading # if it exists
    hexColor = hexColor.replace('#', '');
    
    // Convert to RGB
    const r = parseInt(hexColor.substring(0, 2), 16);
    const g = parseInt(hexColor.substring(2, 4), 16);
    const b = parseInt(hexColor.substring(4, 6), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return black for bright colors and white for dark colors
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  };
  
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Seat Categories</h2>
          <p className="text-sm text-gray-500">Manage ticket types and pricing for your events</p>
        </div>
        <Button onClick={handleAddCategory}>
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-book-primary" />
          <span className="ml-2">Loading seat categories...</span>
        </div>
      ) : ticketTypes.length === 0 ? (
        <div className="text-center p-8 border border-dashed rounded-lg">
          <CircleDashed className="h-10 w-10 mx-auto text-gray-400 mb-2" />
          <h3 className="text-lg font-medium mb-1">No seat categories yet</h3>
          <p className="text-gray-500 mb-4">Create categories to organize your venue seating and pricing</p>
          <Button onClick={handleAddCategory}>
            <Plus className="w-4 h-4 mr-2" />
            Add First Category
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          <div className="grid grid-cols-8 font-medium text-sm text-gray-500 px-4 py-2 border-b">
            <div className="col-span-2">Category</div>
            <div className="col-span-2">Base Price</div>
            <div className="col-span-2">Surge Price</div>
            <div className="col-span-1">Color</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>
          
          {ticketTypes.map(category => (
            <div key={category.id} className="grid grid-cols-8 items-center px-4 py-3 bg-white rounded-lg border hover:bg-gray-50">
              <div className="col-span-2 font-medium">{category.category}</div>
              <div className="col-span-2">₹{category.base_price?.toLocaleString()}</div>
              <div className="col-span-2">
                {category.surge_price 
                  ? `₹${category.surge_price?.toLocaleString()}` 
                  : <span className="text-gray-400">Not set</span>
                }
              </div>
              <div className="col-span-1">
                {category.color ? (
                  <div 
                    className="w-6 h-6 rounded-full" 
                    style={{ 
                      backgroundColor: category.color,
                      color: getContrastColor(category.color)
                    }}
                  ></div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-200"></div>
                )}
              </div>
              <div className="col-span-1 flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleEditCategory(category)}
                >
                  <Edit className="h-4 w-4 text-blue-600" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleDeleteCategory(category.id!)}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Seat Category' : 'Add Seat Category'}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? 'Update this seat category details and pricing information.' 
                : 'Create a new seat category for your events.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category Name
              </Label>
              <Input
                id="category"
                value={currentTicketType.category}
                onChange={(e) => setCurrentTicketType({...currentTicketType, category: e.target.value})}
                className="col-span-3"
                placeholder="e.g. Premium, Gold, Silver"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="basePrice" className="text-right">
                Base Price (₹)
              </Label>
              <Input
                id="basePrice"
                type="number"
                value={currentTicketType.base_price}
                onChange={(e) => setCurrentTicketType({
                  ...currentTicketType, 
                  base_price: parseFloat(e.target.value) || 0
                })}
                className="col-span-3"
                placeholder="e.g. 1000"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="surgePrice" className="text-right">
                Surge Price (₹)
              </Label>
              <Input
                id="surgePrice"
                type="number"
                value={currentTicketType.surge_price || ''}
                onChange={(e) => setCurrentTicketType({
                  ...currentTicketType, 
                  surge_price: e.target.value ? parseFloat(e.target.value) : undefined
                })}
                className="col-span-3"
                placeholder="Leave empty if not applicable"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="color" className="text-right">
                Color
              </Label>
              <div className="col-span-3 flex items-center gap-3">
                <Input
                  id="color"
                  type="color"
                  value={currentTicketType.color || '#3B82F6'}
                  onChange={(e) => setCurrentTicketType({...currentTicketType, color: e.target.value})}
                  className="w-20 p-1 h-10"
                />
                <div 
                  className="flex-1 h-10 rounded-md flex items-center justify-center font-medium"
                  style={{ 
                    backgroundColor: currentTicketType.color || '#3B82F6',
                    color: getContrastColor(currentTicketType.color || '#3B82F6')
                  }}
                >
                  {currentTicketType.category || 'Category Preview'}
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveCategory}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? 'Update Category' : 'Add Category'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-4">
        <div className="flex items-start">
          <CheckCircle className="text-blue-500 h-5 w-5 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-blue-800">Seat Category Tips</h3>
            <ul className="mt-2 space-y-1 text-sm text-blue-700 list-disc pl-5">
              <li>Create distinct categories like Premium, Gold, and Silver for your venue</li>
              <li>Base price is the standard price for this seat category</li>
              <li>Surge price can be applied during high-demand periods</li>
              <li>Choose different colors to easily distinguish seat categories on the seating map</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SeatCategoryManager;
