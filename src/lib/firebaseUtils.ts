
import { firestoreService } from '@/services/firebase';

// Utility function to convert Firebase Timestamp to ISO string
export const timestampToISOString = (timestamp: any): string => {
  if (!timestamp) return new Date().toISOString();
  
  // Handle Firebase Timestamp objects
  if (timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate().toISOString();
  }
  
  // Handle ISO string timestamps
  if (typeof timestamp === 'string') {
    return timestamp;
  }
  
  // Handle numbers (seconds or milliseconds since epoch)
  if (typeof timestamp === 'number') {
    return new Date(timestamp < 10000000000 ? timestamp * 1000 : timestamp).toISOString();
  }
  
  // Default fallback
  return new Date().toISOString();
};

// Function to ensure all collections exist
export const ensureCollectionsExist = async (): Promise<void> => {
  const collections = [
    'customers',
    'employees',
    'orders',
    'measurements',
    'payments',
    'deliveries',
    'measurementTypes'
  ];
  
  for (const collection of collections) {
    try {
      // Try to get documents to check if collection exists
      const docs = await firestoreService.getDocuments(collection);
      console.log(`Collection ${collection} exists with ${docs.length} documents`);
    } catch (error) {
      console.log(`Creating collection ${collection}...`);
      // Create collection by adding a dummy document
      const dummyDoc = await firestoreService.addDocument(collection, {
        _metadata: {
          collectionInitialized: true,
          createdAt: new Date().toISOString()
        }
      });
      
      // Delete the dummy document if it was created
      if (dummyDoc && dummyDoc.id) {
        await firestoreService.deleteDocument(collection, dummyDoc.id);
      }
    }
  }
};

// Initialize Firebase on app start
export const initializeFirebaseApp = async (): Promise<void> => {
  // Ensure Firestore collections exist
  await ensureCollectionsExist();
  
  // Add any other Firebase initialization here
  console.log('Firebase app initialized successfully');
};
