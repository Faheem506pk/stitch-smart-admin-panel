
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaymentFormData } from './addCustomerFlowTypes';
import { Currency } from 'lucide-react';
import { toast } from "sonner";
import { formatCurrency } from '@/utils/currencyUtils';

interface AddCustomerStepPaymentProps {
  paymentData: PaymentFormData;
  setPaymentData: React.Dispatch<React.SetStateAction<PaymentFormData>>;
  orderTotal: number;
  onComplete: () => void;
  onBack: () => void;
}

export function AddCustomerStepPayment({ 
  paymentData, 
  setPaymentData, 
  orderTotal,
  onComplete, 
  onBack
}: AddCustomerStepPaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Update payment data when component mounts
  useState(() => {
    setPaymentData(prev => ({
      ...prev,
      totalAmount: orderTotal,
      advanceAmount: 0,
      balanceAmount: orderTotal
    }));
  });
  
  const handleAdvanceChange = (value: number) => {
    const advance = Number(value) || 0;
    
    setPaymentData(prev => ({
      ...prev,
      advanceAmount: advance,
      balanceAmount: Math.max(0, prev.totalAmount - advance)
    }));
  };
  
  const handleComplete = () => {
    if (paymentData.advanceAmount > paymentData.totalAmount) {
      toast.error("Advance cannot exceed total amount");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      onComplete();
    } catch (error) {
      console.error("Error completing payment:", error);
      toast.error("Failed to process payment");
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-md p-4 bg-muted/30">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label className="text-xs">Total Amount</Label>
            <div className="text-lg font-semibold">{formatCurrency(paymentData.totalAmount)}</div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Advance Payment</Label>
            <div className="text-lg font-semibold text-green-600">{formatCurrency(paymentData.advanceAmount)}</div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Balance Due</Label>
            <div className="text-lg font-semibold text-amber-600">{formatCurrency(paymentData.balanceAmount)}</div>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="advanceAmount">Advance Amount</Label>
        <div className="relative">
          <Currency className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="advanceAmount"
            type="number"
            min="0"
            step="0.01"
            className="pl-10"
            value={paymentData.advanceAmount || ''}
            onChange={(e) => handleAdvanceChange(parseFloat(e.target.value))}
            placeholder="Enter advance amount"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="paymentMethod">Payment Method</Label>
        <Select
          value={paymentData.paymentMethod}
          onValueChange={(value) => setPaymentData(prev => ({ ...prev, paymentMethod: value as 'cash' | 'other' }))}
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
      
      <div className="space-y-2">
        <Label htmlFor="paymentNotes">Notes (Optional)</Label>
        <Textarea
          id="paymentNotes"
          value={paymentData.notes || ''}
          onChange={(e) => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Add any notes about this payment"
        />
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onBack} disabled={isProcessing}>
          Back
        </Button>
        <Button 
          onClick={handleComplete}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
              Processing...
            </>
          ) : "Complete & Save"}
        </Button>
      </div>
    </div>
  );
}
