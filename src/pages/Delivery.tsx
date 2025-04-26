
import { useState, useEffect } from 'react';
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { customerService } from '@/services/customerService';
import { formatCurrency } from '@/utils/currencyUtils';
import { formatDistanceToNow, format } from 'date-fns';
import { Order, Customer } from '@/types/models';
import { CalendarIcon, CheckCircle, Search, Package, Truck } from 'lucide-react';
import { toast } from "sonner";

const statusColors = {
  'pending': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'stitching': 'bg-blue-100 text-blue-800 border-blue-300',
  'ready': 'bg-green-100 text-green-800 border-green-300',
  'delivered': 'bg-purple-100 text-purple-800 border-purple-300',
};

export default function Delivery() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Map<string, Customer>>(new Map());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch orders and subscribe to changes
  useEffect(() => {
    setIsLoading(true);
    
    // Subscribe to real-time order updates
    const unsubscribeOrders = customerService.subscribeToOrders((updatedOrders) => {
      setOrders(updatedOrders);
      applyFilters(updatedOrders, statusFilter, searchQuery);
      setIsLoading(false);
    });
    
    // Subscribe to customer updates for name lookups
    const unsubscribeCustomers = customerService.subscribeToCustomers((customersList) => {
      const customersMap = new Map<string, Customer>();
      customersList.forEach(customer => {
        customersMap.set(customer.id, customer);
      });
      setCustomers(customersMap);
    });
    
    // Cleanup subscriptions on unmount
    return () => {
      if (unsubscribeOrders) unsubscribeOrders();
      if (unsubscribeCustomers) unsubscribeCustomers();
    };
  }, []);
  
  // Filter orders when search or status changes
  useEffect(() => {
    applyFilters(orders, statusFilter, searchQuery);
  }, [statusFilter, searchQuery]);
  
  const applyFilters = (ordersList: Order[], status: string, query: string) => {
    let result = [...ordersList];
    
    // Apply status filter
    if (status !== 'all') {
      result = result.filter(order => order.status === status);
    }
    
    // Apply search filter - search by customer name or order ID
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      result = result.filter(order => {
        const customer = customers.get(order.customerId);
        const customerName = customer?.name.toLowerCase() || '';
        const orderIdMatch = order.id.toLowerCase().includes(lowerQuery);
        const customerMatch = customerName.includes(lowerQuery);
        
        return orderIdMatch || customerMatch;
      });
    }
    
    setFilteredOrders(result);
  };
  
  // Update order status
  const updateOrderStatus = async (orderId: string, newStatus: 'pending' | 'stitching' | 'ready' | 'delivered') => {
    try {
      const success = await customerService.updateOrder(orderId, { 
        status: newStatus,
        updatedAt: new Date().toISOString(),
        ...(newStatus === 'delivered' ? { deliveredAt: new Date().toISOString() } : {})
      });
      
      if (success) {
        toast.success(`Order marked as ${newStatus}`);
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    }
  };
  
  // Mark order as ready for delivery
  const markAsReady = (orderId: string) => {
    updateOrderStatus(orderId, 'ready');
  };
  
  // Mark order as delivered
  const markAsDelivered = (orderId: string) => {
    updateOrderStatus(orderId, 'delivered');
  };
  
  // Group orders by status for the dashboard view
  const ordersByStatus = {
    pending: filteredOrders.filter(order => order.status === 'pending'),
    stitching: filteredOrders.filter(order => order.status === 'stitching'),
    ready: filteredOrders.filter(order => order.status === 'ready'),
    delivered: filteredOrders.filter(order => order.status === 'delivered')
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Delivery Management</h1>
            <p className="text-muted-foreground">
              Track and manage order deliveries.
            </p>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search orders..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="stitching">Stitching</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Tabs defaultValue="table" className="space-y-4">
          <TabsList>
            <TabsTrigger value="table">Table View</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="table" className="space-y-4">
            <Card>
              <CardHeader className="py-4">
                <CardTitle>Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-24">
                      <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No orders found matching your filters
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrders.map((order) => {
                          const customer = customers.get(order.customerId);
                          return (
                            <TableRow key={order.id}>
                              <TableCell className="font-medium">
                                {order.id.substring(0, 8)}...
                              </TableCell>
                              <TableCell>{customer ? customer.name : "Unknown"}</TableCell>
                              <TableCell>{formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}</TableCell>
                              <TableCell>{order.items.length}</TableCell>
                              <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                              <TableCell className="whitespace-nowrap">
                                <div className="flex items-center">
                                  <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                                  {format(new Date(order.dueDate), 'MMM dd, yyyy')}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={statusColors[order.status as keyof typeof statusColors]}
                                  variant="outline"
                                >
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right space-x-2">
                                {order.status !== 'ready' && order.status !== 'delivered' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => markAsReady(order.id)}
                                  >
                                    <Package className="h-4 w-4 mr-1" />
                                    Mark Ready
                                  </Button>
                                )}
                                {order.status === 'ready' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => markAsDelivered(order.id)}
                                    className="text-green-600"
                                  >
                                    <Truck className="h-4 w-4 mr-1" />
                                    Mark Delivered
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Pending Orders */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <div className="h-3 w-3 rounded-full bg-yellow-400 mr-2"></div>
                    Pending Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    {isLoading ? (
                      <div className="flex justify-center items-center h-24">
                        <div className="h-5 w-5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : ordersByStatus.pending.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        No pending orders
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {ordersByStatus.pending.map(order => {
                          const customer = customers.get(order.customerId);
                          return (
                            <div
                              key={order.id}
                              className="border rounded-md p-3 hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">{customer?.name || "Unknown"}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {order.items.length} items • {formatCurrency(order.totalAmount)}
                                  </p>
                                </div>
                                <div className="text-right text-sm">
                                  <p>{format(new Date(order.dueDate), 'MMM dd')}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
              
              {/* Stitching Orders */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <div className="h-3 w-3 rounded-full bg-blue-400 mr-2"></div>
                    Stitching Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    {isLoading ? (
                      <div className="flex justify-center items-center h-24">
                        <div className="h-5 w-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : ordersByStatus.stitching.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        No stitching orders
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {ordersByStatus.stitching.map(order => {
                          const customer = customers.get(order.customerId);
                          return (
                            <div
                              key={order.id}
                              className="border rounded-md p-3 hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">{customer?.name || "Unknown"}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {order.items.length} items • {formatCurrency(order.totalAmount)}
                                  </p>
                                </div>
                                <div className="text-right text-sm">
                                  <p>{format(new Date(order.dueDate), 'MMM dd')}</p>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => markAsReady(order.id)}
                                    className="h-7 mt-1"
                                  >
                                    Mark Ready
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
              
              {/* Ready Orders */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <div className="h-3 w-3 rounded-full bg-green-400 mr-2"></div>
                    Ready for Delivery
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    {isLoading ? (
                      <div className="flex justify-center items-center h-24">
                        <div className="h-5 w-5 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : ordersByStatus.ready.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        No orders ready for delivery
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {ordersByStatus.ready.map(order => {
                          const customer = customers.get(order.customerId);
                          return (
                            <div
                              key={order.id}
                              className="border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900/30 rounded-md p-3"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">{customer?.name || "Unknown"}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {order.items.length} items • {formatCurrency(order.totalAmount)}
                                  </p>
                                  {customer?.phone && (
                                    <p className="text-sm mt-1">
                                      {customer.phone}
                                      {customer.isWhatsApp && (
                                        <a
                                          href={`https://wa.me/92${customer.phone.replace(/\D/g, '').replace(/^0+/, '')}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="ml-2 text-green-600"
                                        >
                                          <svg 
                                            xmlns="http://www.w3.org/2000/svg" 
                                            width="14"
                                            height="14" 
                                            viewBox="0 0 24 24" 
                                            fill="none" 
                                            stroke="currentColor" 
                                            strokeWidth="2" 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round"
                                            className="inline"
                                          >
                                            <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                                          </svg>
                                        </a>
                                      )}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => markAsDelivered(order.id)}
                                    className="bg-green-100 text-green-700 border-green-300 hover:bg-green-200"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Delivered
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
              
              {/* Delivered Orders */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <div className="h-3 w-3 rounded-full bg-purple-400 mr-2"></div>
                    Delivered Today
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    {isLoading ? (
                      <div className="flex justify-center items-center h-24">
                        <div className="h-5 w-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : ordersByStatus.delivered.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        No orders delivered today
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {ordersByStatus.delivered
                          .filter(order => {
                            // Only show deliveries from today
                            const today = new Date().toDateString();
                            const deliveredDate = order.deliveredAt 
                              ? new Date(order.deliveredAt).toDateString()
                              : new Date(order.updatedAt).toDateString();
                            return deliveredDate === today;
                          })
                          .map(order => {
                            const customer = customers.get(order.customerId);
                            return (
                              <div
                                key={order.id}
                                className="border border-purple-200 bg-purple-50 dark:bg-purple-950/20 dark:border-purple-900/30 rounded-md p-3"
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-medium">{customer?.name || "Unknown"}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {order.items.length} items • {formatCurrency(order.totalAmount)}
                                    </p>
                                  </div>
                                  <div className="text-right text-sm">
                                    <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300">
                                      Delivered
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
