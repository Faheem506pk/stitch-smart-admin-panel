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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { firestoreService } from '@/services/firebase';
import { getFirebaseInstances } from '@/services/firebase'; 
import { collection, getDocs } from 'firebase/firestore';
import { Checkbox } from "@/components/ui/checkbox";

interface Customer {
  id: string;
  name: string;
  phone: string;
}

interface OrderType {
  id: string;
  name: string;
  selected: boolean;
}

interface AddOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddOrderDialog({ open, onOpenChange }: AddOrderDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [orderTypes, setOrderTypes] = useState<OrderType[]>([
    { id: "shirt", name: "Shirt", selected: false },
    { id: "pant", name: "Pant", selected: false },
    { id: "suit", name: "Suit", selected: false },
    { id: "dress", name: "Dress", selected: false },
    { id: "other", name: "Other", selected: false },
  ]);
  const [orderId, setOrderId] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [advanceAmount, setAdvanceAmount] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>(new Date());
  const [notes, setNotes] = useState("");
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");

  // Generate a unique 6-digit order ID when the dialog opens
  useEffect(() => {
    if (open) {
      generateOrderId();
      fetchCustomers();
    }
  }, [open]);
  
  // Generate a unique 6-digit order ID
  const generateOrderId = () => {
    // Generate a random 6-digit number
    const randomId = Math.floor(100000 + Math.random() * 900000);
    setOrderId(randomId.toString());
  };

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

  const toggleOrderType = (id: string) => {
    setOrderTypes(orderTypes.map(type => 
      type.id === id ? { ...type, selected: !type.selected } : type
    ));
  };

  const getSelectedOrderTypes = () => {
    return orderTypes.filter(type => type.selected).map(type => type.name).join(", ");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Check if any order type is selected
      const selectedTypes = orderTypes.filter(type => type.selected);
      if (selectedTypes.length === 0) {
        toast("Please select at least one order type", {
          position: "top-center",
          className: "bg-red-500",
        });
        setIsSubmitting(false);
        return;
      }

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
      if (!totalAmount || !dueDate) {
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
        id: orderId,
        customerId: finalCustomerId,
        customer: {
          id: finalCustomerId,
          name: customerData?.name || "",
          phone: customerData?.phone || "",
        },
        orderTypes: selectedTypes.map(type => type.id),
        orderTypeDisplay: getSelectedOrderTypes(),
        totalAmount: totalAmountNum,
        advanceAmount: advanceAmountNum,
        remainingAmount: totalAmountNum - advanceAmountNum,
        dueDate: dueDate ? dueDate.toISOString() : new Date().toISOString(),
        notes,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save to Firestore
      const result = await firestoreService.addDocumentWithId("orders", orderId, orderData);
      
      if (!result) {
        throw new Error("Failed to save order data");
      }
      
      toast.success(`Order #${orderId} created successfully!`);
      
      // Reset form and close dialog
      resetForm();
      onOpenChange(false);
      
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to create order");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const resetForm = () => {
    setCustomerId("");
    setOrderTypes(orderTypes.map(type => ({ ...type, selected: false })));
    setTotalAmount("");
    setAdvanceAmount("");
    setDueDate(new Date());
    setNotes("");
    setIsNewCustomer(false);
    setNewCustomerName("");
    setNewCustomerPhone("");
    generateOrderId();
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
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetForm();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New Order #{orderId}</DialogTitle>
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
              <Label>Order Types (select all that apply)</Label>
              <div className="grid grid-cols-2 gap-2">
                {orderTypes.map((type) => (
                  <div key={type.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`type-${type.id}`} 
                      checked={type.selected}
                      onCheckedChange={() => toggleOrderType(type.id)}
                    />
                    <Label htmlFor={`type-${type.id}`} className="cursor-pointer">
                      {type.name}
                    </Label>
                  </div>
                ))}
              </div>
              {orderTypes.some(type => type.selected) && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {orderTypes
                    .filter(type => type.selected)
                    .map(type => (
                      <Badge key={type.id} variant="outline" className="bg-primary/10">
                        {type.name}
                      </Badge>
                    ))
                  }
                </div>
              )}
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
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
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
