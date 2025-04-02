
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewCategory(prev => ({ ...prev, [name]: name === 'price' ? Number(value) : value }));
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setNewCategory(prev => ({ ...prev, color: value }));
  };

  const addCategory = async () => {
    try {
      const { data, error } = await supabase
        .from('seat_categories')
        .insert([newCategory])
        .select();

      if (error) {
        throw error;
      }

      onCategoryAdded(data[0]);
      setNewCategory({ name: '', price: 0, color: '#cccccc' });
      toast.success('Category added successfully!');
    } catch (error: any) {
      toast.error(`Error adding category: ${error.message}`);
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
            />
            <div
              className="w-6 h-6 rounded-full"
              style={{ backgroundColor: newCategory.color }}
            />
          </div>
        </div>
        <Button onClick={addCategory}><Plus className="w-4 h-4 mr-2" />Add Category</Button>
      </CardContent>
    </Card>
  );
};

export default AddCategoryForm;
