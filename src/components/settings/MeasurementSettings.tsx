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
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomMeasurementType, CustomMeasurementField } from '@/types/measurementTypes';
import { firestoreService } from '@/services/firebase';
import { toast } from "sonner";
import { Scissors, Plus, Trash, Check, X } from 'lucide-react';

export function MeasurementSettings() {
  const [measurementTypes, setMeasurementTypes] = useState<CustomMeasurementType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddTypeDialogOpen, setIsAddTypeDialogOpen] = useState(false);
  const [isAddFieldDialogOpen, setIsAddFieldDialogOpen] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState<'text' | 'number'>('number');
  const [newFieldRequired, setNewFieldRequired] = useState(true);

  // Fetch measurement types
  useEffect(() => {
    fetchMeasurementTypes();
  }, []);

  // Fetch measurement types
  const fetchMeasurementTypes = async () => {
    setIsLoading(true);
    try {
      if (firestoreService.isFirebaseInitialized()) {
        const types = await firestoreService.getDocuments('measurementTypes');
        setMeasurementTypes(types as CustomMeasurementType[]);
      } else {
        const typesJson = localStorage.getItem('measurement_types');
        if (typesJson) {
          setMeasurementTypes(JSON.parse(typesJson));
        }
      }
    } catch (error) {
      console.error('Error loading measurement types:', error);
      toast.error('Failed to load measurement types');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add measurement type
  const addMeasurementType = async () => {
    if (!newTypeName.trim()) {
      toast.error('Please enter a type name');
      return;
    }

    try {
      if (firestoreService.isFirebaseInitialized()) {
        // Create a new measurement type without specifying an ID first
        const newType = {
          name: newTypeName,
          fields: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Add the document to Firestore and get the generated ID
        const docRef = await firestoreService.addDocument('measurementTypes', newType);
        console.log(`Added new measurement type with ID: ${docRef.id}`);
      } else {
        // For local storage, we still need to generate a client-side ID
        const newType: CustomMeasurementType = {
          id: crypto.randomUUID(),
          name: newTypeName,
          fields: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        const updatedTypes = [...measurementTypes, newType];
        localStorage.setItem('measurement_types', JSON.stringify(updatedTypes));
        setMeasurementTypes(updatedTypes);
      }
      
      setNewTypeName('');
      setIsAddTypeDialogOpen(false);
      toast.success('Measurement type added successfully!');
      fetchMeasurementTypes(); // Refresh the list
    } catch (error) {
      console.error('Error adding measurement type:', error);
      toast.error('Failed to add measurement type');
    }
  };

  // Add field to type
  const addFieldToType = async () => {
    if (!selectedTypeId) return;
    if (!newFieldName.trim()) {
      toast.error('Please enter a field name');
      return;
    }
  
    const selectedType = measurementTypes.find(type => type.id === selectedTypeId);
    if (!selectedType) return;
  
    const newField: CustomMeasurementField = {
      id: crypto.randomUUID(),
      label: newFieldName,
      type: newFieldType,
      required: newFieldRequired
    };
  
    const updatedType = {
      ...selectedType,
      fields: [...selectedType.fields, newField],
      updatedAt: new Date().toISOString()
    };
  
    try {
      if (firestoreService.isFirebaseInitialized()) {
        await firestoreService.updateDocument('measurementTypes', selectedTypeId, updatedType);
        console.log(`Updated measurement type ${selectedType.name} with new field ${newFieldName}`);
      } else {
        const updatedTypes = measurementTypes.map(type => 
          type.id === selectedTypeId ? updatedType : type
        );
        localStorage.setItem('measurement_types', JSON.stringify(updatedTypes));
        setMeasurementTypes(updatedTypes);
      }
      
      setNewFieldName('');
      setNewFieldType('number');
      setNewFieldRequired(true);
      setIsAddFieldDialogOpen(false);
      toast.success('Field added successfully!');
      fetchMeasurementTypes();
    } catch (error) {
      console.error('Error adding field:', error);
      toast.error('Failed to add field');
    }
  };

  // Delete field
  const deleteField = async (typeId: string, fieldId: string) => {
    const selectedType = measurementTypes.find(type => type.id === typeId);
    if (!selectedType) return;

    const updatedFields = selectedType.fields.filter(field => field.id !== fieldId);
    const updatedType = {
      ...selectedType,
      fields: updatedFields,
      updatedAt: new Date().toISOString()
    };

    try {
      if (firestoreService.isFirebaseInitialized()) {
        await firestoreService.updateDocument('measurementTypes', typeId, updatedType);
      } else {
        const updatedTypes = measurementTypes.map(type => 
          type.id === typeId ? updatedType : type
        );
        localStorage.setItem('measurement_types', JSON.stringify(updatedTypes));
        setMeasurementTypes(updatedTypes);
      }
      
      toast.success('Field deleted successfully!');
      fetchMeasurementTypes();
    } catch (error) {
      console.error('Error deleting field:', error);
      toast.error('Failed to delete field');
    }
  };

  // Delete measurement type
  const deleteMeasurementType = async (typeId: string) => {
    try {
      if (firestoreService.isFirebaseInitialized()) {
        await firestoreService.deleteDocument('measurementTypes', typeId);
      } else {
        const updatedTypes = measurementTypes.filter(type => type.id !== typeId);
        localStorage.setItem('measurement_types', JSON.stringify(updatedTypes));
        setMeasurementTypes(updatedTypes);
      }
      
      toast.success('Measurement type deleted successfully!');
      fetchMeasurementTypes();
    } catch (error) {
      console.error('Error deleting measurement type:', error);
      toast.error('Failed to delete measurement type');
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Custom Measurement Types</CardTitle>
            <CardDescription>
              Create and manage custom measurement types and fields.
            </CardDescription>
          </div>
          <Button onClick={() => setIsAddTypeDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Type
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : measurementTypes.length === 0 ? (
            <div className="text-center p-8 border rounded-md">
              <Scissors className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
              <p className="text-muted-foreground">No custom measurement types yet.</p>
              <p className="text-muted-foreground text-sm mt-1">
                Add a new type to start customizing your measurements.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {measurementTypes.map(type => (
                <div key={type.id} className="border rounded-md p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-lg">{type.name}</h3>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTypeId(type.id);
                          setIsAddFieldDialogOpen(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Field
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteMeasurementType(type.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {type.fields.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No fields added yet.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {type.fields.map(field => (
                        <div 
                          key={field.id}
                          className="flex items-center justify-between border rounded-md p-2"
                        >
                          <div>
                            <p className="font-medium">{field.label}</p>
                            <p className="text-xs text-muted-foreground">
                              Type: {field.type} • {field.required ? 'Required' : 'Optional'}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => deleteField(type.id, field.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Type Dialog */}
      <Dialog open={isAddTypeDialogOpen} onOpenChange={setIsAddTypeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Measurement Type</DialogTitle>
            <DialogDescription>
              Create a new custom measurement type for your tailor shop
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="typeName">Type Name</Label>
              <Input
                id="typeName"
                placeholder="e.g., Kurta, Sherwani, etc."
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTypeDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={addMeasurementType}>
              <Check className="h-4 w-4 mr-2" />
              Add Type
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Field Dialog */}
      <Dialog open={isAddFieldDialogOpen} onOpenChange={setIsAddFieldDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Measurement Field</DialogTitle>
            <DialogDescription>
              Add a custom measurement field to this type
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="fieldName">Field Name</Label>
              <Input
                id="fieldName"
                placeholder="e.g., Chest, Waist, etc."
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fieldType">Field Type</Label>
              <Select 
                value={newFieldType} 
                onValueChange={(value) => setNewFieldType(value as 'number' | 'text')}
              >
                <SelectTrigger id="fieldType">
                  <SelectValue placeholder="Select field type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="number">Number (inches)</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="fieldRequired"
                checked={newFieldRequired}
                onCheckedChange={setNewFieldRequired}
              />
              <Label htmlFor="fieldRequired">Required Field</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddFieldDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={addFieldToType}>
              <Check className="h-4 w-4 mr-2" />
              Add Field
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
