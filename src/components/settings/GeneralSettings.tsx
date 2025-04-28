import { useState } from 'react';
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
import { toast } from "sonner";

export function GeneralSettings() {
  const [currencySymbol, setCurrencySymbol] = useState(() => {
    return localStorage.getItem('currency_symbol') || 'Rs.';
  });

  // Save currency symbol
  const saveCurrencySymbol = () => {
    try {
      localStorage.setItem('currency_symbol', currencySymbol);
      toast.success('Currency symbol saved successfully');
    } catch (error) {
      console.error('Error saving currency symbol:', error);
      toast.error('Failed to save currency symbol');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
        <CardDescription>
          Configure general settings for your application.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="shopName">Shop Name</Label>
          <Input id="shopName" placeholder="StitchSmart Tailors" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="address">Shop Address</Label>
          <Input id="address" placeholder="123 Fashion Street, Karachi" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" placeholder="+92 300 1234567" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" type="email" placeholder="contact@stitchsmart.com" />
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch id="darkMode" />
          <Label htmlFor="darkMode">Dark Mode Default</Label>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="currency">Currency Symbol</Label>
          <div className="flex items-center space-x-2">
            <Input 
              id="currency" 
              placeholder="Rs." 
              value={currencySymbol}
              onChange={(e) => setCurrencySymbol(e.target.value)}
            />
            <Button onClick={saveCurrencySymbol}>Save</Button>
          </div>
        </div>
        
        <Button>Save Settings</Button>
      </CardContent>
    </Card>
  );
}
