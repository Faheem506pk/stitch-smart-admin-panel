
export type CustomerFormData = {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  isWhatsApp: boolean;
  profilePicture?: string;
  notes?: string;
};

export type MeasurementFormData = {
  type: 'shirt' | 'pant' | 'suit' | 'dress' | 'other';
  values: Record<string, number>;
  notes?: string;
};

export type OrderFormData = {
  items: {
    type: 'shirt' | 'pant' | 'suit' | 'dress' | 'other';
    quantity: number;
    price: number;
    description: string;
    fabricDetails?: string;
  }[];
  dueDate: string;
  status: 'pending' | 'stitching' | 'ready' | 'delivered';
  notes?: string;
};

export type PaymentFormData = {
  totalAmount: number;
  advanceAmount: number;
  balanceAmount: number;
  paymentMethod: 'cash' | 'other';
};
