
import { firestoreService } from '@/services/firebase';
import { Customer, Measurement, Order, Payment } from '@/types/models';
import { toast } from "sonner";

const CUSTOMER_COLLECTION = 'customers';
const MEASUREMENT_COLLECTION = 'measurements';
const ORDER_COLLECTION = 'orders';
const PAYMENT_COLLECTION = 'payments';

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
  
  // Get customer by phone number
  getCustomerByPhone: async (phone: string): Promise<Customer | null> => {
    try {
      const customers = await firestoreService.getDocuments(CUSTOMER_COLLECTION);
      const customer = (customers as Customer[]).find(c => c.phone === phone);
      return customer || null;
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
  }
};
