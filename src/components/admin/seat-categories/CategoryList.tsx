
import { useState } from 'react';
import { Edit, Trash2, Check, X } from 'lucide-react';
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

interface CategoryListProps {
  categories: SeatCategory[];
  onCategoryUpdated: (category: SeatCategory) => void;
  onCategoryDeleted: (id: string) => void;
  loading: boolean;
}

const CategoryList = ({ categories, onCategoryUpdated, onCategoryDeleted, loading }: CategoryListProps) => {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editedCategory, setEditedCategory] = useState<SeatCategory>({ name: '', price: 0, color: '#cccccc' });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedCategory(prev => ({ ...prev, [name]: name === 'price' ? Number(value) : value }));
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setEditedCategory(prev => ({ ...prev, color: value }));
  };

  const startEdit = (category: SeatCategory) => {
    setEditingCategory(category.id || null);
    setEditedCategory({ ...category });
  };

  const cancelEdit = () => {
    setEditingCategory(null);
  };

  const updateCategory = async () => {
    if (!editingCategory) return;

    try {
      const { data, error } = await supabase
        .from('seat_categories')
        .update(editedCategory)
        .eq('id', editingCategory)
        .select();

      if (error) {
        throw error;
      }

      onCategoryUpdated(data[0]);
      setEditingCategory(null);
      toast.success('Category updated successfully!');
    } catch (error: any) {
      toast.error(`Error updating category: ${error.message}`);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('seat_categories')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      onCategoryDeleted(id);
      toast.success('Category deleted successfully!');
    } catch (error: any) {
      toast.error(`Error deleting category: ${error.message}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Seat Categories</CardTitle>
        <CardDescription>Manage existing seat categories.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div>Loading categories...</div>
        ) : (
          <div className="grid gap-4">
            {categories.map(category => (
              <div key={category.id} className="border rounded-md p-4">
                {editingCategory === category.id ? (
                  <div className="grid gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`name-${category.id}`}>Name</Label>
                        <Input
                          type="text"
                          id={`name-${category.id}`}
                          name="name"
                          value={editedCategory.name}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`price-${category.id}`}>Price</Label>
                        <Input
                          type="number"
                          id={`price-${category.id}`}
                          name="price"
                          value={editedCategory.price}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor={`color-${category.id}`}>Color</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="color"
                          id={`color-${category.id}`}
                          name="color"
                          value={editedCategory.color}
                          onChange={handleColorChange}
                        />
                        <div
                          className="w-6 h-6 rounded-full"
                          style={{ backgroundColor: editedCategory.color }}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" onClick={cancelEdit}><X className="w-4 h-4 mr-2" />Cancel</Button>
                      <Button onClick={updateCategory}><Check className="w-4 h-4 mr-2" />Update</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{category.name}</div>
                      <div className="text-sm text-gray-500">Price: ${category.price}</div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" onClick={() => startEdit(category)}><Edit className="w-4 h-4" /></Button>
                      <Button variant="destructive" onClick={() => deleteCategory(category.id || '')}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoryList;
