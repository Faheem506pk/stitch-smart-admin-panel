
import { useState } from 'react';
import { AddCustomerStepCheck } from './AddCustomerStepCheck';
import { AddCustomerStepInfo } from './AddCustomerStepInfo';
import { AddCustomerStepAnimator } from './AddCustomerStepAnimator';
import { Customer } from '@/types/models';
import { customerService } from '@/services/customerService';
import { useToast } from '@/hooks/use-toast';
import { CustomerFormData } from './addCustomerFlowTypes';

export interface AddCustomerFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddCustomerFlow({ open, onOpenChange }: AddCustomerFlowProps) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [existingCustomer, setExistingCustomer] = useState<Customer | null>(null);
  const [customerData, setCustomerData] = useState<CustomerFormData>({ 
    name: '', 
    phone: '', 
    isWhatsApp: false 
  });
  const [isSaving, setIsSaving] = useState(false);

  const goToNextStep = () => {
    setDirection('forward');
    setStep(step + 1);
  };

  const goToPreviousStep = () => {
    setDirection('backward');
    setStep(step - 1);
  };

  const handleCheckCustomer = async (phone: string, isWhatsApp: boolean) => {
    setCustomerData(prev => ({ ...prev, phone, isWhatsApp }));
    
    try {
      const foundCustomer = await customerService.getCustomerByPhone(phone);
      
      if (foundCustomer) {
        setExistingCustomer(foundCustomer);
        setCustomerData({
          id: foundCustomer.id,
          name: foundCustomer.name,
          phone: foundCustomer.phone,
          email: foundCustomer.email,
          address: foundCustomer.address,
          isWhatsApp: foundCustomer.isWhatsApp || isWhatsApp,
          profilePicture: foundCustomer.profilePicture,
          notes: foundCustomer.notes
        });
        
        toast({
          title: "Customer Found",
          description: "We found an existing customer with this phone number."
        });
      } else {
        setExistingCustomer(null);
        toast({
          title: "New Customer",
          description: "No customer found with this phone number. You can add a new customer."
        });
      }
      
      goToNextStep();
    } catch (error) {
      console.error("Error checking customer:", error);
      toast({
        title: "Error",
        description: "Failed to check customer. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSaveCustomer = async () => {
    if (!customerData.name || !customerData.phone) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    try {
      const customerId = existingCustomer ? existingCustomer.id : '';
      
      const customerToSave = {
        name: customerData.name,
        phone: customerData.phone,
        email: customerData.email,
        address: customerData.address,
        notes: customerData.notes ?? null,
        profilePicture: customerData.profilePicture ?? null, // ✅ Fix here
        isWhatsApp: customerData.isWhatsApp,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      

      let success;
      
      if (existingCustomer) {
        success = await customerService.updateCustomer(customerId, customerToSave);
        if (success) {
          toast({
            title: "Success!",
            description: "Customer updated successfully."
          });
        }
      } else {
        const savedCustomer = await customerService.addCustomer(customerToSave);
        success = !!savedCustomer;
        if (success) {
          toast({
            title: "Success!",
            description: "New customer added successfully."
          });
        }
      }
      
      if (success) {
        onOpenChange(false); // Close the modal
      }
    } catch (error) {
      console.error("Error saving customer:", error);
      toast({
        title: "Error",
        description: "Failed to save customer. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <AddCustomerStepCheck
            onCheck={handleCheckCustomer}
            onCancel={() => onOpenChange(false)}
          />
        );
      case 2:
        return (
          <AddCustomerStepInfo
            customerData={customerData}
            setCustomerData={setCustomerData}
            onSave={handleSaveCustomer}
            onBack={goToPreviousStep}
            isExisting={!!existingCustomer}
            isSaving={isSaving}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-background border rounded-lg shadow-lg w-full overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">
              {step === 1 ? "Check Customer" : existingCustomer ? "Update Customer" : "Add New Customer"}
            </h2>
          </div>
        </div>
        <AddCustomerStepAnimator step={step} direction={direction}>
          {renderStep()}
        </AddCustomerStepAnimator>
      </div>
    </div>
  );
}
