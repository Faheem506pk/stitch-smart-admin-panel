
import { useState, useEffect } from 'react';
import { AddCustomerStepCheck } from './AddCustomerStepCheck';
import { AddCustomerStepInfo } from './AddCustomerStepInfo';
import { AddCustomerStepAnimator } from './AddCustomerStepAnimator';
import { Customer, Measurement } from '@/types/models';
import { customerService } from '@/services/customerService';
import { toast } from "sonner";
import { CustomerFormData } from './addCustomerFlowTypes';
import { MeasurementManager } from '@/components/measurements/MeasurementManager';

export interface AddCustomerFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddCustomerFlow({ open, onOpenChange }: AddCustomerFlowProps) {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [existingCustomer, setExistingCustomer] = useState<Customer | null>(null);
  const [customerData, setCustomerData] = useState<CustomerFormData>({ 
    name: '', 
    phone: '', 
    isWhatsApp: false 
  });
  const [isSaving, setIsSaving] = useState(false);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [savedCustomerId, setSavedCustomerId] = useState<string | null>(null);

  // Fetch measurements if customer exists
  useEffect(() => {
    if (existingCustomer) {
      const fetchMeasurements = async () => {
        try {
          const customerMeasurements = await customerService.getCustomerMeasurements(existingCustomer.id);
          setMeasurements(customerMeasurements);
        } catch (error) {
          console.error("Error fetching measurements:", error);
        }
      };

      fetchMeasurements();
    }
  }, [existingCustomer]);

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
        
        toast.success("Customer found! Loading details...");
        setSavedCustomerId(foundCustomer.id);
      } else {
        setExistingCustomer(null);
        toast.info("No customer found with this phone number. You can add a new customer.");
      }
      
      goToNextStep();
    } catch (error) {
      console.error("Error checking customer:", error);
      toast.error("Failed to check customer. Please try again.");
    }
  };

  const handleSaveCustomer = async (): Promise<boolean> => {
    if (!customerData.name || !customerData.phone) {
      toast.error("Please fill in all required fields");
      return false;
    }
    
    setIsSaving(true);
    try {
      const customerId = existingCustomer ? existingCustomer.id : '';
      
      const customerToSave = {
        name: customerData.name,
        phone: customerData.phone,
        email: customerData.email ?? undefined,
        address: customerData.address ?? undefined,
        notes: customerData.notes ?? undefined,
        profilePicture: customerData.profilePicture ?? undefined,
        isWhatsApp: customerData.isWhatsApp,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      let success = false;
      let savedCustomer: Customer | null = null;
      
      if (existingCustomer) {
        success = await customerService.updateCustomer(customerId, customerToSave);
        if (success) {
          toast.success("Customer updated successfully!");
          savedCustomer = { ...existingCustomer, ...customerToSave, id: customerId };
        }
      } else {
        savedCustomer = await customerService.addCustomer(customerToSave);
        success = !!savedCustomer;
        if (success) {
          toast.success("New customer added successfully!");
        }
      }
      
      if (success && savedCustomer) {
        setSavedCustomerId(savedCustomer.id);
        onOpenChange(false); // Close the modal after saving
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error saving customer:", error);
      toast.error("Failed to save customer. Please try again.");
      return false;
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
        
        {/* Show measurements if we found an existing customer */}
        {existingCustomer && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-lg font-medium mb-4">Customer Measurements</h3>
            {measurements.length > 0 ? (
              <MeasurementManager customerId={existingCustomer.id} initialMeasurements={measurements} />
            ) : (
              <p className="text-muted-foreground">No measurements found for this customer.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
