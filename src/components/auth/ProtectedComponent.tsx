import { ReactNode } from 'react';
import { useStore } from '@/store/useStore';
import { UnauthorizedMessage } from './UnauthorizedMessage';

interface ProtectedComponentProps {
  children: ReactNode;
  requiredPermission: {
    section: 'customers' | 'orders' | 'measurements' | 'payments' | 'employees' | 'settings';
    action: 'view' | 'add' | 'edit' | 'delete';
  };
  fallback?: ReactNode;
}

/**
 * A component that only renders its children if the current user has the required permission.
 * If the user doesn't have the permission, it renders the fallback component (if provided).
 * 
 * @example
 * <ProtectedComponent 
 *   requiredPermission={{ section: 'customers', action: 'edit' }}
 *   fallback={<p>You don't have permission to edit customers</p>}
 * >
 *   <CustomerEditForm />
 * </ProtectedComponent>
 */
export function ProtectedComponent({
  children,
  requiredPermission,
  fallback = <UnauthorizedMessage />,
}: ProtectedComponentProps) {
  const user = useStore((state) => state.user);
  
  // If no user is logged in, don't render anything
  if (!user) {
    return null;
  }
  
  // Admin users have all permissions
  if (user.role === 'admin') {
    return <>{children}</>;
  }
  
  // Check if the user has the required permission
  const { section, action } = requiredPermission;
  const hasPermission = user.permissions?.[section]?.[action] === true;
  
  // Render children if the user has permission, otherwise render the fallback
  return hasPermission ? <>{children}</> : <>{fallback}</>;
}
