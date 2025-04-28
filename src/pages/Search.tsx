import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { formatCurrency } from "@/utils/currencyUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon, ArrowLeft } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { customerService } from "@/services/customerService";
import { firestoreService } from "@/services/firebase";
import { format } from "date-fns";
import { Customer } from "@/types/models";

interface Order {
  id: string;
  customer: {
    name: string;
    phone: string;
  };
  totalAmount: number;
  dueDate: string;
  status: string;
}

const Search = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState("customers");

  // Parse query parameter on component mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get("q");
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [location.search]);

  const performSearch = async (query: string) => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    
    try {
      // Search customers
      const customersResult = await searchCustomers(query);
      setCustomers(customersResult);
      
      // Search orders
      const ordersResult = await searchOrders(query);
      setOrders(ordersResult);
      
      // Set active tab based on results
      if (customersResult.length === 0 && ordersResult.length > 0) {
        setActiveTab("orders");
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const searchCustomers = async (query: string): Promise<Customer[]> => {
    try {
      const allCustomers = await customerService.getCustomers();
      const lowerQuery = query.toLowerCase();
      
      return allCustomers.filter(customer => 
        customer.name.toLowerCase().includes(lowerQuery) ||
        customer.phone.toLowerCase().includes(lowerQuery) ||
        (customer.email && customer.email.toLowerCase().includes(lowerQuery))
      );
    } catch (error) {
      console.error("Error searching customers:", error);
      return [];
    }
  };

  const searchOrders = async (query: string): Promise<Order[]> => {
    try {
      const allOrders = await firestoreService.getDocuments("orders");
      const lowerQuery = query.toLowerCase();
      
      // Filter and map to ensure we have the correct type
      return allOrders
        .filter(order => {
          // Type assertion to access properties
          const typedOrder = order as unknown as Order;
          
          return (
            typedOrder.id.toLowerCase().includes(lowerQuery) ||
            typedOrder.customer?.name?.toLowerCase().includes(lowerQuery) ||
            typedOrder.customer?.phone?.toLowerCase().includes(lowerQuery) ||
            (typedOrder as any).orderTypeDisplay?.toLowerCase().includes(lowerQuery) ||
            typedOrder.status?.toLowerCase().includes(lowerQuery)
          );
        })
        .map(order => {
          // Convert to Order type
          return {
            id: order.id,
            customer: (order as any).customer || { name: 'Unknown', phone: '' },
            totalAmount: (order as any).totalAmount || 0,
            dueDate: (order as any).dueDate || new Date().toISOString(),
            status: (order as any).status || 'unknown'
          };
        });
    } catch (error) {
      console.error("Error searching orders:", error);
      return [];
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      performSearch(searchQuery);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Search Results</h1>
        </div>
        
        <form onSubmit={handleSearch} className="flex gap-2 max-w-lg">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search customers, orders..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit">Search</Button>
        </form>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="customers">
              Customers ({customers.length})
            </TabsTrigger>
            <TabsTrigger value="orders">
              Orders ({orders.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="customers" className="mt-4">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Added On</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          Searching...
                        </TableCell>
                      </TableRow>
                    ) : customers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          <p className="text-muted-foreground">No customers found matching "{searchQuery}"</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      customers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell>{customer.name}</TableCell>
                          <TableCell>{customer.phone}</TableCell>
                          <TableCell>{customer.email || '-'}</TableCell>
                          <TableCell>{formatDate(customer.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/customers/${customer.id}`)}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="orders" className="mt-4">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          Searching...
                        </TableCell>
                      </TableRow>
                    ) : orders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          <p className="text-muted-foreground">No orders found matching "{searchQuery}"</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>#{order.id}</TableCell>
                          <TableCell>{order.customer?.name || 'Unknown'}</TableCell>
                          <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                          <TableCell>{formatDate(order.dueDate)}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              order.status === 'completed' ? 'bg-green-100 text-green-800' :
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/orders/${order.id}`)}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Search;
