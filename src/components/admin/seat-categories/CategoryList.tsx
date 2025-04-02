
import { useState, useEffect } from 'react';
import { Edit, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';

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

const CategoryList = ({
  categories,
  onCategoryUpdated,
  onCategoryDeleted,
  loading,
}: CategoryListProps) => {
  const [editingCategory, setEditingCategory] = useState<SeatCategory | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEditClick = (category: SeatCategory) => {
    setEditingCategory({ ...category });
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingCategory) return;
    
    const { name, value } = e.target;
    setEditingCategory(prev => ({
      ...prev!,
      [name]: name === 'price' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSaveEdit = async () => {
    if (!editingCategory || !editingCategory.id) return;
    
    setIsUpdating(true);
    try {
      const { data, error } = await supabase
        .from('seat_categories')
        .update({
          name: editingCategory.name,
          price: editingCategory.price,
          color: editingCategory.color,
        })
        .eq('id', editingCategory.id)
        .select();

      if (error) throw error;
      
      if (data && data.length > 0) {
        onCategoryUpdated(data[0]);
        toast.success('Category updated successfully');
      }
      
      setEditingCategory(null);
    } catch (error: any) {
      console.error('Error updating category:', error);
      toast.error(`Error updating category: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('seat_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      onCategoryDeleted(id);
      toast.success('Category deleted successfully');
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast.error(`Error deleting category: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Seat Categories</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center p-6">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center p-6 text-muted-foreground">
            No categories found. Create your first category above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Color</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Price (₹)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map(category => (
                  <TableRow key={category.id}>
                    {editingCategory && editingCategory.id === category.id ? (
                      // Edit mode
                      <>
                        <TableCell>
                          <Input
                            type="color"
                            name="color"
                            value={editingCategory.color || '#cccccc'}
                            onChange={handleInputChange}
                            className="w-16 h-10"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="text"
                            name="name"
                            value={editingCategory.name}
                            onChange={handleInputChange}
                            className="w-full"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            name="price"
                            value={editingCategory.price}
                            onChange={handleInputChange}
                            className="w-full"
                          />
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={handleSaveEdit}
                            disabled={isUpdating}
                          >
                            {isUpdating ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving
                              </>
                            ) : (
                              'Save'
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleCancelEdit}
                            disabled={isUpdating}
                          >
                            Cancel
                          </Button>
                        </TableCell>
                      </>
                    ) : (
                      // View mode
                      <>
                        <TableCell>
                          <div
                            className="w-8 h-8 rounded-full border"
                            style={{ backgroundColor: category.color }}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>₹{category.price.toLocaleString()}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditClick(category)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-500 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Seat Category</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{category.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => category.id && handleDeleteCategory(category.id)}
                                  className="bg-red-500 hover:bg-red-600"
                                >
                                  {isDeleting ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Deleting
                                    </>
                                  ) : (
                                    'Delete'
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoryList;
