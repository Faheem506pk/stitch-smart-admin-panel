import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { firestoreService } from '@/services/firebase';
import { getFirebaseInstances } from '@/services/firebase';
import { collection, getDocs } from 'firebase/firestore';

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

interface Order {
  id: string;
  customerId: string;
  customer: {
    id: string;
    name: string;
    phone: string;
  };
  orderTypes: OrderType[];
  orderTypeDisplay: string;
  totalAmount: number;
  advanceAmount: number;
  remainingAmount: number;
  dueDate: string;
  notes?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function EditOrder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [orderTypes, setOrderTypes] = useState<OrderType[]>([]);
  const [dueDate, setDueDate] = useState<Date | undefined>(new Date());
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("pending");
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch order data
  useEffect(() => {
    if (id) {
      fetchOrder(id);
      fetchCustomers();
      fetchMeasurementTypes();
    }
  }, [id]);

  const fetchOrder = async (orderId: string) => {
    setIsLoading(true);
    try {
      const data = await firestoreService.getDocumentById('orders', orderId);
      if (data) {
        const orderData = data as Order;
        setOrder(orderData);
        setCustomerId(orderData.customerId);
        setNotes(orderData.notes || "");
        setStatus(orderData.status);
        setDueDate(new Date(orderData.dueDate));
        
        // Initialize order types
        const initialOrderTypes = [
          { id: "shirt", name: "Shirt", selected: false, quantity: 1, price: 0 },
          { id: "pant", name: "Pant", selected: false, quantity: 1, price: 0 },
          { id: "suit", name: "Suit", selected: false, quantity: 1, price: 0 },
          { id: "dress", name: "Dress", selected: false, quantity: 1, price: 0 },
          { id: "other", name: "Other", selected: false, quantity: 1, price: 0 },
        ];
        
        // Mark selected order types and set their quantities and prices
        const updatedOrderTypes = initialOrderTypes.map(type => {
          const existingType = orderData.orderTypes.find(t => t.id === type.id);
          if (existingType) {
            return {
              ...type,
              selected: true,
              quantity: existingType.quantity,
              price: existingType.price
            };
          }
          return type;
        });
        
        // Add any custom order types that weren't in the initial list
        orderData.orderTypes.forEach(orderType => {
          if (!initialOrderTypes.some(t => t.id === orderType.id)) {
            updatedOrderTypes.push({
              ...orderType,
              selected: true
            });
          }
        });
        
        setOrderTypes(updatedOrderTypes);
      } else {
        toast.error('Order not found');
        navigate('/orders');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order details');
      navigate('/orders');
    } finally {
      setIsLoading(false);
    }
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
      toast.error("Failed to load customers");
    }
  };

  const fetchMeasurementTypes = async () => {
    try {
      const { db } = getFirebaseInstances() || {};
      if (!db) return;

      const measurementTypesCollection = collection(db, "measurementTypes");
      const snapshot = await getDocs(measurementTypesCollection);
      
      if (!snapshot.empty) {
        const types = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          selected: false,
          quantity: 1,
          price: 0
        }));
        
        setOrderTypes(prevTypes => [...prevTypes, ...types]);
      }
    } catch (error) {
      console.error("Error fetching measurement types:", error);
    }
  };

  const toggleOrderType = (id: string) => {
    setOrderTypes(orderTypes.map(type => 
      type.id === id ? { ...type, selected: !type.selected } : type
    ));
    
    // Recalculate total amount when order types are toggled
    calculateTotalAmount();
  };
  
  const updateOrderTypeQuantity = (id: string, quantity: number) => {
    setOrderTypes(orderTypes.map(type => 
      type.id === id ? { ...type, quantity } : type
    ));
    
    // Recalculate total amount when quantity changes
    calculateTotalAmount();
  };
  
  const updateOrderTypePrice = (id: string, price: number) => {
    setOrderTypes(orderTypes.map(type => 
      type.id === id ? { ...type, price } : type
    ));
    
    // Recalculate total amount when price changes
    calculateTotalAmount();
  };
  
  const calculateTotalAmount = () => {
    if (!order) return;
    
    const total = orderTypes
      .filter(type => type.selected)
      .reduce((sum, type) => sum + (type.quantity * type.price), 0);
    
    setOrder({
      ...order,
      totalAmount: total,
      remainingAmount: total - order.advanceAmount
    });
  };

  const getSelectedOrderTypes = () => {
    return orderTypes.filter(type => type.selected).map(type => type.name).join(", ");
  };

  const filterCustomers = (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredCustomers([]);
      return;
    }
    
    const lowerQuery = query.toLowerCase();
    const filtered = customers.filter(
      customer => 
        customer.name.toLowerCase().includes(lowerQuery) || 
        customer.phone.toLowerCase().includes(lowerQuery)
    );
    
    setFilteredCustomers(filtered);
  };

  const handleSave = async () => {
    if (!order) return;
    
    setIsSaving(true);
    try {
      // Check if any order type is selected
      const selectedTypes = orderTypes.filter(type => type.selected);
      if (selectedTypes.length === 0) {
        toast.error("Please select at least one order type");
        setIsSaving(false);
        return;
      }

      // Check if customer is selected
      if (!customerId) {
        toast.error("Please select a customer");
        setIsSaving(false);
        return;
      }

      // Validate required fields
      if (!dueDate) {
        toast.error("Please select a due date");
        setIsSaving(false);
        return;
      }

      // Get customer data
      const selectedCustomer = customers.find(c => c.id === customerId);
      if (!selectedCustomer) {
        toast.error("Selected customer not found");
        setIsSaving(false);
        return;
      }

      // Calculate totals
      const totalAmount = selectedTypes.reduce((sum, type) => sum + (type.quantity * type.price), 0);
      const remainingAmount = totalAmount - order.advanceAmount;

      // Prepare order data
      const updatedOrder = {
        ...order,
        customerId,
        customer: {
          id: customerId,
          name: selectedCustomer.name,
          phone: selectedCustomer.phone,
        },
        orderTypes: selectedTypes.map(type => ({
          id: type.id,
          name: type.name,
          quantity: type.quantity,
          price: type.price,
          total: type.quantity * type.price
        })),
        orderTypeDisplay: getSelectedOrderTypes(),
        totalAmount,
        remainingAmount,
        dueDate: dueDate.toISOString(),
        notes,
        status,
        updatedAt: new Date().toISOString(),
      };

      // Save to Firestore
      const success = await firestoreService.updateDocument('orders', id!, updatedOrder);
      
      if (success) {
        toast.success("Order updated successfully!");
        navigate(`/orders/${id}`);
      } else {
        toast.error("Failed to update order");
      }
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !order) {
    return (
      <Layout>
        <div className="container mx-auto py-6">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/orders')}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">Loading Order...</h1>
          </div>
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(`/orders/${id}`)}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Edit Order #{parseInt(order.id).toString()}</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
            <CardDescription>Update the order information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Customer Selection */}
            <div className="space-y-2">
              <Label htmlFor="customer">Customer</Label>
              <div className="relative">
                <div className="flex items-center border rounded-md px-3 py-2">
                  <input
                    type="text"
                    placeholder="Search customer by name or phone"
                    className="flex-1 outline-none bg-transparent"
                    onChange={(e) => filterCustomers(e.target.value)}
                    defaultValue={order.customer.name}
                  />
                  {customerId && (
                    <div className="bg-primary/10 px-2 py-1 rounded-md text-sm mr-2">
                      {customers.find(c => c.id === customerId)?.name || order.customer.name}
                    </div>
                  )}
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

            {/* Order Types */}
            <div className="space-y-2">
              <Label>Order Types</Label>
              <div className="space-y-4">
                {orderTypes.map((type) => (
                  <div key={type.id} className="flex flex-col space-y-2 border p-3 rounded-md">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id={`type-${type.id}`} 
                        checked={type.selected}
                        onCheckedChange={() => toggleOrderType(type.id)}
                      />
                      <Label htmlFor={`type-${type.id}`} className="cursor-pointer font-medium">
                        {type.name}
                      </Label>
                    </div>
                    
                    {type.selected && (
                      <div className="grid grid-cols-2 gap-2 pl-6 mt-2">
                        <div className="space-y-1">
                          <Label htmlFor={`quantity-${type.id}`} className="text-xs">Quantity</Label>
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
                          <Label htmlFor={`price-${type.id}`} className="text-xs">Price</Label>
                          <Input
                            id={`price-${type.id}`}
                            type="number"
                            min="0"
                            step="0.01"
                            value={type.price}
                            onChange={(e) => {
                              // Allow empty string for backspace to work
                              const value = e.target.value;
                              if (value === '') {
                                updateOrderTypePrice(type.id, 0);
                              } else {
                                updateOrderTypePrice(type.id, parseFloat(value) || 0);
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

            {/* Payment Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Total Amount</Label>
                <div className="text-lg font-medium">${order.totalAmount.toFixed(2)}</div>
                <p className="text-sm text-muted-foreground">
                  Calculated from selected items
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Advance Paid</Label>
                <div className="text-lg font-medium">${order.advanceAmount.toFixed(2)}</div>
                <p className="text-sm text-muted-foreground">
                  Cannot be modified here
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Remaining</Label>
                <div className="text-lg font-medium">${order.remainingAmount.toFixed(2)}</div>
                <p className="text-sm text-muted-foreground">
                  Use the Payments tab to record payments
                </p>
              </div>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
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
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea 
                id="notes" 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => navigate(`/orders/${id}`)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
}
