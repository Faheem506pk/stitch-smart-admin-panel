
import {
  Dialog,
  DialogContent,
  DialogOverlay
} from '@/components/ui/dialog';
import { AddCustomerFlow } from './AddCustomerFlow';

interface AddCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddCustomerDialog({ open, onOpenChange }: AddCustomerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogOverlay />
      <DialogContent className="p-0 border-none bg-transparent max-w-3xl">
        <AddCustomerFlow 
          open={open} 
          onOpenChange={onOpenChange} 
        />
      </DialogContent>
    </Dialog>
  );
}
