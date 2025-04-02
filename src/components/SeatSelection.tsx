
import { useState, useEffect } from 'react';
import { Info, AlertTriangle, Lock, Unlock, Save, Edit, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SeatCategory {
  id: string;
  name: string;
  price: number;
  color: string;
  available: boolean;
}
interface SeatSelectionProps {
  venueName: string;
  eventName: string;
  seatCategories: SeatCategory[];
  onCategorySelect: (category: SeatCategory) => void;
  selectedCategory: SeatCategory | null;
  onSeatCategoriesChange?: (categories: SeatCategory[]) => void;
  isAdmin?: boolean; // Add admin mode prop
}
const SeatSelection = ({
  venueName,
  eventName,
  seatCategories,
  onCategorySelect,
  selectedCategory,
  onSeatCategoriesChange,
  isAdmin = false // Default to regular user mode
}: SeatSelectionProps) => {
  const [remainingTime, setRemainingTime] = useState(240); // 4 minutes in seconds
  const [editMode, setEditMode] = useState(false);
  const [modifiedCategories, setModifiedCategories] = useState<SeatCategory[]>(seatCategories);
  const [editCategoryDialog, setEditCategoryDialog] = useState(false);
  const [categoryBeingEdited, setCategoryBeingEdited] = useState<SeatCategory | null>(null);

  useEffect(() => {
    if (remainingTime <= 0) return;
    const timer = setInterval(() => {
      setRemainingTime(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [remainingTime]);
  
  useEffect(() => {
    setModifiedCategories(seatCategories);
  }, [seatCategories]);
  
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  const toggleCategoryAvailability = (categoryId: string) => {
    setModifiedCategories(prev => 
      prev.map(category => 
        category.id === categoryId 
          ? {...category, available: !category.available} 
          : category
      )
    );
  };
  
  const saveChanges = () => {
    // Here you would implement the API call to save the changes
    // For now, we'll just show a toast message and call the callback if provided
    if (onSeatCategoriesChange) {
      onSeatCategoriesChange(modifiedCategories);
    }
    toast.success('Seat categories updated successfully');
    setEditMode(false);
  };

  const handleEditCategory = (category: SeatCategory) => {
    setCategoryBeingEdited({...category});
    setEditCategoryDialog(true);
  };

  const updateCategory = () => {
    if (!categoryBeingEdited) return;
    
    setModifiedCategories(prev => 
      prev.map(category => 
        category.id === categoryBeingEdited.id 
          ? categoryBeingEdited 
          : category
      )
    );
    
    setEditCategoryDialog(false);
    setCategoryBeingEdited(null);
    toast.success('Category updated. Don\'t forget to save changes.');
  };
  
  return <div className="flex flex-col h-full">
      {/* Timer Warning - Only show for regular users */}
      {!isAdmin && (
        <div className="bg-red-500 text-white py-2">
          <div className="container mx-auto flex flex-col md:flex-row items-center justify-center md:justify-between gap-2 px-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span>You have approximately</span>
              <span className="font-bold bg-white text-red-500 px-2 py-0.5 rounded">{formatTime(remainingTime)}</span> 
              <span>to select your seats.</span>
            </div>
            <p className="text-sm">Please don't click on 'back' or close this page, else you will have to start afresh.</p>
          </div>
        </div>
      )}
      
      {/* Admin Controls - Only show for admins */}
      {isAdmin && (
        <div className="bg-blue-100 border-b border-blue-200 p-4">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h2 className="font-semibold">Admin Controls</h2>
              <div className="flex items-center gap-2">
                <span>Edit Mode</span>
                <Switch 
                  checked={editMode}
                  onCheckedChange={setEditMode}
                />
              </div>
            </div>
            {editMode && (
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={saveChanges}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            )}
          </div>
        </div>
      )}
      
      {/* Venue Layout */}
      <div className="container mx-auto px-4 py-6 flex-1">
        <h2 className="text-xl font-bold mb-1">{eventName}</h2>
        <p className="text-sm text-gray-600 mb-6">{venueName}</p>
        
        <div className="relative mb-8">
          <div className="absolute top-4 right-4">
            <button className="flex items-center justify-center w-16 h-8 rounded-full border border-book-primary text-book-primary">
              <Info className="w-4 h-4 mr-1" />
              <span className="text-sm">Info</span>
            </button>
          </div>
          
          {/* Stadium/Venue Image */}
          <div className="bg-gray-100 rounded-lg overflow-hidden">
            <img alt="Venue Layout" className="w-full h-auto object-contain" src="data:image/jpeg;base64,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" />
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">Please select category of your choice</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modifiedCategories.map(category => (
              <div 
                key={category.id} 
                className={`flex items-center justify-between p-4 border rounded-lg transition-all 
                  ${selectedCategory?.id === category.id 
                    ? 'border-book-primary bg-book-primary/5' 
                    : 'border-gray-200 hover:border-book-primary hover:bg-gray-50'} 
                  ${!category.available && 'opacity-60'}`}
                onClick={() => !editMode && category.available && onCategorySelect(category)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${selectedCategory?.id === category.id ? 'bg-book-primary' : category.color}`} />
                  <div>
                    <div className="font-medium">{category.name}</div>
                    <div className="text-xl font-bold">₹ {category.price.toLocaleString()}</div>
                  </div>
                </div>
                
                <div className="text-sm flex items-center gap-2">
                  {isAdmin && editMode ? (
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className={`flex items-center gap-1 ${category.available ? 'text-green-600' : 'text-red-600'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCategoryAvailability(category.id);
                        }}
                      >
                        {category.available ? (
                          <>
                            <Unlock className="w-3 h-3" />
                            <span>Available</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3" />
                            <span>Blocked</span>
                          </>
                        )}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 text-blue-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditCategory(category);
                        }}
                      >
                        <Edit className="w-3 h-3" />
                        <span>Edit</span>
                      </Button>
                    </div>
                  ) : (
                    category.available ? 
                      category.price > 3000 ? 
                        <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
                          Fast Filling
                        </Badge> 
                      : 
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                          Available
                        </Badge> 
                    : 
                      <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                        Sold Out
                      </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Category Dialog */}
      <Dialog open={editCategoryDialog} onOpenChange={setEditCategoryDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Seat Category</DialogTitle>
            <DialogDescription>
              Make changes to the seat category details here.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="categoryName" className="text-right">
                Name
              </Label>
              <Input
                id="categoryName"
                value={categoryBeingEdited?.name || ''}
                onChange={(e) => setCategoryBeingEdited(prev => prev ? {...prev, name: e.target.value} : null)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="categoryPrice" className="text-right">
                Price (₹)
              </Label>
              <Input
                id="categoryPrice"
                type="number"
                value={categoryBeingEdited?.price || 0}
                onChange={(e) => setCategoryBeingEdited(prev => 
                  prev ? {...prev, price: parseFloat(e.target.value) || 0} : null
                )}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="categoryColor" className="text-right">
                Color
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input
                  id="categoryColor"
                  value={categoryBeingEdited?.color || ''}
                  onChange={(e) => setCategoryBeingEdited(prev => 
                    prev ? {...prev, color: e.target.value} : null
                  )}
                  className="flex-1"
                />
                {categoryBeingEdited && (
                  <div className={`w-6 h-6 rounded-full ${categoryBeingEdited.color}`}></div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="categoryAvailable" className="text-right">
                Available
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Switch 
                  id="categoryAvailable"
                  checked={categoryBeingEdited?.available || false}
                  onCheckedChange={(checked) => setCategoryBeingEdited(prev => 
                    prev ? {...prev, available: checked} : null
                  )}
                />
                <span className="text-sm text-gray-500">
                  {categoryBeingEdited?.available ? 'Available for booking' : 'Blocked/Sold out'}
                </span>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setEditCategoryDialog(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={updateCategory}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
};

export default SeatSelection;
