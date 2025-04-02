
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getPaymentSettings, updatePaymentSettings } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, QrCode, IndianRupee, Upload, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const PaymentSettings = () => {
  const [upiId, setUpiId] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await getPaymentSettings();
        if (error) throw error;
        
        if (data) {
          setUpiId(data.upi_id);
          setQrCodeUrl(data.qr_code_url || '');
        }
      } catch (error) {
        console.error('Error fetching payment settings:', error);
        toast.error('Failed to load payment settings');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSettings();
  }, []);

  const generateQRCode = async () => {
    if (!upiId.trim()) {
      toast.error('Please enter a valid UPI ID to generate QR code');
      return;
    }
    
    setIsGeneratingQr(true);
    try {
      // In a real app, this would call an API to generate a QR code
      // For now, we'll simulate it with a fake URL pointing to an external QR code generator
      const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${encodeURIComponent(upiId)}&pn=ShowTix`;
      
      setQrCodeUrl(qrCodeApiUrl);
      toast.success('QR code generated successfully');
      
      // Automatically save the settings
      const { error } = await updatePaymentSettings({
        upi_id: upiId,
        qr_code_url: qrCodeApiUrl,
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
    } finally {
      setIsGeneratingQr(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!upiId.trim()) {
      toast.error('Please enter a valid UPI ID');
      return;
    }
    
    setIsSaving(true);
    try {
      const { error } = await updatePaymentSettings({
        upi_id: upiId,
        qr_code_url: qrCodeUrl,
      });
      
      if (error) throw error;
      toast.success('Payment settings updated successfully');
    } catch (error) {
      console.error('Error updating payment settings:', error);
      toast.error('Failed to update payment settings');
    } finally {
      setIsSaving(false);
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
    <Card>
      <CardHeader>
        <CardTitle>Payment Settings</CardTitle>
        <CardDescription>
          Configure the payment options for your users
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="upi-id">UPI ID</Label>
            <div className="flex relative">
              <IndianRupee className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <Input 
                id="upi-id"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="yourname@upi"
                className="pl-10"
                required
              />
            </div>
            <p className="text-sm text-gray-500">
              This UPI ID will be used for receiving payments from users
            </p>
          </div>
          
          <div className="flex justify-center">
            <Button 
              type="button" 
              variant="outline"
              onClick={generateQRCode}
              disabled={isGeneratingQr || !upiId.trim()}
              className="flex items-center gap-2"
            >
              {isGeneratingQr ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Generate QR Code
                </>
              )}
            </Button>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="qr-code">QR Code URL</Label>
            <div className="flex relative">
              <QrCode className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <Input 
                id="qr-code"
                value={qrCodeUrl}
                onChange={(e) => setQrCodeUrl(e.target.value)}
                placeholder="https://example.com/your-qr-code.png"
                className="pl-10"
              />
            </div>
            <p className="text-sm text-gray-500">
              URL to your UPI QR code image for users to scan
            </p>
          </div>
          
          {qrCodeUrl && (
            <div className="flex justify-center py-4">
              <div className="border border-gray-200 rounded-lg p-2 max-w-[200px]">
                <img 
                  src={qrCodeUrl}
                  alt="UPI QR Code"
                  className="w-full h-auto"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                    e.currentTarget.alt = 'Failed to load QR code';
                  }}
                />
              </div>
            </div>
          )}
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-medium text-yellow-800 mb-1">Important Note</h3>
            <p className="text-sm text-yellow-700">
              Make sure your UPI ID is active and properly set up to receive payments.
              Users will use this QR code to make payments for bookings.
            </p>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit" 
            disabled={isSaving}
            className="w-full"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Payment Settings'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default PaymentSettings;
