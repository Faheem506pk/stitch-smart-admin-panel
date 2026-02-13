import { initializeApp, FirebaseApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  Firestore,
  orderBy,
  getDoc,
  setDoc,
  DocumentData,
} from "firebase/firestore";
import {
  getAuth,
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updatePassword,
  updateEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendEmailVerification,
  User as FirebaseUser,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { getStorage } from "firebase/storage";

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Default config from env vars (Global/Master App)
const defaultFirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Global variables for the MASTER app (Auth + User Data)
let masterApp: FirebaseApp | null = null;
let masterDb: Firestore | null = null;
let masterAuth: Auth | null = null;
let masterStorage: any = null; // Storage doesn't have a simple type in this version? or use FirebaseStorage if available

// Global variables for the TENANT app (Business Data)
let tenantApp: FirebaseApp | null = null;
let tenantDb: Firestore | null = null;

// Initialize Master Firebase (Global)
export const initializeFirebase = () => {
  try {
    if (masterApp) return { app: masterApp, db: masterDb, auth: masterAuth, storage: masterStorage, initialized: true };

    masterApp = initializeApp(defaultFirebaseConfig, "MASTER");
    masterDb = getFirestore(masterApp);
    masterAuth = getAuth(masterApp);
    masterStorage = getStorage(masterApp);

    console.log("Master Firebase initialized successfully");
    return { app: masterApp, db: masterDb, auth: masterAuth, storage: masterStorage, initialized: true };
  } catch (error) {
    console.error("Error initializing Master Firebase:", error);
    return { initialized: false, error };
  }
};

// Initialize Tenant Firebase (Dynamic)
export const initializeTenantFirebase = (config: FirebaseConfig) => {
  try {
    // If a tenant app already exists, delete it first (to switch tenants)
    // Note: deleteApp is async, but we might not need to await it strictly if we use unique names
    // For simplicity, we'll try to reuse or just create a new named app.
    // Actually, Firebase SDK manages multiple apps by name.

    // Check if we already have a tenant app initialized with this config?
    // For now, let's just create a new instance with a specific name 'TENANT'
    // If 'TENANT' exists, we might need to remove it or handle re-init.

    // Simplest approach: Create named app 'TENANT'. If exists, return it (but how to update config?)
    // Warning: initializeApp with same name throws. We should check if exists.
    // NOTE: In this basic implementation, we assume we might need to reload or handle this carefully.
    // For now, let's just overwrite the variable references.

    // Ideally we would delete the previous app instance if it exists, but deleteApp is imported from firebase/app

    tenantApp = initializeApp(config, "TENANT"); // Using a specific name avoids conflict with DEFAULT/MASTER
    tenantDb = getFirestore(tenantApp);

    console.log("Tenant Firebase initialized successfully");
    return { app: tenantApp, db: tenantDb, initialized: true };
  } catch (error: unknown) {
    if ((error as any).code === "app/duplicate-app") {
      console.log("Tenant app already initialized, reusing.");
      // This is tricky if we WANT to switch. For now assume one tenant per session.
      // In a real app we'd fetch the existing app by name.
    }
    console.error("Error initializing Tenant Firebase:", error);
    return { initialized: false, error };
  }
};

// Auto initialize Master
initializeFirebase();

// Export Master instances for Auth and Metadata
export { masterApp, masterDb, masterAuth, masterDb as db, masterAuth as auth };

// ---- Firestore Service now needs to be smarter ----

export const firestoreService = {
  // Check if Firebase is initialized
  isFirebaseInitialized: () => !!masterDb,

  // Helper to get the correct DB instance
  // If useTenantDb is true, return tenantDb (or null if not configured — DO NOT fallback to masterDb)
  // If useTenantDb is false, return masterDb (for user profiles, system data)
  getDb: (useTenantDb: boolean = true) => {
    if (useTenantDb) {
      return tenantDb; // Returns null if tenant is not configured — this is intentional for data isolation
    }
    return masterDb; // Only return masterDb when explicitly asked (for user/auth data)
  },

  // Document Exists
  documentExists: async (collectionName: string, docId: string, useTenantDb: boolean = true): Promise<boolean> => {
    const dbInstance = firestoreService.getDb(useTenantDb);
    if (!dbInstance) return false;

    try {
      const docRef = doc(dbInstance, collectionName, docId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists();
    } catch (error) {
      console.error(`Error checking document in ${collectionName}:`, error);
      return false;
    }
  },

  // Add document with ID
  addDocumentWithId: async (collectionName: string, docId: string, data: DocumentData, useTenantDb: boolean = true) => {
    const dbInstance = firestoreService.getDb(useTenantDb);
    if (!dbInstance) return null;

    try {
      const docRef = doc(dbInstance, collectionName, docId);
      await setDoc(docRef, {
        ...data,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return docId;
    } catch (error) {
      console.error(`Error adding document directly to ${collectionName}:`, error);
      throw error;
    }
  },

  // Add document (auto-id)
  addDocument: async (collectionName: string, data: DocumentData, useTenantDb: boolean = true) => {
    const dbInstance = firestoreService.getDb(useTenantDb);
    if (!dbInstance) return null;

    try {
      const result = await addDoc(collection(dbInstance, collectionName), {
        ...data,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return { id: result.id, ...data };
    } catch (error) {
      console.error(`Error adding document to ${collectionName}:`, error);
      return null;
    }
  },

  // Get document by ID
  getDocumentById: async (collectionName: string, id: string, useTenantDb: boolean = true) => {
    const dbInstance = firestoreService.getDb(useTenantDb);
    if (!dbInstance) return null;

    try {
      const docRef = doc(dbInstance, collectionName, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error(`Error getting document ${id} from ${collectionName}:`, error);
      return null;
    }
  },

  // Get all documents
  getDocuments: async (collectionName: string, useTenantDb: boolean = true) => {
    const dbInstance = firestoreService.getDb(useTenantDb);
    if (!dbInstance) return [];

    try {
      const querySnapshot = await getDocs(collection(dbInstance, collectionName));
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error(`Error getting documents from ${collectionName}:`, error);
      return [];
    }
  },

  // Get ordered documents
  getOrderedDocuments: async (collectionName: string, orderByField: string, direction: "asc" | "desc" = "desc", useTenantDb: boolean = true) => {
    const dbInstance = firestoreService.getDb(useTenantDb);
    if (!dbInstance) return [];

    try {
      const q = query(collection(dbInstance, collectionName), orderBy(orderByField, direction));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error(`Error getting ordered documents from ${collectionName}:`, error);
      return [];
    }
  },

  // Get documents by field
  getDocumentsByField: async (collectionName: string, field: string, value: string | number | boolean, useTenantDb: boolean = true) => {
    const dbInstance = firestoreService.getDb(useTenantDb);
    if (!dbInstance) return [];

    try {
      const q = query(collection(dbInstance, collectionName), where(field, "==", value));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error(`Error getting documents by field from ${collectionName}:`, error);
      return [];
    }
  },

  // Update document
  updateDocument: async (collectionName: string, docId: string, data: Partial<DocumentData>, useTenantDb: boolean = true) => {
    const dbInstance = firestoreService.getDb(useTenantDb);
    if (!dbInstance) return false;

    try {
      const docRef = doc(dbInstance, collectionName, docId);
      await updateDoc(docRef, { ...data, updatedAt: new Date().toISOString() });
      return true;
    } catch (error) {
      console.error(`Error updating document in ${collectionName}:`, error);
      return false;
    }
  },

  // Delete document
  deleteDocument: async (collectionName: string, docId: string, useTenantDb: boolean = true) => {
    const dbInstance = firestoreService.getDb(useTenantDb);
    if (!dbInstance) return false;

    try {
      await deleteDoc(doc(dbInstance, collectionName, docId));
      return true;
    } catch (error) {
      console.error(`Error deleting document from ${collectionName}:`, error);
      return false;
    }
  },

  // Subscribe to collection
  subscribeToCollection: (collectionName: string, callback: (data: DocumentData[]) => void, useTenantDb: boolean = true) => {
    const dbInstance = firestoreService.getDb(useTenantDb);
    if (!dbInstance) {
      callback([]);
      return () => {};
    }

    const q = collection(dbInstance, collectionName);
    return onSnapshot(q, (querySnapshot) => {
      const documents = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      callback(documents);
    });
  },

  // Subscribe ordered
  subscribeToOrderedCollection: (
    collectionName: string,
    callback: (data: DocumentData[]) => void,
    orderByField: string,
    direction: "asc" | "desc" = "desc",
    useTenantDb: boolean = true,
  ) => {
    const dbInstance = firestoreService.getDb(useTenantDb);
    if (!dbInstance) {
      callback([]);
      return () => {};
    }

    const q = query(collection(dbInstance, collectionName), orderBy(orderByField, direction));

    return onSnapshot(q, (querySnapshot) => {
      const documents = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      callback(documents);
    });
  },

  // Subscribe filtered
  subscribeToFilteredCollection: (
    collectionName: string,
    callback: (data: DocumentData[]) => void,
    field: string,
    value: string | number | boolean,
    useTenantDb: boolean = true,
  ) => {
    const dbInstance = firestoreService.getDb(useTenantDb);
    if (!dbInstance) {
      callback([]);
      return () => {};
    }

    const q = query(collection(dbInstance, collectionName), where(field, "==", value));

    return onSnapshot(q, (querySnapshot) => {
      const documents = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      callback(documents);
    });
  },
};

// Firebase Authentication Service (Using Master Auth)
export const authService = {
  // Mock function to simulate setting a default password
  mockSetDefaultPassword: async (email: string, defaultPassword: string = "admin123"): Promise<{ success: boolean; error: string | null }> => {
    if (!masterAuth) {
      return { success: false, error: "Firebase Auth not initialized" };
    }

    try {
      await sendPasswordResetEmail(masterAuth, email);
      console.log(`[MOCK] Password for ${email} has been set to "${defaultPassword}"`);
      return { success: true, error: null };
    } catch (error: unknown) {
      console.error("Error in mock set default password:", error);
      return { success: false, error: (error as Error).message || "Failed to set default password" };
    }
  },

  // Get current user
  getCurrentUser: () => {
    if (!masterAuth) return null;
    return masterAuth.currentUser;
  },

  // Create a new user with email and password
  createUser: async (email: string, password: string): Promise<{ user: FirebaseUser; error: null } | { user: null; error: string }> => {
    if (!masterAuth) {
      console.error("Firebase Auth not initialized");
      return { user: null, error: "Firebase Auth not initialized" };
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(masterAuth, email, password);
      return { user: userCredential.user, error: null };
    } catch (error: unknown) {
      console.error("Error creating user:", error);
      return { user: null, error: (error as Error).message || "Failed to create user" };
    }
  },

  // Sign in with email and password
  signIn: async (email: string, password: string): Promise<{ user: FirebaseUser; error: null } | { user: null; error: string }> => {
    if (!masterAuth) {
      console.error("Firebase Auth not initialized");
      return { user: null, error: "Firebase Auth not initialized" };
    }

    try {
      const userCredential = await signInWithEmailAndPassword(masterAuth, email, password);
      return { user: userCredential.user, error: null };
    } catch (error: unknown) {
      console.error("Error signing in:", error);
      return { user: null, error: (error as Error).message || "Failed to sign in" };
    }
  },

  // Sign out the current user
  signOut: async (): Promise<{ success: boolean; error: string | null }> => {
    if (!masterAuth) {
      return { success: false, error: "Firebase Auth not initialized" };
    }

    try {
      await signOut(masterAuth);
      // Also clear tenant config on sign out
      clearTenantConfig();
      return { success: true, error: null };
    } catch (error: any) {
      console.error("Error signing out:", error);
      return { success: false, error: error.message || "Failed to sign out" };
    }
  },

  // Send password reset email
  sendPasswordResetEmail: async (email: string): Promise<{ success: boolean; error: string | null }> => {
    if (!masterAuth) {
      return { success: false, error: "Firebase Auth not initialized" };
    }

    try {
      await sendPasswordResetEmail(masterAuth, email);
      return { success: true, error: null };
    } catch (error: any) {
      console.error("Error sending password reset email:", error);
      return { success: false, error: error.message || "Failed to send password reset email" };
    }
  },

  // Update user email
  updateUserEmail: async (newEmail: string, currentPassword: string): Promise<{ success: boolean; error: string | null }> => {
    if (!masterAuth || !masterAuth.currentUser) {
      return { success: false, error: "No authenticated user" };
    }

    try {
      const credential = EmailAuthProvider.credential(masterAuth.currentUser.email || "", currentPassword);

      await reauthenticateWithCredential(masterAuth.currentUser, credential);
      await updateEmail(masterAuth.currentUser, newEmail);
      return { success: true, error: null };
    } catch (error: any) {
      console.error("Error updating email:", error);
      return { success: false, error: error.message || "Failed to update email" };
    }
  },

  // Update user password
  updateUserPassword: async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error: string | null }> => {
    if (!masterAuth || !masterAuth.currentUser) {
      return { success: false, error: "No authenticated user" };
    }

    try {
      const credential = EmailAuthProvider.credential(masterAuth.currentUser.email || "", currentPassword);

      await reauthenticateWithCredential(masterAuth.currentUser, credential);
      await updatePassword(masterAuth.currentUser, newPassword);
      return { success: true, error: null };
    } catch (error: any) {
      console.error("Error updating password:", error);
      return { success: false, error: error.message || "Failed to update password" };
    }
  },

  // Send email verification
  sendEmailVerification: async (): Promise<{ success: boolean; error: string | null }> => {
    if (!masterAuth || !masterAuth.currentUser) {
      return { success: false, error: "No authenticated user" };
    }

    try {
      await sendEmailVerification(masterAuth.currentUser);
      return { success: true, error: null };
    } catch (error: any) {
      console.error("Error sending email verification:", error);
      return { success: false, error: error.message || "Failed to send email verification" };
    }
  },

  // Sign in with Google
  signInWithGoogle: async (): Promise<{ user: FirebaseUser | null; error: string | null }> => {
    if (!masterAuth) {
      return { user: null, error: "Firebase Auth not initialized" };
    }

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(masterAuth, provider);
      return { user: result.user, error: null };
    } catch (error: unknown) {
      console.error("Error signing in with Google:", error);
      return { user: null, error: (error as Error).message || "Failed to sign in with Google" };
    }
  },
};

// Helper to reset tenant setup (e.g. on logout)
export const clearTenantConfig = () => {
  tenantApp = null;
  tenantDb = null;
};
