
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Measurement } from '@/types/models';

interface MeasurementEditorProps {
  type: 'shirt' | 'pant' | 'suit' | 'dress';
  measurement: Measurement | null;
  onSave: (values: Record<string, any>, overwriteId?: string) => Promise<void>;
  onCancel: () => void;
}

export function MeasurementEditor({ type, measurement, onSave, onCancel }: MeasurementEditorProps) {
  const initialValues = measurement?.values || getDefaultValues(type);
  const [values, setValues] = useState<Record<string, any>>(initialValues);
  const [isSaving, setIsSaving] = useState(false);
  const [saveAsNew, setSaveAsNew] = useState(!measurement);

  const handleInputChange = (fieldName: string, value: string | number) => {
    setValues(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await onSave(values, saveAsNew ? undefined : measurement?.id);
    } catch (error) {
      console.error("Error saving measurement:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {measurement ? "Edit Measurement" : "Add New Measurement"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {renderFieldsForType(type, values, handleInputChange)}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={values.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes..."
              className="min-h-[100px]"
            />
          </div>

          {measurement && (
            <div className="flex items-center space-x-2 py-2">
              <input
                type="checkbox"
                id="saveAsNew"
                checked={saveAsNew}
                onChange={() => setSaveAsNew(!saveAsNew)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="saveAsNew" className="text-sm cursor-pointer">
                Save as new version (keep history)
              </Label>
            </div>
          )}

          <DialogFooter className="sm:justify-end">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : "Save Measurement"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function renderFieldsForType(
  type: string,
  values: Record<string, any>,
  handleChange: (field: string, value: any) => void
) {
  switch (type) {
    case 'shirt':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="neck">Neck</Label>
            <Input
              id="neck"
              type="number"
              step="0.01"
              value={values.neck || ''}
              onChange={(e) => handleChange('neck', parseFloat(e.target.value) || '')}
              placeholder="Inches"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="chest">Chest</Label>
            <Input
              id="chest"
              type="number"
              step="0.01"
              value={values.chest || ''}
              onChange={(e) => handleChange('chest', parseFloat(e.target.value) || '')}
              placeholder="Inches"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shoulder">Shoulder</Label>
            <Input
              id="shoulder"
              type="number"
              step="0.01"
              value={values.shoulder || ''}
              onChange={(e) => handleChange('shoulder', parseFloat(e.target.value) || '')}
              placeholder="Inches"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sleeveLength">Sleeve Length</Label>
            <Input
              id="sleeveLength"
              type="number"
              step="0.01"
              value={values.sleeveLength || ''}
              onChange={(e) => handleChange('sleeveLength', parseFloat(e.target.value) || '')}
              placeholder="Inches"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bicep">Bicep</Label>
            <Input
              id="bicep"
              type="number"
              step="0.01"
              value={values.bicep || ''}
              onChange={(e) => handleChange('bicep', parseFloat(e.target.value) || '')}
              placeholder="Inches"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cuff">Cuff</Label>
            <Input
              id="cuff"
              type="number"
              step="0.01"
              value={values.cuff || ''}
              onChange={(e) => handleChange('cuff', parseFloat(e.target.value) || '')}
              placeholder="Inches"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shirtLength">Shirt Length</Label>
            <Input
              id="shirtLength"
              type="number"
              step="0.01"
              value={values.shirtLength || ''}
              onChange={(e) => handleChange('shirtLength', parseFloat(e.target.value) || '')}
              placeholder="Inches"
            />
          </div>
        </div>
      );
    
    case 'pant':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="waist">Waist</Label>
            <Input
              id="waist"
              type="number"
              step="0.01"
              value={values.waist || ''}
              onChange={(e) => handleChange('waist', parseFloat(e.target.value) || '')}
              placeholder="Inches"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hip">Hip</Label>
            <Input
              id="hip"
              type="number"
              step="0.01"
              value={values.hip || ''}
              onChange={(e) => handleChange('hip', parseFloat(e.target.value) || '')}
              placeholder="Inches"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inseam">Inseam</Label>
            <Input
              id="inseam"
              type="number"
              step="0.01"
              value={values.inseam || ''}
              onChange={(e) => handleChange('inseam', parseFloat(e.target.value) || '')}
              placeholder="Inches"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="outseam">Outseam</Label>
            <Input
              id="outseam"
              type="number"
              step="0.01"
              value={values.outseam || ''}
              onChange={(e) => handleChange('outseam', parseFloat(e.target.value) || '')}
              placeholder="Inches"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="thigh">Thigh</Label>
            <Input
              id="thigh"
              type="number"
              step="0.01"
              value={values.thigh || ''}
              onChange={(e) => handleChange('thigh', parseFloat(e.target.value) || '')}
              placeholder="Inches"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="knee">Knee</Label>
            <Input
              id="knee"
              type="number"
              step="0.01"
              value={values.knee || ''}
              onChange={(e) => handleChange('knee', parseFloat(e.target.value) || '')}
              placeholder="Inches"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bottom">Bottom</Label>
            <Input
              id="bottom"
              type="number"
              step="0.01"
              value={values.bottom || ''}
              onChange={(e) => handleChange('bottom', parseFloat(e.target.value) || '')}
              placeholder="Inches"
            />
          </div>
        </div>
      );
      
    case 'suit':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="chest">Chest</Label>
            <Input
              id="chest"
              type="number"
              step="0.01"
              value={values.chest || ''}
              onChange={(e) => handleChange('chest', parseFloat(e.target.value) || '')}
              placeholder="Inches"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shoulder">Shoulder</Label>
            <Input
              id="shoulder"
              type="number"
              step="0.01"
              value={values.shoulder || ''}
              onChange={(e) => handleChange('shoulder', parseFloat(e.target.value) || '')}
              placeholder="Inches"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sleeve">Sleeve</Label>
            <Input
              id="sleeve"
              type="number"
              step="0.01"
              value={values.sleeve || ''}
              onChange={(e) => handleChange('sleeve', parseFloat(e.target.value) || '')}
              placeholder="Inches"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="waist">Waist</Label>
            <Input
              id="waist"
              type="number"
              step="0.01"
              value={values.waist || ''}
              onChange={(e) => handleChange('waist', parseFloat(e.target.value) || '')}
              placeholder="Inches"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="jacketLength">Jacket Length</Label>
            <Input
              id="jacketLength"
              type="number"
              step="0.01"
              value={values.jacketLength || ''}
              onChange={(e) => handleChange('jacketLength', parseFloat(e.target.value) || '')}
              placeholder="Inches"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hip">Hip</Label>
            <Input
              id="hip"
              type="number"
              step="0.01"
              value={values.hip || ''}
              onChange={(e) => handleChange('hip', parseFloat(e.target.value) || '')}
              placeholder="Inches"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pantWaist">Pant Waist</Label>
            <Input
              id="pantWaist"
              type="number"
              step="0.01"
              value={values.pantWaist || ''}
              onChange={(e) => handleChange('pantWaist', parseFloat(e.target.value) || '')}
              placeholder="Inches"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pantLength">Pant Length</Label>
            <Input
              id="pantLength"
              type="number"
              step="0.01"
              value={values.pantLength || ''}
              onChange={(e) => handleChange('pantLength', parseFloat(e.target.value) || '')}
              placeholder="Inches"
            />
          </div>
        </div>
      );
      
    case 'dress':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bust">Bust</Label>
            <Input
              id="bust"
              type="number"
              step="0.01"
              value={values.bust || ''}
              onChange={(e) => handleChange('bust', parseFloat(e.target.value) || '')}
              placeholder="Inches"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="waist">Waist</Label>
            <Input
              id="waist"
              type="number"
              step="0.01"
              value={values.waist || ''}
              onChange={(e) => handleChange('waist', parseFloat(e.target.value) || '')}
              placeholder="Inches"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hip">Hip</Label>
            <Input
              id="hip"
              type="number"
              step="0.01"
              value={values.hip || ''}
              onChange={(e) => handleChange('hip', parseFloat(e.target.value) || '')}
              placeholder="Inches"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shoulder">Shoulder</Label>
            <Input
              id="shoulder"
              type="number"
              step="0.01"
              value={values.shoulder || ''}
              onChange={(e) => handleChange('shoulder', parseFloat(e.target.value) || '')}
              placeholder="Inches"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="length">Length</Label>
            <Input
              id="length"
              type="number"
              step="0.01"
              value={values.length || ''}
              onChange={(e) => handleChange('length', parseFloat(e.target.value) || '')}
              placeholder="Inches"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sleeveLength">Sleeve Length</Label>
            <Input
              id="sleeveLength"
              type="number"
              step="0.01"
              value={values.sleeveLength || ''}
              onChange={(e) => handleChange('sleeveLength', parseFloat(e.target.value) || '')}
              placeholder="Inches"
            />
          </div>
        </div>
      );
      
    default:
      return (
        <div className="text-muted-foreground">
          Measurement form for this type will appear here.
        </div>
      );
  }
}

function getDefaultValues(type: string): Record<string, any> {
  switch (type) {
    case 'shirt':
      return {
        neck: '',
        chest: '',
        shoulder: '',
        sleeveLength: '',
        bicep: '',
        cuff: '',
        shirtLength: '',
        notes: ''
      };
    case 'pant':
      return {
        waist: '',
        hip: '',
        inseam: '',
        outseam: '',
        thigh: '',
        knee: '',
        bottom: '',
        notes: ''
      };
    case 'suit':
      return {
        chest: '',
        shoulder: '',
        sleeve: '',
        waist: '',
        jacketLength: '',
        hip: '',
        pantWaist: '',
        pantLength: '',
        notes: ''
      };
    case 'dress':
      return {
        bust: '',
        waist: '',
        hip: '',
        shoulder: '',
        length: '',
        sleeveLength: '',
        notes: ''
      };
    default:
      return {};
  }
}
