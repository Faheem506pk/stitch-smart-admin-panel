import { useState, useEffect } from 'react';
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
import { Scissors, Loader2 } from 'lucide-react';
import { firestoreService } from '@/services/firebase';
import { CustomMeasurementType } from '@/types/measurementTypes';

interface AddCustomerStepMeasurementsProps {
  measurementData: MeasurementFormData;
  setMeasurementData: React.Dispatch<React.SetStateAction<MeasurementFormData>>;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  customerId?: string;
  isExisting: boolean;
}

// Default measurement fields for different garment types
const defaultMeasurementFields = {
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
  const [customMeasurementTypes, setCustomMeasurementTypes] = useState<CustomMeasurementType[]>([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);
  
  // Fetch custom measurement types
  useEffect(() => {
    const fetchMeasurementTypes = async () => {
      setIsLoadingTypes(true);
      try {
        if (firestoreService.isFirebaseInitialized()) {
          const types = await firestoreService.getDocuments('measurementTypes');
          setCustomMeasurementTypes(types as CustomMeasurementType[]);
        } else {
          const typesJson = localStorage.getItem('measurement_types');
          if (typesJson) {
            setCustomMeasurementTypes(JSON.parse(typesJson));
          }
        }
      } catch (error) {
        console.error('Error loading measurement types:', error);
      } finally {
        setIsLoadingTypes(false);
      }
    };

    fetchMeasurementTypes();
  }, []);
  
  const handleTypeChange = (type: string) => {
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
    // Call the parent's onNext function which will handle saving data
    onNext();
  };

  const handleSkip = () => {
    // Skip measurements and go to the next step
    onSkip();
  };

  // Check if any measurements have been entered
  const hasMeasurements = Object.keys(measurementData.values).length > 0;

  // Get fields for the current measurement type
  const getFieldsForCurrentType = () => {
    // First check if it's a custom type
    const customType = customMeasurementTypes.find(t => t.id === measurementData.type);
    
    if (customType) {
      return customType.fields.map(field => ({
        id: field.id,
        label: `${field.label} ${field.type === 'number' ? '(inches)' : ''}`
      }));
    }
    
    // Otherwise use default fields
    return defaultMeasurementFields[measurementData.type as keyof typeof defaultMeasurementFields] || [];
  };

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
        {isLoadingTypes ? (
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading measurement types...</span>
          </div>
        ) : (
          <Select
            value={measurementData.type}
            onValueChange={handleTypeChange}
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
              
              {customMeasurementTypes.length > 0 && (
                <>
                  <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
                    Custom Types
                  </div>
                  {customMeasurementTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </>
              )}
            </SelectContent>
          </Select>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 max-h-[60vh] overflow-y-auto py-2">
        {getFieldsForCurrentType().map((field) => (
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
          onClick={hasMeasurements ? handleNext : handleSkip}
          className="px-6"
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : hasMeasurements ? "Next" : "Skip Measurements"}
        </Button>
      </div>
    </div>
  );
}
