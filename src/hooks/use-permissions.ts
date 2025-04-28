import { useStore } from '@/store/useStore';

/**
 * A hook that provides functions to check if the current user has specific permissions.
 * 
 * @returns An object with functions to check permissions
 * 
 * @example
 * const { canView, canAdd, canEdit, canDelete } = usePermissions();
 * 
 * if (canView('customers')) {
 *   // Render customer list
 * }
 * 
 * // Disable button if user can't add customers
 * <Button disabled={!canAdd('customers')}>Add Customer</Button>
 */
export function usePermissions() {
  const user = useStore((state) => state.user);
  
  /**
   * Check if the current user has permission to view a specific section
   */
  const canView = (section: 'customers' | 'orders' | 'measurements' | 'payments' | 'employees' | 'settings'): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.permissions?.[section]?.view === true;
  };
  
  /**
   * Check if the current user has permission to add items in a specific section
   */
  const canAdd = (section: 'customers' | 'orders' | 'measurements' | 'payments' | 'employees'): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.permissions?.[section]?.add === true;
  };
  
  /**
   * Check if the current user has permission to edit items in a specific section
   */
  const canEdit = (section: 'customers' | 'orders' | 'measurements' | 'settings' | 'employees'): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.permissions?.[section]?.edit === true;
  };
  
  /**
   * Check if the current user has permission to delete items in a specific section
   */
  const canDelete = (section: 'customers' | 'orders' | 'employees'): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.permissions?.[section]?.delete === true;
  };
  
  /**
   * Check if the current user has a specific permission
   */
  const hasPermission = (
    section: 'customers' | 'orders' | 'measurements' | 'payments' | 'employees' | 'settings',
    action: 'view' | 'add' | 'edit' | 'delete'
  ): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.permissions?.[section]?.[action] === true;
  };
  
  return {
    canView,
    canAdd,
    canEdit,
    canDelete,
    hasPermission
  };
}
