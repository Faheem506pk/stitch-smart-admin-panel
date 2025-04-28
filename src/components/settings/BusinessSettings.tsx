import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

export function BusinessSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Information</CardTitle>
        <CardDescription>
          Manage your business details and preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="businessName">Business Name</Label>
          <Input id="businessName" placeholder="Your Business Name" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="businessLogo">Business Logo</Label>
          <Input id="businessLogo" type="file" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="tagline">Tagline</Label>
          <Input id="tagline" placeholder="Your business tagline" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="businessDescription">Business Description</Label>
          <Textarea 
            id="businessDescription" 
            placeholder="Describe your business"
            className="min-h-[100px]"
          />
        </div>
        
        <div className="space-y-2">
          <Label>Receipt Settings</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Switch id="showLogo" />
              <Label htmlFor="showLogo">Show Logo on Receipt</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="showAddress" defaultChecked />
              <Label htmlFor="showAddress">Show Address on Receipt</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="showContact" defaultChecked />
              <Label htmlFor="showContact">Show Contact Info on Receipt</Label>
            </div>
          </div>
        </div>
        
        <Button>Save Business Settings</Button>
      </CardContent>
    </Card>
  );
}
