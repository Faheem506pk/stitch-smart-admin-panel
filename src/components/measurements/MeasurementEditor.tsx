import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Measurement } from '@/types/models';
import { CustomMeasurementType } from '@/types/measurementTypes';

interface MeasurementEditorProps {
  type: string;
  measurement: Measurement | null;
  onSave: (values: Record<string, any>, overwriteId?: string) => void;
  onCancel: () => void;
  customMeasurementTypes?: CustomMeasurementType[];
}

// Default measurement fields for different garment types
const defaultMeasurementFields = {
  shirt: [
    { id: 'chest', label: 'Chest (inches)', type: 'number' },
    { id: 'shoulder', label: 'Shoulder (inches)', type: 'number' },
    { id: 'sleeves', label: 'Sleeves (inches)', type: 'number' },
    { id: 'length', label: 'Length (inches)', type: 'number' },
    { id: 'collar', label: 'Collar (inches)', type: 'number' },
    { id: 'cuff', label: 'Cuff (inches)', type: 'number' },
  ],
  pant: [
    { id: 'waist', label: 'Waist (inches)', type: 'number' },
    { id: 'hip', label: 'Hip (inches)', type: 'number' },
    { id: 'inseam', label: 'Inseam (inches)', type: 'number' },
    { id: 'outseam', label: 'Outseam (inches)', type: 'number' },
    { id: 'thigh', label: 'Thigh (inches)', type: 'number' },
    { id: 'knee', label: 'Knee (inches)', type: 'number' },
    { id: 'bottomWidth', label: 'Bottom Width (inches)', type: 'number' },
  ],
  suit: [
    { id: 'chest', label: 'Chest (inches)', type: 'number' },
    { id: 'shoulder', label: 'Shoulder (inches)', type: 'number' },
    { id: 'sleeves', label: 'Sleeves (inches)', type: 'number' },
    { id: 'length', label: 'Coat Length (inches)', type: 'number' },
    { id: 'waist', label: 'Waist (inches)', type: 'number' },
    { id: 'hip', label: 'Hip (inches)', type: 'number' },
    { id: 'backWidth', label: 'Back Width (inches)', type: 'number' },
  ],
  dress: [
    { id: 'bust', label: 'Bust (inches)', type: 'number' },
    { id: 'waist', label: 'Waist (inches)', type: 'number' },
    { id: 'hip', label: 'Hip (inches)', type: 'number' },
    { id: 'shoulder', label: 'Shoulder (inches)', type: 'number' },
    { id: 'length', label: 'Length (inches)', type: 'number' },
    { id: 'sleeves', label: 'Sleeves (inches)', type: 'number' },
  ],
  other: [
    { id: 'custom1', label: 'Custom Measurement 1', type: 'number' },
    { id: 'custom2', label: 'Custom Measurement 2', type: 'number' },
    { id: 'custom3', label: 'Custom Measurement 3', type: 'number' },
  ],
};

export function MeasurementEditor({ type, measurement, onSave, onCancel, customMeasurementTypes = [] }: MeasurementEditorProps) {
  const [values, setValues] = useState<Record<string, any>>({});
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (measurement) {
      setValues(measurement.values || {});
      setNotes(measurement.notes || '');
    }
  }, [measurement]);

  const handleValueChange = (id: string, fieldType: 'number' | 'text', value: string) => {
    let processedValue: string | number = value;
    
    if (fieldType === 'number' && value !== '') {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        processedValue = numValue;
      } else {
        return; // Invalid number input, do not update
      }
    }
    
    setValues(prev => ({
      ...prev,
      [id]: value === '' ? undefined : processedValue
    }));
  };

  const handleSubmit = () => {
    onSave(
      { ...values, notes },
      measurement?.id
    );
  };

  // Get fields for the current measurement type
  const getFieldsForCurrentType = () => {
    // Check if it's a custom type
    const customType = customMeasurementTypes.find(t => t.id === type);
    
    if (customType) {
      return customType.fields;
    }
    
    // Convert default fields to include type property
    return defaultMeasurementFields[type as keyof typeof defaultMeasurementFields] || []
      .map(field => ({ 
        ...field, 
        type: 'number' as 'number' | 'text' 
      }));
  };

  // Get title based on the type
  const getTitle = () => {
    if (measurement) {
      return `Edit ${getTypeName()} Measurements`;
    }
    return `Add ${getTypeName()} Measurements`;
  };
  
  // Get type display name
  const getTypeName = () => {
    const customType = customMeasurementTypes.find(t => t.id === type);
    if (customType) return customType.name;
    
    const defaultNames: Record<string, string> = {
      shirt: "Shirt",
      pant: "Pant",
      suit: "Suit",
      dress: "Dress"
    };
    
    return defaultNames[type] || "Other";
  };

  return (
    <Dialog open onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>
        
        <div className="max-h-[60vh] overflow-y-auto py-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {getFieldsForCurrentType().map((field) => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id}>{field.label}</Label>
                <Input
                  id={field.id}
                  type={field.type === 'number' ? "text" : "text"}
                  value={values[field.id] || ''}
                  onChange={(e) => handleValueChange(field.id, field.type, e.target.value)}
                  placeholder={field.type === 'number' ? "0.0" : ""}
                />
              </div>
            ))}
          </div>
          
          <div className="space-y-2 py-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about these measurements"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSubmit}>{measurement ? 'Update' : 'Save'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
