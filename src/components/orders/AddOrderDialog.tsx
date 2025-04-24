
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { firestoreService } from '@/services/firebase';
import { getFirebaseInstances } from '@/services/firebase'; 
import { collection, getDocs } from 'firebase/firestore';

interface Customer {
  id: string;
  name: string;
  phone: string;
}

interface AddOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddOrderDialog({ open, onOpenChange }: AddOrderDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [orderType, setOrderType] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [advanceAmount, setAdvanceAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");

  // Fetch all customers when dialog opens
  useEffect(() => {
    if (open) {
      fetchCustomers();
    }
  }, [open]);

  const fetchCustomers = async () => {
    try {
      const { db } = getFirebaseInstances() || {};
      if (!db) return;

      const customersCollection = collection(db, "customers");
      const snapshot = await getDocs(customersCollection);
      const customersList = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        phone: doc.data().phone,
      }));
      setCustomers(customersList);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast("Failed to load customers", {
        position: "top-center",
        className: "bg-red-500",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Check if adding new customer first
      let finalCustomerId = customerId;
      let customerData = null;
      
      if (isNewCustomer) {
        if (!newCustomerName || !newCustomerPhone) {
          toast("Please fill in customer name and phone", {
            position: "top-center",
            className: "bg-red-500",
          });
          setIsSubmitting(false);
          return;
        }
        
        // Add new customer first
        const newCustomer = await firestoreService.addDocument("customers", {
          name: newCustomerName,
          phone: newCustomerPhone,
          isWhatsApp: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        
        if (!newCustomer || !newCustomer.id) {
          throw new Error("Failed to add new customer");
        }
        
        finalCustomerId = newCustomer.id;
        customerData = newCustomer;
      } else if (!customerId) {
        toast("Please select a customer", {
          position: "top-center",
          className: "bg-red-500",
        });
        setIsSubmitting(false);
        return;
      } else {
        const selectedCustomer = customers.find(c => c.id === customerId);
        customerData = selectedCustomer;
      }

      // Validate required fields
      if (!orderType || !totalAmount || !dueDate) {
        toast("Please fill in all required fields", {
          position: "top-center",
          className: "bg-red-500",
        });
        setIsSubmitting(false);
        return;
      }

      // Prepare order data
      const totalAmountNum = parseFloat(totalAmount);
      const advanceAmountNum = parseFloat(advanceAmount) || 0;

      const orderData = {
        customerId: finalCustomerId,
        customer: {
          id: finalCustomerId,
          name: customerData?.name || "",
          phone: customerData?.phone || "",
        },
        orderType,
        totalAmount: totalAmountNum,
        advanceAmount: advanceAmountNum,
        remainingAmount: totalAmountNum - advanceAmountNum,
        dueDate,
        notes,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save to Firestore
      const result = await firestoreService.addDocument("orders", orderData);
      
      if (!result) {
        throw new Error("Failed to save order data");
      }
      
      toast("Order created successfully!", {
        position: "top-center",
      });
      
      // Reset form and close dialog
      resetForm();
      onOpenChange(false);
      
    } catch (error) {
      console.error("Error creating order:", error);
      toast("Failed to create order", {
        position: "top-center",
        className: "bg-red-500",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const resetForm = () => {
    setCustomerId("");
    setOrderType("");
    setTotalAmount("");
    setAdvanceAmount("");
    setDueDate("");
    setNotes("");
    setIsNewCustomer(false);
    setNewCustomerName("");
    setNewCustomerPhone("");
  };

  const toggleNewCustomer = (value: string) => {
    if (value === "new") {
      setIsNewCustomer(true);
      setCustomerId("");
    } else {
      setIsNewCustomer(false);
      setCustomerId(value);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New Order</DialogTitle>
            <DialogDescription>
              Create a new order for a customer. Fill in all required information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {!isNewCustomer ? (
              <div className="grid gap-2">
                <Label htmlFor="customer">Customer</Label>
                <Select value={customerId} onValueChange={toggleNewCustomer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">+ Add New Customer</SelectItem>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} ({customer.phone})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="newCustomerName">New Customer</Label>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setIsNewCustomer(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="newCustomerName">Name</Label>
                  <Input 
                    id="newCustomerName" 
                    value={newCustomerName} 
                    onChange={(e) => setNewCustomerName(e.target.value)} 
                    required={isNewCustomer}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="newCustomerPhone">Phone</Label>
                  <Input 
                    id="newCustomerPhone" 
                    value={newCustomerPhone} 
                    onChange={(e) => setNewCustomerPhone(e.target.value)} 
                    required={isNewCustomer}
                  />
                </div>
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="type">Order Type</Label>
              <Select value={orderType} onValueChange={setOrderType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select order type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="shirt">Shirt</SelectItem>
                  <SelectItem value="pant">Pant</SelectItem>
                  <SelectItem value="suit">Suit</SelectItem>
                  <SelectItem value="dress">Dress</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="totalAmount">Total Amount</Label>
                <Input
                  type="number"
                  id="totalAmount"
                  required
                  min="0"
                  step="0.01"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="advanceAmount">Advance Amount</Label>
                <Input
                  type="number"
                  id="advanceAmount"
                  min="0"
                  step="0.01"
                  value={advanceAmount}
                  onChange={(e) => setAdvanceAmount(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input 
                type="date" 
                id="dueDate" 
                required 
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea 
                id="notes" 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Order"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
