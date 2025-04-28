import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { employeeService } from '@/services/employeeService';
import { toast } from 'sonner';
import { Check, X, Shield } from 'lucide-react';
import { Employee, Permissions } from '@/types/models';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PermissionManagerProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee;
}

export function PermissionManager({
  isOpen,
  onClose,
  employee,
}: PermissionManagerProps) {
  const [permissions, setPermissions] = useState<Permissions>(employee.permissions);
  const [isLoading, setIsLoading] = useState(false);

  const handlePermissionChange = (
    section: keyof Permissions,
    permission: string,
    value: boolean
  ) => {
    setPermissions((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [permission]: value,
      },
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const success = await employeeService.updateEmployee(employee.id, {
        permissions,
      });
      if (success) {
        toast.success('Permissions updated successfully');
        onClose();
      }
    } catch (error) {
      console.error('Error updating permissions:', error);
      toast.error('Failed to update permissions');
    } finally {
      setIsLoading(false);
    }
  };

  const renderPermissionSection = (
    section: keyof Permissions,
    title: string,
    permissions: Record<string, boolean>
  ) => {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">{title}</h3>
        <div className="space-y-2">
          {Object.entries(permissions).map(([permission, value]) => (
            <div
              key={`${section}-${permission}`}
              className="flex items-center justify-between"
            >
              <Label htmlFor={`${section}-${permission}`} className="capitalize">
                {permission}
              </Label>
              <Switch
                id={`${section}-${permission}`}
                checked={value}
                onCheckedChange={(checked) =>
                  handlePermissionChange(section, permission, checked)
                }
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Manage Permissions for {employee.name}
          </DialogTitle>
          <DialogDescription>
            Configure what this employee can view and modify in the system
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="customers" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="customers">Customers & Orders</TabsTrigger>
            <TabsTrigger value="measurements">Measurements & Payments</TabsTrigger>
            <TabsTrigger value="system">System & Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="customers" className="space-y-6">
            {renderPermissionSection('customers', 'Customers', permissions.customers)}
            {renderPermissionSection('orders', 'Orders', permissions.orders)}
          </TabsContent>
          
          <TabsContent value="measurements" className="space-y-6">
            {renderPermissionSection('measurements', 'Measurements', permissions.measurements)}
            {renderPermissionSection('payments', 'Payments', permissions.payments)}
          </TabsContent>
          
          <TabsContent value="system" className="space-y-6">
            {renderPermissionSection('employees', 'Employees', permissions.employees)}
            {renderPermissionSection('settings', 'Settings', permissions.settings)}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            Save Permissions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
