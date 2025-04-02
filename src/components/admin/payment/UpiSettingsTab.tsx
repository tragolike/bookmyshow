
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { QrCode, IndianRupee, Upload, Info, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface UpiSettingsTabProps {
  upiId: string;
  qrCodeUrl: string;
  onUpiIdChange: (value: string) => void;
  onQrCodeUrlChange: (value: string) => void;
  onGenerateQR: () => void;
  onQrUpload: (file: File) => Promise<void>;
}

const UpiSettingsTab = ({
  upiId,
  qrCodeUrl,
  onUpiIdChange,
  onQrCodeUrlChange,
  onGenerateQR,
  onQrUpload
}: UpiSettingsTabProps) => {
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);

  const handleGenerateQR = async () => {
    setIsGeneratingQr(true);
    try {
      await onGenerateQR();
    } finally {
      setIsGeneratingQr(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onQrUpload(file);
    }
  };

  return (
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
              onChange={(e) => onUpiIdChange(e.target.value)}
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
                    onClick={handleGenerateQR}
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
                    onChange={handleFileUpload}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="qr-code-url">QR Code URL</Label>
                  <div className="flex relative">
                    <QrCode className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <Input 
                      id="qr-code-url"
                      value={qrCodeUrl}
                      onChange={(e) => onQrCodeUrlChange(e.target.value)}
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
  );
};

export default UpiSettingsTab;
