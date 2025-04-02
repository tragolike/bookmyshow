
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getPaymentSettings, updatePaymentSettings, uploadFile } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import UpiSettingsTab from './UpiSettingsTab';
import PaymentInstructionsTab from './PaymentInstructionsTab';
import { PaymentSettings } from '@/components/payment/types';

const PaymentSettingsForm = () => {
  const [upiId, setUpiId] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [instructions, setInstructions] = useState('');
  const [activeTab, setActiveTab] = useState('upi');
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Use React Query with cache busting to ensure we get latest data
  const { data, isLoading, error } = useQuery({
    queryKey: ['paymentSettings'],
    queryFn: getPaymentSettings,
    refetchOnWindowFocus: true,
    staleTime: 0, // Don't use stale data
    gcTime: 5000, // Short cache time (renamed from cacheTime)
  });
  
  // Update local state when data is fetched
  useEffect(() => {
    if (data?.data) {
      console.log('Setting form state from fetched data:', data.data);
      setUpiId(data.data.upi_id || '');
      setQrCodeUrl(data.data.qr_code_url || '');
      setInstructions(data.data.payment_instructions || '');
    }
  }, [data]);
  
  const mutation = useMutation({
    mutationFn: updatePaymentSettings,
    onSuccess: () => {
      toast.success('Payment settings updated successfully');
      // Force refresh of payment settings data
      queryClient.invalidateQueries({ queryKey: ['paymentSettings'] });
    },
    onError: (error) => {
      console.error('Failed to update payment settings:', error);
      toast.error('Failed to update payment settings. Please try again.');
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!upiId.trim()) {
      toast.error('Please enter a valid UPI ID');
      return;
    }
    
    // Explicitly log what we're sending to the server
    console.log('Submitting payment settings:', {
      upi_id: upiId,
      qr_code_url: qrCodeUrl,
      payment_instructions: instructions,
      updated_by: user?.id
    });
    
    try {
      const result = await updatePaymentSettings({
        upi_id: upiId,
        qr_code_url: qrCodeUrl,
        payment_instructions: instructions,
        updated_by: user?.id
      });
      
      if (result.error) {
        throw result.error;
      }
      
      toast.success('Payment settings updated successfully');
      queryClient.invalidateQueries({ queryKey: ['paymentSettings'] });
    } catch (error: any) {
      console.error('Error updating payment settings:', error);
      toast.error(`Failed to update payment settings: ${error.message || 'Unknown error'}`);
    }
  };

  const generateQRCode = async () => {
    if (!upiId.trim()) {
      toast.error('Please enter a valid UPI ID to generate QR code');
      return;
    }
    
    try {
      // In a real app, this would call an API to generate a QR code
      // For now, we'll use an external QR code generator
      const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${encodeURIComponent(upiId)}&pn=ShowTix&cache=${Date.now()}`;
      
      setQrCodeUrl(qrCodeApiUrl);
      toast.success('QR code generated successfully');
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
    }
  };

  const handleQrUpload = async (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      toast.error('QR code image must be less than 2MB');
      return;
    }
    
    if (!['image/png', 'image/jpeg', 'image/svg+xml'].includes(file.type)) {
      toast.error('Only PNG, JPEG, and SVG files are allowed');
      return;
    }
    
    try {
      toast.info('Uploading QR code...');
      const { url, error } = await uploadFile(file, 'brand_assets', 'qr_codes');
      if (error) throw error;
      if (url) {
        console.log('QR code uploaded successfully to:', url);
        setQrCodeUrl(url);
        toast.success('QR code uploaded successfully');
      }
    } catch (error) {
      console.error('QR code upload error:', error);
      toast.error('Failed to upload QR code');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-book-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded-md">
        <h3 className="text-red-700 font-medium mb-2">Error loading payment settings</h3>
        <p className="text-sm text-red-600">Please try refreshing the page or contact support.</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Refresh Page
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Tabs defaultValue="upi" onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="upi">UPI Settings</TabsTrigger>
            <TabsTrigger value="instructions">Payment Instructions</TabsTrigger>
          </TabsList>
          
          <Button 
            type="submit" 
            disabled={mutation.isPending}
            className="ml-auto bg-[#ff2366] hover:bg-[#e01f59] text-white"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Settings'
            )}
          </Button>
        </div>
      
        <TabsContent value="upi">
          <UpiSettingsTab 
            upiId={upiId}
            qrCodeUrl={qrCodeUrl}
            onUpiIdChange={(value) => setUpiId(value)}
            onQrCodeUrlChange={(value) => setQrCodeUrl(value)}
            onGenerateQR={generateQRCode}
            onQrUpload={handleQrUpload}
          />
        </TabsContent>
        
        <TabsContent value="instructions">
          <PaymentInstructionsTab
            instructions={instructions}
            onInstructionsChange={(value) => setInstructions(value)}
          />
        </TabsContent>
      </Tabs>
    </form>
  );
};

export default PaymentSettingsForm;
