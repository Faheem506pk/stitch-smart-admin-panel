import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { toast } from "sonner";
import { Employee } from '@/types/models';
import { employeeService } from '@/services/employeeService';
import { RotateCcw, Plus, Trash, PenLine, Check, X, Shield } from 'lucide-react';
import { PermissionManager } from './PermissionManager';

interface UserSettingsProps {
  onEditCredentials: (employee: Employee) => void;
}

export function UserSettings({ onEditCredentials }: UserSettingsProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [isAddEmployeeDialogOpen, setIsAddEmployeeDialogOpen] = useState(false);
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    position: '',
    role: 'employee' as 'admin' | 'employee',
    password: '',
  });

  // Fetch employees
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Fetch employees
  const fetchEmployees = async () => {
    setIsLoadingEmployees(true);
    try {
      const fetchedEmployees = await employeeService.getEmployees();
      setEmployees(fetchedEmployees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
    } finally {
      setIsLoadingEmployees(false);
    }
  };
  
  // Add new employee
  const addNewEmployee = async () => {
    if (!newEmployee.name || !newEmployee.email || !newEmployee.position || !newEmployee.password) {
      toast.error('Please fill all required fields');
      return;
    }
    
    try {
      // Create the new employee
      const { password, ...employeeData } = newEmployee;
      const employeeWithMeta = {
        ...employeeData,
        hireDate: new Date().toISOString(),
        permissions: getDefaultPermissions(newEmployee.role),
        passwordResetRequired: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const addedEmployee = await employeeService.addEmployee(employeeWithMeta, password);
      
      if (addedEmployee) {
        toast.success('Employee added successfully!');
        setNewEmployee({
          name: '',
          email: '',
          phoneNumber: '',
          position: '',
          role: 'employee',
          password: '',
        });
        setIsAddEmployeeDialogOpen(false);
        fetchEmployees();
        
        // Open credentials dialog for the new employee
        onEditCredentials(addedEmployee);
      }
    } catch (error) {
      console.error('Error adding employee:', error);
      toast.error('Failed to add employee');
    }
  };
  
  // Delete employee
  const deleteEmployee = async (id: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) {
      return;
    }
    
    try {
      const success = await employeeService.deleteEmployee(id);
      if (success) {
        toast.success('Employee deleted successfully!');
        fetchEmployees();
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('Failed to delete employee');
    }
  };
  
  // Reset employee password
  const resetEmployeePassword = async (employee: Employee) => {
    try {
      const success = await employeeService.requestPasswordReset(employee.id);
      if (success) {
        toast.success('Password reset requested successfully!');
        fetchEmployees();
      }
    } catch (error) {
      console.error('Error requesting password reset:', error);
      toast.error('Failed to request password reset');
    }
  };
  
  // Update employee role
  const updateEmployeeRole = async (id: string, role: 'admin' | 'employee') => {
    try {
      const success = await employeeService.updateEmployee(id, { 
        role,
        permissions: getDefaultPermissions(role)
      });
      
      if (success) {
        toast.success('Employee role updated successfully!');
        fetchEmployees();
      }
    } catch (error) {
      console.error('Error updating employee role:', error);
      toast.error('Failed to update employee role');
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
  
  // Handle new employee input change
  const handleEmployeeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewEmployee(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              Manage user accounts and permissions
            </CardDescription>
          </div>
          <Button onClick={() => setIsAddEmployeeDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingEmployees ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <div className="flex justify-center items-center">
                        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : employees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <p className="text-muted-foreground">No employees found</p>
                      <p className="text-muted-foreground text-sm">
                        Add your first employee to get started
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell>{employee.position}</TableCell>
                      <TableCell>
                        <Select
                          value={employee.role}
                          onValueChange={(value) => updateEmployeeRole(employee.id, value as 'admin' | 'employee')}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="employee">Employee</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedEmployee(employee);
                            setIsPermissionDialogOpen(true);
                          }}
                          className="h-8"
                        >
                          <Shield className="h-3 w-3 mr-1" />
                          Permissions
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => resetEmployeePassword(employee)}
                          className="h-8"
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Reset
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditCredentials(employee)}
                          className="h-8"
                        >
                          <PenLine className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteEmployee(employee.id)}
                          className="h-8 text-destructive hover:text-destructive"
                        >
                          <Trash className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Employee Dialog */}
      <Dialog open={isAddEmployeeDialogOpen} onOpenChange={setIsAddEmployeeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>
              Create a new employee account
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="employeeName">Full Name</Label>
              <Input
                id="employeeName"
                name="name"
                placeholder="Employee Name"
                value={newEmployee.name}
                onChange={handleEmployeeInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="employeeEmail">Email</Label>
              <Input
                id="employeeEmail"
                type="email"
                name="email"
                placeholder="employee@example.com"
                value={newEmployee.email}
                onChange={handleEmployeeInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="employeePhone">Phone Number</Label>
              <Input
                id="employeePhone"
                name="phoneNumber"
                placeholder="03XX-XXXXXXX"
                value={newEmployee.phoneNumber}
                onChange={handleEmployeeInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="employeePosition">Position</Label>
              <Input
                id="employeePosition"
                name="position"
                placeholder="e.g., Tailor, Manager, etc."
                value={newEmployee.position}
                onChange={handleEmployeeInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="employeeRole">Role</Label>
              <Select 
                value={newEmployee.role}
                onValueChange={(value) => setNewEmployee(prev => ({
                  ...prev,
                  role: value as 'admin' | 'employee'
                }))}
              >
                <SelectTrigger id="employeeRole">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="employeePassword">Password</Label>
              <Input
                id="employeePassword"
                type="password"
                name="password"
                placeholder="Temporary password"
                value={newEmployee.password}
                onChange={handleEmployeeInputChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEmployeeDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={addNewEmployee}>
              <Check className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permission Manager Dialog */}
      {selectedEmployee && (
        <PermissionManager
          isOpen={isPermissionDialogOpen}
          onClose={() => {
            setIsPermissionDialogOpen(false);
            fetchEmployees(); // Refresh the employee list to get updated permissions
          }}
          employee={selectedEmployee}
        />
      )}
    </>
  );
}
