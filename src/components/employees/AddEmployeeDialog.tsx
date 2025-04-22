
import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { employeeService } from '@/services/employeeService';
import { useToast } from '@/hooks/use-toast';

interface AddEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddEmployeeDialog({ open, onOpenChange }: AddEmployeeDialogProps) {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [position, setPosition] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !phoneNumber || !position) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const newEmployee = {
        name: name,
        email: email,
        phoneNumber: phoneNumber,
        position: position,
        role: "employee" as const,
        hireDate: new Date().toISOString(),
        permissions: {
          customers: { view: true, add: false, edit: false, delete: false },
          orders: { view: true, add: false, edit: false, delete: false },
          measurements: { view: true, add: false, edit: false },
          payments: { view: true, add: false },
          employees: { view: false, add: false, edit: false, delete: false },
          settings: { view: false, edit: false }
        }
      };
      
      const result = await employeeService.addEmployee(newEmployee);
      
      if (result) {
        toast({
          title: "Success",
          description: "Employee added successfully!"
        });
        
        // Reset form
        setName('');
        setEmail('');
        setPhoneNumber('');
        setPosition('');
        
        // Close dialog
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error adding employee:", error);
      toast({
        title: "Error",
        description: "Failed to add employee. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input 
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter employee name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter employee email"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input 
              id="phone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter phone number"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <Select value={position} onValueChange={setPosition} required>
              <SelectTrigger id="position">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tailor">Tailor</SelectItem>
                <SelectItem value="cutter">Cutter</SelectItem>
                <SelectItem value="salesperson">Salesperson</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="helper">Helper</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Employee"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
