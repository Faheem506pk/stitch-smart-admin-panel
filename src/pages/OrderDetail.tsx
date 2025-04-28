import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Calendar, Edit, Trash2, User, Phone, FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { firestoreService } from '@/services/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface OrderType {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
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

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (id) {
      fetchOrder(id);
    }
  }, [id]);

  const fetchOrder = async (orderId: string) => {
    setIsLoading(true);
    try {
      const data = await firestoreService.getDocumentById('orders', orderId);
      if (data) {
        setOrder(data as Order);
      } else {
        toast.error('Order not found');
        navigate('/orders');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order details');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'cancelled':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/orders')}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Skeleton className="h-8 w-64" />
          </div>
          <Skeleton className="h-[400px] w-full" />
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/orders')}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Order Not Found</h1>
          </div>
          <p>The requested order could not be found. It may have been deleted or you may have followed an invalid link.</p>
          <Button onClick={() => navigate('/orders')}>Return to Orders</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/orders')}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Order #{order.id}</h1>
              <p className="text-muted-foreground">Created on {formatDate(order.createdAt)}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" size="sm" className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{order.customer.name}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{order.customer.phone}</span>
              </div>
              <Button 
                variant="link" 
                className="p-0 h-auto mt-2" 
                onClick={() => navigate(`/customers/${order.customerId}`)}
              >
                View Customer
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Due Date</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{formatDate(order.dueDate)}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {new Date(order.dueDate) < new Date() 
                  ? 'Overdue' 
                  : `Due in ${Math.ceil((new Date(order.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days`}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {getStatusIcon(order.status)}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              <div className="mt-2">
                <Button variant="outline" size="sm" className="mr-2">
                  Mark as Completed
                </Button>
                <Button variant="outline" size="sm" className="text-destructive">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="details">Order Details</TabsTrigger>
            <TabsTrigger value="payments">Payment</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
                <CardDescription>Items included in this order</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-2 text-left font-medium">Item</th>
                        <th className="p-2 text-center font-medium">Quantity</th>
                        <th className="p-2 text-right font-medium">Price</th>
                        <th className="p-2 text-right font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.orderTypes.map((item) => (
                        <tr key={item.id} className="border-b">
                          <td className="p-2 font-medium">{item.name}</td>
                          <td className="p-2 text-center">{item.quantity}</td>
                          <td className="p-2 text-right">${item.price.toFixed(2)}</td>
                          <td className="p-2 text-right">${item.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-muted/50">
                        <td colSpan={3} className="p-2 font-medium text-right">Total</td>
                        <td className="p-2 font-medium text-right">${order.totalAmount.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>
            
            {order.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <p>{order.notes}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="payments" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
                <CardDescription>Payment status and history</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Status</span>
                    <span className="font-medium">
                      {order.remainingAmount > 0 ? 'Partially Paid' : 'Fully Paid'}
                    </span>
                  </div>
                  
                  <Progress value={(order.advanceAmount / order.totalAmount) * 100} className="h-2" />
                  
                  <div className="flex justify-between text-sm">
                    <span>{Math.round((order.advanceAmount / order.totalAmount) * 100)}% Paid</span>
                    <span>{Math.round((order.remainingAmount / order.totalAmount) * 100)}% Remaining</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="text-lg font-medium">${order.totalAmount.toFixed(2)}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Advance Paid</p>
                    <p className="text-lg font-medium">${order.advanceAmount.toFixed(2)}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Remaining</p>
                    <p className="text-lg font-medium">${order.remainingAmount.toFixed(2)}</p>
                  </div>
                </div>
                
                <Button className="w-full sm:w-auto">Record Payment</Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>Timeline of order events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="mt-1">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Order Created</p>
                      <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="mt-1">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Advance Payment Received</p>
                      <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
                      <p className="text-sm">${order.advanceAmount.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  {order.status === 'completed' && (
                    <div className="flex gap-4">
                      <div className="mt-1">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                      </div>
                      <div>
                        <p className="font-medium">Order Completed</p>
                        <p className="text-sm text-muted-foreground">{formatDate(order.updatedAt)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
