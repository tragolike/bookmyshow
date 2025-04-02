
import { useState, useEffect } from 'react';
import { supabase, getPaymentSettings, uploadFile } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UpiSettingsTab from './UpiSettingsTab';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const PaymentSettingsForm = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('upi');
  
  // Payment settings state
  const [upiId, setUpiId] = useState('showtix@upi');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [paymentInstructions, setPaymentInstructions] = useState(
    'Please make the payment using any UPI app and enter the UTR number for verification.'
  );
  
  // Load payment settings on mount
  useEffect(() => {
    fetchPaymentSettings();
  }, []);
  
  const fetchPaymentSettings = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching payment settings...');
      
      const { data, error } = await getPaymentSettings();
      
      if (error) {
        console.error('Error fetching payment settings:', error);
        toast.error('Could not load payment settings');
        // Use default values which are already set
        return;
      }
      
      if (data) {
        console.log('Payment settings loaded:', data);
        setUpiId(data.upi_id || 'showtix@upi');
        setQrCodeUrl(data.qr_code_url || '');
        setPaymentInstructions(data.payment_instructions || 'Please make the payment using any UPI app and enter the UTR number for verification.');
      }
    } catch (error) {
      console.error('Exception while fetching payment settings:', error);
      toast.error('Failed to load payment settings');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      console.log('Saving payment settings...');
      const { error } = await supabase
        .from('payment_settings')
        .upsert({
          upi_id: upiId,
          qr_code_url: qrCodeUrl,
          payment_instructions: paymentInstructions,
          updated_by: user?.id,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });
      
      if (error) {
        throw error;
      }
      
      toast.success('Payment settings saved successfully');
    } catch (error: any) {
      console.error('Error saving payment settings:', error);
      toast.error(error.message || 'Failed to save payment settings');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleGenerateQR = async () => {
    try {
      if (!upiId.trim()) {
        toast.error('Please enter a UPI ID first');
        return;
      }
      
      // This would typically call an API to generate a QR code
      const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${encodeURIComponent(
        upiId
      )}&pn=ShowTix&mc=0000&tn=Payment&am=0`;
      
      setQrCodeUrl(qrCodeApiUrl);
      toast.success('QR code generated');
      
      return qrCodeApiUrl;
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
      return null;
    }
  };
  
  const handleQrUpload = async (file: File) => {
    try {
      // Upload QR code image to Supabase Storage
      console.log('Uploading QR code image...');
      const result = await uploadFile(file, 'payment_assets', 'qr_codes');
      
      if (result.error) {
        throw result.error;
      }
      
      if (result.url) {
        setQrCodeUrl(result.url);
        toast.success('QR code uploaded successfully');
      }
    } catch (error: any) {
      console.error('Error uploading QR code:', error);
      toast.error(error.message || 'Failed to upload QR code');
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="upi">UPI Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upi">
          <UpiSettingsTab
            upiId={upiId}
            qrCodeUrl={qrCodeUrl}
            onUpiIdChange={setUpiId}
            onQrCodeUrlChange={setQrCodeUrl}
            onGenerateQR={handleGenerateQR}
            onQrUpload={handleQrUpload}
          />
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end">
        <button
          type="button"
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          onClick={handleSaveSettings}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
              Saving...
            </>
          ) : (
            'Save Payment Settings'
          )}
        </button>
      </div>
    </div>
  );
};

export default PaymentSettingsForm;
