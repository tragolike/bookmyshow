
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, PlusCircle, TrashIcon, Upload, Info, AlertTriangle, RefreshCw } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface SpecialOffer {
  id?: string;
  title: string;
  description: string;
  image_url: string;
  link_url: string;
  is_active: boolean;
  discount_percentage?: number;
  valid_until?: string;
  created_at?: string;
}

const fetchSpecialOffers = async () => {
  try {
    console.log('Fetching special offers...');
    const { data, error } = await supabase
      .from('special_offers')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error from Supabase when fetching special offers:', error);
      throw error;
    }
    
    console.log('Successfully fetched special offers:', data);
    return data || [];
  } catch (error) {
    console.error('Error fetching special offers:', error);
    throw error;
  }
};

const SpecialOffersManager = () => {
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('all');
  const [newOffer, setNewOffer] = useState<SpecialOffer>({
    title: '',
    description: '',
    image_url: '',
    link_url: '',
    is_active: true,
    discount_percentage: 10
  });
  const [isUploading, setIsUploading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const { data: offers, isLoading, error, refetch } = useQuery({
    queryKey: ['specialOffers', retryCount],
    queryFn: fetchSpecialOffers,
    retry: 3,
    retryDelay: 1000
  });
  
  const createMutation = useMutation({
    mutationFn: async (offer: SpecialOffer) => {
      try {
        console.log('Creating special offer:', offer);
        const { data, error } = await supabase
          .from('special_offers')
          .insert(offer)
          .select();
          
        if (error) {
          console.error('Error from Supabase when creating special offer:', error);
          throw error;
        }
        
        console.log('Successfully created special offer:', data);
        return data;
      } catch (error) {
        console.error('Create special offer error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specialOffers'] });
      toast.success('Special offer created successfully');
      setNewOffer({
        title: '',
        description: '',
        image_url: '',
        link_url: '',
        is_active: true,
        discount_percentage: 10
      });
    },
    onError: (error: any) => {
      console.error('Error creating special offer:', error);
      toast.error(`Failed to create special offer: ${error.message || 'Unknown error'}`);
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('special_offers')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specialOffers'] });
      toast.success('Special offer deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting special offer:', error);
      toast.error(`Failed to delete special offer: ${error.message || 'Unknown error'}`);
    }
  });
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setIsUploading(true);
      
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `special_offers/${fileName}`;
      
      // Upload the file
      const { error: uploadError, data } = await supabase.storage
        .from('marketing_assets')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('marketing_assets')
        .getPublicUrl(filePath);
        
      setNewOffer({
        ...newOffer,
        image_url: urlData.publicUrl
      });
      
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(`Failed to upload image: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newOffer.title || !newOffer.description) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    await createMutation.mutate(newOffer);
  };
  
  const handleDeleteOffer = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this special offer?')) {
      await deleteMutation.mutate(id);
    }
  };
  
  const handleRetryFetch = () => {
    setRetryCount(prev => prev + 1);
    refetch();
    toast.info('Retrying to fetch special offers...');
  };
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Special Offers</CardTitle>
          <CardDescription>
            Manage special offers and promotions that appear on the website
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <AlertDescription className="flex items-center justify-between">
              <span>Error loading special offers: {(error as any)?.message || 'Unknown error'}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRetryFetch}
                className="ml-2"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
          
          <Button onClick={() => setActiveTab('create')} className="mt-4">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Your First Offer
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Special Offers</CardTitle>
        <CardDescription>
          Manage special offers and promotions that appear on the website
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Offers</TabsTrigger>
            <TabsTrigger value="create">Create New</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
              </div>
            ) : offers && offers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {offers.map((offer) => (
                  <Card key={offer.id} className="overflow-hidden">
                    <div className="relative h-40">
                      <img 
                        src={offer.image_url || '/placeholder.svg'} 
                        alt={offer.title}
                        className="w-full h-full object-cover"
                      />
                      {offer.is_active && (
                        <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                          Active
                        </span>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-lg">{offer.title}</h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{offer.description}</p>
                      
                      {offer.discount_percentage && (
                        <p className="text-sm font-medium text-green-600 mt-2">
                          {offer.discount_percentage}% discount
                        </p>
                      )}
                      
                      <div className="flex justify-between items-center mt-4">
                        <a 
                          href={offer.link_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 text-sm hover:underline"
                        >
                          View Offer
                        </a>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteOffer(offer.id!)}
                        >
                          <TrashIcon className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No special offers found</p>
                <Button 
                  onClick={() => setActiveTab('create')} 
                  className="mt-4"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Your First Offer
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="create">
            <form onSubmit={handleCreateOffer} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={newOffer.title}
                    onChange={(e) => setNewOffer({ ...newOffer, title: e.target.value })}
                    placeholder="e.g., Summer Special Discount"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="discount">Discount Percentage</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    max="100"
                    value={newOffer.discount_percentage || ''}
                    onChange={(e) => setNewOffer({ 
                      ...newOffer, 
                      discount_percentage: parseInt(e.target.value) || undefined 
                    })}
                    placeholder="e.g., 10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  value={newOffer.description}
                  onChange={(e) => setNewOffer({ ...newOffer, description: e.target.value })}
                  placeholder="Brief description of the offer"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="link_url">Link URL *</Label>
                <Input
                  id="link_url"
                  value={newOffer.link_url}
                  onChange={(e) => setNewOffer({ ...newOffer, link_url: e.target.value })}
                  placeholder="e.g., /events/summer-festival"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="image">Offer Image</Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Label
                      htmlFor="image"
                      className="flex items-center justify-center border border-dashed border-gray-300 rounded-md p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {isUploading ? 'Uploading...' : 'Upload Image'}
                    </Label>
                  </div>
                  
                  {newOffer.image_url && (
                    <div className="h-16 w-16 rounded overflow-hidden">
                      <img 
                        src={newOffer.image_url}
                        alt="Offer preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="pt-4 flex justify-end">
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || isUploading || !newOffer.title || !newOffer.description || !newOffer.link_url}
                >
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Special Offer
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SpecialOffersManager;
