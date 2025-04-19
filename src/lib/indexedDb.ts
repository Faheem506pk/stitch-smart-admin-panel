
// IndexedDB utilities for offline data storage

// Define database settings
const DB_NAME = 'TailorShopDB';
const DB_VERSION = 1;

// Define stores (tables)
export const STORES = {
  CUSTOMERS: 'customers',
  ORDERS: 'orders',
  EMPLOYEES: 'employees',
  MEASUREMENTS: 'measurements',
  PAYMENTS: 'payments',
};

// Open database connection
export const openDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject('Error opening IndexedDB');
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    // This is called if the database doesn't exist or needs an update
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create stores with indexes for each entity
      if (!db.objectStoreNames.contains(STORES.CUSTOMERS)) {
        const customerStore = db.createObjectStore(STORES.CUSTOMERS, { keyPath: 'id', autoIncrement: true });
        customerStore.createIndex('email', 'email', { unique: true });
        customerStore.createIndex('name', 'name', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(STORES.ORDERS)) {
        const orderStore = db.createObjectStore(STORES.ORDERS, { keyPath: 'id', autoIncrement: true });
        orderStore.createIndex('customerId', 'customerId', { unique: false });
        orderStore.createIndex('status', 'status', { unique: false });
        orderStore.createIndex('createdAt', 'createdAt', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(STORES.EMPLOYEES)) {
        const employeeStore = db.createObjectStore(STORES.EMPLOYEES, { keyPath: 'id', autoIncrement: true });
        employeeStore.createIndex('email', 'email', { unique: true });
        employeeStore.createIndex('role', 'role', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(STORES.MEASUREMENTS)) {
        const measurementStore = db.createObjectStore(STORES.MEASUREMENTS, { keyPath: 'id', autoIncrement: true });
        measurementStore.createIndex('customerId', 'customerId', { unique: false });
        measurementStore.createIndex('type', 'type', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(STORES.PAYMENTS)) {
        const paymentStore = db.createObjectStore(STORES.PAYMENTS, { keyPath: 'id', autoIncrement: true });
        paymentStore.createIndex('orderId', 'orderId', { unique: false });
        paymentStore.createIndex('date', 'date', { unique: false });
      }
    };
  });
};

// Generic get all records from a store
export const getAll = async <T>(storeName: string): Promise<T[]> => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result as T[]);
    };

    request.onerror = () => {
      reject(`Error getting records from ${storeName}`);
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
};

// Generic add record to a store
export const add = async <T>(storeName: string, data: T): Promise<IDBValidKey> => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add(data);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(`Error adding record to ${storeName}`);
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
};

// Generic update record in a store
export const update = async <T>(storeName: string, data: T): Promise<IDBValidKey> => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(data);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(`Error updating record in ${storeName}`);
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
};

// Generic get by id from a store
export const getById = async <T>(storeName: string, id: IDBValidKey): Promise<T | undefined> => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result as T | undefined);
    };

    request.onerror = () => {
      reject(`Error getting record from ${storeName}`);
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
};

// Generic delete from a store
export const deleteRecord = async (storeName: string, id: IDBValidKey): Promise<void> => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(`Error deleting record from ${storeName}`);
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
};

// Example of a utility to sync data with Firebase when online
export const syncWithServer = async (storeName: string): Promise<void> => {
  try {
    // Check if we're online
    if (!navigator.onLine) {
      console.log('Cannot sync - device is offline');
      return;
    }
    
    // Get all local records
    const localRecords = await getAll(storeName);
    
    // In a real app, you would:
    // 1. Get the timestamp of the last sync
    // 2. Fetch changes from Firebase since that time
    // 3. Apply those changes to IndexedDB
    // 4. Send local changes to Firebase
    
    console.log(`Synced ${localRecords.length} records from ${storeName}`);
    
    // For now, just log that we would sync these
    console.log('Would sync these records:', localRecords);
    
    // Update the last sync timestamp
    localStorage.setItem(`${storeName}_last_sync`, new Date().toISOString());
  } catch (error) {
    console.error('Sync error:', error);
  }
};
