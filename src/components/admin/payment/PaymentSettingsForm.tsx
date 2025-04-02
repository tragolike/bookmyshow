
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
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['paymentSettings'],
    queryFn: getPaymentSettings,
  });
  
  // Update local state when data is fetched
  useEffect(() => {
    if (data?.data) {
      setUpiId(data.data.upi_id);
      setQrCodeUrl(data.data.qr_code_url || '');
      setInstructions(data.data.payment_instructions || '');
    }
  }, [data]);
  
  const mutation = useMutation({
    mutationFn: updatePaymentSettings,
    onSuccess: () => {
      toast.success('Payment settings updated successfully');
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
    
    mutation.mutate({
      upi_id: upiId,
      qr_code_url: qrCodeUrl,
      payment_instructions: instructions,
      updated_by: user?.id
    });
  };

  const generateQRCode = async () => {
    if (!upiId.trim()) {
      toast.error('Please enter a valid UPI ID to generate QR code');
      return;
    }
    
    try {
      // In a real app, this would call an API to generate a QR code
      // For now, we'll use an external QR code generator
      const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${encodeURIComponent(upiId)}&pn=ShowTix`;
      
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
      const { url, error } = await uploadFile(file, 'brand_assets', 'qr_codes');
      if (error) throw error;
      if (url) {
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
            className="ml-auto"
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
