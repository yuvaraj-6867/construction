// User Roles
export type UserRole = 'admin' | 'supervisor' | 'accountant' | 'client';

// User Interface
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  createdAt: Date;
}

// Project Interface
export interface Project {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  location: string;
  budget: number;
  startDate: Date;
  endDate?: Date;
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold';
  description?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Worker Interface
export interface Worker {
  id: string;
  name: string;
  phone: string;
  role: string;
  dailyWage: number;
  projectId: string;
  isActive: boolean;
  joinedDate: Date;
  createdAt: Date;
}

// Attendance Interface
export interface Attendance {
  id: string;
  workerId: string;
  workerName: string;
  projectId: string;
  date: Date;
  status: 'present' | 'half-day' | 'absent';
  wage: number;
  notes?: string;
  markedBy: string;
  createdAt: Date;
}

// Payment Interface
export interface Payment {
  id: string;
  workerId: string;
  workerName: string;
  projectId: string;
  amount: number;
  date: Date;
  paymentType: 'wage' | 'advance' | 'bonus';
  notes?: string;
  paidBy: string;
  createdAt: Date;
}

// Material Interface
export interface Material {
  id: string;
  projectId: string;
  name: string;
  quantity: number;
  unit: string;
  cost: number;
  totalCost: number;
  supplier?: string;
  purchaseDate: Date;
  invoiceNumber?: string;
  notes?: string;
  addedBy: string;
  createdAt: Date;
}

// Expense Interface
export interface Expense {
  id: string;
  projectId: string;
  category: 'petty-cash' | 'subcontractor' | 'equipment' | 'transport' | 'other';
  description: string;
  amount: number;
  date: Date;
  billNumber?: string;
  notes?: string;
  addedBy: string;
  createdAt: Date;
}

// Client Advance Interface
export interface ClientAdvance {
  id: string;
  projectId: string;
  amount: number;
  date: Date;
  paymentMethod: 'cash' | 'bank-transfer' | 'cheque' | 'online';
  referenceNumber?: string;
  notes?: string;
  receivedBy: string;
  createdAt: Date;
}

// Invoice Interface
export interface Invoice {
  id: string;
  projectId: string;
  invoiceNumber: string;
  amount: number;
  date: Date;
  dueDate?: Date;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  items: InvoiceItem[];
  notes?: string;
  createdBy: string;
  createdAt: Date;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

// Site Photo Interface
export interface SitePhoto {
  id: string;
  projectId: string;
  url: string;
  caption?: string;
  uploadedBy: string;
  uploadedAt: Date;
}

// Notification Interface
export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

// Dashboard Stats
export interface ProjectStats {
  totalWorkers: number;
  presentToday: number;
  totalWagePaid: number;
  totalAdvanceGiven: number;
  totalMaterialCost: number;
  totalExpenses: number;
  totalClientAdvance: number;
  balanceDue: number;
  profit: number;
}

// Report Filters
export interface ReportFilter {
  projectId?: string;
  startDate?: Date;
  endDate?: Date;
  workerId?: string;
  category?: string;
}
