
import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, collection, addDoc, getDocs, updateDoc, doc, 
  deleteDoc, query, where, onSnapshot, Firestore, DocumentData, 
  orderBy, getDoc, 
  setDoc
} from 'firebase/firestore';
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
  signOut
} from 'firebase/auth';
import { getStorage } from 'firebase/storage';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

const defaultFirebaseConfig = {
  apiKey: "AIzaSyAItH36ywjf2PQ2i9vVYYhmyPm_DKvGW0E",
  authDomain: "stichsmart-27609.firebaseapp.com",
  projectId: "stichsmart-27609",
  storageBucket: "stichsmart-27609.firebasestorage.app",
  messagingSenderId: "950545083064",
  appId: "1:950545083064:web:02986e0c231517d1bc224d"
};

// Global variables to hold Firebase instances
let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let storage: any = null;

// Initialize Firebase with configuration
export const initializeFirebase = (config: FirebaseConfig = defaultFirebaseConfig) => {
  try {
    // Check if Firebase is already initialized
    if (app) {
      console.log("Firebase already initialized, reinitializing with new config");
    }
    
    app = initializeApp(config);
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);
    
    console.log("Firebase initialized successfully");
    
    return { app, db, auth, storage, initialized: true };
  } catch (error) {
    console.error("Error initializing Firebase:", error);
    return { initialized: false, error };
  }
};

// Auto initialize Firebase with the default config
initializeFirebase();

// Check if Firebase is initialized
export const isFirebaseInitialized = () => {
  return !!app && !!db;
};

// Get Firebase instances (only if initialized)
export const getFirebaseInstances = () => {
  if (!isFirebaseInitialized()) {
    console.warn("Firebase not initialized yet. Call initializeFirebase first.");
    return null;
  }
  
  return { app, db, auth, storage };
};

// Export the db and auth instances directly so they can be imported in components
export { db, auth };

// Firebase Authentication Service
export const authService = {
  // Get current user
  getCurrentUser: () => {
    if (!auth) return null;
    return auth.currentUser;
  },

  // Create a new user with email and password
  createUser: async (email: string, password: string): Promise<{user: FirebaseUser, error: null} | {user: null, error: string}> => {
    if (!auth) {
      console.error("Firebase Auth not initialized");
      return { user: null, error: "Firebase Auth not initialized" };
    }
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return { user: userCredential.user, error: null };
    } catch (error: any) {
      console.error("Error creating user:", error);
      return { user: null, error: error.message || "Failed to create user" };
    }
  },
  
  // Sign in with email and password
  signIn: async (email: string, password: string): Promise<{user: FirebaseUser, error: null} | {user: null, error: string}> => {
    if (!auth) {
      console.error("Firebase Auth not initialized");
      return { user: null, error: "Firebase Auth not initialized" };
    }
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { user: userCredential.user, error: null };
    } catch (error: any) {
      console.error("Error signing in:", error);
      return { user: null, error: error.message || "Failed to sign in" };
    }
  },
  
  // Sign out the current user
  signOut: async (): Promise<{success: boolean, error: string | null}> => {
    if (!auth) {
      return { success: false, error: "Firebase Auth not initialized" };
    }
    
    try {
      await signOut(auth);
      return { success: true, error: null };
    } catch (error: any) {
      console.error("Error signing out:", error);
      return { success: false, error: error.message || "Failed to sign out" };
    }
  },
  
  // Send password reset email
  sendPasswordResetEmail: async (email: string): Promise<{success: boolean, error: string | null}> => {
    if (!auth) {
      return { success: false, error: "Firebase Auth not initialized" };
    }
    
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true, error: null };
    } catch (error: any) {
      console.error("Error sending password reset email:", error);
      return { success: false, error: error.message || "Failed to send password reset email" };
    }
  },
  
  // Update user email
  updateUserEmail: async (newEmail: string, currentPassword: string): Promise<{success: boolean, error: string | null}> => {
    if (!auth || !auth.currentUser) {
      return { success: false, error: "No authenticated user" };
    }
    
    try {
      // Re-authenticate user before changing email
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email || '', 
        currentPassword
      );
      
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updateEmail(auth.currentUser, newEmail);
      
      return { success: true, error: null };
    } catch (error: any) {
      console.error("Error updating email:", error);
      return { success: false, error: error.message || "Failed to update email" };
    }
  },
  
  // Update user password
  updateUserPassword: async (currentPassword: string, newPassword: string): Promise<{success: boolean, error: string | null}> => {
    if (!auth || !auth.currentUser) {
      return { success: false, error: "No authenticated user" };
    }
    
    try {
      // Re-authenticate user before changing password
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email || '', 
        currentPassword
      );
      
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      
      return { success: true, error: null };
    } catch (error: any) {
      console.error("Error updating password:", error);
      return { success: false, error: error.message || "Failed to update password" };
    }
  },
  
  // Send email verification
  sendEmailVerification: async (): Promise<{success: boolean, error: string | null}> => {
    if (!auth || !auth.currentUser) {
      return { success: false, error: "No authenticated user" };
    }
    
    try {
      await sendEmailVerification(auth.currentUser);
      return { success: true, error: null };
    } catch (error: any) {
      console.error("Error sending email verification:", error);
      return { success: false, error: error.message || "Failed to send email verification" };
    }
  }
};

// Store Firebase config in localStorage
export const storeFirebaseConfig = (config: FirebaseConfig) => {
  localStorage.setItem('firebase_config', JSON.stringify(config));
};

// Get Firebase config from localStorage
export const getFirebaseConfig = (): FirebaseConfig | null => {
  const config = localStorage.getItem('firebase_config');
  return config ? JSON.parse(config) : null;
};

// Auto-initialize Firebase if config exists in localStorage
export const autoInitializeFirebase = () => {
  const config = getFirebaseConfig();
  if (config) {
    return initializeFirebase(config);
  }
  return { initialized: false };
};

// Firestore CRUD operations
export const firestoreService = {
  // Check if Firebase is initialized
  isFirebaseInitialized: () => {
    return isFirebaseInitialized();
  },

  // Add these two new methods to the firestoreService object

// Check if document exists
documentExists: async (collectionName: string, docId: string): Promise<boolean> => {
  if (!isFirebaseInitialized() || !db) return false;
  
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  } catch (error) {
    console.error(`Error checking if document exists in ${collectionName}:`, error);
    return false;
  }
},

// Add document with specific ID
addDocumentWithId: async (collectionName: string, docId: string, data: any) => {
  if (!isFirebaseInitialized() || !db) return null;
  
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, {
      ...data,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return docId;
  } catch (error) {
    console.error(`Error adding document with ID to ${collectionName}:`, error);
    throw error;
  }
},

  // Add document to collection
  addDocument: async (collectionName: string, data: any) => {
    if (!isFirebaseInitialized() || !db) return null;
    
    try {
      const result = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return { id: result.id, ...data };
    } catch (error) {
      console.error(`Error adding document to ${collectionName}:`, error);
      return null;
    }
  },
  
  // Get document by ID
  getDocumentById: async (collectionName: string, id: string) => {
    if (!isFirebaseInitialized() || !db) return null;
    
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      } else {
        console.log(`No document found with ID: ${id}`);
        return null;
      }
    } catch (error) {
      console.error(`Error getting document by ID from ${collectionName}:`, error);
      return null;
    }
  },
  
  // Get all documents from collection
  getDocuments: async (collectionName: string) => {
    if (!isFirebaseInitialized() || !db) return [];
    
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error(`Error getting documents from ${collectionName}:`, error);
      return [];
    }
  },
  
  // Get documents with ordering
  getOrderedDocuments: async (collectionName: string, orderByField: string, direction: 'asc' | 'desc' = 'desc') => {
    if (!isFirebaseInitialized() || !db) return [];
    
    try {
      const q = query(collection(db, collectionName), orderBy(orderByField, direction));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error(`Error getting ordered documents from ${collectionName}:`, error);
      return [];
    }
  },
  
  // Get documents by field value
  getDocumentsByField: async (collectionName: string, field: string, value: any) => {
    if (!isFirebaseInitialized() || !db) return [];
    
    try {
      const q = query(collection(db, collectionName), where(field, '==', value));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error(`Error getting documents by field from ${collectionName}:`, error);
      return [];
    }
  },
  
  // Update document in collection
  updateDocument: async (collectionName: string, docId: string, data: any) => {
    if (!isFirebaseInitialized() || !db) return false;
    
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error(`Error updating document in ${collectionName}:`, error);
      return false;
    }
  },
  
  // Delete document from collection
  deleteDocument: async (collectionName: string, docId: string) => {
    if (!isFirebaseInitialized() || !db) return false;
    
    try {
      await deleteDoc(doc(db, collectionName, docId));
      return true;
    } catch (error) {
      console.error(`Error deleting document from ${collectionName}:`, error);
      return false;
    }
  },
  
  // Subscribe to collection changes
  subscribeToCollection: (collectionName: string, callback: (data: DocumentData[]) => void) => {
    if (!isFirebaseInitialized() || !db) {
      callback([]);
      return () => {};
    }
    
    const q = collection(db, collectionName);
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const documents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(documents);
    });
    
    return unsubscribe;
  },
  
  // Subscribe to collection with ordering
  subscribeToOrderedCollection: (
    collectionName: string, 
    callback: (data: DocumentData[]) => void,
    orderByField: string,
    direction: 'asc' | 'desc' = 'desc'
  ) => {
    if (!isFirebaseInitialized() || !db) {
      callback([]);
      return () => {};
    }
    
    const q = query(
      collection(db, collectionName),
      orderBy(orderByField, direction)
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const documents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(documents);
    });
    
    return unsubscribe;
  },
  
  // Subscribe to filtered collection
  subscribeToFilteredCollection: (
    collectionName: string,
    callback: (data: DocumentData[]) => void,
    field: string,
    value: any
  ) => {
    if (!isFirebaseInitialized() || !db) {
      callback([]);
      return () => {};
    }
    
    const q = query(
      collection(db, collectionName),
      where(field, '==', value)
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const documents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(documents);
    });
    
    return unsubscribe;
  }
};
