import { Button } from "@/components/ui/button";
import { formatCurrency, parseCurrency, validateCurrencyInput } from "@/utils/currencyUtils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect, useCallback } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { firestoreService } from "@/services/firebase";
import { useTenant } from "@/context/TenantContext";
import { collection, getDocs } from "firebase/firestore";
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
  quantity: number;
  price: number;
}

interface MeasurementType {
  id: string;
  name: string;
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
    { id: "shirt", name: "Shirt", selected: false, quantity: 1, price: 0 },
    { id: "pant", name: "Pant", selected: false, quantity: 1, price: 0 },
    { id: "suit", name: "Suit", selected: false, quantity: 1, price: 0 },
    { id: "dress", name: "Dress", selected: false, quantity: 1, price: 0 },
    { id: "other", name: "Other", selected: false, quantity: 1, price: 0 },
  ]);
  const [measurementTypes, setMeasurementTypes] = useState<MeasurementType[]>([]);
  const [orderId, setOrderId] = useState("");
  const [totalAmount, setTotalAmount] = useState("0");
  const [advanceAmount, setAdvanceAmount] = useState("0");
  const [dueDate, setDueDate] = useState<Date | undefined>(new Date());
  const [notes, setNotes] = useState("");
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const { tenantDb, isTenantConfigured } = useTenant();

  // Generate a unique 6-digit order ID when the dialog opens

  // Fetch measurement types from Firebase
  const fetchMeasurementTypes = useCallback(async () => {
    try {
      if (!tenantDb) return;

      const measurementTypesCollection = collection(tenantDb, "measurementTypes");
      const snapshot = await getDocs(measurementTypesCollection);

      if (snapshot.empty) {
        console.log("No measurement types found in Firestore");
        return;
      }

      const types = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
      }));

      setMeasurementTypes(types);

      // Add custom measurement types to order types
      const customTypes = types.map((type) => ({
        id: type.id,
        name: type.name,
        selected: false,
        quantity: 1,
        price: 0,
      }));

      setOrderTypes((prevTypes) => [...prevTypes, ...customTypes]);
    } catch (error) {
      console.error("Error fetching measurement types:", error);
    }
  }, [tenantDb]);

  // Fetch the last order ID from Firebase and generate the next one
  const fetchLastOrderId = useCallback(async () => {
    try {
      if (!tenantDb) {
        generateOrderId(); // Fallback to random ID if DB not available
        return;
      }

      // Get all orders and sort them by ID
      const orders = await firestoreService.getOrderedDocuments("orders", "id", "desc");

      if (orders && orders.length > 0) {
        // Find the highest order ID
        const highestId = orders.reduce((max, order) => {
          const orderId = parseInt(order.id);
          return isNaN(orderId) ? max : Math.max(max, orderId);
        }, 0);

        // Set the next order ID
        const nextId = (highestId + 1).toString().padStart(6, "0");
        setOrderId(nextId);
        console.log(`Generated sequential order ID: ${nextId} (previous highest: ${highestId})`);
      } else {
        // If no orders exist, start with 1
        setOrderId("000001");
        console.log("No existing orders found, starting with ID: 000001");
      }
    } catch (error) {
      console.error("Error fetching last order ID:", error);
      generateOrderId(); // Fallback to random ID
    }
  }, [tenantDb]);

  // Generate a random order ID (fallback method)
  const generateOrderId = () => {
    // Generate a random 6-digit number
    const randomId = Math.floor(100000 + Math.random() * 900000);
    setOrderId(randomId.toString());
    console.log(`Generated random order ID: ${randomId}`);
  };

  const fetchCustomers = useCallback(async () => {
    try {
      if (!tenantDb) return;

      const customersCollection = collection(tenantDb, "customers");
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
  }, [tenantDb]);

  useEffect(() => {
    if (open && isTenantConfigured) {
      fetchLastOrderId();
      fetchCustomers();
      fetchMeasurementTypes();
    }
  }, [open, isTenantConfigured, fetchLastOrderId, fetchCustomers, fetchMeasurementTypes]);

  const toggleOrderType = (id: string) => {
    setOrderTypes(orderTypes.map((type) => (type.id === id ? { ...type, selected: !type.selected } : type)));

    // Recalculate total amount when order types are toggled
    calculateTotalAmount();
  };

  const updateOrderTypeQuantity = (id: string, quantity: number) => {
    setOrderTypes(orderTypes.map((type) => (type.id === id ? { ...type, quantity } : type)));

    // Recalculate total amount when quantity changes
    calculateTotalAmount();
  };

  const updateOrderTypePrice = (id: string, price: number) => {
    // Ensure price is non-negative and an integer
    const validPrice = Math.max(0, Math.round(price));

    setOrderTypes(orderTypes.map((type) => (type.id === id ? { ...type, price: validPrice } : type)));

    // Recalculate total amount when price changes
    calculateTotalAmount();
  };

  const calculateTotalAmount = () => {
    const total = orderTypes.filter((type) => type.selected).reduce((sum, type) => sum + type.quantity * type.price, 0);

    // Ensure total is non-negative and an integer
    const validTotal = Math.max(0, Math.round(total));
    setTotalAmount(validTotal.toString());
  };

  const getSelectedOrderTypes = () => {
    return orderTypes
      .filter((type) => type.selected)
      .map((type) => type.name)
      .join(", ");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Check if any order type is selected
      const selectedTypes = orderTypes.filter((type) => type.selected);
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
        const selectedCustomer = customers.find((c) => c.id === customerId);
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
      const totalAmountNum = parseInt(totalAmount) || 0;
      const advanceAmountNum = parseInt(advanceAmount) || 0;

      const orderData = {
        id: orderId,
        customerId: finalCustomerId,
        customer: {
          id: finalCustomerId,
          name: customerData?.name || "",
          phone: customerData?.phone || "",
        },
        orderTypes: selectedTypes.map((type) => ({
          id: type.id,
          name: type.name,
          quantity: type.quantity,
          price: type.price,
          total: type.quantity * type.price,
        })),
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
    setOrderTypes(orderTypes.map((type) => ({ ...type, selected: false })));
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

  // Filter customers based on search query
  const filterCustomers = (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setFilteredCustomers([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = customers.filter(
      (customer) => customer.name.toLowerCase().includes(lowerQuery) || customer.phone.toLowerCase().includes(lowerQuery),
    );

    setFilteredCustomers(filtered);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) resetForm();
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New Order #{orderId}</DialogTitle>
            <DialogDescription>Create a new order for a customer. Fill in all required information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {!isNewCustomer ? (
              <div className="grid gap-2">
                <Label htmlFor="customer">Customer</Label>
                <div className="relative">
                  <div className="flex items-center border rounded-md px-3 py-2">
                    <input
                      type="text"
                      placeholder="Search customer by name or phone"
                      className="flex-1 outline-none bg-transparent"
                      onChange={(e) => filterCustomers(e.target.value)}
                    />
                    {customerId && (
                      <div className="bg-primary/10 px-2 py-1 rounded-md text-sm mr-2">
                        {customers.find((c) => c.id === customerId)?.name || "Selected"}
                      </div>
                    )}
                    <Button type="button" variant="ghost" size="sm" onClick={() => (window.location.href = "/customers")} className="ml-2">
                      + New
                    </Button>
                  </div>

                  {filteredCustomers.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredCustomers.map((customer) => (
                        <div
                          key={customer.id}
                          className="px-3 py-2 hover:bg-accent cursor-pointer"
                          onClick={() => {
                            setCustomerId(customer.id);
                            setFilteredCustomers([]);
                          }}
                        >
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-muted-foreground">{customer.phone}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="newCustomerName">New Customer</Label>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setIsNewCustomer(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="newCustomerName">Name</Label>
                  <Input id="newCustomerName" value={newCustomerName} onChange={(e) => setNewCustomerName(e.target.value)} required={isNewCustomer} />
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

            <div className="grid gap-4">
              <Label>Order Types (select all that apply)</Label>
              <div className="space-y-4">
                {orderTypes.map((type) => (
                  <div key={type.id} className="flex flex-col space-y-2 border p-3 rounded-md">
                    <div className="flex items-center space-x-2">
                      <Checkbox id={`type-${type.id}`} checked={type.selected} onCheckedChange={() => toggleOrderType(type.id)} />
                      <Label htmlFor={`type-${type.id}`} className="cursor-pointer font-medium">
                        {type.name}
                      </Label>
                    </div>

                    {type.selected && (
                      <div className="grid grid-cols-2 gap-2 pl-6 mt-2">
                        <div className="space-y-1">
                          <Label htmlFor={`quantity-${type.id}`} className="text-xs">
                            Quantity
                          </Label>
                          <Input
                            id={`quantity-${type.id}`}
                            type="number"
                            min="1"
                            value={type.quantity}
                            onChange={(e) => updateOrderTypeQuantity(type.id, parseInt(e.target.value) || 1)}
                            className="h-8"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`price-${type.id}`} className="text-xs">
                            Price
                          </Label>
                          <Input
                            id={`price-${type.id}`}
                            type="text"
                            value={type.price}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Only allow non-negative integers
                              if (value === "" || validateCurrencyInput(value)) {
                                updateOrderTypePrice(type.id, parseInt(value) || 0);
                              }
                            }}
                            className="h-8"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="totalAmount">Total Amount</Label>
                <Input
                  type="text"
                  id="totalAmount"
                  required
                  value={totalAmount}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Only allow non-negative integers
                    if (value === "" || validateCurrencyInput(value)) {
                      setTotalAmount(value === "" ? "0" : value);
                    }
                  }}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="advanceAmount">Advance Amount</Label>
                <Input
                  type="text"
                  id="advanceAmount"
                  value={advanceAmount}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Only allow non-negative integers
                    if (value === "" || validateCurrencyInput(value)) {
                      setAdvanceAmount(value === "" ? "0" : value);
                    }
                  }}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
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
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
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
