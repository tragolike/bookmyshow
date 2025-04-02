
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Settings2, ServerCrash, Shield, RefreshCw } from 'lucide-react';

const SystemSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    enableRealTimeSync: true,
    enableNotifications: true,
    maxBookingsPerUser: 10,
    maintenanceMode: false,
    cacheDuration: 15
  });

  useEffect(() => {
    // In a real app, this would fetch system settings from the database
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      toast.success('System settings updated successfully');
      setIsSaving(false);
    }, 1000);
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
        <CardTitle>System Settings</CardTitle>
        <CardDescription>
          Configure system-wide settings for your booking platform
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="real-time-sync" className="text-base">Real-Time Sync</Label>
                <p className="text-sm text-gray-500">
                  Enable real-time updates for seat bookings
                </p>
              </div>
              <Switch 
                id="real-time-sync"
                checked={settings.enableRealTimeSync}
                onCheckedChange={value => setSettings({...settings, enableRealTimeSync: value})}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications" className="text-base">Notifications</Label>
                <p className="text-sm text-gray-500">
                  Send email notifications for bookings and updates
                </p>
              </div>
              <Switch 
                id="notifications"
                checked={settings.enableNotifications}
                onCheckedChange={value => setSettings({...settings, enableNotifications: value})}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="max-bookings">Maximum Bookings Per User</Label>
            <Input 
              id="max-bookings"
              type="number"
              value={settings.maxBookingsPerUser}
              onChange={e => setSettings({...settings, maxBookingsPerUser: parseInt(e.target.value)})}
              min={1}
              max={50}
            />
            <p className="text-sm text-gray-500">
              Maximum number of active bookings a user can have
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cache-duration">Cache Duration (minutes)</Label>
            <Input 
              id="cache-duration"
              type="number"
              value={settings.cacheDuration}
              onChange={e => setSettings({...settings, cacheDuration: parseInt(e.target.value)})}
              min={1}
              max={60}
            />
            <p className="text-sm text-gray-500">
              Duration for caching event and booking data
            </p>
          </div>
          
          <div className="pt-4 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="maintenance-mode" className="text-base font-medium text-amber-700">Maintenance Mode</Label>
                <p className="text-sm text-amber-600">
                  When enabled, only admins can access the platform
                </p>
              </div>
              <Switch 
                id="maintenance-mode"
                checked={settings.maintenanceMode}
                onCheckedChange={value => setSettings({...settings, maintenanceMode: value})}
                className="data-[state=checked]:bg-amber-500"
              />
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => {
              toast.info('Settings reset to defaults');
              setSettings({
                enableRealTimeSync: true,
                enableNotifications: true,
                maxBookingsPerUser: 10,
                maintenanceMode: false,
                cacheDuration: 15
              });
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Reset Defaults
          </Button>
          
          <Button 
            type="submit" 
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Settings2 className="mr-2 h-4 w-4" /> Save Settings
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default SystemSettings;
