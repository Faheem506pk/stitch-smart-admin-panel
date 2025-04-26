
export interface CustomerFormData {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  profilePicture: string | null;
  isWhatsApp: boolean;
}

export interface MeasurementFormData {
  type: string;
  values: Record<string, number | string>;
  notes?: string;
}

export interface OrderItemFormData {
  id?: string;
  type: string;
  quantity: number;
  price: number;
  description: string;
  fabricDetails?: string;
  measurementId?: string;
}

export interface OrderFormData {
  items: OrderItemFormData[];
  totalAmount: number;
  advanceAmount: number;
  balanceAmount: number;
  status: 'pending' | 'stitching' | 'ready' | 'delivered';
  dueDate: string;
  notes?: string;
}

export interface PaymentFormData {
  totalAmount: number;
  advanceAmount: number;
  balanceAmount: number;
  paymentMethod: 'cash' | 'other';
  notes?: string;
}
