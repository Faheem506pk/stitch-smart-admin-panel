import { useStore } from '@/store/useStore';

// Check if the current user has permission for a specific action
export const hasPermission = (section: string, action: 'view' | 'add' | 'edit' | 'delete'): boolean => {
  const { user } = useStore.getState();
  
  if (!user) return false;
  
  // Admins have all permissions
  if (user.role === 'admin') return true;
  
  // Check specific permission
  return user.permissions?.[section]?.[action] === true;
};

// React hook for checking permissions
export const usePermissions = () => {
  const { user } = useStore();
  
  const canView = (section: string): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.permissions?.[section]?.view === true;
  };
  
  const canAdd = (section: string): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.permissions?.[section]?.add === true;
  };
  
  const canEdit = (section: string): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.permissions?.[section]?.edit === true;
  };
  
  const canDelete = (section: string): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.permissions?.[section]?.delete === true;
  };
  
  return { canView, canAdd, canEdit, canDelete };
};
