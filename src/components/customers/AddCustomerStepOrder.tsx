
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Card,
  CardContent,
} from "@/components/ui/card";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { OrderFormData, OrderItemFormData } from './addCustomerFlowTypes';
import { format } from "date-fns";
import { Plus, Trash2, FileText, CalendarIcon } from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AddCustomerStepOrderProps {
  orderData: OrderFormData;
  setOrderData: React.Dispatch<React.SetStateAction<OrderFormData>>;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export function AddCustomerStepOrder({ 
  orderData, 
  setOrderData, 
  onNext, 
  onBack,
  onSkip
}: AddCustomerStepOrderProps) {
  const [showOrderForm, setShowOrderForm] = useState(orderData.items.length > 0);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    orderData.dueDate ? new Date(orderData.dueDate) : undefined
  );
  
  const addNewItem = () => {
    setOrderData(prev => ({
      ...prev,
      items: [
        ...prev.items, 
        { 
          id: crypto.randomUUID(),
          type: 'shirt', 
          quantity: 1, 
          price: 0, 
          description: ''
        }
      ]
    }));
  };
  
  const removeItem = (index: number) => {
    setOrderData(prev => {
      const newItems = prev.items.filter((_, i) => i !== index);
      
      // Recalculate total amount after removing an item
      const newTotalAmount = newItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
      
      return {
        ...prev,
        items: newItems,
        totalAmount: newTotalAmount,
        balanceAmount: Math.max(0, newTotalAmount - prev.advanceAmount)
      };
    });
  };
  
  const updateItem = (index: number, field: string, value: any) => {
    setOrderData(prev => {
      const updatedItems = prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      );
      
      // Recalculate total amount when prices or quantities change
      let newTotalAmount = updatedItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
      
      return {
        ...prev,
        items: updatedItems,
        totalAmount: newTotalAmount,
        balanceAmount: Math.max(0, newTotalAmount - prev.advanceAmount)
      };
    });
  };

  const handleAddOrder = () => {
    setShowOrderForm(true);
    if (orderData.items.length === 0) {
      addNewItem();
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setOrderData(prev => ({
        ...prev,
        dueDate: format(date, 'yyyy-MM-dd')
      }));
    }
  };

  const handleSkip = () => {
    // Close the modal by calling onSkip
    onSkip();
  };

  const handleNext = () => {
    // Validate order data
    if (orderData.items.length === 0 || !orderData.dueDate) {
      toast.error("Please add at least one item and select a due date");
      return;
    }
    
    onNext();
  };

  return (
    <div className="space-y-4">
      {!showOrderForm ? (
        <div className="py-6">
          <div className="text-center space-y-4">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="text-lg font-medium">Create an Order</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Would you like to create an order for this customer now? You can also create orders later.
            </p>
            <div className="flex justify-center gap-3 pt-4">
              <Button variant="outline" onClick={handleSkip}>
                Skip for Now
              </Button>
              <Button onClick={handleAddOrder}>
                Create Order
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Order Items</Label>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={addNewItem}
                  className="h-8"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Item
                </Button>
              </div>
              
              {orderData.items.length === 0 ? (
                <div className="text-center p-4 border rounded-md bg-muted/30">
                  <p className="text-muted-foreground">No items added yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orderData.items.map((item, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex flex-col gap-3">
                          <div className="flex justify-between">
                            <Label className="font-medium">Item {index + 1}</Label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(index)}
                              className="h-6 px-2 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label htmlFor={`type-${index}`} className="text-xs">Type</Label>
                              <Select
                                value={item.type}
                                onValueChange={(value) => updateItem(index, 'type', value)}
                              >
                                <SelectTrigger id={`type-${index}`}>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="shirt">Shirt</SelectItem>
                                  <SelectItem value="pant">Pant/Trouser</SelectItem>
                                  <SelectItem value="suit">Suit</SelectItem>
                                  <SelectItem value="dress">Dress</SelectItem>
                                  <SelectItem value="kurta">Kurta</SelectItem>
                                  <SelectItem value="shalwar">Shalwar</SelectItem>
                                  <SelectItem value="kameez">Kameez</SelectItem>
                                  <SelectItem value="waistcoat">Waistcoat</SelectItem>
                                  <SelectItem value="jacket">Jacket</SelectItem>
                                  <SelectItem value="blazer">Blazer</SelectItem>
                                  <SelectItem value="coat">Coat</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-1">
                              <Label htmlFor={`quantity-${index}`} className="text-xs">Quantity</Label>
                              <Input
                                id={`quantity-${index}`}
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                              />
                            </div>
                            
                            <div className="space-y-1">
                              <Label htmlFor={`price-${index}`} className="text-xs">Price</Label>
                              <Input
                                id={`price-${index}`}
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.price}
                                onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                              />
                            </div>
                            
                            <div className="space-y-1">
                              <Label htmlFor={`fabric-${index}`} className="text-xs">Fabric Details (Optional)</Label>
                              <Input
                                id={`fabric-${index}`}
                                value={item.fabricDetails || ''}
                                onChange={(e) => updateItem(index, 'fabricDetails', e.target.value)}
                                placeholder="Cotton, Linen, etc."
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <Label htmlFor={`description-${index}`} className="text-xs">Description</Label>
                            <Input
                              id={`description-${index}`}
                              value={item.description}
                              onChange={(e) => updateItem(index, 'description', e.target.value)}
                              placeholder="Custom collar, specific styling, etc."
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={orderData.status}
                  onValueChange={(value) => setOrderData(prev => ({ 
                    ...prev, 
                    status: value as 'pending' | 'stitching' | 'ready' | 'delivered'
                  }))}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="stitching">Stitching</SelectItem>
                    <SelectItem value="ready">Ready</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="orderNotes">Notes (Optional)</Label>
              <Textarea
                id="orderNotes"
                value={orderData.notes || ''}
                onChange={(e) => setOrderData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any notes about this order"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button 
              onClick={handleNext}
              disabled={orderData.items.length === 0 || !orderData.dueDate}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
