
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Measurement } from '@/types/models';
import { customerService } from '@/services/customerService';
import { toast } from "sonner";
import { Plus, Trash2, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { MeasurementEditor } from './MeasurementEditor';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface MeasurementManagerProps {
  customerId: string;
  initialMeasurements?: Measurement[];
}

export function MeasurementManager({ customerId, initialMeasurements = [] }: MeasurementManagerProps) {
  const [measurements, setMeasurements] = useState<Measurement[]>(initialMeasurements);
  const [selectedType, setSelectedType] = useState<'shirt' | 'pant' | 'suit' | 'dress'>('shirt');
  const [showEditor, setShowEditor] = useState(false);
  const [editingMeasurement, setEditingMeasurement] = useState<Measurement | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [measurementToDelete, setMeasurementToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (initialMeasurements.length > 0) {
      setMeasurements(initialMeasurements);
    } else {
      // Fetch measurements if not provided
      const fetchMeasurements = async () => {
        try {
          const customerMeasurements = await customerService.getCustomerMeasurements(customerId);
          setMeasurements(customerMeasurements);
        } catch (error) {
          console.error("Error fetching measurements:", error);
          toast.error("Failed to load measurements");
        }
      };

      fetchMeasurements();

      // Set up subscription
      const unsubscribe = customerService.subscribeToCustomerMeasurements(
        customerId,
        (updatedMeasurements) => {
          setMeasurements(updatedMeasurements);
        }
      );

      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [customerId, initialMeasurements]);

  const filteredMeasurements = measurements
    .filter(m => m.type === selectedType)
    .sort((a, b) => {
      const dateA = new Date(a.updatedAt).getTime();
      const dateB = new Date(b.updatedAt).getTime();
      return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
    });

  const handleAddMeasurement = () => {
    setEditingMeasurement(null);
    setShowEditor(true);
  };

  const handleEditMeasurement = (measurement: Measurement) => {
    setEditingMeasurement(measurement);
    setShowEditor(true);
  };

  const handleDeleteMeasurement = async (id: string) => {
    try {
      const success = await customerService.deleteMeasurement(id);
      if (success) {
        setMeasurements(prev => prev.filter(m => m.id !== id));
      }
      setMeasurementToDelete(null);
    } catch (error) {
      console.error("Error deleting measurement:", error);
      toast.error("Failed to delete measurement");
    }
  };

  const handleSaveMeasurement = async (values: Record<string, any>, overwriteId?: string) => {
    try {
      const measurementData: Omit<Measurement, 'id'> = {
        customerId,
        type: selectedType,
        values,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      let success = false;

      if (overwriteId) {
        // Update existing measurement
        success = await customerService.updateMeasurement(overwriteId, measurementData);
      } else {
        // Add new measurement
        const result = await customerService.addMeasurement(measurementData);
        success = !!result;
        if (result) {
          setMeasurements(prev => [...prev, result]);
        }
      }

      if (success) {
        setShowEditor(false);
        toast.success(overwriteId ? "Measurement updated successfully!" : "Measurement added successfully!");
      }
    } catch (error) {
      console.error("Error saving measurement:", error);
      toast.error("Failed to save measurement");
    }
  };

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  return (
    <div>
      <Tabs defaultValue="shirt" onValueChange={(value) => setSelectedType(value as any)}>
        <div className="flex items-center justify-between mb-4">
          <TabsList className="flex-wrap">
            <TabsTrigger value="shirt">Shirt</TabsTrigger>
            <TabsTrigger value="pant">Pant</TabsTrigger>
            <TabsTrigger value="suit">Suit</TabsTrigger>
            <TabsTrigger value="dress">Dress</TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSortDirection}
              className="flex items-center gap-1"
            >
              <ArrowUpDown className="h-4 w-4" />
              {sortDirection === 'desc' ? 'Newest' : 'Oldest'}
            </Button>
            <Button size="sm" onClick={handleAddMeasurement}>
              <Plus className="h-4 w-4 mr-1" />
              Add Measurement
            </Button>
          </div>
        </div>

        <TabsContent value="shirt" className="space-y-4">
          {filteredMeasurements.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No shirt measurements found.</p>
          ) : (
            <div className="space-y-3">
              {filteredMeasurements.map((measurement) => (
                <Card key={measurement.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">
                        {format(new Date(measurement.updatedAt), 'MMM d, yyyy h:mm a')}
                      </h4>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEditMeasurement(measurement)}
                        >
                          Edit
                        </Button>
                        <AlertDialog open={measurementToDelete === measurement.id} onOpenChange={(open) => {
                          if (!open) setMeasurementToDelete(null);
                        }}>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-destructive" 
                              onClick={() => setMeasurementToDelete(measurement.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete this measurement record.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteMeasurement(measurement.id)}
                                className="bg-destructive text-destructive-foreground"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                      {Object.entries(measurement.values).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="capitalize">{key.replace(/([A-Z])/g, " $1")}: </span>
                          <span className="font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="pant" className="space-y-4">
          {filteredMeasurements.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No pant measurements found.</p>
          ) : (
            <div className="space-y-3">
              {/* Similar rendering for pant measurements */}
              {filteredMeasurements.map((measurement) => (
                <Card key={measurement.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">
                        {format(new Date(measurement.updatedAt), 'MMM d, yyyy h:mm a')}
                      </h4>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEditMeasurement(measurement)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-destructive" 
                          onClick={() => setMeasurementToDelete(measurement.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                      {Object.entries(measurement.values).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="capitalize">{key.replace(/([A-Z])/g, " $1")}: </span>
                          <span className="font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="suit" className="space-y-4">
          {filteredMeasurements.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No suit measurements found.</p>
          ) : (
            <div className="space-y-3">
              {/* Similar rendering for suit measurements */}
              {/* ... (similar pattern as shirt) */}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="dress" className="space-y-4">
          {filteredMeasurements.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No dress measurements found.</p>
          ) : (
            <div className="space-y-3">
              {/* Similar rendering for dress measurements */}
              {/* ... (similar pattern as shirt) */}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {showEditor && (
        <MeasurementEditor
          type={selectedType}
          measurement={editingMeasurement}
          onSave={handleSaveMeasurement}
          onCancel={() => setShowEditor(false)}
        />
      )}
    </div>
  );
}
