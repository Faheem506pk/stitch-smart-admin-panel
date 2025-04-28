
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Employee } from '@/types/models';
import { employeeService } from '@/services/employeeService';
import { authService } from '@/services/firebase';
import { toast } from 'sonner';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  error: string | null;
}

interface AppState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: string | null;
  setOnlineStatus: (status: boolean) => void;
  setSyncingStatus: (status: boolean) => void;
  updateLastSyncTime: () => void;
}

type StoreState = AuthState & AppState;

// Convert employee to user
const employeeToUser = (employee: Employee): User => {
  return {
    id: employee.id,
    email: employee.email,
    name: employee.name,
    role: employee.role,
    permissions: employee.permissions,
    profilePicture: employee.profilePicture,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  };
};

// Mock admin for demo purposes
const mockAdmin: User = {
  id: 'admin-001',
  email: 'admin@example.com',
  name: 'Admin User',
  role: 'admin',
  permissions: {
    customers: { view: true, add: true, edit: true, delete: true },
    orders: { view: true, add: true, edit: true, delete: true },
    measurements: { view: true, add: true, edit: true },
    payments: { view: true, add: true },
    employees: { view: true, add: true, edit: true, delete: true },
    settings: { view: true, edit: true },
  },
  createdAt: new Date().toISOString(),
  lastLogin: new Date().toISOString(),
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Auth state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      // App state
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      isSyncing: false,
      lastSyncTime: null,
      
      // Auth actions
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Sign in with Firebase Authentication
          const { user: firebaseUser, error: firebaseError } = await authService.signIn(email, password);
          
          if (firebaseError || !firebaseUser) {
            set({
              error: firebaseError || 'Invalid email or password',
              isLoading: false,
              isAuthenticated: false,
            });
            toast.error(firebaseError || 'Invalid email or password');
            return;
          }
          
          // Get the employee data from Firestore
          const employee = await employeeService.getEmployeeByEmail(email);
          
          if (employee) {
            // Convert employee to user
            const user = employeeToUser(employee);
            
            set({ 
              user,
              isAuthenticated: true,
              isLoading: false 
            });
            
            toast.success(`Welcome back, ${user.name}!`);
            return;
          }
          
          // Fallback to mock admin if email matches (for demo purposes)
          if (email === 'admin@example.com') {
            set({ 
              user: mockAdmin,
              isAuthenticated: true,
              isLoading: false 
            });
            toast.success(`Welcome back, ${mockAdmin.name}!`);
            return;
          }
          
          // If we get here, user authenticated but no employee record found
          set({
            error: 'User account exists but no employee record found',
            isLoading: false,
            isAuthenticated: false,
          });
          toast.error('User account exists but no employee record found');
        } catch (error) {
          console.error('Login error:', error);
          set({ 
            error: typeof error === 'string' ? error : 'An error occurred during login',
            isLoading: false,
            isAuthenticated: false
          });
          toast.error('An error occurred during login');
        }
      },
      
      logout: async () => {
        try {
          // Sign out from Firebase
          await authService.signOut();
          
          set({ 
            user: null,
            isAuthenticated: false,
            error: null
          });
          toast.info('You have been logged out');
        } catch (error) {
          console.error('Logout error:', error);
          toast.error('An error occurred during logout');
        }
      },
      
      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData }
          });
        }
      },
      
      // App actions
      setOnlineStatus: (status: boolean) => {
        set({ isOnline: status });
      },
      
      setSyncingStatus: (status: boolean) => {
        set({ isSyncing: status });
      },
      
      updateLastSyncTime: () => {
        set({ lastSyncTime: new Date().toISOString() });
      },
    }),
    {
      name: 'tailor-shop-storage',
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        lastSyncTime: state.lastSyncTime
      }),
    }
  )
);

// Listen for online/offline events
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useStore.getState().setOnlineStatus(true);
  });
  
  window.addEventListener('offline', () => {
    useStore.getState().setOnlineStatus(false);
  });
}
