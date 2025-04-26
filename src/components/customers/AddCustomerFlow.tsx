
import { useState, useEffect } from 'react';
import { AddCustomerStepCheck } from './AddCustomerStepCheck';
import { AddCustomerStepInfo } from './AddCustomerStepInfo';
import { AddCustomerStepMeasurements } from './AddCustomerStepMeasurements';
import { AddCustomerStepAnimator } from './AddCustomerStepAnimator';
import { AddCustomerStepOrder } from './AddCustomerStepOrder';
import { AddCustomerStepPayment } from './AddCustomerStepPayment';
import { Customer, Measurement } from '@/types/models';
import { customerService } from '@/services/customerService';
import { toast } from "sonner";
import { CustomerFormData, MeasurementFormData, OrderFormData, PaymentFormData } from './addCustomerFlowTypes';
import { MeasurementManager } from '@/components/measurements/MeasurementManager';
import { ScrollArea } from '@/components/ui/scroll-area';

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
    isWhatsApp: false,
    profilePicture: null
  });
  const [isSaving, setIsSaving] = useState(false);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [savedCustomerId, setSavedCustomerId] = useState<string | null>(null);
  const [measurementData, setMeasurementData] = useState<MeasurementFormData>({
    type: 'shirt',
    values: {}
  });
  const [orderData, setOrderData] = useState<OrderFormData>({
    items: [],
    totalAmount: 0,
    advanceAmount: 0,
    balanceAmount: 0,
    status: 'pending',
    dueDate: ''
  });
  const [paymentData, setPaymentData] = useState<PaymentFormData>({
    totalAmount: 0,
    advanceAmount: 0,
    balanceAmount: 0,
    paymentMethod: 'cash'
  });

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
        email: customerData.email ?? null,
        address: customerData.address ?? null,
        notes: customerData.notes ?? null,
        profilePicture: customerData.profilePicture ?? null,
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

  const handleSaveMeasurement = async () => {
    if (!savedCustomerId) {
      toast.error("Please save customer first");
      return false;
    }

    try {
      if (measurementData.type && Object.keys(measurementData.values).length > 0) {
        const measurementToSave = {
          customerId: savedCustomerId,
          type: measurementData.type,
          values: measurementData.values,
          notes: measurementData.notes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        await customerService.addCustomerMeasurement(measurementToSave);
        toast.success("Measurement added successfully!");
        goToNextStep();
        return true;
      } else {
        // If no measurements to save, just proceed
        goToNextStep();
        return true;
      }
    } catch (error) {
      console.error("Error saving measurement:", error);
      toast.error("Failed to save measurement. Please try again.");
      return false;
    }
  };

  const handleSaveOrder = async () => {
    if (!savedCustomerId) {
      toast.error("Please save customer first");
      return false;
    }

    try {
      // Update payment data based on order data
      setPaymentData({
        totalAmount: orderData.totalAmount,
        advanceAmount: orderData.advanceAmount,
        balanceAmount: orderData.balanceAmount,
        paymentMethod: 'cash'
      });

      goToNextStep();
      return true;
    } catch (error) {
      console.error("Error preparing order:", error);
      toast.error("Failed to prepare order. Please try again.");
      return false;
    }
  };

  const handleCompleteFlow = async () => {
    if (!savedCustomerId) {
      toast.error("Error with customer data");
      return;
    }

    try {
      if (orderData.items.length > 0) {
        const orderToSave = {
          customerId: savedCustomerId,
          items: orderData.items,
          status: orderData.status,
          totalAmount: orderData.totalAmount,
          advanceAmount: paymentData.advanceAmount,
          balanceAmount: paymentData.balanceAmount,
          dueDate: orderData.dueDate,
          notes: orderData.notes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'current-user-id', // This should come from auth context
          lastUpdatedBy: 'current-user-id' // This should come from auth context
        };

        const savedOrder = await customerService.addOrder(orderToSave);
        if (savedOrder && paymentData.advanceAmount > 0) {
          const paymentToSave = {
            orderId: savedOrder.id,
            amount: paymentData.advanceAmount,
            paymentMethod: paymentData.paymentMethod,
            date: new Date().toISOString(),
            notes: paymentData.notes,
            receivedBy: 'current-user-id' // This should come from auth context
          };
          await customerService.addPayment(paymentToSave);
        }

        toast.success("Order and payment processed successfully!");
      }

      // Complete the flow and close the modal
      onOpenChange(false);
    } catch (error) {
      console.error("Error completing flow:", error);
      toast.error("Failed to complete. Please try again.");
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
            onSave={async () => {
              const success = await handleSaveCustomer();
              if (success) goToNextStep();
              return success;
            }}
            onBack={goToPreviousStep}
            isExisting={!!existingCustomer}
            isSaving={isSaving}
          />
        );
      case 3:
        return (
          <AddCustomerStepMeasurements
            measurementData={measurementData}
            setMeasurementData={setMeasurementData}
            onNext={handleSaveMeasurement}
            onBack={goToPreviousStep}
            onSkip={() => goToNextStep()}
            customerId={savedCustomerId}
            isExisting={!!existingCustomer}
          />
        );
      case 4:
        return (
          <AddCustomerStepOrder
            orderData={orderData}
            setOrderData={setOrderData}
            onNext={handleSaveOrder}
            onBack={goToPreviousStep}
            onSkip={() => goToNextStep()}
          />
        );
      case 5:
        return (
          <AddCustomerStepPayment
            paymentData={paymentData}
            setPaymentData={setPaymentData}
            orderTotal={orderData.totalAmount}
            onComplete={handleCompleteFlow}
            onBack={goToPreviousStep}
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
            <h2 className="text-xl font-bold px-4">
              {step === 1 ? "Check Customer" : existingCustomer ? "Update Customer" : "Add New Customer"}
            </h2>
          </div>
        </div>
        
        <ScrollArea className="h-[60vh] pr-4">
          <div className="px-4">
            <AddCustomerStepAnimator step={step} direction={direction}>
              {renderStep()}
            </AddCustomerStepAnimator>
            
            {existingCustomer && step <= 3 && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-lg font-medium mb-4">Customer Measurements</h3>
                <ScrollArea className="h-[300px]">
                  {measurements.length > 0 ? (
                    <MeasurementManager customerId={existingCustomer.id} initialMeasurements={measurements} />
                  ) : (
                    <p className="text-muted-foreground">No measurements found for this customer.</p>
                  )}
                </ScrollArea>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
