
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AddCustomerStepFinishProps {
  customerName: string;
  customerId: string | null;
  onClose: () => void;
}

export function AddCustomerStepFinish({ 
  customerName, 
  customerId,
  onClose 
}: AddCustomerStepFinishProps) {
  const navigate = useNavigate();
  
  const handleViewCustomer = () => {
    onClose();
    // Navigate to customer details page if you have one
    if (customerId) {
      navigate(`/customers?selected=${customerId}`);
    } else {
      navigate('/customers');
    }
  };
  
  return (
    <div className="text-center py-8">
      <div className="mb-4 flex justify-center">
        <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
          <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-300" />
        </div>
      </div>
      
      <h3 className="text-xl font-medium mb-2">
        {customerName} has been added successfully!
      </h3>
      
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        The customer has been added to your database along with all their details and order information.
      </p>
      
      <div className="flex justify-center space-x-3">
        <Button variant="outline" onClick={onClose}>
          Return to Dashboard
        </Button>
        <Button onClick={handleViewCustomer}>
          View Customer
        </Button>
      </div>
    </div>
  );
}
