
export interface CustomMeasurementField {
  id: string;
  label: string;
  type: 'number' | 'text';
  required: boolean;
}

export interface CustomMeasurementType {
  id: string;
  name: string;
  fields: CustomMeasurementField[];
  createdAt: string;
  updatedAt: string;
}
