export type ProjectStatus = 'planning' | 'active' | 'completed' | 'on-hold';
export type MilestoneStatus = 'pending' | 'in-progress' | 'completed' | 'paid';
export type AttendanceStatus = 'draft' | 'approved' | 'processed';

export interface Project {
  id: string;
  name: string;
  location: string;
  status: ProjectStatus;
  budget: number;
  currency: string;
  startDate: string;
  endDate?: string;
  managerId?: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  amount: number;
  status: MilestoneStatus;
  dueDate: string;
  completionDate?: string;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  phone: string;
  dailyRate: number;
  currentProjectId?: string;
}

export interface Attendance {
  id: string;
  staffId: string;
  projectId: string;
  date: string;
  hoursWorked: number;
  overtime: number;
  allowance: number; // Regional difficulty allowance
  status: AttendanceStatus;
}

export interface Supplier {
  id: string;
  name: string;
  category: string;
  contact: string;
  paymentTerms: string;
  totalBalance: number;
}
