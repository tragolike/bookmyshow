
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AddCategoryForm from './AddCategoryForm';
import CategoryList from './CategoryList';
import ImageUploader from './ImageUploader';

interface SeatCategory {
  id?: string;
  name: string;
  price: number;
  color: string;
}

const SeatCategoryManager = () => {
  const [categories, setCategories] = useState<SeatCategory[]>([]);
  const [loading, setLoading] = useState(true);

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
      console.error('Error fetching categories:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryAdded = (category: SeatCategory) => {
    setCategories([category, ...categories]);
  };

  const handleCategoryUpdated = (updatedCategory: SeatCategory) => {
    setCategories(categories.map(cat => 
      cat.id === updatedCategory.id ? updatedCategory : cat
    ));
  };

  const handleCategoryDeleted = (id: string) => {
    setCategories(categories.filter(cat => cat.id !== id));
  };

  return (
    <div className="space-y-4">
      <AddCategoryForm onCategoryAdded={handleCategoryAdded} />
      <CategoryList 
        categories={categories} 
        onCategoryUpdated={handleCategoryUpdated}
        onCategoryDeleted={handleCategoryDeleted}
        loading={loading}
      />
      <ImageUploader />
    </div>
  );
};

export default SeatCategoryManager;
