import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Upload, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface SeatCategory {
  id?: string;
  name: string;
  price: number;
  color: string;
}

const SeatCategoryManager = () => {
  const [categories, setCategories] = useState<SeatCategory[]>([]);
  const [newCategory, setNewCategory] = useState<SeatCategory>({ name: '', price: 0, color: '#cccccc' });
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editedCategory, setEditedCategory] = useState<SeatCategory>({ name: '', price: 0, color: '#cccccc' });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [image, setImage] = useState<File | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('seat_categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setCategories(data || []);
    } catch (error: any) {
      toast.error(`Error fetching categories: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, categoryType: 'new' | 'edit' = 'new') => {
    const { name, value } = e.target;
    if (categoryType === 'new') {
      setNewCategory(prev => ({ ...prev, [name]: value }));
    } else {
      setEditedCategory(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>, categoryType: 'new' | 'edit' = 'new') => {
    const { value } = e.target;
    if (categoryType === 'new') {
      setNewCategory(prev => ({ ...prev, color: value }));
    } else {
      setEditedCategory(prev => ({ ...prev, color: value }));
    }
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

      setCategories([...categories, ...data]);
      setNewCategory({ name: '', price: 0, color: '#cccccc' });
      toast.success('Category added successfully!');
    } catch (error: any) {
      toast.error(`Error adding category: ${error.message}`);
    }
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

      setCategories(categories.map(cat => (cat.id === editingCategory ? { ...cat, ...editedCategory } : cat)));
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

      setCategories(categories.filter(cat => cat.id !== id));
      toast.success('Category deleted successfully!');
    } catch (error: any) {
      toast.error(`Error deleting category: ${error.message}`);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setImage(null);
      return;
    }
    const file = e.target.files[0];
    setImage(file);
  };

  const uploadImage = async () => {
    if (!image) {
      toast.error('Please select an image to upload.');
      return;
    }

    setUploading(true);
    try {
      const timestamp = new Date().getTime();
      const filePath = `seat_categories/${timestamp}-${image.name}`;

      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, image, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${data.Key}`;
      toast.success('Image uploaded successfully!');
    } catch (error: any) {
      toast.error(`Error uploading image: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
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
                onChange={(e) => handleInputChange(e)}
              />
            </div>
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                type="number"
                id="price"
                name="price"
                value={newCategory.price}
                onChange={(e) => handleInputChange(e)}
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
                            onChange={(e) => handleInputChange(e, 'edit')}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`price-${category.id}`}>Price</Label>
                          <Input
                            type="number"
                            id={`price-${category.id}`}
                            name="price"
                            value={editedCategory.price}
                            onChange={(e) => handleInputChange(e, 'edit')}
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
                            onChange={(e) => handleColorChange(e, 'edit')}
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

      <Card>
        <CardHeader>
          <CardTitle>Upload Category Image</CardTitle>
          <CardDescription>Upload an image for a seat category.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Input type="file" id="image" onChange={handleImageChange} />
            <Button onClick={uploadImage} disabled={uploading}>
              {uploading ? (
                <>Uploading... <Loader2 className="w-4 h-4 ml-2 animate-spin" /></>
              ) : (
                <>Upload Image <Upload className="w-4 h-4 ml-2" /></>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SeatCategoryManager;
