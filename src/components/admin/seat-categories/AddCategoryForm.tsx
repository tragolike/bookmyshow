
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface SeatCategory {
  id?: string;
  name: string;
  price: number;
  color: string;
}

interface AddCategoryFormProps {
  onCategoryAdded: (category: SeatCategory) => void;
}

const AddCategoryForm = ({ onCategoryAdded }: AddCategoryFormProps) => {
  const [newCategory, setNewCategory] = useState<SeatCategory>({ name: '', price: 0, color: '#cccccc' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewCategory(prev => ({ ...prev, [name]: name === 'price' ? Number(value) : value }));
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setNewCategory(prev => ({ ...prev, color: value }));
  };

  const validateForm = () => {
    if (!newCategory.name.trim()) {
      toast.error('Please enter a category name');
      return false;
    }
    
    if (isNaN(newCategory.price) || newCategory.price < 0) {
      toast.error('Please enter a valid price');
      return false;
    }
    
    return true;
  };

  const addCategory = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      // Debug logging
      console.log('Inserting new category:', newCategory);
      
      const { data, error } = await supabase
        .from('seat_categories')
        .insert([{
          name: newCategory.name,
          price: newCategory.price,
          color: newCategory.color
        }])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error('No data returned from database');
      }

      console.log('Category added successfully:', data[0]);
      onCategoryAdded(data[0]);
      setNewCategory({ name: '', price: 0, color: '#cccccc' });
      toast.success('Category added successfully!');
    } catch (error: any) {
      console.error('Error adding category:', error);
      toast.error(`Error adding category: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Category</CardTitle>
        <CardDescription>Create a new seat category.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={newCategory.name}
              onChange={handleInputChange}
              placeholder="e.g. Premium, VIP, Standard"
            />
          </div>
          <div>
            <Label htmlFor="price">Price</Label>
            <Input
              type="number"
              id="price"
              name="price"
              value={newCategory.price}
              onChange={handleInputChange}
              placeholder="Enter price"
              min="0"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="color">Color</Label>
          <div className="flex items-center space-x-2">
            <Input
              type="color"
              id="color"
              name="color"
              value={newCategory.color}
              onChange={handleColorChange}
              className="w-16 h-10"
            />
            <div
              className="w-6 h-6 rounded-full border border-gray-200"
              style={{ backgroundColor: newCategory.color }}
            />
            <span className="text-sm text-gray-500">{newCategory.color}</span>
          </div>
        </div>
        <Button 
          onClick={addCategory} 
          disabled={isSubmitting}
          className="w-full bg-[#ff2366] hover:bg-[#e01f59] text-white"
        >
          {isSubmitting ? (
            <>Adding...</>
          ) : (
            <><Plus className="w-4 h-4 mr-2" />Add Category</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AddCategoryForm;
