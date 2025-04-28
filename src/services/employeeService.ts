
import { firestoreService, authService } from '@/services/firebase';
import { Employee } from '@/types/models';
import { toast } from "sonner";

const COLLECTION_NAME = 'employees';

export const employeeService = {
  // Add a new employee with Firebase Authentication
  addEmployee: async (employee: Omit<Employee, 'id'>, password: string): Promise<Employee | null> => {
    try {
      // First create the Firebase Auth user
      const { user, error } = await authService.createUser(employee.email, password);
      
      if (error || !user) {
        toast.error(`Failed to create user: ${error}`);
        return null;
      }
      
      // Then create the employee document in Firestore
      const employeeData = {
        ...employee,
        firebaseUid: user.uid, // Store the Firebase UID for reference
        passwordResetRequired: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Use the Firebase UID as the document ID for easy reference
      await firestoreService.addDocumentWithId(COLLECTION_NAME, user.uid, employeeData);
      
      const result = {
        id: user.uid,
        ...employeeData
      } as Employee;
      
      toast.success("Employee added successfully!");
      return result;
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

  // Change password using Firebase Auth
  changePassword: async (id: string, newPassword: string, currentPassword?: string): Promise<boolean> => {
    try {
      // Get the employee to find their email
      const employee = await employeeService.getEmployeeById(id);
      if (!employee) {
        toast.error("Employee not found");
        return false;
      }
      
      // If current user is changing their own password, they need to provide current password
      const currentUser = authService.getCurrentUser();
      if (currentUser && currentUser.email === employee.email) {
        if (!currentPassword) {
          toast.error("Current password is required");
          return false;
        }
        
        // Update password through Firebase Auth
        const result = await authService.updateUserPassword(currentPassword, newPassword);
        if (!result.success) {
          toast.error(`Failed to change password: ${result.error}`);
          return false;
        }
      } else {
        // Admin is resetting someone else's password
        // In a real app, you would use Firebase Admin SDK to reset the password
        // For this demo, we'll simulate it with a password reset email
        const result = await authService.sendPasswordResetEmail(employee.email);
        if (!result.success) {
          toast.error(`Failed to send password reset email: ${result.error}`);
          return false;
        }
      }
      
      // Update the employee document
      const success = await firestoreService.updateDocument(COLLECTION_NAME, id, {
        passwordLastChanged: new Date().toISOString(),
        passwordResetRequired: false
      });
      
      if (success) {
        toast.success("Password change initiated successfully!");
      }
      return success;
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Failed to change password");
      return false;
    }
  },
  
  // Request password reset for an employee (admin function)
  requestPasswordReset: async (id: string): Promise<boolean> => {
    try {
      // Get the employee to find their email
      const employee = await employeeService.getEmployeeById(id);
      if (!employee) {
        toast.error("Employee not found");
        return false;
      }
      
      // Send password reset email to the admin's email
      const currentUser = authService.getCurrentUser();
      if (!currentUser || !currentUser.email) {
        toast.error("Admin email not available");
        return false;
      }
      
      // In a real app, you would use Firebase Admin SDK to generate a password reset link
      // and send it to the admin's email. For this demo, we'll simulate it.
      const result = await authService.sendPasswordResetEmail(currentUser.email);
      if (!result.success) {
        toast.error(`Failed to send password reset email: ${result.error}`);
        return false;
      }
      
      // Update the employee document
      const success = await firestoreService.updateDocument(COLLECTION_NAME, id, {
        passwordResetRequired: true,
        passwordResetRequestedAt: new Date().toISOString()
      });
      
      if (success) {
        toast.success(`Password reset link sent to your email (${currentUser.email})`);
      }
      return success;
    } catch (error) {
      console.error("Error requesting password reset:", error);
      toast.error("Failed to request password reset");
      return false;
    }
  },
  
  // Send forgot password email (for login page)
  sendForgotPasswordEmail: async (email: string): Promise<boolean> => {
    try {
      // Check if the email belongs to an employee
      const employee = await employeeService.getEmployeeByEmail(email);
      
      // If it's an admin, send reset link directly
      if (employee && employee.role === 'admin') {
        const result = await authService.sendPasswordResetEmail(email);
        if (!result.success) {
          toast.error(`Failed to send password reset email: ${result.error}`);
          return false;
        }
        
        toast.success(`Password reset link sent to ${email}`);
        return true;
      } else if (employee) {
        // For regular employees, notify that only admin can reset
        toast.info("For employee accounts, please contact your administrator to reset your password");
        return false;
      } else {
        // Email not found
        toast.error("Email not found in our system");
        return false;
      }
    } catch (error) {
      console.error("Error sending forgot password email:", error);
      toast.error("Failed to process forgot password request");
      return false;
    }
  }
};
