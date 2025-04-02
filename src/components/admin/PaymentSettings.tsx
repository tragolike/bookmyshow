
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getPaymentSettings, updatePaymentSettings } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, QrCode, IndianRupee, Upload, RefreshCw, Info, HelpCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const PaymentSettings = () => {
  const [upiId, setUpiId] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [instructions, setInstructions] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);
  const [activeTab, setActiveTab] = useState('upi');
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
          setInstructions(data.payment_instructions || '');
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
      // For now, we'll use an external QR code generator
      const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${encodeURIComponent(upiId)}&pn=ShowTix`;
      
      setQrCodeUrl(qrCodeApiUrl);
      toast.success('QR code generated successfully');
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
        payment_instructions: instructions,
        updated_by: user?.id
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

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      toast.error('QR code image must be less than 2MB');
      return;
    }
    
    if (!['image/png', 'image/jpeg', 'image/svg+xml'].includes(file.type)) {
      toast.error('Only PNG, JPEG, and SVG files are allowed');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setQrCodeUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
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
            disabled={isSaving}
            className="ml-auto"
          >
            {isSaving ? (
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
          <Card>
            <CardHeader>
              <CardTitle>UPI Payment Settings</CardTitle>
              <CardDescription>
                Configure the UPI payment options for your users
              </CardDescription>
            </CardHeader>
            
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>QR Code</Label>
                    <div className="flex flex-col gap-3">
                      <div className="flex gap-2">
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={generateQRCode}
                          disabled={isGeneratingQr || !upiId.trim()}
                          className="flex-1 flex items-center gap-2"
                        >
                          {isGeneratingQr ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <QrCode className="h-4 w-4" />
                              Generate QR Code
                            </>
                          )}
                        </Button>
                        
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('qr-upload')?.click()}
                          className="flex items-center gap-1"
                        >
                          <Upload className="h-4 w-4" />
                          Upload
                        </Button>
                        <input 
                          id="qr-upload"
                          type="file"
                          accept="image/png,image/jpeg,image/svg+xml"
                          className="hidden"
                          onChange={handleQrUpload}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="qr-code-url">QR Code URL</Label>
                        <div className="flex relative">
                          <QrCode className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                          <Input 
                            id="qr-code-url"
                            value={qrCodeUrl}
                            onChange={(e) => setQrCodeUrl(e.target.value)}
                            placeholder="https://example.com/your-qr-code.png"
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  {qrCodeUrl ? (
                    <div className="border border-gray-200 rounded-lg p-2 max-w-[200px] bg-white">
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
                  ) : (
                    <div className="border border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center bg-gray-50 w-full max-w-[200px]">
                      <QrCode className="h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 text-center">
                        Generate or upload a QR code
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Important Note</AlertTitle>
                <AlertDescription>
                  Make sure your UPI ID is active and properly set up to receive payments.
                  Users will use this QR code to make payments for bookings.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="instructions">
          <Card>
            <CardHeader>
              <CardTitle>Payment Instructions</CardTitle>
              <CardDescription>
                Customize the instructions that will be shown to users during payment
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="payment-instructions">Payment Instructions</Label>
                <Textarea
                  id="payment-instructions"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Enter any additional payment instructions or information for users"
                  className="min-h-[150px]"
                />
                <p className="text-sm text-gray-500">
                  These instructions will be displayed to users on the payment page
                </p>
              </div>
              
              <div className="mt-6">
                <Alert>
                  <HelpCircle className="h-4 w-4" />
                  <AlertTitle>UTR Verification Process</AlertTitle>
                  <AlertDescription>
                    <p className="mb-2">When users make UPI payments, they will be asked to provide the UTR (Unique Transaction Reference) for verification.</p>
                    <p>You will be able to verify these UTR numbers in the Bookings section under "Pending Payments" tab.</p>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  );
};

export default PaymentSettings;
