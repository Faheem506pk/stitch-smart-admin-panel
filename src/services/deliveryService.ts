
import { STORES, add, getAll, update, getById, deleteRecord } from '@/lib/indexedDb';
import { syncWithServer } from '@/lib/indexedDb';
import { firestoreService, isFirebaseInitialized } from '@/services/firebase';
import { toast } from "sonner";
import { useStore } from '@/store/useStore';

export interface DeliveryItem {
  id?: number;
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

// Get all delivery items from IndexedDB
export const getDeliveryItems = async (): Promise<DeliveryItem[]> => {
  try {
    const deliveries = await getAll<DeliveryItem>(STORES.ORDERS);
    return deliveries.filter(delivery => delivery.status);
  } catch (error) {
    console.error('Error fetching delivery items:', error);
    toast.error('Failed to load delivery items');
    return [];
  }
};

// Get delivery items by status
export const getDeliveryItemsByStatus = async (status: string): Promise<DeliveryItem[]> => {
  try {
    const allDeliveries = await getDeliveryItems();
    return allDeliveries.filter(delivery => delivery.status === status);
  } catch (error) {
    console.error(`Error fetching ${status} deliveries:`, error);
    toast.error(`Failed to load ${status} deliveries`);
    return [];
  }
};

// Update delivery status
export const updateDeliveryStatus = async (id: number, status: 'pending' | 'in-transit' | 'delivered' | 'cancelled'): Promise<boolean> => {
  try {
    const delivery = await getById<DeliveryItem>(STORES.ORDERS, id);
    if (!delivery) {
      toast.error('Delivery not found');
      return false;
    }
    
    // Update local IndexedDB
    const updatedDelivery = {
      ...delivery,
      status,
      updatedAt: new Date().toISOString(),
      deliveryDate: status === 'delivered' ? new Date().toISOString() : delivery.deliveryDate
    };
    
    await update(STORES.ORDERS, updatedDelivery);
    
    // Sync with Firebase if online
    if (isFirebaseInitialized() && useStore.getState().isOnline) {
      await firestoreService.updateDocument(DELIVERY_COLLECTION, String(id), {
        status,
        updatedAt: new Date().toISOString(),
        deliveryDate: status === 'delivered' ? new Date().toISOString() : delivery.deliveryDate
      });
    } else {
      // Mark for sync when online
      localStorage.setItem(`sync_delivery_${id}`, JSON.stringify(updatedDelivery));
    }
    
    toast.success(`Delivery status updated to ${status}`);
    return true;
  } catch (error) {
    console.error('Error updating delivery status:', error);
    toast.error('Failed to update delivery status');
    return false;
  }
};

// Sync all pending delivery changes with Firebase
export const syncPendingDeliveryChanges = async (): Promise<void> => {
  if (!isFirebaseInitialized() || !useStore.getState().isOnline) {
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

// Sync deliveries with Firebase
export const syncDeliveriesWithFirebase = async (): Promise<void> => {
  if (!isFirebaseInitialized()) return;
  
  // First, sync any pending changes
  await syncPendingDeliveryChanges();
  
  // Then sync all deliveries
  await syncWithServer(STORES.ORDERS);
};
