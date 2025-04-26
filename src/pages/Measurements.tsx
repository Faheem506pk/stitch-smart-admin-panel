
import { useState, useEffect } from 'react';
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, User, Search } from "lucide-react";
import { customerService } from '@/services/customerService';
import { Customer, Measurement } from '@/types/models';
import { MeasurementManager } from '@/components/measurements/MeasurementManager';
import { toast } from "sonner";
import { AddCustomerDialog } from '@/components/customers/AddCustomerDialog';
import { ScrollArea } from "@/components/ui/scroll-area";

const Measurements = () => {
  const [customerSearch, setCustomerSearch] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerMeasurements, setCustomerMeasurements] = useState<Measurement[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [measurementsSubscription, setMeasurementsSubscription] = useState<(() => void) | null>(null);

  // Fetch customers on component mount
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const allCustomers = await customerService.getCustomers();
        setCustomers(allCustomers);
        setFilteredCustomers(allCustomers);
      } catch (error) {
        console.error("Error fetching customers:", error);
        toast.error("Failed to load customers");
      } finally {
        setIsLoading(false);
      }
    };

    // Set up subscription
    const unsubscribe = customerService.subscribeToCustomers((data) => {
      setCustomers(data);
      setFilteredCustomers(
        data.filter(customer => 
          customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
          customer.phone.includes(customerSearch)
        )
      );
    });

    fetchCustomers();

    return () => {
      if (unsubscribe) unsubscribe();
      if (measurementsSubscription) measurementsSubscription();
    };
  }, []);

  // Filter customers when search changes
  useEffect(() => {
    if (!customerSearch.trim()) {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter(customer => 
        customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
        customer.phone.includes(customerSearch)
      );
      setFilteredCustomers(filtered);
    }
  }, [customerSearch, customers]);

  // Fetch customer measurements when selected customer changes
  useEffect(() => {
    // Clean up previous subscription if exists
    if (measurementsSubscription) {
      measurementsSubscription();
      setMeasurementsSubscription(null);
    }
    
    if (!selectedCustomer) {
      setCustomerMeasurements([]);
      return;
    }

    const fetchMeasurements = async () => {
      try {
        const measurements = await customerService.getCustomerMeasurements(selectedCustomer.id);
        setCustomerMeasurements(measurements);
      } catch (error) {
        console.error("Error fetching measurements:", error);
        toast.error("Failed to load measurements");
      }
    };

    fetchMeasurements();
    
    // For real-time updates, we'll use a manual approach since we don't have the subscription function
    // This would be the ideal approach if the function existed
    const intervalId = setInterval(fetchMeasurements, 10000); // Poll every 10 seconds
    
    return () => clearInterval(intervalId);
  }, [selectedCustomer]);

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Measurements</h1>
            <p className="text-muted-foreground mt-1">
              Record and manage customer measurements.
            </p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2" />
            Add Customer
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Customer Selection */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search customers..."
                    className="pl-8"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                  />
                </div>
                
                <ScrollArea className="h-[300px]">
                  <div className="border rounded-md">
                    {isLoading ? (
                      <div className="flex items-center justify-center h-[300px]">
                        <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : filteredCustomers.length === 0 ? (
                      <div className="p-2 text-center text-muted-foreground">
                        No customers found
                      </div>
                    ) : (
                      filteredCustomers.map(customer => (
                        <div 
                          key={customer.id}
                          className={`p-2 hover:bg-accent cursor-pointer ${selectedCustomer?.id === customer.id ? 'bg-accent' : ''}`}
                          onClick={() => handleCustomerSelect(customer)}
                        >
                          <p className="font-medium">{customer.name}</p>
                          <div className='flex items-center  gap-2'>
                          <p className="text-sm text-muted-foreground">{customer.phone}
                            
                          </p>
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
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
          
          {/* Measurement Form */}
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>
                {selectedCustomer ? `${selectedCustomer.name}'s Measurements` : 'Measurement Details'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedCustomer ? (
                <MeasurementManager 
                  customerId={selectedCustomer.id}
                  initialMeasurements={customerMeasurements}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <User className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-medium text-lg">No Customer Selected</h3>
                  <p className="text-muted-foreground mt-1">
                    Select a customer from the list to view or edit their measurements.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AddCustomerDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </Layout>
  );
};

export default Measurements;
