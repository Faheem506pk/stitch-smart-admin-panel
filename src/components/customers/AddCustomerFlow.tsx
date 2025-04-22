import { useState, useEffect } from 'react';
import { AddCustomerStepCheck } from './AddCustomerStepCheck';
import { AddCustomerStepInfo } from './AddCustomerStepInfo';
import { AddCustomerStepMeasurements } from './AddCustomerStepMeasurements';
import { AddCustomerStepOrder } from './AddCustomerStepOrder';
import { AddCustomerStepPayment } from './AddCustomerStepPayment';
import { AddCustomerStepFinish } from './AddCustomerStepFinish';
import { Customer } from '@/types/models';
import { AnimatePresence, motion } from 'framer-motion';
import { firestoreService } from '@/services/firebase';
import { useToast } from '@/hooks/use-toast';
import { useStore } from '@/store/useStore';

export type CustomerFormData = {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  isWhatsApp: boolean;
  profilePicture?: string;
  notes?: string;
};

export type MeasurementFormData = {
  type: 'shirt' | 'pant' | 'suit' | 'dress' | 'other';
  values: Record<string, number>;
  notes?: string;
};

export type OrderFormData = {
  items: {
    type: 'shirt' | 'pant' | 'suit' | 'dress' | 'other';
    quantity: number;
    price: number;
    description: string;
    fabricDetails?: string;
  }[];
  dueDate: string;
  status: 'pending' | 'stitching' | 'ready' | 'delivered';
  notes?: string;
};

export type PaymentFormData = {
  totalAmount: number;
  advanceAmount: number;
  balanceAmount: number;
  paymentMethod: 'cash' | 'other';
};

interface AddCustomerFlowProps {
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
  const [measurementData, setMeasurementData] = useState<MeasurementFormData>({
    type: 'shirt',
    values: {}
  });
  const [orderData, setOrderData] = useState<OrderFormData>({
    items: [],
    dueDate: '',
    status: 'pending',
    notes: ''
  });
  const [paymentData, setPaymentData] = useState<PaymentFormData>({
    totalAmount: 0,
    advanceAmount: 0,
    balanceAmount: 0,
    paymentMethod: 'cash'
  });
  const [savedCustomerId, setSavedCustomerId] = useState<string | null>(null);
  const [saveInProgress, setSaveInProgress] = useState(false);
  const [skipToFinish, setSkipToFinish] = useState(false);

  const isOnline = useStore(state => state.isOnline);
  
  useEffect(() => {
    if (!isOnline && open) {
      const formProgress = {
        step,
        customerData,
        measurementData,
        orderData,
        paymentData
      };
      localStorage.setItem('addCustomerFormProgress', JSON.stringify(formProgress));
    }
  }, [isOnline, step, customerData, measurementData, orderData, paymentData, open]);

  useEffect(() => {
    if (isOnline && open) {
      const storedProgress = localStorage.getItem('addCustomerFormProgress');
      if (storedProgress) {
        try {
          const progress = JSON.parse(storedProgress);
          setStep(progress.step || 1);
          setCustomerData(progress.customerData || { name: '', phone: '', isWhatsApp: false });
          setMeasurementData(progress.measurementData || { type: 'shirt', values: {} });
          setOrderData(progress.orderData || { items: [], dueDate: '', status: 'pending', notes: '' });
          setPaymentData(progress.paymentData || { totalAmount: 0, advanceAmount: 0, balanceAmount: 0, paymentMethod: 'cash' });
          
          toast({
            title: "Form Progress Restored",
            description: "Your previous form progress has been restored.",
          });
          
          localStorage.removeItem('addCustomerFormProgress');
        } catch (error) {
          console.error("Error restoring form progress:", error);
        }
      }
    }
  }, [isOnline, open, toast]);

  useEffect(() => {
    if (!open) {
      setStep(1);
      setDirection('forward');
      setExistingCustomer(null);
      setCustomerData({ name: '', phone: '', isWhatsApp: false });
      setMeasurementData({ type: 'shirt', values: {} });
      setOrderData({ items: [], dueDate: '', status: 'pending', notes: '' });
      setPaymentData({ totalAmount: 0, advanceAmount: 0, balanceAmount: 0, paymentMethod: 'cash' });
      setSavedCustomerId(null);
      setSkipToFinish(false);
    }
  }, [open]);

  const goToNextStep = () => {
    setDirection('forward');
    setStep(step + 1);
  };

  const goToPreviousStep = () => {
    setDirection('backward');
    setStep(step - 1);
  };

  const handleSaveCustomer = async () => {
    setSaveInProgress(true);
    try {
      const customerId = existingCustomer ? existingCustomer.id : '';
      
      const customerToSave = {
        name: customerData.name,
        phone: customerData.phone,
        email: customerData.email,
        address: customerData.address,
        notes: customerData.notes,
        profilePicture: customerData.profilePicture,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      let savedCustomer;
      
      if (existingCustomer) {
        await firestoreService.updateDocument('customers', customerId, customerToSave);
        savedCustomer = { id: customerId, ...customerToSave };
      } else {
        savedCustomer = await firestoreService.addDocument('customers', customerToSave);
      }

      if (savedCustomer && savedCustomer.id) {
        setSavedCustomerId(savedCustomer.id);
        
        if (Object.keys(measurementData.values).length > 0) {
          await firestoreService.addDocument('measurements', {
            customerId: savedCustomer.id,
            type: measurementData.type,
            values: measurementData.values,
            notes: measurementData.notes,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
        
        if (orderData.items.length > 0) {
          const orderId = await firestoreService.addDocument('orders', {
            customerId: savedCustomer.id,
            items: orderData.items,
            status: orderData.status,
            totalAmount: paymentData.totalAmount,
            advanceAmount: paymentData.advanceAmount,
            balanceAmount: paymentData.balanceAmount,
            dueDate: orderData.dueDate,
            notes: orderData.notes,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: "current-user",
            lastUpdatedBy: "current-user"
          });
          
          if (orderId && paymentData.advanceAmount > 0) {
            await firestoreService.addDocument('payments', {
              orderId: orderId.id,
              amount: paymentData.advanceAmount,
              paymentMethod: paymentData.paymentMethod,
              date: new Date().toISOString(),
              receivedBy: "current-user"
            });
          }
        }
        
        toast({
          title: "Success!",
          description: existingCustomer 
            ? "Customer updated successfully." 
            : "New customer added successfully.",
        });
        
        setSkipToFinish(true);
        goToNextStep();
      }
    } catch (error) {
      console.error("Error saving customer data:", error);
      toast({
        title: "Error",
        description: "Failed to save customer data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaveInProgress(false);
    }
  };

  useEffect(() => {
    if (skipToFinish && step < 6) {
      setStep(6);
    }
  }, [skipToFinish, step]);

  const handleCheckCustomer = async (phone: string, isWhatsApp: boolean) => {
    setCustomerData(prev => ({ ...prev, phone, isWhatsApp }));
    
    try {
      const customers = await firestoreService.getDocuments('customers');
      
      type FirestoreCustomer = {
        id: string;
        name?: string;
        phone?: string;
        email?: string;
        address?: string;
        profilePicture?: string;
        notes?: string;
        createdAt?: string;
        updatedAt?: string;
      };
      
      const foundCustomer = (customers as FirestoreCustomer[]).find(c => c.phone === phone);
      
      if (foundCustomer) {
        const validCustomer: Customer = {
          id: foundCustomer.id || '',
          name: foundCustomer.name || '',
          phone: foundCustomer.phone || '',
          email: foundCustomer.email || '',
          address: foundCustomer.address || '',
          profilePicture: foundCustomer.profilePicture || '',
          notes: foundCustomer.notes || '',
          createdAt: foundCustomer.createdAt || new Date().toISOString(),
          updatedAt: foundCustomer.updatedAt || new Date().toISOString()
        };
        
        setExistingCustomer(validCustomer);
        setCustomerData({
          name: validCustomer.name,
          phone: validCustomer.phone,
          email: validCustomer.email,
          address: validCustomer.address,
          isWhatsApp,
          profilePicture: validCustomer.profilePicture,
          notes: validCustomer.notes
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
            onNext={goToNextStep}
            onBack={goToPreviousStep}
            isExisting={!!existingCustomer}
          />
        );
      case 3:
        return (
          <AddCustomerStepMeasurements
            measurementData={measurementData}
            setMeasurementData={setMeasurementData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );
      case 4:
        return (
          <AddCustomerStepOrder
            orderData={orderData}
            setOrderData={setOrderData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
            onSkip={() => {
              handleSaveCustomer();
            }}
          />
        );
      case 5:
        return (
          <AddCustomerStepPayment
            paymentData={paymentData}
            setPaymentData={setPaymentData}
            orderData={orderData}
            onComplete={handleSaveCustomer}
            onBack={goToPreviousStep}
            isSaving={saveInProgress}
          />
        );
      case 6:
        return (
          <AddCustomerStepFinish
            customerName={customerData.name}
            customerId={savedCustomerId}
            onClose={() => onOpenChange(false)}
          />
        );
      default:
        return null;
    }
  };

  const variants = {
    enter: (direction: 'forward' | 'backward') => ({
      x: direction === 'forward' ? 300 : -300,
      opacity: 0,
      rotateY: direction === 'forward' ? 45 : -45,
    }),
    center: {
      x: 0,
      opacity: 1,
      rotateY: 0,
    },
    exit: (direction: 'forward' | 'backward') => ({
      x: direction === 'forward' ? -300 : 300,
      opacity: 0,
      rotateY: direction === 'forward' ? -45 : 45,
    }),
  };

  return (
    <div className="bg-background border rounded-lg shadow-lg w-full overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">
              {step === 1 ? "Add New Customer" : 
               step === 2 ? (existingCustomer ? "Edit Customer" : "Customer Details") : 
               step === 3 ? "Measurements" : 
               step === 4 ? "Create Order" : 
               step === 5 ? "Payment Details" : "Customer Added"}
            </h2>
            {step < 6 && (
              <div className="mt-1 flex space-x-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div 
                    key={s}
                    className={`h-1.5 rounded-full w-12 ${
                      s === step ? 'bg-primary' : 
                      s < step ? 'bg-primary/70' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
              rotateY: { duration: 0.4 }
            }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
