import { useState, useEffect } from 'react';
import { getTicketTypes, upsertTicketType, db } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus, Trash2, Save, Edit, CircleDollarSign } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
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

interface TicketType {
  id?: string;
  category: string;
  base_price: number;
  surge_price?: number;
  color?: string;
}

const defaultColors = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-cyan-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-emerald-500',
  'bg-rose-500',
  'bg-amber-500',
];

const TicketTypeManager = () => {
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingType, setEditingType] = useState<TicketType | null>(null);
  const { user } = useAuth();
  
  const [category, setCategory] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [surgePrice, setSurgePrice] = useState('');
  const [selectedColor, setSelectedColor] = useState(defaultColors[0]);
  
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
      toast.error('Failed to load ticket types');
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetForm = () => {
    setCategory('');
    setBasePrice('');
    setSurgePrice('');
    setSelectedColor(defaultColors[0]);
    setEditingType(null);
  };
  
  const handleEditType = (type: TicketType) => {
    setEditingType(type);
    setCategory(type.category);
    setBasePrice(type.base_price.toString());
    setSurgePrice(type.surge_price?.toString() || '');
    setSelectedColor(type.color || defaultColors[0]);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!category.trim()) {
      toast.error('Please enter a category name');
      return;
    }
    
    if (!basePrice || isNaN(Number(basePrice)) || Number(basePrice) <= 0) {
      toast.error('Please enter a valid base price');
      return;
    }
    
    if (surgePrice && (isNaN(Number(surgePrice)) || Number(surgePrice) <= 0)) {
      toast.error('Please enter a valid surge price');
      return;
    }
    
    setIsSaving(true);
    try {
      const typeData: TicketType = {
        id: editingType?.id,
        category: category.trim(),
        base_price: Number(basePrice),
        surge_price: surgePrice ? Number(surgePrice) : undefined,
        color: selectedColor
      };
      
      const { data, error } = await upsertTicketType(typeData);
      
      if (error) {
        console.error('Error saving ticket type:', error);
        throw error;
      }
      
      toast.success(`Ticket type ${editingType ? 'updated' : 'created'} successfully`);
      resetForm();
      fetchTicketTypes();
    } catch (error) {
      console.error('Error saving ticket type:', error);
      toast.error('Failed to save ticket type. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDeleteTicketType = async (id: string) => {
    try {
      const { error } = await db.ticketTypes()
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Ticket type deleted successfully');
      fetchTicketTypes();
    } catch (error) {
      console.error('Error deleting ticket type:', error);
      toast.error('Failed to delete ticket type');
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-book-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Ticket Types</h2>
          <p className="text-gray-500">Manage ticket categories and pricing</p>
        </div>
        <Button
          onClick={resetForm}
          variant={editingType ? "outline" : "default"}
        >
          <Plus className="h-4 w-4 mr-2" />
          {editingType ? "Cancel Editing" : "Add New Ticket Type"}
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{editingType ? "Edit Ticket Type" : "Add New Ticket Type"}</CardTitle>
          <CardDescription>
            {editingType 
              ? "Update the details for this ticket type" 
              : "Create a new ticket category with pricing details"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="category">Category Name</Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. VIP, Premium, General"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="color">Category Color</Label>
                <div className="grid grid-cols-5 gap-2">
                  {defaultColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`h-10 w-10 rounded-full ${color} ${
                        selectedColor === color ? 'ring-2 ring-offset-2 ring-book-primary' : ''
                      }`}
                      onClick={() => setSelectedColor(color)}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="base-price">Base Price (₹)</Label>
                <div className="relative">
                  <CircleDollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input
                    id="base-price"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    placeholder="Regular ticket price"
                    className="pl-10"
                    type="number"
                    min="1"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="surge-price">Surge Price (₹) (Optional)</Label>
                <div className="relative">
                  <CircleDollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input
                    id="surge-price"
                    value={surgePrice}
                    onChange={(e) => setSurgePrice(e.target.value)}
                    placeholder="Price during high demand"
                    className="pl-10"
                    type="number"
                    min="1"
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {editingType ? "Update Ticket Type" : "Save Ticket Type"}
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ticketTypes.map((type) => (
          <Card key={type.id} className="overflow-hidden">
            <div className={`h-2 ${type.color || 'bg-gray-300'} w-full`}></div>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{type.category}</h3>
                  <div className="mt-1 space-y-1">
                    <p className="text-2xl font-semibold">₹{type.base_price.toLocaleString()}</p>
                    {type.surge_price && (
                      <p className="text-sm text-amber-600">
                        Surge: ₹{type.surge_price.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleEditType(type)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Ticket Type</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete the "{type.category}" ticket type? 
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-500 hover:bg-red-600"
                          onClick={() => type.id && handleDeleteTicketType(type.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {ticketTypes.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <div className="text-gray-400 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <line x1="3" y1="10" x2="21" y2="10" />
                <line x1="7" y1="15" x2="8" y2="15" />
                <line x1="12" y1="15" x2="13" y2="15" />
              </svg>
            </div>
            <p className="text-gray-600 text-lg font-medium">No ticket types available</p>
            <p className="text-gray-500 mt-1">Create your first ticket category to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketTypeManager;
