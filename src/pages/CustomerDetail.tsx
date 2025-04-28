import { useState, useEffect } from 'react';
import { EditCustomerDialog } from '@/components/customers/EditCustomerDialog';
import { MeasurementManager } from '@/components/measurements/MeasurementManager';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Phone, Mail, Calendar, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { firestoreService } from '@/services/firebase';
import { Customer } from '@/types/models';
import { Skeleton } from '@/components/ui/skeleton';

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [customerMeasurements, setCustomerMeasurements] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('details');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoadingMeasurements, setIsLoadingMeasurements] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCustomer(id);
      fetchCustomerOrders(id);
      fetchCustomerMeasurements(id);
    }
  }, [id]);

  const fetchCustomer = async (customerId: string) => {
    setIsLoading(true);
    try {
      const data = await firestoreService.getDocumentById('customers', customerId);
      if (data) {
        setCustomer(data as Customer);
      } else {
        toast.error('Customer not found');
        navigate('/customers');
      }
    } catch (error) {
      console.error('Error fetching customer:', error);
      toast.error('Failed to load customer details');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustomerOrders = async (customerId: string) => {
    try {
      const orders = await firestoreService.getDocumentsByField('orders', 'customerId', customerId);
      setCustomerOrders(orders);
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      toast.error('Failed to load customer orders');
    }
  };

  const fetchCustomerMeasurements = async (customerId: string) => {
    setIsLoadingMeasurements(true);
    try {
      const measurements = await firestoreService.getDocumentsByField('measurements', 'customerId', customerId);
      setCustomerMeasurements(measurements);
    } catch (error) {
      console.error('Error fetching customer measurements:', error);
      toast.error('Failed to load customer measurements');
    } finally {
      setIsLoadingMeasurements(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
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
              onClick={() => navigate('/customers')}
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

  if (!customer) {
    return (
      <Layout>
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/customers')}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Customer Not Found</h1>
          </div>
          <p>The requested customer could not be found. It may have been deleted or you may have followed an invalid link.</p>
          <Button onClick={() => navigate('/customers')}>Return to Customers</Button>
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
              onClick={() => navigate('/customers')}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">{customer.name}</h1>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" size="sm" className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="details">Customer Details</TabsTrigger>
            <TabsTrigger value="orders">Orders ({customerOrders.length})</TabsTrigger>
            <TabsTrigger value="measurements">Measurements</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
                <CardDescription>Basic details about the customer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row gap-6 mb-6">
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center relative overflow-hidden">
                      {customer.profilePicture ? (
                        <img
                          src={customer.profilePicture}
                          alt="Profile"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Handle image load error
                            (e.target as HTMLImageElement).src = '';
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-12 w-12 text-muted-foreground"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Name</p>
                        <p className="font-medium">{customer.name}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Phone</p>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium">{customer.phone}</p>
                          {customer.isWhatsApp && (
                            <a
                              href={`https://wa.me/92${customer.phone.replace(/\D/g, '').replace(/^0+/, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-700"
                            >
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="16" 
                                height="16" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                                className="h-4 w-4"
                              >
                                <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                                <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
                                <path d="M14 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
                                <path d="M9 14a5 5 0 0 0 6 0" />
                              </svg>
                            </a>
                          )}
                        </div>
                      </div>
                      
                      {customer.email && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">Email</p>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <p className="font-medium">{customer.email}</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Customer Since</p>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium">{formatDate(customer.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {customer.address && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Address</p>
                    <p className="font-medium">{customer.address}</p>
                  </div>
                )}
                
                {customer.notes && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Notes</p>
                    <p>{customer.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="orders" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Customer Orders</CardTitle>
                <CardDescription>Orders placed by this customer</CardDescription>
              </CardHeader>
              <CardContent>
                {customerOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No orders found for this customer</p>
                    <Button 
                      className="mt-4" 
                      onClick={() => navigate('/orders')}
                    >
                      Create Order
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="p-2 text-left font-medium">Order ID</th>
                          <th className="p-2 text-left font-medium">Date</th>
                          <th className="p-2 text-left font-medium">Items</th>
                          <th className="p-2 text-left font-medium">Total</th>
                          <th className="p-2 text-left font-medium">Status</th>
                          <th className="p-2 text-right font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customerOrders.map((order) => (
                          <tr key={order.id} className="border-b">
                            <td className="p-2 font-medium">#{order.id}</td>
                            <td className="p-2">{formatDate(order.createdAt)}</td>
                            <td className="p-2">{order.orderTypeDisplay}</td>
                            <td className="p-2">${order.totalAmount.toFixed(2)}</td>
                            <td className="p-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </td>
                            <td className="p-2 text-right">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => navigate(`/orders/${order.id}`)}
                              >
                                View
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="measurements" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <div className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Customer Measurements</CardTitle>
                    <CardDescription>Saved measurements for this customer</CardDescription>
                  </div>
                  <Button onClick={() => navigate(`/measurements?customer=${id}`)}>
                    Manage Measurements
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingMeasurements ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : customerMeasurements.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No measurements found for this customer</p>
                    <Button 
                      className="mt-4"
                      onClick={() => navigate(`/measurements?customer=${id}`)}
                    >
                      Add Measurements
                    </Button>
                  </div>
                ) : (
                  <MeasurementManager 
                    customerId={id!} 
                    initialMeasurements={customerMeasurements}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      {/* Edit Customer Dialog */}
      <EditCustomerDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        customer={customer}
      />
    </Layout>
  );
}
