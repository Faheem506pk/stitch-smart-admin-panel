
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types/models';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
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

// Mock user for demo purposes
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
      isOnline: navigator.onLine,
      isSyncing: false,
      lastSyncTime: null,
      
      // Auth actions
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // In a real app, this would be a Firebase auth call
          // For demo, we'll just use a mock response after a delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Mock validation
          if (email === 'admin@example.com' && password === 'password') {
            set({ 
              user: mockAdmin,
              isAuthenticated: true,
              isLoading: false 
            });
          } else {
            set({
              error: 'Invalid email or password',
              isLoading: false,
              isAuthenticated: false,
            });
          }
        } catch (error) {
          set({ 
            error: typeof error === 'string' ? error : 'An error occurred during login',
            isLoading: false,
            isAuthenticated: false
          });
        }
      },
      
      logout: () => {
        set({ 
          user: null,
          isAuthenticated: false,
          error: null
        });
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
