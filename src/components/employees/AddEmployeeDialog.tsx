import { useState } from 'react';
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
import { EmployeeCredentials } from '@/components/auth/EmployeeCredentials';

interface AddEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddEmployeeDialog({ open, onOpenChange }: AddEmployeeDialogProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [position, setPosition] = useState('');
  const [role, setRole] = useState<'admin' | 'employee'>('employee');
  const [isLoading, setIsLoading] = useState(false);
  const [isCredentialsDialogOpen, setIsCredentialsDialogOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState<any>(null);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhoneNumber('');
    setPosition('');
    setRole('employee');
    setNewEmployee(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    
    try {
      // Generate a random temporary password
      const tempPassword = Math.random().toString(36).slice(-8);
      
      // Prepare employee data
      const employeeData = {
        name,
        email,
        phoneNumber,
        position,
        role,
        hireDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        permissions: getDefaultPermissions(role),
      };
      
      // Add employee to Firestore and create Firebase Auth account
      const result = await employeeService.addEmployee(employeeData, tempPassword);
      
      if (result) {
        toast.success('Employee added successfully!');
        setNewEmployee(result);
        setIsCredentialsDialogOpen(true);
        resetForm();
        onOpenChange(false);
      } else {
        toast.error('Failed to add employee');
      }
    } catch (error) {
      console.error('Error adding employee:', error);
      toast.error('An error occurred while adding the employee');
    } finally {
      setIsLoading(false);
    }
  };

  // Get default permissions based on role
  const getDefaultPermissions = (role: 'admin' | 'employee') => {
    if (role === 'admin') {
      return {
        customers: { view: true, add: true, edit: true, delete: true },
        orders: { view: true, add: true, edit: true, delete: true },
        measurements: { view: true, add: true, edit: true },
        payments: { view: true, add: true },
        employees: { view: true, add: true, edit: true, delete: true },
        settings: { view: true, edit: true },
      };
    } else {
      return {
        customers: { view: true, add: true, edit: true, delete: false },
        orders: { view: true, add: true, edit: true, delete: false },
        measurements: { view: true, add: true, edit: true },
        payments: { view: true, add: true },
        employees: { view: false, add: false, edit: false, delete: false },
        settings: { view: false, edit: false },
      };
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => {
        if (!isOpen) resetForm();
        onOpenChange(isOpen);
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
              <DialogDescription>
                Add a new employee to your tailor shop. You'll be able to set their login credentials after creating their account.
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
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
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
                {isLoading ? 'Adding...' : 'Add Employee'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {newEmployee && (
        <EmployeeCredentials
          isOpen={isCredentialsDialogOpen}
          onClose={() => setIsCredentialsDialogOpen(false)}
          employee={newEmployee}
          mode="create"
        />
      )}
    </>
  );
}
