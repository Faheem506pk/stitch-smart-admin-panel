
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useStore } from "@/store/useStore";
import { usePermissions } from "@/hooks/use-permissions";
import { UnauthorizedMessage } from "./UnauthorizedMessage";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: {
    section: 'customers' | 'orders' | 'measurements' | 'payments' | 'employees' | 'settings';
    action: 'view' | 'add' | 'edit' | 'delete';
  };
}

export function ProtectedRoute({ children, requiredPermission }: ProtectedRouteProps) {
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const { hasPermission } = usePermissions();
  const user = useStore((state) => state.user);

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // If no specific permission is required, allow access
  if (!requiredPermission) {
    return <>{children}</>;
  }

  // Admin users have all permissions
  if (user?.role === 'admin') {
    return <>{children}</>;
  }

  // Check if the user has the required permission
  const { section, action } = requiredPermission;
  if (!hasPermission(section, action)) {
    // Show unauthorized message instead of redirecting
    return (
      <div className="container mx-auto py-8">
        <UnauthorizedMessage 
          title="Access Denied" 
          description={`You don't have permission to ${action} ${section}. Please contact your administrator if you need access.`}
        />
      </div>
    );
  }

  return <>{children}</>;
}
