import { Shield, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface UnauthorizedMessageProps {
  title?: string;
  description?: string;
  showIcon?: boolean;
}

/**
 * A component to display when a user doesn't have permission to access a feature
 */
export function UnauthorizedMessage({
  title = "Access Restricted",
  description = "You don't have permission to access this feature. Please contact your administrator if you need access.",
  showIcon = true
}: UnauthorizedMessageProps) {
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader className="text-center">
        {showIcon && (
          <div className="flex justify-center mb-2">
            <div className="rounded-full bg-amber-100 dark:bg-amber-900 p-3 text-amber-600 dark:text-amber-300">
              <AlertCircle className="h-6 w-6" />
            </div>
          </div>
        )}
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-1">
          <Shield className="h-4 w-4" />
          <span>Permission required</span>
        </div>
      </CardContent>
    </Card>
  );
}
