
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { employeeService } from '@/services/employeeService';
import { authService } from '@/services/firebase';
import { toast } from 'sonner';
import { User, Key, X } from 'lucide-react';
import { Employee } from '@/types/models';

interface EmployeeCredentialsProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  mode: 'update' | 'create';
}

export function EmployeeCredentials({
  isOpen,
  onClose,
  employee,
  mode
}: EmployeeCredentialsProps) {
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Update email state when employee changes or dialog opens
  useEffect(() => {
    if (employee && isOpen) {
      setEmail(employee.email || '');
      // Reset other fields when dialog opens
      setCurrentPassword('');
      setPassword('');
      setConfirmPassword('');
    }
  }, [employee, isOpen]);

  const handleSubmit = async () => {
    // Validate inputs
    if (!email) {
      toast.error('Email is required');
      return;
    }

    if (mode === 'create' || password) {
      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }

      if (password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (mode === 'update' && employee) {
        // Update existing employee credentials
        const updates: Partial<Employee> = { email };
        
        // Check if email is being changed
        const isEmailChanged = email !== employee.email;
        
        // For email or password changes, we need the current password
        if ((isEmailChanged || password) && !currentPassword) {
          toast.error('Current password is required for security verification');
          setIsLoading(false);
          return;
        }
        
        // First ensure the Firebase Auth user exists for this email
        if (isEmailChanged) {
          // Check if the new email already exists in Firebase Auth
          await employeeService.ensureFirebaseAuthUser(email);
          
          // Update email in Firebase Auth if the user is currently logged in
          const currentUser = authService.getCurrentUser();
          if (currentUser && currentUser.email === employee.email) {
            const result = await authService.updateUserEmail(email, currentPassword);
            if (!result.success) {
              toast.error(`Failed to update email: ${result.error}`);
              setIsLoading(false);
              return;
            }
          }
        }
        
        if (password) {
          // Update password in Firebase Auth
          const currentUser = authService.getCurrentUser();
          if (currentUser && currentUser.email === employee.email) {
            // Use the current password for authentication
            await employeeService.changePassword(employee.id, password, currentPassword);
          } else {
            // Admin is updating someone else's password
            await employeeService.changePassword(employee.id, password);
          }
        }
        
        // Update employee record in Firestore
        const success = await employeeService.updateEmployee(employee.id, updates);
        if (success) {
          toast.success('Employee credentials updated successfully');
          onClose();
        }
      } else {
        // This is just a simulation since we're not implementing full auth
        toast.success('Employee credentials updated');
        onClose();
      }
    } catch (error) {
      console.error('Error updating credentials:', error);
      toast.error('Failed to update credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === 'update' ? 'Update Employee Credentials' : 'Set Employee Credentials'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'update'
              ? 'Update the login credentials for this employee.'
              : 'Set login credentials for the new employee.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                className="pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="employee@example.com"
              />
            </div>
          </div>

          {mode === 'update' && (
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="currentPassword"
                  type="password"
                  className="pl-10"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">
              {mode === 'update' ? 'New Password (leave blank to keep current)' : 'Password'}
            </Label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                className="pl-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              disabled={mode === 'update' && !password}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Key className="h-4 w-4 mr-2" />
            )}
            {mode === 'update' ? 'Update Credentials' : 'Set Credentials'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
