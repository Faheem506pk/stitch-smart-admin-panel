
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { CustomerFormData } from './addCustomerFlowTypes';
import { customerService } from '@/services/customerService';
import { useToast } from '@/hooks/use-toast';
import { Camera, User, Mail, MapPin, FileText } from 'lucide-react';

interface AddCustomerStepInfoProps {
  customerData: CustomerFormData;
  setCustomerData: React.Dispatch<React.SetStateAction<CustomerFormData>>;
  onNext: () => void;
  onBack: () => void;
  isExisting: boolean;
}

export function AddCustomerStepInfo({ 
  customerData, 
  setCustomerData, 
  onNext, 
  onBack,
  isExisting
}: AddCustomerStepInfoProps) {
  const [profileImage, setProfileImage] = useState<string | null>(customerData.profilePicture || null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setProfileImage(imageUrl);
        setCustomerData(prev => ({ ...prev, profilePicture: imageUrl }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleWhatsAppChange = (checked: boolean) => {
    setCustomerData(prev => ({ ...prev, isWhatsApp: checked }));
  };

  const handleNext = async () => {
    if (!customerData.name || !customerData.phone) {
      toast({
        title: "Error",
        description: "Please fill in required fields",
        variant: "destructive"
      });
      return;
    }

    // Call the parent's onNext which will save the data
    onNext();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-shrink-0">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center relative overflow-hidden">
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="h-12 w-12 text-muted-foreground" />
            )}
            <input 
              type="file" 
              id="profilePicture" 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />
            <label 
              htmlFor="profilePicture"
              className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity"
            >
              <Camera className="h-6 w-6 text-white" />
            </label>
          </div>
        </div>
        
        <div className="flex-1 space-y-3">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                value={customerData.name}
                onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter customer name"
                className="pl-10"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={customerData.phone}
              onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="Enter phone number"
              readOnly={isExisting} // Make read-only if it's an existing customer
              required
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email (Optional)</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            value={customerData.email || ''}
            onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="Enter email address"
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="address">Address (Optional)</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Textarea
            id="address"
            value={customerData.address || ''}
            onChange={(e) => setCustomerData(prev => ({ ...prev, address: e.target.value }))}
            placeholder="Enter customer address"
            className="pl-10 pt-2"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <div className="relative">
          <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Textarea
            id="notes"
            value={customerData.notes || ''}
            onChange={(e) => setCustomerData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Add any notes about this customer"
            className="pl-10 pt-2"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="isWhatsApp" 
          checked={customerData.isWhatsApp}
          onCheckedChange={(checked) => handleWhatsAppChange(checked === true)}
        />
        <Label htmlFor="isWhatsApp" className="font-normal">
          This is a WhatsApp number
        </Label>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onBack} disabled={isSaving}>
          Back
        </Button>
        <Button 
          onClick={handleNext}
          disabled={!customerData.name || !customerData.phone || isSaving}
        >
          {isSaving ? "Saving..." : "Next"}
        </Button>
      </div>
    </div>
  );
}
