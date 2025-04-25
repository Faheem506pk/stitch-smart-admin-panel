import { Customer, Employee, Order, Measurement } from "@/types/models";

// Sample Customers
export const customers: Customer[] = [
  {
    id: "cust-001",
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "555-123-4567",
    address: "123 Main St, Anytown, USA",
    notes: "Regular customer, prefers cotton fabrics.",
    createdAt: "2023-01-15T10:30:00Z",
    updatedAt: "2023-03-20T14:15:00Z",
    profilePicture: null,
    isWhatsApp: false
  },
  {
    id: "cust-002",
    name: "Emma Johnson",
    email: "emma.j@example.com",
    phone: "555-234-5678",
    address: "456 Oak Ave, Somewhere, USA",
    notes: "Wedding dress client.",
    createdAt: "2023-02-10T09:45:00Z",
    updatedAt: "2023-04-05T11:20:00Z",
    profilePicture: null,
    isWhatsApp: false
  },
  {
    id: "cust-003",
    name: "Michael Brown",
    email: "michael.b@example.com",
    phone: "555-345-6789",
    address: "789 Pine Rd, Nowhere, USA",
    notes: "Prefers classic fits for business attire.",
    createdAt: "2023-01-22T13:15:00Z",
    updatedAt: "2023-03-10T10:05:00Z",
    profilePicture: null,
    isWhatsApp: true
  },
  {
    id: "cust-004",
    name: "Sarah Wilson",
    email: "sarah.w@example.com",
    phone: "555-456-7890",
    address: "101 Elm St, Anywhere, USA",
    notes: "Regular client for formal gowns.",
    createdAt: "2023-02-28T15:30:00Z",
    updatedAt: "2023-04-12T09:45:00Z",
    profilePicture: null,
    isWhatsApp: false
  },
  {
    id: "cust-005",
    name: "David Lee",
    email: "david.l@example.com",
    phone: "555-567-8901",
    address: "202 Maple Dr, Somewhere, USA",
    notes: "Allergic to wool fabrics.",
    createdAt: "2023-03-05T11:00:00Z",
    updatedAt: "2023-04-10T14:30:00Z",
    profilePicture: null,
    isWhatsApp: true
  },
];

// Sample Employees
export const employees: Employee[] = [
  {
    id: "emp-001",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    phoneNumber: "555-111-2222",
    position: "Shop Owner",
    hireDate: "2022-01-01T00:00:00Z",
    permissions: {
      customers: { view: true, add: true, edit: true, delete: true },
      orders: { view: true, add: true, edit: true, delete: true },
      measurements: { view: true, add: true, edit: true },
      payments: { view: true, add: true },
      employees: { view: true, add: true, edit: true, delete: true },
      settings: { view: true, edit: true },
    },
  },
  {
    id: "emp-002",
    name: "Jane Doe",
    email: "jane.doe@example.com",
    role: "employee",
    phoneNumber: "555-333-4444",
    position: "Senior Tailor",
    hireDate: "2022-02-15T00:00:00Z",
    permissions: {
      customers: { view: true, add: true, edit: true, delete: false },
      orders: { view: true, add: true, edit: true, delete: false },
      measurements: { view: true, add: true, edit: true },
      payments: { view: true, add: true },
      employees: { view: false, add: false, edit: false, delete: false },
      settings: { view: false, edit: false },
    },
  },
  {
    id: "emp-003",
    name: "Robert Johnson",
    email: "robert.j@example.com",
    role: "employee",
    phoneNumber: "555-555-6666",
    position: "Tailor Assistant",
    hireDate: "2022-05-10T00:00:00Z",
    permissions: {
      customers: { view: true, add: false, edit: false, delete: false },
      orders: { view: true, add: false, edit: false, delete: false },
      measurements: { view: true, add: false, edit: false },
      payments: { view: false, add: false },
      employees: { view: false, add: false, edit: false, delete: false },
      settings: { view: false, edit: false },
    },
  },
];

// Sample Measurements
export const measurements: Measurement[] = [
  {
    id: "meas-001",
    customerId: "cust-001",
    type: "shirt",
    values: {
      neck: 16,
      chest: 42,
      waist: 36,
      sleeve: 34,
      shoulder: 18.5,
    },
    notes: "Prefers looser fit around waist.",
    createdAt: "2023-01-20T11:30:00Z",
    updatedAt: "2023-01-20T11:30:00Z",
  },
  {
    id: "meas-002",
    customerId: "cust-001",
    type: "pant",
    values: {
      waist: 36,
      inseam: 32,
      outseam: 42,
      hip: 40,
      thigh: 24,
    },
    notes: "Standard fit.",
    createdAt: "2023-01-20T11:45:00Z",
    updatedAt: "2023-01-20T11:45:00Z",
  },
  {
    id: "meas-003",
    customerId: "cust-002",
    type: "dress",
    values: {
      bust: 36,
      waist: 28,
      hip: 38,
      shoulder: 15,
      length: 60,
    },
    notes: "Wedding dress measurements, double-checked.",
    createdAt: "2023-02-15T10:00:00Z",
    updatedAt: "2023-02-15T10:00:00Z",
  },
];

// Sample Orders
export const orders: Order[] = [
  {
    id: "ORD-1234",
    customerId: "cust-001",
    items: [
      {
        id: "item-001",
        type: "shirt",
        measurementId: "meas-001",
        quantity: 2,
        price: 125,
        description: "Custom Business Shirts - Blue Cotton",
        fabricDetails: "Egyptian cotton, blue solid",
      },
    ],
    status: "pending",
    totalAmount: 250,
    advanceAmount: 100,
    balanceAmount: 150,
    dueDate: "2023-04-25T00:00:00Z",
    notes: "Rush order for business trip.",
    createdAt: "2023-04-15T10:30:00Z",
    updatedAt: "2023-04-15T10:30:00Z",
    createdBy: "emp-001",
    lastUpdatedBy: "emp-001",
  },
  {
    id: "ORD-1235",
    customerId: "cust-002",
    items: [
      {
        id: "item-002",
        type: "dress",
        measurementId: "meas-003",
        quantity: 1,
        price: 350,
        description: "Wedding Dress - White Satin",
        fabricDetails: "White satin with lace details",
      },
    ],
    status: "stitching",
    totalAmount: 350,
    advanceAmount: 175,
    balanceAmount: 175,
    dueDate: "2023-05-10T00:00:00Z",
    notes: "Wedding on May 15th, needs final fitting.",
    createdAt: "2023-04-14T09:45:00Z",
    updatedAt: "2023-04-16T11:20:00Z",
    createdBy: "emp-001",
    lastUpdatedBy: "emp-002",
  },
  {
    id: "ORD-1236",
    customerId: "cust-003",
    items: [
      {
        id: "item-003",
        type: "shirt",
        quantity: 1,
        price: 80,
        description: "Formal Shirt - White",
        fabricDetails: "Cotton blend, white",
      },
    ],
    status: "ready",
    totalAmount: 80,
    advanceAmount: 40,
    balanceAmount: 40,
    dueDate: "2023-04-20T00:00:00Z",
    notes: "Customer will pick up on Saturday.",
    createdAt: "2023-04-13T13:15:00Z",
    updatedAt: "2023-04-18T10:05:00Z",
    createdBy: "emp-002",
    lastUpdatedBy: "emp-002",
  },
  {
    id: "ORD-1237",
    customerId: "cust-004",
    items: [
      {
        id: "item-004",
        type: "dress",
        quantity: 1,
        price: 200,
        description: "Evening Gown - Black",
        fabricDetails: "Black silk with sequin details",
      },
    ],
    status: "delivered",
    totalAmount: 200,
    advanceAmount: 200,
    balanceAmount: 0,
    dueDate: "2023-04-18T00:00:00Z",
    notes: "Delivered on time, customer very satisfied.",
    createdAt: "2023-04-12T15:30:00Z",
    updatedAt: "2023-04-18T09:45:00Z",
    deliveredAt: "2023-04-18T09:45:00Z",
    createdBy: "emp-002",
    lastUpdatedBy: "emp-001",
  },
  {
    id: "ORD-1238",
    customerId: "cust-005",
    items: [
      {
        id: "item-005",
        type: "pant",
        quantity: 1,
        price: 95,
        description: "Dress Pants - Gray",
        fabricDetails: "Cotton-polyester blend, gray",
      },
    ],
    status: "pending",
    totalAmount: 95,
    advanceAmount: 50,
    balanceAmount: 45,
    dueDate: "2023-04-28T00:00:00Z",
    notes: "Customer requested non-wool fabric.",
    createdAt: "2023-04-11T11:00:00Z",
    updatedAt: "2023-04-11T11:00:00Z",
    createdBy: "emp-001",
    lastUpdatedBy: "emp-001",
  },
];

// Function to seed the IndexedDB with sample data
export const seedDatabase = async () => {
  // Implement in next phase with IndexedDB
  console.log("Database seeding would happen here in a real app");
};
