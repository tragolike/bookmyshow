
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, BellRing, Mail, MessageSquare } from 'lucide-react';

const NotificationSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSettings, setEmailSettings] = useState({
    newBooking: true,
    paymentConfirmation: true,
    cancellationAlert: true,
    eventReminder: true
  });
  
  const [smsSettings, setSmsSettings] = useState({
    newBooking: false,
    paymentConfirmation: true,
    cancellationAlert: false,
    eventReminder: true
  });
  
  const [pushSettings, setPushSettings] = useState({
    newBooking: true,
    paymentConfirmation: false,
    cancellationAlert: true,
    eventReminder: false
  });
  
  const handleEmailSettingChange = (key: keyof typeof emailSettings) => {
    setEmailSettings({
      ...emailSettings,
      [key]: !emailSettings[key]
    });
  };
  
  const handleSmsSettingChange = (key: keyof typeof smsSettings) => {
    setSmsSettings({
      ...smsSettings,
      [key]: !smsSettings[key]
    });
  };
  
  const handlePushSettingChange = (key: keyof typeof pushSettings) => {
    setPushSettings({
      ...pushSettings,
      [key]: !pushSettings[key]
    });
  };
  
  const handleSaveSettings = async () => {
    setIsLoading(true);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Notification settings saved successfully');
    } catch (error) {
      toast.error('Failed to save notification settings');
      console.error('Error saving notification settings:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>
          Configure how and when notifications are sent to users
        </CardDescription>
      </CardHeader>
      
      <Tabs defaultValue="email">
        <TabsList className="mx-6">
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span>Email</span>
          </TabsTrigger>
          <TabsTrigger value="sms" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>SMS</span>
          </TabsTrigger>
          <TabsTrigger value="push" className="flex items-center gap-2">
            <BellRing className="h-4 w-4" />
            <span>Push</span>
          </TabsTrigger>
        </TabsList>
        
        <CardContent className="pt-6 space-y-6">
          <TabsContent value="email" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="email-new-booking" 
                  checked={emailSettings.newBooking}
                  onCheckedChange={() => handleEmailSettingChange('newBooking')}
                />
                <label
                  htmlFor="email-new-booking"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  New Booking Notification
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="email-payment" 
                  checked={emailSettings.paymentConfirmation}
                  onCheckedChange={() => handleEmailSettingChange('paymentConfirmation')}
                />
                <label
                  htmlFor="email-payment"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Payment Confirmation
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="email-cancellation" 
                  checked={emailSettings.cancellationAlert}
                  onCheckedChange={() => handleEmailSettingChange('cancellationAlert')}
                />
                <label
                  htmlFor="email-cancellation"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Booking Cancellation Alert
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="email-reminder" 
                  checked={emailSettings.eventReminder}
                  onCheckedChange={() => handleEmailSettingChange('eventReminder')}
                />
                <label
                  htmlFor="email-reminder"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Event Reminder (24h before)
                </label>
              </div>
            </div>
            
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-700">
                Email templates can be customized in the Templates section
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="sms" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="sms-new-booking" 
                  checked={smsSettings.newBooking}
                  onCheckedChange={() => handleSmsSettingChange('newBooking')}
                />
                <label
                  htmlFor="sms-new-booking"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  New Booking Notification
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="sms-payment" 
                  checked={smsSettings.paymentConfirmation}
                  onCheckedChange={() => handleSmsSettingChange('paymentConfirmation')}
                />
                <label
                  htmlFor="sms-payment"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Payment Confirmation
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="sms-cancellation" 
                  checked={smsSettings.cancellationAlert}
                  onCheckedChange={() => handleSmsSettingChange('cancellationAlert')}
                />
                <label
                  htmlFor="sms-cancellation"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Booking Cancellation Alert
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="sms-reminder" 
                  checked={smsSettings.eventReminder}
                  onCheckedChange={() => handleSmsSettingChange('eventReminder')}
                />
                <label
                  htmlFor="sms-reminder"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Event Reminder (3h before)
                </label>
              </div>
            </div>
            
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-700">
                SMS messages will be charged at standard rates. Configure SMS gateway in API settings.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="push" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="push-new-booking" 
                  checked={pushSettings.newBooking}
                  onCheckedChange={() => handlePushSettingChange('newBooking')}
                />
                <label
                  htmlFor="push-new-booking"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  New Booking Notification
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="push-payment" 
                  checked={pushSettings.paymentConfirmation}
                  onCheckedChange={() => handlePushSettingChange('paymentConfirmation')}
                />
                <label
                  htmlFor="push-payment"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Payment Confirmation
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="push-cancellation" 
                  checked={pushSettings.cancellationAlert}
                  onCheckedChange={() => handlePushSettingChange('cancellationAlert')}
                />
                <label
                  htmlFor="push-cancellation"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Booking Cancellation Alert
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="push-reminder" 
                  checked={pushSettings.eventReminder}
                  onCheckedChange={() => handlePushSettingChange('eventReminder')}
                />
                <label
                  htmlFor="push-reminder"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Event Reminder (1h before)
                </label>
              </div>
            </div>
            
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-700">
                Push notifications are sent to mobile app users only
              </p>
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>
      
      <CardFooter>
        <Button 
          onClick={handleSaveSettings}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Notification Settings'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NotificationSettings;
