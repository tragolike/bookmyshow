
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AddCategoryForm from './seat-categories/AddCategoryForm';
import CategoryList from './seat-categories/CategoryList';
import ImageUploader from './seat-categories/ImageUploader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface SeatCategory {
  id?: string;
  name: string;
  price: number;
  color: string;
}

const SeatCategoryManager = () => {
  const [categories, setCategories] = useState<SeatCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching seat categories...');
      const { data, error } = await supabase
        .from('seat_categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }

      console.log('Fetched categories:', data);
      setCategories(data || []);
    } catch (error: any) {
      console.error('Failed to fetch categories:', error);
      setError(error.message || 'Failed to load seat categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryAdded = (category: SeatCategory) => {
    setCategories(prevCategories => [category, ...prevCategories]);
  };

  const handleCategoryUpdated = (updatedCategory: SeatCategory) => {
    setCategories(prevCategories => 
      prevCategories.map(cat => 
        cat.id === updatedCategory.id ? updatedCategory : cat
      )
    );
  };

  const handleCategoryDeleted = (id: string) => {
    setCategories(prevCategories => 
      prevCategories.filter(cat => cat.id !== id)
    );
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Alert variant="default" className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4" />
        <AlertTitle>Seat Categories</AlertTitle>
        <AlertDescription>
          Define different seat categories with different pricing. These categories will be used in the seating layout for events.
        </AlertDescription>
      </Alert>
      
      <div className="grid md:grid-cols-2 gap-6">
        <AddCategoryForm onCategoryAdded={handleCategoryAdded} />
        <ImageUploader />
      </div>
      
      <CategoryList 
        categories={categories} 
        onCategoryUpdated={handleCategoryUpdated}
        onCategoryDeleted={handleCategoryDeleted}
        loading={loading}
      />
    </div>
  );
};

export default SeatCategoryManager;
