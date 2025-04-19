
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, deleteDoc, query, where, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Global variables to hold Firebase instances
let app;
let db;
let auth;
let storage;

// Initialize Firebase with configuration
export const initializeFirebase = (config: FirebaseConfig) => {
  try {
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

// Check if Firebase is initialized
export const isFirebaseInitialized = () => {
  return !!app;
};

// Get Firebase instances (only if initialized)
export const getFirebaseInstances = () => {
  if (!isFirebaseInitialized()) {
    console.warn("Firebase not initialized yet. Call initializeFirebase first.");
    return null;
  }
  
  return { app, db, auth, storage };
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
  // Add document to collection
  addDocument: async (collectionName: string, data: any) => {
    if (!isFirebaseInitialized()) return null;
    
    try {
      const result = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return { id: result.id, ...data };
    } catch (error) {
      console.error(`Error adding document to ${collectionName}:`, error);
      return null;
    }
  },
  
  // Get all documents from collection
  getDocuments: async (collectionName: string) => {
    if (!isFirebaseInitialized()) return [];
    
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
  
  // Update document in collection
  updateDocument: async (collectionName: string, docId: string, data: any) => {
    if (!isFirebaseInitialized()) return false;
    
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
    if (!isFirebaseInitialized()) return false;
    
    try {
      await deleteDoc(doc(db, collectionName, docId));
      return true;
    } catch (error) {
      console.error(`Error deleting document from ${collectionName}:`, error);
      return false;
    }
  },
  
  // Subscribe to collection changes
  subscribeToCollection: (collectionName: string, callback: (data: any[]) => void) => {
    if (!isFirebaseInitialized()) {
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
  }
};
