
import { firestoreService } from '@/services/firebase';
import { Employee } from '@/types/models';
import { toast } from "sonner";

const COLLECTION_NAME = 'employees';

export const employeeService = {
  // Add a new employee
  addEmployee: async (employee: Omit<Employee, 'id'>): Promise<Employee | null> => {
    try {
      const result = await firestoreService.addDocument(COLLECTION_NAME, employee);
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
  
  // Get all employees
  getEmployees: async (): Promise<Employee[]> => {
    try {
      const employees = await firestoreService.getDocuments(COLLECTION_NAME);
      return employees as Employee[];
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Failed to load employees");
      return [];
    }
  },

  // Get employee by ID
  getEmployeeById: async (id: string): Promise<Employee | null> => {
    try {
      const employee = await firestoreService.getDocumentById(COLLECTION_NAME, id);
      return employee as Employee || null;
    } catch (error) {
      console.error("Error fetching employee by ID:", error);
      toast.error("Failed to find employee");
      return null;
    }
  },

  // Get employee by email
  getEmployeeByEmail: async (email: string): Promise<Employee | null> => {
    try {
      const employees = await firestoreService.getDocumentsByField(COLLECTION_NAME, 'email', email);
      return employees.length > 0 ? employees[0] as Employee : null;
    } catch (error) {
      console.error("Error fetching employee by email:", error);
      toast.error("Failed to find employee");
      return null;
    }
  },
  
  // Update an existing employee
  updateEmployee: async (id: string, data: Partial<Employee>): Promise<boolean> => {
    try {
      const success = await firestoreService.updateDocument(COLLECTION_NAME, id, data);
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
  
  // Delete an employee
  deleteEmployee: async (id: string): Promise<boolean> => {
    try {
      const success = await firestoreService.deleteDocument(COLLECTION_NAME, id);
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
  
  // Subscribe to real-time employee updates
  subscribeToEmployees: (callback: (employees: Employee[]) => void) => {
    return firestoreService.subscribeToCollection(COLLECTION_NAME, (data) => {
      callback(data as Employee[]);
    });
  },

  // Change password (would typically use Firebase Auth directly)
  changePassword: async (id: string, newPassword: string): Promise<boolean> => {
    try {
      // This is a simplified example. In a real app, you would use Firebase Auth
      // to actually change the password. For this demo, we'll just update a flag.
      const success = await firestoreService.updateDocument(COLLECTION_NAME, id, {
        passwordLastChanged: new Date().toISOString(),
        passwordResetRequired: false
      });
      
      if (success) {
        toast.success("Password changed successfully!");
      }
      return success;
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Failed to change password");
      return false;
    }
  },
  
  // Request password reset
  requestPasswordReset: async (id: string): Promise<boolean> => {
    try {
      const success = await firestoreService.updateDocument(COLLECTION_NAME, id, {
        passwordResetRequired: true,
        passwordResetRequestedAt: new Date().toISOString()
      });
      
      if (success) {
        toast.success("Password reset requested!");
      }
      return success;
    } catch (error) {
      console.error("Error requesting password reset:", error);
      toast.error("Failed to request password reset");
      return false;
    }
  }
};
