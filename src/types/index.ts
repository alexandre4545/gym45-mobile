// ===== Tasks =====
export type TaskPriority = 'haute' | 'moyenne' | 'basse';
export type TaskStatus = 'à faire' | 'en cours' | 'terminé';
export type TaskDepartment = 'Coaching' | 'Opérations' | 'Comptoir';

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignee: string;
  deadline: string; // ISO date
  priority: TaskPriority;
  status: TaskStatus;
  department: TaskDepartment;
  category?: string;
  createdAt: string;
}

// ===== Messages =====
export type ConversationType = 'direct' | 'group' | 'task';

export interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  name: string;
  participants: string[];
  messages: Message[];
  taskId?: string;
  taskTitle?: string;
  lastMessage?: string;
  lastTimestamp?: string;
  unreadCount: number;
}

// ===== Calendar =====
export type AvailabilityType = 'ouvert' | 'bloqué' | 'interne';

export interface AvailabilityBlock {
  id: string;
  type: AvailabilityType;
  start: string; // HH:mm
  end: string;   // HH:mm
  label?: string;
}

export interface Appointment {
  id: string;
  title: string;
  clientName?: string;
  date: string; // ISO date
  start: string; // HH:mm
  end: string;   // HH:mm
  type: string;
  notes?: string;
}

// ===== Profile =====
export interface Employee {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  photo?: string;
  department: TaskDepartment;
}

export interface UserSettings {
  notifications: boolean;
  darkMode: boolean;
}

// ===== Home alerts =====
export interface HomeStats {
  tasksOverdue: number;
  appointmentsToday: number;
  pendingCheckins: number;
  unreadMessages: number;
  activeAlerts: number;
  renewals: number;
}
