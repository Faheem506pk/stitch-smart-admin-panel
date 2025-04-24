
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreVertical, Loader2 } from "lucide-react";
import { AddOrderDialog } from "@/components/orders/AddOrderDialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/services/firebase";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

// Order type definition
interface Order {
  id: string;
  customer: {
    id: string;
    name: string;
    phone: string;
  };
  orderType: string;
  totalAmount: number;
  advanceAmount: number;
  remainingAmount: number;
  dueDate: string;
  notes?: string;
  status: "pending" | "in-progress" | "completed" | "delivered";
  createdAt: string;
}

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOrderDialogOpen, setIsAddOrderDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch orders
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const ordersCollection = collection(db, "orders");
      const snapshot = await getDocs(ordersCollection);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];
    },
  });

  // Delete order mutation
  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const orderRef = doc(db, "orders", orderId);
      await deleteDoc(orderRef);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast("Order deleted successfully", {
        position: "top-center"
      });
    },
    onError: (error) => {
      console.error("Error deleting order:", error);
      toast("Failed to delete order", {
        position: "top-center",
        className: "bg-red-500",
      });
    },
  });

  // Filter orders by search term
  const filteredOrders = orders.filter((order) => {
    const searchString = searchTerm.toLowerCase();
    return (
      order.customer.name.toLowerCase().includes(searchString) ||
      order.orderType.toLowerCase().includes(searchString) ||
      order.id.toLowerCase().includes(searchString)
    );
  });

  // Format currency
  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString()}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy");
    } catch (error) {
      return dateString;
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-300">Pending</Badge>;
      case "in-progress":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-300">In Progress</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100 border-green-300">Completed</Badge>;
      case "delivered":
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-100 border-purple-300">Delivered</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Handle delete order
  const handleDeleteOrder = (orderId: string) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      deleteOrderMutation.mutate(orderId);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Orders</h1>
          <Button onClick={() => setIsAddOrderDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Order
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No orders found.</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Remaining</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customer.name}</TableCell>
                    <TableCell>{order.orderType}</TableCell>
                    <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                    <TableCell>{formatCurrency(order.remainingAmount)}</TableCell>
                    <TableCell>{formatDate(order.dueDate)}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Edit Order</DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteOrder(order.id)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <AddOrderDialog
          open={isAddOrderDialogOpen}
          onOpenChange={setIsAddOrderDialogOpen}
        />
      </div>
    </Layout>
  );
};

export default Orders;
