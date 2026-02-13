import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, Employee } from "@/types/models";
import { employeeService } from "@/services/employeeService";
import { authService, firestoreService } from "@/services/firebase";
import { toast } from "sonner";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
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

// Get default permissions based on role
const getDefaultPermissions = (role: "admin" | "employee" | "super_admin") => {
  if (role === "admin" || role === "super_admin") {
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
  id: "admin-001",
  email: "admin@example.com",
  name: "Admin User",
  role: "admin",
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
      isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
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
              error: firebaseError || "Invalid email or password",
              isLoading: false,
              isAuthenticated: false,
            });
            toast.error(firebaseError || "Invalid email or password");
            return;
          }

          // Get the user profile from Master DB
          // Force use of masterDb by passing false to useTenantDb
          const userProfile = (await firestoreService.getDocumentById("users", firebaseUser.uid, false)) as User | null;

          if (userProfile) {
            set({
              user: userProfile as User,
              isAuthenticated: true,
              isLoading: false,
            });

            toast.success(`Welcome back, ${userProfile.name}!`);
            return;
          }

          // Super Admin Fallback
          if (email === import.meta.env.VITE_SUPER_ADMIN_EMAIL) {
            const superAdmin: User = {
              id: firebaseUser.uid,
              email: email,
              name: "Super Admin",
              role: "super_admin",
              permissions: getDefaultPermissions("admin"),
              createdAt: new Date().toISOString(),
            };

            set({
              user: superAdmin,
              isAuthenticated: true,
              isLoading: false,
            });
            toast.success("Welcome, Super Admin!");
            return;
          }

          set({
            error: "User profile not found in Master DB",
            isLoading: false,
            isAuthenticated: false,
          });
          toast.error("User profile not found");
        } catch (error) {
          console.error("Login error:", error);
          set({
            error: "An error occurred during login",
            isLoading: false,
            isAuthenticated: false,
          });
          toast.error("An error occurred during login");
        }
      },

      loginWithGoogle: async () => {
        set({ isLoading: true, error: null });

        try {
          const { user: firebaseUser, error: firebaseError } = await authService.signInWithGoogle();

          if (firebaseError || !firebaseUser) {
            set({
              error: firebaseError || "Google sign-in failed",
              isLoading: false,
              isAuthenticated: false,
            });
            toast.error(firebaseError || "Google sign-in failed");
            return;
          }

          // Check for existing profile
          let userProfile = (await firestoreService.getDocumentById("users", firebaseUser.uid, false)) as User | null;

          if (!userProfile) {
            // Create a new profile for first-time Google sign-in
            const isSuperAdmin = firebaseUser.email === import.meta.env.VITE_SUPER_ADMIN_EMAIL;

            const newUser: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email || "",
              name: firebaseUser.displayName || "User",
              role: isSuperAdmin ? "super_admin" : "admin",
              permissions: getDefaultPermissions("admin"),
              profilePicture: firebaseUser.photoURL || undefined,
              createdAt: new Date().toISOString(),
              status: "active",
            };

            await firestoreService.addDocumentWithId("users", firebaseUser.uid, newUser, false);
            userProfile = newUser;
          }

          if ((userProfile as User).status === "banned") {
            await authService.signOut();
            set({
              error: "Your account has been deactivated. Please contact support.",
              isLoading: false,
              isAuthenticated: false,
              user: null,
            });
            toast.error("Account deactivated");
            return;
          }

          set({
            user: userProfile as User,
            isAuthenticated: true,
            isLoading: false,
          });

          toast.success(`Welcome, ${userProfile.name}!`);
        } catch (error) {
          console.error("Google login error:", error);
          set({
            error: "An error occurred during Google sign-in",
            isLoading: false,
            isAuthenticated: false,
          });
          toast.error("An error occurred during Google sign-in");
        }
      },

      logout: async () => {
        try {
          // Sign out from Firebase
          await authService.signOut();

          set({
            user: null,
            isAuthenticated: false,
            error: null,
          });
          toast.info("You have been logged out");
        } catch (error) {
          console.error("Logout error:", error);
          toast.error("An error occurred during logout");
        }
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
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
      name: "tailor-shop-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        lastSyncTime: state.lastSyncTime,
      }),
    },
  ),
);

// Listen for online/offline events
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    useStore.getState().setOnlineStatus(true);
  });

  window.addEventListener("offline", () => {
    useStore.getState().setOnlineStatus(false);
  });
}
