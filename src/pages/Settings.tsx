
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Settings = () => {
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your settings have been saved successfully.",
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto py-6 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="md:col-span-1 space-y-6">
            <div>
              <h2 className="text-lg font-semibold">Settings</h2>
              <p className="text-muted-foreground">
                Configure your monitoring preferences and notification settings.
              </p>
            </div>
          </div>
          
          <div className="md:col-span-2 space-y-8">
            <div className="bg-card rounded-lg border p-6">
              <h3 className="text-xl font-medium mb-4">Dashboard Settings</h3>
              
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-refresh" className="text-base">Auto Refresh</Label>
                    <p className="text-sm text-muted-foreground">Automatically refresh dashboard data</p>
                  </div>
                  <Switch id="auto-refresh" defaultChecked />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="refresh-interval">Refresh Interval (seconds)</Label>
                  <Input id="refresh-interval" type="number" defaultValue={60} min={10} />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="default-timeframe">Default Timeframe</Label>
                  <Select defaultValue="24h">
                    <SelectTrigger>
                      <SelectValue placeholder="Select timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">1 hour</SelectItem>
                      <SelectItem value="6h">6 hours</SelectItem>
                      <SelectItem value="24h">24 hours</SelectItem>
                      <SelectItem value="7d">7 days</SelectItem>
                      <SelectItem value="30d">30 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-lg border p-6">
              <h3 className="text-xl font-medium mb-4">Alert Settings</h3>
              
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enable-alerts" className="text-base">Enable Alerts</Label>
                    <p className="text-sm text-muted-foreground">Receive alerts when metrics exceed thresholds</p>
                  </div>
                  <Switch id="enable-alerts" defaultChecked />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label>CPU Warning Threshold (%)</Label>
                  <Input type="number" defaultValue={70} min={0} max={100} />
                </div>
                
                <div className="space-y-2">
                  <Label>CPU Critical Threshold (%)</Label>
                  <Input type="number" defaultValue={90} min={0} max={100} />
                </div>
                
                <div className="space-y-2">
                  <Label>RAM Warning Threshold (%)</Label>
                  <Input type="number" defaultValue={80} min={0} max={100} />
                </div>
                
                <div className="space-y-2">
                  <Label>RAM Critical Threshold (%)</Label>
                  <Input type="number" defaultValue={95} min={0} max={100} />
                </div>
                
                <div className="space-y-2">
                  <Label>Disk Warning Threshold (%)</Label>
                  <Input type="number" defaultValue={75} min={0} max={100} />
                </div>
                
                <div className="space-y-2">
                  <Label>Disk Critical Threshold (%)</Label>
                  <Input type="number" defaultValue={90} min={0} max={100} />
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-lg border p-6">
              <h3 className="text-xl font-medium mb-4">Notification Settings</h3>
              
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications" className="text-base">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive alerts via email</p>
                  </div>
                  <Switch id="email-notifications" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notification-email">Notification Email</Label>
                  <Input id="notification-email" type="email" placeholder="your@email.com" />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="browser-notifications" className="text-base">Browser Notifications</Label>
                    <p className="text-sm text-muted-foreground">Show desktop notifications in browser</p>
                  </div>
                  <Switch id="browser-notifications" defaultChecked />
                </div>
              </div>
            </div>
            
            <Button className="w-full" onClick={handleSave}>Save Settings</Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Settings;
