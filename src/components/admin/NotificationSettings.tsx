
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, BellRing, MailIcon, SmartphoneIcon, Send } from 'lucide-react';

const NotificationSettings = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    bookingConfirmationTemplate: "Thank you for your booking! Your booking for {{event_name}} has been confirmed. Your booking ID is {{booking_id}}.",
    bookingCancellationTemplate: "Your booking for {{event_name}} has been cancelled. If you have any questions, please contact our support team.",
    reminderTemplate: "Reminder: Your event {{event_name}} is scheduled for tomorrow at {{event_time}}. We look forward to seeing you!"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      toast.success('Notification settings updated successfully');
      setIsSaving(false);
    }, 1000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>
          Configure how and when notifications are sent to users
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Notification Channels</h3>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MailIcon className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-gray-500">Send booking confirmations and updates via email</p>
                  </div>
                </div>
                <Switch 
                  checked={settings.emailNotifications}
                  onCheckedChange={value => setSettings({...settings, emailNotifications: value})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SmartphoneIcon className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">SMS Notifications</p>
                    <p className="text-sm text-gray-500">Send text messages for important updates</p>
                  </div>
                </div>
                <Switch 
                  checked={settings.smsNotifications}
                  onCheckedChange={value => setSettings({...settings, smsNotifications: value})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BellRing className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-gray-500">Send in-app notifications and reminders</p>
                  </div>
                </div>
                <Switch 
                  checked={settings.pushNotifications}
                  onCheckedChange={value => setSettings({...settings, pushNotifications: value})}
                />
              </div>
            </div>
          </div>
          
          <div className="pt-4 space-y-6">
            <h3 className="text-lg font-medium">Notification Templates</h3>
            
            <div className="space-y-2">
              <p className="font-medium">Booking Confirmation</p>
              <Textarea 
                value={settings.bookingConfirmationTemplate}
                onChange={e => setSettings({...settings, bookingConfirmationTemplate: e.target.value})}
                rows={3}
                placeholder="Enter booking confirmation template"
              />
              <p className="text-sm text-gray-500">
                Variables: {{'{{'}}event_name{{'}}'}}, {{'{{'}}booking_id{{'}}'}}, {{'{{'}}event_date{{'}}'}}, {{'{{'}}event_time{{'}}'}}, {{'{{'}}user_name{{'}}'}}
              </p>
            </div>
            
            <div className="space-y-2">
              <p className="font-medium">Booking Cancellation</p>
              <Textarea 
                value={settings.bookingCancellationTemplate}
                onChange={e => setSettings({...settings, bookingCancellationTemplate: e.target.value})}
                rows={3}
                placeholder="Enter booking cancellation template"
              />
              <p className="text-sm text-gray-500">
                Variables: {{'{{'}}event_name{{'}}'}}, {{'{{'}}booking_id{{'}}'}}, {{'{{'}}refund_amount{{'}}'}}, {{'{{'}}user_name{{'}}'}}
              </p>
            </div>
            
            <div className="space-y-2">
              <p className="font-medium">Event Reminder</p>
              <Textarea 
                value={settings.reminderTemplate}
                onChange={e => setSettings({...settings, reminderTemplate: e.target.value})}
                rows={3}
                placeholder="Enter event reminder template"
              />
              <p className="text-sm text-gray-500">
                Variables: {{'{{'}}event_name{{'}}'}}, {{'{{'}}event_date{{'}}'}}, {{'{{'}}event_time{{'}}'}}, {{'{{'}}venue{{'}}'}}, {{'{{'}}user_name{{'}}'}}
              </p>
            </div>
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
              <>
                <Send className="mr-2 h-4 w-4" /> Save Notification Settings
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default NotificationSettings;
