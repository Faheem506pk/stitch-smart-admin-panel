
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, FileText, Truck, Search, Package, ArrowRight, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { getDeliveryItemsByStatus, updateDeliveryStatus, syncDeliveriesWithFirebase } from "@/services/deliveryService";
import { useStore } from "@/store/useStore";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { format, addDays, isBefore } from "date-fns";

interface DeliveryItem {
  id?: number;
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  items: string[];
  status: 'pending' | 'in-transit' | 'delivered' | 'cancelled';
  dueDate: string;
  deliveryDate?: string;
  deliveryAgent?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Sample delivery data for demonstration
const sampleDeliveries: DeliveryItem[] = [
  {
    id: 1,
    orderId: 'ord-1234',
    orderNumber: '1234',
    customerId: 'cust-1',
    customerName: 'John Doe',
    customerPhone: '212-555-1234',
    items: ['2x Shirts', '1x Pants'],
    status: 'pending',
    dueDate: addDays(new Date(), 2).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    orderId: 'ord-1235',
    orderNumber: '1235',
    customerId: 'cust-2',
    customerName: 'Jane Smith',
    customerPhone: '212-555-5678',
    items: ['1x Dress'],
    status: 'pending',
    dueDate: addDays(new Date(), 5).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    orderId: 'ord-1236',
    orderNumber: '1236',
    customerId: 'cust-3',
    customerName: 'Mike Johnson',
    customerPhone: '212-555-9012',
    items: ['3x Shirts', '2x Suits'],
    status: 'in-transit',
    dueDate: addDays(new Date(), 1).toISOString(),
    deliveryAgent: 'David Wilson',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 4,
    orderId: 'ord-1237',
    orderNumber: '1237',
    customerId: 'cust-4',
    customerName: 'Sarah Brown',
    customerPhone: '212-555-3456',
    items: ['1x Wedding Dress'],
    status: 'delivered',
    dueDate: addDays(new Date(), -2).toISOString(),
    deliveryDate: addDays(new Date(), -3).toISOString(),
    deliveryAgent: 'David Wilson',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const Delivery = () => {
  const [deliveryTab, setDeliveryTab] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deliveries, setDeliveries] = useState<DeliveryItem[]>([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState<DeliveryItem[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryItem | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { isOnline } = useStore();

  // Load deliveries based on tab
  useEffect(() => {
    const loadDeliveries = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, this would fetch from IndexedDB
        // const items = await getDeliveryItemsByStatus(deliveryTab === 'all' ? '' : deliveryTab);
        
        // For demo purposes, we'll use sample data
        setTimeout(() => {
          let items;
          if (deliveryTab === 'all') {
            items = sampleDeliveries;
          } else {
            items = sampleDeliveries.filter(d => d.status === deliveryTab);
          }
          setDeliveries(items);
          setIsLoading(false);
        }, 700);
      } catch (error) {
        console.error('Error loading deliveries:', error);
        toast.error('Failed to load deliveries');
        setIsLoading(false);
      }
    };

    loadDeliveries();
  }, [deliveryTab]);

  // Apply search filter
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredDeliveries(deliveries);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = deliveries.filter(delivery => 
      delivery.orderNumber.toLowerCase().includes(query) ||
      delivery.customerName.toLowerCase().includes(query) ||
      delivery.customerPhone.includes(query)
    );
    
    setFilteredDeliveries(filtered);
  }, [searchQuery, deliveries]);

  // Check if delivery is urgent (due within 24 hours)
  const isDeliveryUrgent = (dueDate: string) => {
    const due = new Date(dueDate);
    const tomorrow = addDays(new Date(), 1);
    return isBefore(due, tomorrow);
  };

  // Update delivery status
  const handleUpdateStatus = async (id: number | undefined, newStatus: 'pending' | 'in-transit' | 'delivered' | 'cancelled') => {
    if (!id) return;
    
    try {
      // For demo purposes, update in the local state
      // In a real implementation, call updateDeliveryStatus(id, newStatus)
      
      const updatedDeliveries = deliveries.map(d => 
        d.id === id ? { ...d, status: newStatus } : d
      );
      
      setDeliveries(updatedDeliveries);
      setDetailsOpen(false);
      
      if (newStatus === 'delivered') {
        toast.success('Order successfully delivered!');
      } else if (newStatus === 'in-transit') {
        toast.success('Order marked as in transit');
      } else {
        toast.success(`Order status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error('Error updating delivery status:', error);
      toast.error('Failed to update delivery status');
    }
  };

  // Show delivery details
  const handleShowDetails = (delivery: DeliveryItem) => {
    setSelectedDelivery(delivery);
    setDetailsOpen(true);
  };

  // Sync with Firebase
  const handleSync = async () => {
    if (!isOnline) {
      toast.error('Cannot sync while offline');
      return;
    }
    
    toast.promise(
      syncDeliveriesWithFirebase(isOnline),
      {
        loading: 'Syncing with cloud...',
        success: 'Deliveries synchronized successfully',
        error: 'Failed to sync deliveries'
      }
    );
  };

  // Render the badge for delivery status
  const renderStatusBadge = (status: string) => {
    switch(status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">Ready for delivery</Badge>;
      case 'in-transit':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">In transit</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Delivered</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Delivery Tracking</h1>
            <p className="text-muted-foreground mt-1">
              Track and manage order deliveries.
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleSync} 
              variant="outline" 
              size="sm"
              disabled={!isOnline}
              className="hidden md:flex"
            >
              <Package className="h-4 w-4 mr-1" />
              Sync Orders
            </Button>
          </div>
        </div>
        
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <CardTitle>Deliveries</CardTitle>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="search" 
                  placeholder="Search orders..." 
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending" onValueChange={setDeliveryTab}>
              <TabsList className="mb-4 w-full md:w-auto overflow-auto">
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="in-transit">In Transit</TabsTrigger>
                <TabsTrigger value="delivered">Delivered</TabsTrigger>
                <TabsTrigger value="all">All Orders</TabsTrigger>
              </TabsList>
              
              {/* Tab Content - Pending */}
              <TabsContent value="pending" className="space-y-4">
                {isLoading ? (
                  // Loading skeleton
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="p-4 border rounded-md">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredDeliveries.length === 0 ? (
                  <div className="text-center py-10">
                    <Package className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No pending deliveries found</p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    {filteredDeliveries.map((delivery) => (
                      <div 
                        key={delivery.id} 
                        className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-5 gap-4 border-b hover:bg-muted/40 transition-colors last:border-b-0"
                      >
                        <div>
                          <p className="text-sm font-medium">Order #{delivery.orderNumber}</p>
                          <p className="text-xs text-muted-foreground">
                            {isDeliveryUrgent(delivery.dueDate) && (
                              <span className="text-red-500 font-medium flex items-center gap-1">
                                <Bell className="h-3 w-3" /> Urgent
                              </span>
                            )}
                            {!isDeliveryUrgent(delivery.dueDate) && (
                              <span>Due in {Math.round((new Date(delivery.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days</span>
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm">{delivery.customerName}</p>
                          <p className="text-xs text-muted-foreground">{delivery.customerPhone}</p>
                        </div>
                        <div>
                          <p className="text-sm">{delivery.items.join(', ')}</p>
                          {renderStatusBadge(delivery.status)}
                        </div>
                        <div>
                          <p className="text-sm">Due Date:</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(delivery.dueDate), 'MMMM dd, yyyy')}</p>
                        </div>
                        <div className="flex items-center justify-end space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleShowDetails(delivery)}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Details</span>
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleUpdateStatus(delivery.id, 'in-transit')}
                          >
                            <Truck className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Start Delivery</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              {/* Tab Content - In Transit */}
              <TabsContent value="in-transit" className="space-y-4">
                {isLoading ? (
                  // Loading skeleton
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="p-4 border rounded-md">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredDeliveries.length === 0 ? (
                  <div className="text-center py-10">
                    <Truck className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No orders currently in transit</p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    {filteredDeliveries.map((delivery) => (
                      <div 
                        key={delivery.id} 
                        className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-5 gap-4 border-b hover:bg-muted/40 transition-colors last:border-b-0"
                      >
                        <div>
                          <p className="text-sm font-medium">Order #{delivery.orderNumber}</p>
                          <p className="text-xs text-muted-foreground">
                            {isDeliveryUrgent(delivery.dueDate) && (
                              <span className="text-red-500 font-medium flex items-center gap-1">
                                <Bell className="h-3 w-3" /> Urgent
                              </span>
                            )}
                            {!isDeliveryUrgent(delivery.dueDate) && (
                              <span>Due in {Math.round((new Date(delivery.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days</span>
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm">{delivery.customerName}</p>
                          <p className="text-xs text-muted-foreground">{delivery.customerPhone}</p>
                        </div>
                        <div>
                          <p className="text-sm">{delivery.items.join(', ')}</p>
                          {renderStatusBadge(delivery.status)}
                        </div>
                        <div>
                          <p className="text-sm">Agent:</p>
                          <p className="text-xs text-muted-foreground">{delivery.deliveryAgent || 'Not assigned'}</p>
                        </div>
                        <div className="flex items-center justify-end space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleShowDetails(delivery)}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Details</span>
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleUpdateStatus(delivery.id, 'delivered')}
                          >
                            <Package className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Mark Delivered</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              {/* Tab Content - Delivered */}
              <TabsContent value="delivered" className="space-y-4">
                {isLoading ? (
                  // Loading skeleton
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="p-4 border rounded-md">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredDeliveries.length === 0 ? (
                  <div className="text-center py-10">
                    <Package className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No delivered orders found</p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    {filteredDeliveries.map((delivery) => (
                      <div 
                        key={delivery.id} 
                        className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-5 gap-4 border-b hover:bg-muted/40 transition-colors last:border-b-0"
                      >
                        <div>
                          <p className="text-sm font-medium">Order #{delivery.orderNumber}</p>
                          <p className="text-xs text-muted-foreground">Completed order</p>
                        </div>
                        <div>
                          <p className="text-sm">{delivery.customerName}</p>
                          <p className="text-xs text-muted-foreground">{delivery.customerPhone}</p>
                        </div>
                        <div>
                          <p className="text-sm">{delivery.items.join(', ')}</p>
                          {renderStatusBadge(delivery.status)}
                        </div>
                        <div>
                          <p className="text-sm">Delivered:</p>
                          <p className="text-xs text-muted-foreground">
                            {delivery.deliveryDate ? format(new Date(delivery.deliveryDate), 'MMMM dd, yyyy') : 'Unknown'}
                          </p>
                        </div>
                        <div className="flex items-center justify-end space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleShowDetails(delivery)}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Details</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              {/* Tab Content - All Orders */}
              <TabsContent value="all" className="space-y-4">
                {isLoading ? (
                  // Loading skeleton
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-4 border rounded-md">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredDeliveries.length === 0 ? (
                  <div className="text-center py-10">
                    <Package className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No orders found</p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    {filteredDeliveries.map((delivery) => (
                      <div 
                        key={delivery.id} 
                        className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-5 gap-4 border-b hover:bg-muted/40 transition-colors last:border-b-0"
                      >
                        <div>
                          <p className="text-sm font-medium">Order #{delivery.orderNumber}</p>
                          <p className="text-xs text-muted-foreground">
                            {delivery.status === 'pending' && isDeliveryUrgent(delivery.dueDate) && (
                              <span className="text-red-500 font-medium flex items-center gap-1">
                                <Bell className="h-3 w-3" /> Urgent
                              </span>
                            )}
                            {delivery.status === 'pending' && !isDeliveryUrgent(delivery.dueDate) && (
                              <span>Due in {Math.round((new Date(delivery.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days</span>
                            )}
                            {delivery.status === 'delivered' && 'Completed order'}
                            {delivery.status === 'in-transit' && 'In delivery'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm">{delivery.customerName}</p>
                          <p className="text-xs text-muted-foreground">{delivery.customerPhone}</p>
                        </div>
                        <div>
                          <p className="text-sm">{delivery.items.join(', ')}</p>
                          {renderStatusBadge(delivery.status)}
                        </div>
                        <div>
                          {delivery.status === 'delivered' ? (
                            <>
                              <p className="text-sm">Delivered:</p>
                              <p className="text-xs text-muted-foreground">
                                {delivery.deliveryDate ? format(new Date(delivery.deliveryDate), 'MMMM dd, yyyy') : 'Unknown'}
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="text-sm">Due Date:</p>
                              <p className="text-xs text-muted-foreground">{format(new Date(delivery.dueDate), 'MMMM dd, yyyy')}</p>
                            </>
                          )}
                        </div>
                        <div className="flex items-center justify-end space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleShowDetails(delivery)}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Details</span>
                          </Button>
                          {delivery.status === 'pending' && (
                            <Button 
                              size="sm"
                              onClick={() => handleUpdateStatus(delivery.id, 'in-transit')}
                            >
                              <Truck className="h-4 w-4 mr-1" />
                              <span className="hidden sm:inline">Start Delivery</span>
                            </Button>
                          )}
                          {delivery.status === 'in-transit' && (
                            <Button 
                              size="sm"
                              onClick={() => handleUpdateStatus(delivery.id, 'delivered')}
                            >
                              <Package className="h-4 w-4 mr-1" />
                              <span className="hidden sm:inline">Mark Delivered</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Upcoming Deliveries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isLoading ? (
                // Loading skeleton for upcoming deliveries
                <>
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </>
              ) : (
                // Filter and show only upcoming deliveries (pending and in-transit)
                sampleDeliveries
                  .filter(d => ['pending', 'in-transit'].includes(d.status))
                  .slice(0, 4)
                  .map(delivery => (
                    <div 
                      key={delivery.id} 
                      className="border rounded-md p-4 hover:bg-muted/40 transition-colors cursor-pointer"
                      onClick={() => handleShowDetails(delivery)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">Order #{delivery.orderNumber}</h3>
                          <p className="text-sm text-muted-foreground">{delivery.customerName}</p>
                        </div>
                        {renderStatusBadge(delivery.status)}
                      </div>
                      <div className="mt-2 flex justify-between items-end">
                        <p className="text-sm">{delivery.items.join(', ')}</p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(new Date(delivery.dueDate), 'MMM dd')}
                          <ArrowRight className="h-3 w-3 mx-1" />
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delivery Details Sheet */}
      {selectedDelivery && (
        <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
          <SheetContent className="sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Order #{selectedDelivery.orderNumber}</SheetTitle>
              <SheetDescription>
                View and manage delivery details
              </SheetDescription>
            </SheetHeader>
            <div className="py-6 space-y-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Status</h3>
                <div className="flex items-center space-x-2">
                  {renderStatusBadge(selectedDelivery.status)}
                  {selectedDelivery.status === 'pending' && isDeliveryUrgent(selectedDelivery.dueDate) && (
                    <span className="text-xs text-red-500 font-medium flex items-center">
                      <Bell className="h-3 w-3 mr-1" /> Urgent
                    </span>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Customer Information</h3>
                <div className="text-sm">
                  <p>{selectedDelivery.customerName}</p>
                  <p className="text-muted-foreground">{selectedDelivery.customerPhone}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Order Items</h3>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {selectedDelivery.items.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Delivery Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Due Date</p>
                    <p>{format(new Date(selectedDelivery.dueDate), 'MMMM dd, yyyy')}</p>
                  </div>
                  {selectedDelivery.deliveryDate && (
                    <div>
                      <p className="text-muted-foreground">Delivery Date</p>
                      <p>{format(new Date(selectedDelivery.deliveryDate), 'MMMM dd, yyyy')}</p>
                    </div>
                  )}
                  {selectedDelivery.deliveryAgent && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Delivery Agent</p>
                      <p>{selectedDelivery.deliveryAgent}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {selectedDelivery.notes && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Notes</h3>
                  <p className="text-sm">{selectedDelivery.notes}</p>
                </div>
              )}
              
              <div className="flex flex-col gap-2 pt-4">
                {selectedDelivery.status === 'pending' && (
                  <Button onClick={() => handleUpdateStatus(selectedDelivery.id, 'in-transit')}>
                    <Truck className="h-4 w-4 mr-2" />
                    Start Delivery
                  </Button>
                )}
                
                {selectedDelivery.status === 'in-transit' && (
                  <Button onClick={() => handleUpdateStatus(selectedDelivery.id, 'delivered')}>
                    <Package className="h-4 w-4 mr-2" />
                    Mark as Delivered
                  </Button>
                )}
                
                {(selectedDelivery.status === 'pending' || selectedDelivery.status === 'in-transit') && (
                  <Button variant="outline" onClick={() => handleUpdateStatus(selectedDelivery.id, 'cancelled')}>
                    Cancel Delivery
                  </Button>
                )}
                
                <SheetClose asChild>
                  <Button variant="ghost">Close</Button>
                </SheetClose>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </Layout>
  );
};

export default Delivery;
