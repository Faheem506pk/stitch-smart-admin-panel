import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MeasurementFormData } from './addCustomerFlowTypes';
import { customerService } from '@/services/customerService';
import { useToast } from '@/hooks/use-toast';
import { Scissors } from 'lucide-react';

interface AddCustomerStepMeasurementsProps {
  measurementData: MeasurementFormData;
  setMeasurementData: React.Dispatch<React.SetStateAction<MeasurementFormData>>;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  customerId?: string;
  isExisting: boolean;
}

// Measurement fields for different garment types
const measurementFields = {
  shirt: [
    { id: 'chest', label: 'Chest (inches)' },
    { id: 'shoulder', label: 'Shoulder (inches)' },
    { id: 'sleeves', label: 'Sleeves (inches)' },
    { id: 'length', label: 'Length (inches)' },
    { id: 'collar', label: 'Collar (inches)' },
    { id: 'cuff', label: 'Cuff (inches)' },
  ],
  pant: [
    { id: 'waist', label: 'Waist (inches)' },
    { id: 'hip', label: 'Hip (inches)' },
    { id: 'inseam', label: 'Inseam (inches)' },
    { id: 'outseam', label: 'Outseam (inches)' },
    { id: 'thigh', label: 'Thigh (inches)' },
    { id: 'knee', label: 'Knee (inches)' },
    { id: 'bottomWidth', label: 'Bottom Width (inches)' },
  ],
  suit: [
    { id: 'chest', label: 'Chest (inches)' },
    { id: 'shoulder', label: 'Shoulder (inches)' },
    { id: 'sleeves', label: 'Sleeves (inches)' },
    { id: 'length', label: 'Coat Length (inches)' },
    { id: 'waist', label: 'Waist (inches)' },
    { id: 'hip', label: 'Hip (inches)' },
    { id: 'backWidth', label: 'Back Width (inches)' },
  ],
  dress: [
    { id: 'bust', label: 'Bust (inches)' },
    { id: 'waist', label: 'Waist (inches)' },
    { id: 'hip', label: 'Hip (inches)' },
    { id: 'shoulder', label: 'Shoulder (inches)' },
    { id: 'length', label: 'Length (inches)' },
    { id: 'sleeves', label: 'Sleeves (inches)' },
  ],
  other: [
    { id: 'custom1', label: 'Custom Measurement 1' },
    { id: 'custom2', label: 'Custom Measurement 2' },
    { id: 'custom3', label: 'Custom Measurement 3' },
  ],
};

export function AddCustomerStepMeasurements({ 
  measurementData, 
  setMeasurementData, 
  onNext, 
  onBack,
  onSkip,
  customerId,
  isExisting
}: AddCustomerStepMeasurementsProps) {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  const handleTypeChange = (type: 'shirt' | 'pant' | 'suit' | 'dress' | 'other') => {
    setMeasurementData(prev => ({ 
      ...prev, 
      type,
      // Reset values when changing type
      values: {}
    }));
  };
  
  const handleMeasurementChange = (id: string, value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) && value !== '') return;
    
    setMeasurementData(prev => ({
      ...prev,
      values: {
        ...prev.values,
        [id]: value === '' ? undefined : numValue
      }
    }));
  };

  const handleNext = async () => {
    // Check if any measurements have been entered
    const hasMeasurements = Object.keys(measurementData.values).length > 0;
    
    if (hasMeasurements && isExisting && customerId) {
      setIsSaving(true);
      try {
        // Save measurements to Firebase
        await customerService.addMeasurement({
          customerId: customerId,
          type: measurementData.type,
          values: measurementData.values,
          notes: measurementData.notes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        
        toast({
          title: "Success",
          description: "Measurements saved successfully"
        });
      } catch (error) {
        console.error("Error saving measurements:", error);
        toast({
          title: "Error",
          description: "Failed to save measurements",
          variant: "destructive"
        });
      } finally {
        setIsSaving(false);
      }
    }
    
    onNext();
  };

  // Check if any measurements have been entered
  const hasMeasurements = Object.keys(measurementData.values).length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-2">
        <Scissors className="h-5 w-5 text-primary" />
        <p className="text-muted-foreground">
          Add measurements for this customer. You can skip this step if you don't have measurements yet.
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="measurementType">Measurement Type</Label>
        <Select
          value={measurementData.type}
          onValueChange={(value) => handleTypeChange(value as any)}
        >
          <SelectTrigger id="measurementType">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="shirt">Shirt</SelectItem>
            <SelectItem value="pant">Pant/Trouser</SelectItem>
            <SelectItem value="suit">Suit</SelectItem>
            <SelectItem value="dress">Dress</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {measurementFields[measurementData.type].map((field) => (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>{field.label}</Label>
            <Input
              id={field.id}
              type="text"
              value={measurementData.values[field.id] || ''}
              onChange={(e) => handleMeasurementChange(field.id, e.target.value)}
              placeholder="0.0"
            />
          </div>
        ))}
      </div>
      
      <div className="space-y-2 mt-4">
        <Label htmlFor="measurementNotes">Notes (Optional)</Label>
        <Textarea
          id="measurementNotes"
          value={measurementData.notes || ''}
          onChange={(e) => setMeasurementData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Add any notes about these measurements"
        />
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onBack} disabled={isSaving}>
          Back
        </Button>
        <Button 
          onClick={handleNext}
          className="px-6"
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : hasMeasurements ? "Next" : "Skip Measurements"}
        </Button>
      </div>
    </div>
  );
}
