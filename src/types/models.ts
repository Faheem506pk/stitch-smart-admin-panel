
// Basic types for our tailor shop management system

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'employee';
  permissions: Permissions;
  profilePicture?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  phoneNumber: string;
  position: string;
  hireDate: string;
  profilePicture?: string;
  permissions: Permissions;
}

export interface Permissions {
  customers: {
    view: boolean;
    add: boolean;
    edit: boolean;
    delete: boolean;
  };
  orders: {
    view: boolean;
    add: boolean;
    edit: boolean;
    delete: boolean;
  };
  measurements: {
    view: boolean;
    add: boolean;
    edit: boolean;
  };
  payments: {
    view: boolean;
    add: boolean;
  };
  employees: {
    view: boolean;
    add: boolean;
    edit: boolean;
    delete: boolean;
  };
  settings: {
    view: boolean;
    edit: boolean;
  };
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  profilePicture?: string;
  notes?: string;
  isWhatsApp?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Measurement {
  id: string;
  customerId: string;
  type: 'shirt' | 'pant' | 'suit' | 'dress' | 'other';
  values: {
    [key: string]: number | string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  status: 'pending' | 'stitching' | 'ready' | 'delivered';
  totalAmount: number;
  advanceAmount: number;
  balanceAmount: number;
  dueDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
  createdBy: string; // User ID
  lastUpdatedBy: string; // User ID
}

export interface OrderItem {
  id: string;
  type: 'shirt' | 'pant' | 'suit' | 'dress' | 'other';
  measurementId?: string;
  quantity: number;
  price: number;
  description: string;
  fabricDetails?: string;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  paymentMethod: 'cash' | 'other';
  date: string;
  notes?: string;
  receivedBy: string; // User ID
}

export interface AuditLog {
  id: string;
  userId: string;
  action: 'create' | 'update' | 'delete';
  entityType: 'customer' | 'order' | 'measurement' | 'payment' | 'employee';
  entityId: string;
  changes: {
    [key: string]: {
      previous: any;
      current: any;
    };
  };
  timestamp: string;
}
