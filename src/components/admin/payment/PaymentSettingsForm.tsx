
import { useState, useEffect } from 'react';
import { uploadFile } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UpiSettingsTab from './UpiSettingsTab';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { usePaymentSettings, PaymentSettings } from '@/hooks/usePaymentSettings';

const PaymentSettingsForm = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('upi');

  // Use our updated payment settings hook
  const { 
    paymentSettings, 
    isLoading, 
    isUpdating, 
    updateSettings, 
    refreshPaymentSettings 
  } = usePaymentSettings(false);
  
  // Payment settings state
  const [upiId, setUpiId] = useState('showtix@upi');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [paymentInstructions, setPaymentInstructions] = useState(
    'Please make the payment using any UPI app and enter the UTR number for verification.'
  );
  
  // Update local state when payment settings change
  useEffect(() => {
    if (paymentSettings) {
      setUpiId(paymentSettings.upi_id || 'showtix@upi');
      setQrCodeUrl(paymentSettings.qr_code_url || '');
      setPaymentInstructions(paymentSettings.payment_instructions || 'Please make the payment using any UPI app and enter the UTR number for verification.');
    }
  }, [paymentSettings]);
  
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
  
  const handleSaveSettings = async () => {
    if (!user?.id) {
      toast.error('You must be logged in to save settings');
      return;
    }
    
    const settingsToSave: PaymentSettings = {
      upi_id: upiId,
      qr_code_url: qrCodeUrl,
      payment_instructions: paymentInstructions,
      updated_by: user.id,
    };
    
    try {
      // Use our mutation from the hook
      await updateSettings(settingsToSave);
      
      // Force refresh after updating to ensure we have the latest data
      setTimeout(() => {
        refreshPaymentSettings();
      }, 500);
    } catch (error) {
      console.error('Error in handleSaveSettings:', error);
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
          disabled={isUpdating}
        >
          {isUpdating ? (
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
