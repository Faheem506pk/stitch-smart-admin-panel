
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { AddEmployeeDialog } from "@/components/employees/AddEmployeeDialog";
import { EditEmployeeDialog } from "@/components/employees/EditEmployeeDialog";
import { employeeService } from "@/services/employeeService";
import { Employee } from "@/types/models";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const Employees = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchEmployees = async () => {
      setIsLoading(true);
      try {
        const data = await employeeService.getEmployees();
        setEmployees(data);
      } catch (error) {
        console.error("Error fetching employees:", error);
        toast({
          title: "Error",
          description: "Could not fetch employees. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    // Set up real-time listener
    const unsubscribe = employeeService.subscribeToEmployees((data) => {
      setEmployees(data);
      setIsLoading(false);
    });

    fetchEmployees();

    // Clean up the subscription
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [toast]);

  const handleDelete = async (id: string) => {
    const success = await employeeService.deleteEmployee(id);
    if (success) {
      setEmployeeToDelete(null);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
            <p className="text-muted-foreground mt-1">
              Manage your tailor shop employees.
            </p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2" />
            Add Employee
          </Button>
        </div>
        
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      Loading employees...
                    </TableCell>
                  </TableRow>
                ) : employees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      <p className="text-muted-foreground">No employees found. Add your first employee.</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>{employee.name}</TableCell>
                      <TableCell>{employee.position}</TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell>{employee.phoneNumber}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => {
                            setSelectedEmployee(employee);
                            setIsEditDialogOpen(true);
                          }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-destructive" onClick={() => setEmployeeToDelete(employee.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      
      <AddEmployeeDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
      />
      
      <EditEmployeeDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        employee={selectedEmployee}
      />

      <AlertDialog open={!!employeeToDelete} onOpenChange={(open) => {
        if (!open) setEmployeeToDelete(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this employee
              and remove their data from the server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => employeeToDelete && handleDelete(employeeToDelete)} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Employees;
