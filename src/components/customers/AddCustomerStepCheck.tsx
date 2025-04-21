
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Phone } from 'lucide-react';

interface AddCustomerStepCheckProps {
  onCheck: (phone: string, isWhatsApp: boolean) => void;
  onCancel: () => void;
}

export function AddCustomerStepCheck({ onCheck, onCancel }: AddCustomerStepCheckProps) {
  const [phone, setPhone] = useState('');
  const [isWhatsApp, setIsWhatsApp] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const handleCheck = async () => {
    if (!phone) return;
    
    setIsChecking(true);
    await onCheck(phone, isWhatsApp);
    setIsChecking(false);
  };

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        Enter the customer's phone number to check if they already exist in your records.
      </p>
      
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter phone number"
            className="pl-10"
            autoFocus
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="isWhatsApp" 
          checked={isWhatsApp}
          onCheckedChange={(checked) => setIsWhatsApp(checked === true)}
        />
        <Label htmlFor="isWhatsApp" className="font-normal">
          This is a WhatsApp number
        </Label>
      </div>
      
      {isWhatsApp && phone && (
        <div className="flex items-center text-sm space-x-2 text-muted-foreground">
          <svg 
            viewBox="0 0 24 24" 
            className="h-4 w-4 text-green-600" 
            fill="currentColor"
          >
            <path d="M17.6 6.32c1.6 1.6 2.4 3.6 2.4 5.68 0 7.14-9.8 13-13.8 7.26l-3 1.02L4.24 17C2.44 5.88 14.2.18 17.6 6.32z" />
            <path fill="#FFF" d="M13.6 8.32l-1.26.65c-.4-.2-1.03-.26-1.05-.26-.8-.08-1.53.22-1.66.3-.8.5-.94.54-1 .54-.5.05-.13.17-.26.47a5.4 5.4 0 0 0-.24 1.33c0 .8.24 1.56.47 2 .33.6.75 1.04 1.24 1.26.15.07.32.13.5.17.33.08 1.2.2 2.12-.37.94-.58 1.3-.56 1.3-.56.25 0 .77-.53.77-1.47 0-.17-.07-.35-.14-.5-.06-.17-.7-1.77-.7-1.77-.5-.7-1.36-1.93-2.42-2.13 0 0-.35-.27-1.03-.27-.7 0-1.7.4-2.4 1.47-.54.8-.84 1.57-.84 2.4 0 .75.23 1.45.68 2.08.56.77 1.68 1.84 3.75 1.84 2.2 0 3.64-1.6 3.64-1.6.45-.38.80-.93 1.06-1.4.16-.3.43-1.02.43-1.93 0-1.1-.3-1.82-.3-1.82-.37-1.04-1.65-2.26-3.12-2.6-.24-.06-.95-.2-1.83-.2-1.7 0-2.8.9-2.8.9-1.02.9-1.77 2.14-1.9 3.48-.12 1.02-.06 1.74.03 2.2.14.6.4 1.2.4 1.2.54 1.02 1.65 1.90 3.06 2.42.7.25 1.9.44 3.14.1 1.7-.48 2.43-1.12 2.43-1.12.8-.53 1.5-1.5 1.85-2.1.35-.56.77-1.78.77-2.92 0-1.1-.18-1.77-.27-2.04a6.62 6.62 0 0 0-2.1-2.9c-.57-.46-1.7-1.1-3.55-1.1-2.55 0-4.5 1.96-4.5 1.96C6.9 5.94 6.43 7.16 6.22 8c-.22.87-.2 1.67-.2 1.67.1 1.5.6 2.54.6 2.54C7.5 14.5 9.57 15.9 12.37 16c2.6.07 4.45-1.1 4.45-1.1 1.06-.67 1.76-1.35 2.44-2.74.34-.66.85-2.37.5-4.16-.18-.9-.33-1.42-.73-2.13-.4-.7-.74-1.13-1.57-1.83-1.56-1.3-3.5-1.6-3.5-1.6-1.98-.3-3.28.4-3.28.4-.96.37-1.85 1.22-2.33 1.9-.48.66-.8 1.37-.8 1.37-.4.87-.6 1.86-.2 3.28.42 1.4 1.32 2.25 1.32 2.25.67.57 1.5 1.07 2.37 1.28.57.13 1.56.3 2.53 0 .55-.15 1.3-.53 1.86-1.1.56-.56.7-.87.7-.87.17-.23.37-.7.37-1.33.02-.5-.12-1.05-.12-1.05-.2-.62-.67-1.1-.67-1.1-.38-.43-.93-.76-1.4-.9-.17-.05-.24-.07-.24-.07-.43-.1-.84-.1-1.12-.05-.18.03-.27.06-.27.06-.4.1-.7.3-.93.5-.1.1-.14.14-.14.14-.17.2-.32.44-.32.74 0 .44.3.83.66.93h.06c.33 0 .6-.27.6-.6 0-.33-.27-.6-.6-.6a.56.56 0 0 0-.4.17s.05-.02.1-.05c.15-.06.3-.1.47-.12.1 0 .13 0 .13 0 .17-.03.42-.02.68.05 0 0 .04 0 .12.04.3.1.66.3.92.58.6.8.95 1.47.72 2.57 0 .08-.05.25-.15.4-.1.15-.17.25-.17.25-.12.15-.33.47-.66.67-.37.23-.7.32-1.3.32-.48 0-.87-.1-1.24-.2-.28-.07-.5-.16-.67-.26-.62-.32-1.1-.68-1.35-.9-.54-.45-.87-.96-1.1-1.36-.36-.65-.54-1.17-.63-1.72-.07-.55-.05-1.03 0-1.32.05-.3.17-.84.46-1.42.3-.58.75-1.1 1.06-1.33.6-.47 1.4-.86 2.5-.86.94 0 1.67.26 2.13.47.4.2.7.4.95.6 1.3 1.1 1.85 2.35 2.02 2.78.58 1.38.57 2.28.57 2.3 0 .53-.2.95-.2.95-.17.37-.44.92-1.43 1.53-1 .6-1.8.54-2.02.5a3.64 3.64 0 0 1-1.34-.46c-.3-.17-.54-.37-.7-.52a3.67 3.67 0 0 1-1.08-1.87c-.13-.53-.15-1-.15-1.24 0-.18.02-.52.14-.9.1-.38.33-.97.9-1.48.56-.5 1.37-.72 1.77-.72.17 0 .33 0 .33 0 .35.04.75.16 1 .32l-.04-.03z" />
          </svg>
          <span>
            WhatsApp chat option will be available after saving
          </span>
        </div>
      )}
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleCheck} 
          disabled={!phone || isChecking}
        >
          {isChecking ? "Checking..." : "Check & Continue"}
        </Button>
      </div>
    </div>
  );
}
