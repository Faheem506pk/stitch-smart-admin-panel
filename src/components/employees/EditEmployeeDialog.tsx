import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { employeeService } from '@/services/employeeService';
import { toast } from 'sonner';
import { Employee } from '@/types/models';
import { EmployeeCredentials } from '@/components/auth/EmployeeCredentials';

interface EditEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
}

export function EditEmployeeDialog({ open, onOpenChange, employee }: EditEmployeeDialogProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [position, setPosition] = useState('');
  const [role, setRole] = useState<'admin' | 'employee'>('employee');
  const [isLoading, setIsLoading] = useState(false);
  const [isCredentialsDialogOpen, setIsCredentialsDialogOpen] = useState(false);

  // Update form state when employee changes
  useEffect(() => {
    if (employee) {
      setName(employee.name || '');
      setEmail(employee.email || '');
      setPhoneNumber(employee.phoneNumber || '');
      setPosition(employee.position || '');
      setRole(employee.role || 'employee');
    }
  }, [employee]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!employee) return;
    
    setIsLoading(true);
    
    try {
      // Prepare updated employee data
      const updatedEmployee: Partial<Employee> = {
        name,
        email,
        phoneNumber,
        position,
        role,
        updatedAt: new Date().toISOString(),
      };
      
      // Update employee in Firestore
      const success = await employeeService.updateEmployee(employee.id, updatedEmployee);
      
      if (success) {
        toast.success('Employee updated successfully!');
        onOpenChange(false);
      } else {
        toast.error('Failed to update employee');
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      toast.error('An error occurred while updating the employee');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCredentials = () => {
    setIsCredentialsDialogOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Employee</DialogTitle>
              <DialogDescription>
                Update employee information. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex gap-2">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleEditCredentials}
                  >
                    Edit Credentials
                  </Button>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={(value) => setRole(value as 'admin' | 'employee')}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="employee">Employee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {employee && (
        <EmployeeCredentials
          isOpen={isCredentialsDialogOpen}
          onClose={() => setIsCredentialsDialogOpen(false)}
          employee={employee}
          mode="update"
        />
      )}
    </>
  );
}
