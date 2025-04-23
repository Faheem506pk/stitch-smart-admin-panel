
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrderFormData, PaymentFormData } from './addCustomerFlowTypes';
import { DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AddCustomerStepPaymentProps {
  paymentData: PaymentFormData;
  setPaymentData: React.Dispatch<React.SetStateAction<PaymentFormData>>;
  orderData: OrderFormData;
  onComplete: () => void;
  onBack: () => void;
  isSaving: boolean;
}

export function AddCustomerStepPayment({ 
  paymentData, 
  setPaymentData,
  orderData,
  onComplete, 
  onBack,
  isSaving
}: AddCustomerStepPaymentProps) {
  const { toast } = useToast();
  
  // Calculate total order amount based on items
  useEffect(() => {
    const total = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setPaymentData(prev => ({ 
      ...prev, 
      totalAmount: total,
      balanceAmount: total - prev.advanceAmount
    }));
  }, [orderData.items, setPaymentData]);
  
  const handleAdvanceChange = (value: number) => {
    const advance = isNaN(value) ? 0 : value;
    setPaymentData(prev => ({ 
      ...prev, 
      advanceAmount: advance,
      balanceAmount: prev.totalAmount - advance
    }));
  };

  const handleComplete = async () => {
    if (paymentData.advanceAmount > paymentData.totalAmount) {
      toast({
        title: "Error",
        description: "Advance amount cannot be greater than total amount",
        variant: "destructive"
      });
      return;
    }
    
    // Call parent's onComplete function to save data to Firebase
    onComplete();
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-2">
        <DollarSign className="h-5 w-5 text-primary" />
        <p className="text-muted-foreground">
          Record payment details for this order.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="totalAmount">Total Amount</Label>
          <Input
            id="totalAmount"
            type="number"
            min="0"
            step="0.01"
            value={paymentData.totalAmount}
            onChange={(e) => setPaymentData(prev => ({ 
              ...prev, 
              totalAmount: parseFloat(e.target.value) || 0,
              balanceAmount: (parseFloat(e.target.value) || 0) - prev.advanceAmount
            }))}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="advanceAmount">Advance Amount</Label>
          <Input
            id="advanceAmount"
            type="number"
            min="0"
            max={paymentData.totalAmount}
            step="0.01"
            value={paymentData.advanceAmount}
            onChange={(e) => handleAdvanceChange(parseFloat(e.target.value))}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="balanceAmount">Balance Amount</Label>
          <Input
            id="balanceAmount"
            type="number"
            value={paymentData.balanceAmount}
            readOnly
            className="bg-muted"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="paymentMethod">Payment Method</Label>
          <Select
            value={paymentData.paymentMethod}
            onValueChange={(value) => setPaymentData(prev => ({ 
              ...prev, 
              paymentMethod: value as 'cash' | 'other'
            }))}
          >
            <SelectTrigger id="paymentMethod">
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="rounded-md bg-primary/10 p-4 mt-4">
        <h4 className="font-medium mb-2">Payment Summary</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>Total Order Value:</div>
          <div className="font-medium text-right">${paymentData.totalAmount.toFixed(2)}</div>
          
          <div>Advance Paid:</div>
          <div className="font-medium text-right">${paymentData.advanceAmount.toFixed(2)}</div>
          
          <div className="border-t pt-1 mt-1">Remaining Balance:</div>
          <div className="font-medium text-right border-t pt-1 mt-1">${paymentData.balanceAmount.toFixed(2)}</div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onBack} disabled={isSaving}>
          Back
        </Button>
        <Button 
          onClick={handleComplete}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Complete"}
        </Button>
      </div>
    </div>
  );
}
