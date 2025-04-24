
import { STORES, add, getAll, update, getById, deleteRecord } from '@/lib/indexedDb';
import { syncWithServer } from '@/lib/indexedDb';
import { firestoreService } from '@/services/firebase';
import { toast } from "sonner";

// Import useStore only for TypeScript types, not for direct usage
import { useStore } from '@/store/useStore';

export interface DeliveryItem {
  id?: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  items: string[];
  status: 'pending' | 'in-transit' | 'delivered' | 'cancelled';
  dueDate: string;
  deliveryDate?: string;
  deliveryAgent?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const DELIVERY_COLLECTION = 'deliveries';
const ORDER_COLLECTION = 'orders';

// Get all delivery items from Firebase and fallback to IndexedDB
export const getDeliveryItems = async (): Promise<DeliveryItem[]> => {
  try {
    if (firestoreService.isFirebaseInitialized()) {
      const deliveries = await firestoreService.getDocuments(DELIVERY_COLLECTION);
      return deliveries as DeliveryItem[];
    } else {
      // Fallback to IndexedDB
      const deliveries = await getAll<DeliveryItem>(STORES.ORDERS);
      return deliveries.filter(delivery => delivery.status);
    }
  } catch (error) {
    console.error('Error fetching delivery items:', error);
    toast.error('Failed to load delivery items');
    return [];
  }
};

// Get delivery items by status
export const getDeliveryItemsByStatus = async (status: string): Promise<DeliveryItem[]> => {
  try {
    if (firestoreService.isFirebaseInitialized()) {
      const deliveries = await firestoreService.getDocumentsByField(DELIVERY_COLLECTION, 'status', status);
      return deliveries as DeliveryItem[];
    } else {
      // Fallback to IndexedDB filtering
      const allDeliveries = await getDeliveryItems();
      return allDeliveries.filter(delivery => delivery.status === status);
    }
  } catch (error) {
    console.error(`Error fetching ${status} deliveries:`, error);
    toast.error(`Failed to load ${status} deliveries`);
    return [];
  }
};

// Get delivery by ID
export const getDeliveryById = async (id: string): Promise<DeliveryItem | null> => {
  try {
    if (firestoreService.isFirebaseInitialized()) {
      const delivery = await firestoreService.getDocumentById(DELIVERY_COLLECTION, id);
      return delivery as DeliveryItem;
    } else {
      // Fallback to IndexedDB
      const delivery = await getById<DeliveryItem>(STORES.ORDERS, id);
      return delivery;
    }
  } catch (error) {
    console.error(`Error fetching delivery ${id}:`, error);
    toast.error(`Failed to load delivery details`);
    return null;
  }
};

// Get order details for a delivery
export const getOrderDetails = async (orderId: string) => {
  try {
    if (firestoreService.isFirebaseInitialized()) {
      const order = await firestoreService.getDocumentById(ORDER_COLLECTION, orderId);
      return order;
    } else {
      // Fallback to IndexedDB
      const order = await getById(STORES.ORDERS, orderId);
      return order;
    }
  } catch (error) {
    console.error(`Error fetching order ${orderId}:`, error);
    toast.error(`Failed to load order details`);
    return null;
  }
};

// Add a delivery
export const addDelivery = async (delivery: Omit<DeliveryItem, 'id'>): Promise<DeliveryItem | null> => {
  try {
    if (firestoreService.isFirebaseInitialized()) {
      // Add to Firebase
      const result = await firestoreService.addDocument(DELIVERY_COLLECTION, delivery);
      if (result) {
        toast.success("Delivery added successfully!");
        return result as DeliveryItem;
      }
    } else {
      // Add to IndexedDB
      const id = await add(STORES.ORDERS, delivery);
      if (id) {
        toast.success("Delivery saved locally. Will sync when online.");
        return { ...delivery, id: id.toString() };
      }
    }
    return null;
  } catch (error) {
    console.error('Error adding delivery:', error);
    toast.error('Failed to add delivery');
    return null;
  }
};

// Update delivery
export const updateDelivery = async (id: string, deliveryData: Partial<DeliveryItem>): Promise<boolean> => {
  try {
    if (firestoreService.isFirebaseInitialized()) {
      const success = await firestoreService.updateDocument(
        DELIVERY_COLLECTION, 
        id, 
        {
          ...deliveryData,
          updatedAt: new Date().toISOString()
        }
      );
      if (success) {
        toast.success("Delivery updated successfully!");
      }
      return success;
    } else {
      // Update in IndexedDB
      const delivery = await getById<DeliveryItem>(STORES.ORDERS, id);
      if (delivery) {
        const updatedDelivery = {
          ...delivery,
          ...deliveryData,
          updatedAt: new Date().toISOString()
        };
        await update(STORES.ORDERS, updatedDelivery);
        toast.success("Delivery updated locally. Will sync when online.");
        return true;
      }
      return false;
    }
  } catch (error) {
    console.error('Error updating delivery:', error);
    toast.error('Failed to update delivery');
    return false;
  }
};

// Delete delivery
export const deleteDelivery = async (id: string): Promise<boolean> => {
  try {
    if (firestoreService.isFirebaseInitialized()) {
      const success = await firestoreService.deleteDocument(DELIVERY_COLLECTION, id);
      if (success) {
        toast.success("Delivery deleted successfully!");
      }
      return success;
    } else {
      // Delete from IndexedDB
      await deleteRecord(STORES.ORDERS, id);
      toast.success("Delivery deleted locally. Will sync when online.");
      return true;
    }
  } catch (error) {
    console.error('Error deleting delivery:', error);
    toast.error('Failed to delete delivery');
    return false;
  }
};

// Update delivery status
export const updateDeliveryStatus = async (
  id: string, 
  status: 'pending' | 'in-transit' | 'delivered' | 'cancelled',
  isOnline: boolean
): Promise<boolean> => {
  try {
    let success = false;
    
    if (firestoreService.isFirebaseInitialized() && isOnline) {
      // Update in Firebase
      success = await firestoreService.updateDocument(DELIVERY_COLLECTION, id, {
        status,
        updatedAt: new Date().toISOString(),
        deliveryDate: status === 'delivered' ? new Date().toISOString() : undefined
      });
      
      if (success) {
        toast.success(`Delivery status updated to ${status}`);
      }
    } else {
      // Update in IndexedDB
      let delivery;
      
      try {
        // Try to get from IndexedDB first
        delivery = await getById<DeliveryItem>(STORES.ORDERS, id);
      } catch (error) {
        console.error('Error fetching from IndexedDB, creating new record for sync');
      }
      
      if (delivery) {
        const updatedDelivery = {
          ...delivery,
          status,
          updatedAt: new Date().toISOString(),
          deliveryDate: status === 'delivered' ? new Date().toISOString() : delivery.deliveryDate
        };
        
        await update(STORES.ORDERS, updatedDelivery);
        success = true;
      }
      
      // Mark for sync when online
      localStorage.setItem(`sync_delivery_${id}`, JSON.stringify({
        id,
        status,
        updatedAt: new Date().toISOString(),
        deliveryDate: status === 'delivered' ? new Date().toISOString() : undefined
      }));
      
      toast.success(`Delivery status updated to ${status} (offline)`);
      success = true;
    }
    
    return success;
  } catch (error) {
    console.error('Error updating delivery status:', error);
    toast.error('Failed to update delivery status');
    return false;
  }
};

// Sync all pending delivery changes with Firebase
export const syncPendingDeliveryChanges = async (isOnline: boolean): Promise<void> => {
  if (!firestoreService.isFirebaseInitialized() || !isOnline) {
    return;
  }
  
  try {
    // Find all pending sync items in localStorage
    const pendingSyncKeys = Object.keys(localStorage).filter(key => key.startsWith('sync_delivery_'));
    
    for (const key of pendingSyncKeys) {
      const deliveryData = JSON.parse(localStorage.getItem(key) || '{}');
      const id = key.replace('sync_delivery_', '');
      
      // Send to Firebase
      await firestoreService.updateDocument(DELIVERY_COLLECTION, id, deliveryData);
      
      // Remove from pending sync
      localStorage.removeItem(key);
    }
    
    if (pendingSyncKeys.length > 0) {
      toast.success(`Synced ${pendingSyncKeys.length} delivery changes`);
    }
  } catch (error) {
    console.error('Error syncing pending delivery changes:', error);
    toast.error('Failed to sync some delivery changes');
  }
};

// Subscribe to deliveries by status
export const subscribeToDeliveriesByStatus = (
  status: string, 
  callback: (deliveries: DeliveryItem[]) => void
): (() => void) => {
  if (!firestoreService.isFirebaseInitialized()) {
    // If Firebase isn't available, return a no-op function
    callback([]);
    return () => {};
  }
  
  return firestoreService.subscribeToFilteredCollection(
    DELIVERY_COLLECTION,
    data => callback(data as DeliveryItem[]),
    'status',
    status
  );
};

// Subscribe to all deliveries
export const subscribeToAllDeliveries = (
  callback: (deliveries: DeliveryItem[]) => void
): (() => void) => {
  if (!firestoreService.isFirebaseInitialized()) {
    // If Firebase isn't available, return a no-op function
    callback([]);
    return () => {};
  }
  
  return firestoreService.subscribeToCollection(
    DELIVERY_COLLECTION,
    data => callback(data as DeliveryItem[])
  );
};

// Sync deliveries with Firebase
export const syncDeliveriesWithFirebase = async (isOnline: boolean): Promise<void> => {
  if (!firestoreService.isFirebaseInitialized()) return;
  
  // First, sync any pending changes
  await syncPendingDeliveryChanges(isOnline);
  
  // Then sync all deliveries
  await syncWithServer(STORES.ORDERS);
};
