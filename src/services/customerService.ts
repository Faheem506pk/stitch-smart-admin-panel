
import { firestoreService } from '@/services/firebase';
import { Customer } from '@/types/models';
import { toast } from "sonner";

const COLLECTION_NAME = 'customers';

export const customerService = {
  // Add a new customer
  addCustomer: async (customer: Omit<Customer, 'id'>): Promise<Customer | null> => {
    try {
      const result = await firestoreService.addDocument(COLLECTION_NAME, customer);
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
      const customers = await firestoreService.getDocuments(COLLECTION_NAME);
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
      const customers = await firestoreService.getDocuments(COLLECTION_NAME);
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
      const success = await firestoreService.updateDocument(COLLECTION_NAME, id, data);
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
      const success = await firestoreService.deleteDocument(COLLECTION_NAME, id);
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
    return firestoreService.subscribeToCollection(COLLECTION_NAME, (data) => {
      callback(data as Customer[]);
    });
  }
};
