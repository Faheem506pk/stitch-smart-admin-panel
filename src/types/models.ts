// Basic types for our tailor shop management system

export interface TenantConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  cloudinaryCloudName: string;
  cloudinaryApiKey: string;
  cloudinaryUploadPreset: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "employee" | "super_admin";
  permissions: Permissions;
  profilePicture?: string;
  createdAt: string;
  lastLogin?: string;
  status?: "active" | "banned";
  tenantConfig?: TenantConfig; // Optional: Only admins/tenants have this
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: "admin" | "employee";
  phoneNumber: string;
  position: string;
  hireDate: string;
  profilePicture?: string;
  permissions: Permissions;
  firebaseUid?: string;
  passwordResetRequired?: boolean;
  passwordLastChanged?: string;
  passwordResetRequestedAt?: string;
  createdAt?: string;
  updatedAt?: string;
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
  phone: string; // Format: "03XX-XXXXXXX"
  email?: string;
  address?: string;
  notes?: string;
  profilePicture: string | null; // Made optional with null as fallback
  isWhatsApp: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Measurement {
  id: string;
  customerId: string;
  type: string; // Updated to string to support custom types
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
  status: "pending" | "stitching" | "ready" | "delivered";
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
  type: string; // Updated to string to support custom types
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
  paymentMethod: "cash" | "other";
  date: string;
  notes?: string;
  receivedBy: string; // User ID
}

export interface AuditLog {
  id: string;
  userId: string;
  action: "create" | "update" | "delete";
  entityType: "customer" | "order" | "measurement" | "payment" | "employee";
  entityId: string;
  changes: {
    [key: string]: {
      previous: any;
      current: any;
    };
  };
  timestamp: string;
}
