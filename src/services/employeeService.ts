
import { firestoreService, authService } from '@/services/firebase';
import { Employee } from '@/types/models';
import { toast } from "sonner";

const COLLECTION_NAME = 'employees';

// Get default permissions based on role
const getDefaultPermissions = (role: 'admin' | 'employee') => {
  if (role === 'admin') {
    return {
      customers: { view: true, add: true, edit: true, delete: true },
      orders: { view: true, add: true, edit: true, delete: true },
      measurements: { view: true, add: true, edit: true },
      payments: { view: true, add: true },
      employees: { view: true, add: true, edit: true, delete: true },
      settings: { view: true, edit: true },
    };
  } else {
    return {
      customers: { view: true, add: true, edit: true, delete: false },
      orders: { view: true, add: true, edit: true, delete: false },
      measurements: { view: true, add: true, edit: true },
      payments: { view: true, add: true },
      employees: { view: false, add: false, edit: false, delete: false },
      settings: { view: false, edit: false },
    };
  }
};

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
  
  // Check if email exists in Firebase Auth and create if not
  ensureFirebaseAuthUser: async (email: string, defaultPassword: string = "admin123"): Promise<boolean> => {
    try {
      console.log(`Ensuring Firebase Auth user exists for email: ${email}`);
      
      // Try to find the user by email in Firestore
      const employees = await firestoreService.getDocumentsByField(COLLECTION_NAME, 'email', email);
      
      if (employees.length === 0) {
        console.log(`No employee found with email ${email} in Firestore`);
        return false;
      }
      
      console.log(`Found employee in Firestore: ${employees[0].id}`);
      
      // Try to create the user in Firebase Auth
      // If the user already exists, this will fail with an "already in use" error
      try {
        console.log(`Attempting to create Firebase Auth user for ${email}`);
        const { user, error } = await authService.createUser(email, defaultPassword);
        
        if (error) {
          if (error.includes("already in use")) {
            console.log(`User ${email} already exists in Firebase Auth`);
            return true; // User already exists, which is what we want
          } else {
            console.error(`Error creating Firebase Auth user: ${error}`);
            return false;
          }
        }
        
        // If user was created successfully, update the employee record
        if (user) {
          console.log(`Firebase Auth user created successfully with UID: ${user.uid}`);
          await firestoreService.updateDocument(COLLECTION_NAME, employees[0].id, {
            firebaseUid: user.uid,
            passwordResetRequired: true
          });
          
          toast.success("Firebase Authentication account created for employee");
          return true;
        }
      } catch (error) {
        console.log(`Error in createUser, but this might be expected if user already exists: ${error}`);
        // Even if there was an error, if it's because the user already exists, that's fine
        return true;
      }
      
      return true;
    } catch (error) {
      console.error(`Error checking/creating Firebase Auth user: ${error}`);
      return false;
    }
  },
  
  // Update an existing employee
  updateEmployee: async (id: string, data: Partial<Employee>): Promise<boolean> => {
    try {
      // If email is being updated, ensure the user exists in Firebase Auth
      if (data.email) {
        await employeeService.ensureFirebaseAuthUser(data.email);
      }
      
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
      
      console.log(`Attempting to reset password for employee: ${employee.email}`);
      
      // Since we can't directly set a password for an existing user without the Firebase Admin SDK,
      // we'll send a password reset email to the employee
      console.log(`Sending password reset email to ${employee.email}...`);
      const result = await authService.sendPasswordResetEmail(employee.email);
      
      if (!result.success) {
        toast.error(`Failed to send password reset email: ${result.error}`);
        return false;
      }
      
      // Reset permissions based on role
      const defaultPermissions = getDefaultPermissions(employee.role);
      
      // Update the employee document
      const success = await firestoreService.updateDocument(COLLECTION_NAME, id, {
        passwordResetRequired: true,
        passwordResetRequestedAt: new Date().toISOString(),
        permissions: defaultPermissions
      });
      
      if (success) {
        toast.success(`Password reset link sent to ${employee.email} and permissions reset`);
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
