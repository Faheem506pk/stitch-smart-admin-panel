
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
import { OrderFormData } from './AddCustomerFlow';
import { Plus, Trash2, FileText } from 'lucide-react';

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
  
  const addNewItem = () => {
    setOrderData(prev => ({
      ...prev,
      items: [
        ...prev.items, 
        { 
          type: 'shirt', 
          quantity: 1, 
          price: 0, 
          description: ''
        }
      ]
    }));
  };
  
  const removeItem = (index: number) => {
    setOrderData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };
  
  const updateItem = (index: number, field: string, value: any) => {
    setOrderData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleAddOrder = () => {
    setShowOrderForm(true);
    if (orderData.items.length === 0) {
      addNewItem();
    }
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
              <Button variant="outline" onClick={onSkip}>
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
                <Input
                  id="dueDate"
                  type="date"
                  value={orderData.dueDate}
                  onChange={(e) => setOrderData(prev => ({ ...prev, dueDate: e.target.value }))}
                />
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
              onClick={onNext}
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
