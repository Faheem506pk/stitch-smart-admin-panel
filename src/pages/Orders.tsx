
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { AddOrderDialog } from "@/components/orders/AddOrderDialog";
import { customerService } from "@/services/customerService";
import { Order, Customer } from "@/types/models";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

const Orders = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Record<string, Customer>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to real-time order updates
    const unsubscribe = customerService.subscribeToOrders((data) => {
      setOrders(data);
      setIsLoading(false);
    });

    // Fetch all customers to map IDs to names
    const fetchCustomers = async () => {
      try {
        const customersData = await customerService.getCustomers();
        const customersMap: Record<string, Customer> = {};
        customersData.forEach(customer => {
          customersMap[customer.id] = customer;
        });
        setCustomers(customersMap);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };

    fetchCustomers();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const getCustomerName = (customerId: string) => {
    return customers[customerId]?.name || "Unknown Customer";
  };

  const filteredOrders = orders.filter(order => {
    if (!searchQuery) return true;
    
    const customerName = getCustomerName(order.customerId).toLowerCase();
    const orderId = order.id.toLowerCase();
    const query = searchQuery.toLowerCase();
    
    return customerName.includes(query) || orderId.includes(query);
  });

  const handleDelete = async (id: string) => {
    try {
      const success = await customerService.deleteOrder(id);
      if (success) {
        setOrderToDelete(null);
        toast.success("Order deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Failed to delete order");
    }
  };

  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString()}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'stitching':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Stitching</Badge>;
      case 'ready':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Ready</Badge>;
      case 'delivered':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Delivered</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
            <p className="text-muted-foreground mt-1">
              Manage tailor shop orders.
            </p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2" />
            New Order
          </Button>
        </div>
        
        <div className="flex gap-2 mb-2">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders by customer or ID..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex justify-center">
                        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      {searchQuery ? (
                        <p className="text-center text-muted-foreground">No orders match your search.</p>
                      ) : (
                        <p className="text-center text-muted-foreground">No orders found. Create your first order.</p>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id.substring(0, 8).toUpperCase()}</TableCell>
                      <TableCell>{getCustomerName(order.customerId)}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>{format(new Date(order.dueDate), 'MMM d, yyyy')}</TableCell>
                      <TableCell className="text-right">{formatCurrency(order.totalAmount)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => {
                            // Edit functionality would go here
                            toast({
                              description: "Edit feature will be available soon.",
                            });
                          }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-destructive"
                            onClick={() => setOrderToDelete(order.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      
      <AddOrderDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
      />

      <AlertDialog open={!!orderToDelete} onOpenChange={(open) => {
        if (!open) setOrderToDelete(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this order
              and all related data from the server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => orderToDelete && handleDelete(orderToDelete)} 
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Orders;
