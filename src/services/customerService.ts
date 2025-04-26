
import { firestoreService } from '@/services/firebase';
import { Customer, Measurement, Order, Payment, Employee } from '@/types/models';
import { toast } from "sonner";

const CUSTOMER_COLLECTION = 'customers';
const MEASUREMENT_COLLECTION = 'measurements';
const ORDER_COLLECTION = 'orders';
const PAYMENT_COLLECTION = 'payments';
const EMPLOYEE_COLLECTION = 'employees';

export const customerService = {
  // Add a new customer
  addCustomer: async (customer: Omit<Customer, 'id'>): Promise<Customer | null> => {
    try {
      const result = await firestoreService.addDocument(CUSTOMER_COLLECTION, customer);
      if (result) {
        toast.success("Customer added successfully!");
        return result as Customer;
      }
      return null;
    } catch (error) {
      console.error("Error adding customer:", error);
      toast.error("Failed to add customer");
      return null;
    }
  },
  
  // Get all customers
  getCustomers: async (): Promise<Customer[]> => {
    try {
      const customers = await firestoreService.getDocuments(CUSTOMER_COLLECTION);
      return customers as Customer[];
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Failed to load customers");
      return [];
    }
  },
  
  // Get customer by ID
  getCustomerById: async (id: string): Promise<Customer | null> => {
    try {
      const customer = await firestoreService.getDocumentById(CUSTOMER_COLLECTION, id);
      return customer as Customer || null;
    } catch (error) {
      console.error("Error fetching customer by ID:", error);
      toast.error("Failed to find customer");
      return null;
    }
  },
  
  // Get customer by phone number
  getCustomerByPhone: async (phone: string): Promise<Customer | null> => {
    try {
      const customers = await firestoreService.getDocumentsByField(CUSTOMER_COLLECTION, 'phone', phone);
      return customers.length > 0 ? customers[0] as Customer : null;
    } catch (error) {
      console.error("Error fetching customer by phone:", error);
      toast.error("Failed to find customer");
      return null;
    }
  },
  
  // Update an existing customer
  updateCustomer: async (id: string, data: Partial<Customer>): Promise<boolean> => {
    try {
      const success = await firestoreService.updateDocument(CUSTOMER_COLLECTION, id, data);
      if (success) {
        toast.success("Customer updated successfully!");
      }
      return success;
    } catch (error) {
      console.error("Error updating customer:", error);
      toast.error("Failed to update customer");
      return false;
    }
  },
  
  // Delete a customer
  deleteCustomer: async (id: string): Promise<boolean> => {
    try {
      const success = await firestoreService.deleteDocument(CUSTOMER_COLLECTION, id);
      if (success) {
        toast.success("Customer deleted successfully!");
      }
      return success;
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast.error("Failed to delete customer");
      return false;
    }
  },
  
  // Subscribe to real-time customer updates
  subscribeToCustomers: (callback: (customers: Customer[]) => void) => {
    return firestoreService.subscribeToCollection(CUSTOMER_COLLECTION, (data) => {
      callback(data as Customer[]);
    });
  },

  // === MEASUREMENTS SECTION === //
  
  // Add a measurement
  addMeasurement: async (measurement: Omit<Measurement, 'id'>): Promise<Measurement | null> => {
    try {
      const result = await firestoreService.addDocument(MEASUREMENT_COLLECTION, measurement);
      if (result) {
        toast.success("Measurement added successfully!");
        return result as Measurement;
      }
      return null;
    } catch (error) {
      console.error("Error adding measurement:", error);
      toast.error("Failed to add measurement");
      return null;
    }
  },
  
  // Add customer measurement
  addCustomerMeasurement: async (measurement: Omit<Measurement, 'id'>): Promise<Measurement | null> => {
    return customerService.addMeasurement(measurement);
  },
  
  // Get measurements for a customer
  getCustomerMeasurements: async (customerId: string): Promise<Measurement[]> => {
    try {
      const measurements = await firestoreService.getDocumentsByField(MEASUREMENT_COLLECTION, 'customerId', customerId);
      return measurements as Measurement[];
    } catch (error) {
      console.error("Error fetching customer measurements:", error);
      toast.error("Failed to load measurements");
      return [];
    }
  },
  
  // Get latest measurement for a customer by type
  getLatestCustomerMeasurement: async (customerId: string, type: string): Promise<Measurement | null> => {
    try {
      const measurements = await firestoreService.getDocumentsByField(MEASUREMENT_COLLECTION, 'customerId', customerId);
      const typeMeasurements = (measurements as Measurement[]).filter(m => m.type === type);
      
      if (typeMeasurements.length === 0) return null;
      
      // Sort by date descending
      return typeMeasurements.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )[0];
    } catch (error) {
      console.error("Error fetching latest measurement:", error);
      toast.error("Failed to load measurement");
      return null;
    }
  },
  
  // Update measurement
  updateMeasurement: async (id: string, data: Partial<Measurement>): Promise<boolean> => {
    try {
      const success = await firestoreService.updateDocument(MEASUREMENT_COLLECTION, id, data);
      if (success) {
        toast.success("Measurement updated successfully!");
      }
      return success;
    } catch (error) {
      console.error("Error updating measurement:", error);
      toast.error("Failed to update measurement");
      return false;
    }
  },
  
  // Delete measurement
  deleteMeasurement: async (id: string): Promise<boolean> => {
    try {
      const success = await firestoreService.deleteDocument(MEASUREMENT_COLLECTION, id);
      if (success) {
        toast.success("Measurement deleted successfully!");
      }
      return success;
    } catch (error) {
      console.error("Error deleting measurement:", error);
      toast.error("Failed to delete measurement");
      return false;
    }
  },
  
  // Subscribe to customer measurements
  subscribeToCustomerMeasurements: (customerId: string, callback: (measurements: Measurement[]) => void) => {
    return firestoreService.subscribeToFilteredCollection(
      MEASUREMENT_COLLECTION,
      data => callback(data as Measurement[]),
      'customerId',
      customerId
    );
  },

  // === ORDERS SECTION === //

  // Add an order
  addOrder: async (order: Omit<Order, 'id'>): Promise<Order | null> => {
    try {
      const result = await firestoreService.addDocument(ORDER_COLLECTION, order);
      if (result) {
        toast.success("Order created successfully!");
        return result as Order;
      }
      return null;
    } catch (error) {
      console.error("Error adding order:", error);
      toast.error("Failed to create order");
      return null;
    }
  },
  
  // Get orders for a customer
  getCustomerOrders: async (customerId: string): Promise<Order[]> => {
    try {
      const orders = await firestoreService.getDocumentsByField(ORDER_COLLECTION, 'customerId', customerId);
      return orders as Order[];
    } catch (error) {
      console.error("Error fetching customer orders:", error);
      toast.error("Failed to load orders");
      return [];
    }
  },
  
  // Get all orders
  getAllOrders: async (): Promise<Order[]> => {
    try {
      const orders = await firestoreService.getDocuments(ORDER_COLLECTION);
      return orders as Order[];
    } catch (error) {
      console.error("Error fetching all orders:", error);
      toast.error("Failed to load orders");
      return [];
    }
  },
  
  // Update order
  updateOrder: async (id: string, data: Partial<Order>): Promise<boolean> => {
    try {
      const success = await firestoreService.updateDocument(ORDER_COLLECTION, id, data);
      if (success) {
        toast.success("Order updated successfully!");
      }
      return success;
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order");
      return false;
    }
  },
  
  // Delete order
  deleteOrder: async (id: string): Promise<boolean> => {
    try {
      const success = await firestoreService.deleteDocument(ORDER_COLLECTION, id);
      if (success) {
        toast.success("Order deleted successfully!");
      }
      return success;
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Failed to delete order");
      return false;
    }
  },
  
  // Subscribe to all orders
  subscribeToOrders: (callback: (orders: Order[]) => void) => {
    return firestoreService.subscribeToOrderedCollection(
      ORDER_COLLECTION,
      data => callback(data as Order[]),
      'createdAt'
    );
  },
  
  // Subscribe to customer orders
  subscribeToCustomerOrders: (customerId: string, callback: (orders: Order[]) => void) => {
    return firestoreService.subscribeToFilteredCollection(
      ORDER_COLLECTION,
      data => callback(data as Order[]),
      'customerId',
      customerId
    );
  },

  // === PAYMENTS SECTION === //

  // Add a payment
  addPayment: async (payment: Omit<Payment, 'id'>): Promise<Payment | null> => {
    try {
      const result = await firestoreService.addDocument(PAYMENT_COLLECTION, payment);
      if (result) {
        toast.success("Payment recorded successfully!");
        return result as Payment;
      }
      return null;
    } catch (error) {
      console.error("Error adding payment:", error);
      toast.error("Failed to record payment");
      return null;
    }
  },
  
  // Get payments for an order
  getOrderPayments: async (orderId: string): Promise<Payment[]> => {
    try {
      const payments = await firestoreService.getDocumentsByField(PAYMENT_COLLECTION, 'orderId', orderId);
      return payments as Payment[];
    } catch (error) {
      console.error("Error fetching order payments:", error);
      toast.error("Failed to load payments");
      return [];
    }
  },
  
  // === EMPLOYEES SECTION === //
  
  // Get all employees
  getEmployees: async (): Promise<Employee[]> => {
    try {
      const employees = await firestoreService.getDocuments(EMPLOYEE_COLLECTION);
      return employees as Employee[];
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Failed to load employees");
      return [];
    }
  },
  
  // Get employee by email
  getEmployeeByEmail: async (email: string): Promise<Employee | null> => {
    try {
      const employees = await firestoreService.getDocumentsByField(EMPLOYEE_COLLECTION, 'email', email);
      return employees.length > 0 ? employees[0] as Employee : null;
    } catch (error) {
      console.error("Error fetching employee by email:", error);
      toast.error("Failed to find employee");
      return null;
    }
  },
  
  // Add an employee
  addEmployee: async (employee: Omit<Employee, 'id'>): Promise<Employee | null> => {
    try {
      const result = await firestoreService.addDocument(EMPLOYEE_COLLECTION, employee);
      if (result) {
        toast.success("Employee added successfully!");
        return result as Employee;
      }
      return null;
    } catch (error) {
      console.error("Error adding employee:", error);
      toast.error("Failed to add employee");
      return null;
    }
  },
  
  // Update employee
  updateEmployee: async (id: string, data: Partial<Employee>): Promise<boolean> => {
    try {
      const success = await firestoreService.updateDocument(EMPLOYEE_COLLECTION, id, data);
      if (success) {
        toast.success("Employee updated successfully!");
      }
      return success;
    } catch (error) {
      console.error("Error updating employee:", error);
      toast.error("Failed to update employee");
      return false;
    }
  },
  
  // Delete employee
  deleteEmployee: async (id: string): Promise<boolean> => {
    try {
      const success = await firestoreService.deleteDocument(EMPLOYEE_COLLECTION, id);
      if (success) {
        toast.success("Employee deleted successfully!");
      }
      return success;
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast.error("Failed to delete employee");
      return false;
    }
  },
  
  // Subscribe to employees
  subscribeToEmployees: (callback: (employees: Employee[]) => void) => {
    return firestoreService.subscribeToCollection(EMPLOYEE_COLLECTION, (data) => {
      callback(data as Employee[]);
    });
  }
};
