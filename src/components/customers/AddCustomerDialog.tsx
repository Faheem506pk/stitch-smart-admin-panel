
import { AddCustomerFlow } from './AddCustomerFlow';

interface AddCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddCustomerDialog({ open, onOpenChange }: AddCustomerDialogProps) {
  return (
    <AddCustomerFlow 
      open={open} 
      onOpenChange={onOpenChange} 
    />
  );
}
