import { User } from '@/types/models';

/**
 * Check if a user has a specific permission
 * 
 * @param user The user to check permissions for
 * @param section The section to check permission for
 * @param action The action to check permission for
 * @returns True if the user has permission, false otherwise
 */
export function checkPermission(
  user: User | null,
  section: 'customers' | 'orders' | 'measurements' | 'payments' | 'employees' | 'settings',
  action: 'view' | 'add' | 'edit' | 'delete'
): boolean {
  // If no user, no permission
  if (!user) return false;
  
  // Admin users have all permissions
  if (user.role === 'admin') return true;
  
  // Check if the user has the specific permission
  return user.permissions?.[section]?.[action] === true;
}

/**
 * Get a list of all permissions a user has
 * 
 * @param user The user to get permissions for
 * @returns An array of permission objects with section and action
 */
export function getUserPermissions(user: User | null): Array<{section: string, action: string}> {
  if (!user) return [];
  
  // Admin users have all permissions
  if (user.role === 'admin') {
    return [
      // Customers
      { section: 'customers', action: 'view' },
      { section: 'customers', action: 'add' },
      { section: 'customers', action: 'edit' },
      { section: 'customers', action: 'delete' },
      // Orders
      { section: 'orders', action: 'view' },
      { section: 'orders', action: 'add' },
      { section: 'orders', action: 'edit' },
      { section: 'orders', action: 'delete' },
      // Measurements
      { section: 'measurements', action: 'view' },
      { section: 'measurements', action: 'add' },
      { section: 'measurements', action: 'edit' },
      // Payments
      { section: 'payments', action: 'view' },
      { section: 'payments', action: 'add' },
      // Employees
      { section: 'employees', action: 'view' },
      { section: 'employees', action: 'add' },
      { section: 'employees', action: 'edit' },
      { section: 'employees', action: 'delete' },
      // Settings
      { section: 'settings', action: 'view' },
      { section: 'settings', action: 'edit' },
    ];
  }
  
  // For regular users, check each permission
  const permissions: Array<{section: string, action: string}> = [];
  
  // Iterate through all sections and actions
  const sections = ['customers', 'orders', 'measurements', 'payments', 'employees', 'settings'];
  const actions = ['view', 'add', 'edit', 'delete'];
  
  for (const section of sections) {
    for (const action of actions) {
      // Skip if the action doesn't exist for this section
      if (
        (section === 'measurements' && action === 'delete') ||
        (section === 'payments' && (action === 'edit' || action === 'delete')) ||
        (section === 'settings' && (action === 'add' || action === 'delete'))
      ) {
        continue;
      }
      
      // Check if the user has this permission
      if (user.permissions?.[section as keyof typeof user.permissions]?.[action as any] === true) {
        permissions.push({ section, action });
      }
    }
  }
  
  return permissions;
}
