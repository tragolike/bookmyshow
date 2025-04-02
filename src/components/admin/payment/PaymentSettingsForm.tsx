import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase, uploadFile } from '@/integrations/supabase/client';
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
  
  const fetchSettings = async () => {
    console.log('Fetching payment settings directly from database...');
    const { data, error } = await supabase
      .from('payment_settings')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();
      
    if (error) {
      console.error('Direct SQL error fetching payment settings:', error);
      throw error;
    }
    
    console.log('Direct SQL payment settings fetched:', data);
    return { data };
  };
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['paymentSettings', Date.now()],
    queryFn: fetchSettings,
    refetchOnWindowFocus: true,
    staleTime: 0,
    gcTime: 0,
  });
  
  useEffect(() => {
    if (data?.data) {
      console.log('Setting form state from fetched data:', data.data);
      setUpiId(data.data.upi_id || '');
      setQrCodeUrl(data.data.qr_code_url || '');
      setInstructions(data.data.payment_instructions || '');
    }
  }, [data]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!upiId.trim()) {
      toast.error('Please enter a valid UPI ID');
      return;
    }
    
    const saveSettings = async () => {
      console.log('Saving payment settings directly to database...');
      
      const { data: existingData, error: checkError } = await supabase
        .from('payment_settings')
        .select('id')
        .limit(1)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking payment settings:', checkError);
        throw checkError;
      }
      
      const settingsData = {
        upi_id: upiId,
        qr_code_url: qrCodeUrl,
        payment_instructions: instructions,
        updated_by: user?.id,
        updated_at: new Date().toISOString()
      };
      
      let result;
      if (existingData?.id) {
        console.log('Updating existing settings with ID:', existingData.id);
        result = await supabase
          .from('payment_settings')
          .update(settingsData)
          .eq('id', existingData.id)
          .select();
      } else {
        console.log('Creating new payment settings');
        result = await supabase
          .from('payment_settings')
          .insert(settingsData)
          .select();
      }
      
      if (result.error) {
        console.error('Error saving payment settings:', result.error);
        throw result.error;
      }
      
      console.log('Payment settings saved successfully:', result.data);
      return result.data;
    };
    
    try {
      toast.loading('Saving payment settings...');
      await saveSettings();
      toast.dismiss();
      toast.success('Payment settings saved successfully');
      
      queryClient.invalidateQueries({ queryKey: ['paymentSettings'] });
      
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['paymentSettings'] });
      }, 1000);
    } catch (error: any) {
      toast.dismiss();
      console.error('Failed to save payment settings:', error);
      toast.error(`Failed to save settings: ${error.message || 'Unknown error'}`);
    }
  };

  const generateQRCode = async () => {
    if (!upiId.trim()) {
      toast.error('Please enter a valid UPI ID to generate QR code');
      return;
    }
    
    try {
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
      const result = await uploadFile(file, 'brand_assets', 'qr_codes');
      
      if (result.error) throw result.error;
      
      if (result.url) {
        setQrCodeUrl(result.url);
      } else if (result.path) {
        const { data: { publicUrl } } = supabase.storage
          .from('brand_assets')
          .getPublicUrl(result.path);
          
        setQrCodeUrl(publicUrl);
      }
      
      toast.success('QR code uploaded successfully');
    } catch (error: any) {
      console.error('QR code upload error:', error);
      toast.error(`Failed to upload QR code: ${error.message}`);
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
            className="ml-auto bg-[#ff2366] hover:bg-[#e01f59] text-white"
          >
            Save Settings
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
