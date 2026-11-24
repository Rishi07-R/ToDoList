export type TaskCategory = 'inbox' | 'study' | 'projects' | 'personal';

export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export type TaskPriority = 'high' | 'medium' | 'low';

export type NavSection =
  | 'today'
  | 'inbox'
  | 'upcoming'
  | 'overview'
  | 'study'
  | 'projects'
  | 'personal';

export type ViewMode = 'list' | 'board';

export type StatusFilter = 'all' | 'active' | 'completed';

export type SortOption = 'dueDate' | 'priority' | 'createdAt';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  notes: string;
  category: TaskCategory;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string; // YYYY-MM-DD or ''
  dueTime?: string; // HH:mm
  estimatedMinutes?: number;
  subtasks: Subtask[];
  createdAt: string; // ISO string
  completedAt?: string; // ISO string
}

export interface CategoryMeta {
  id: TaskCategory;
  label: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  barColor: string;
  description: string;
}

export const CATEGORY_META: Record<TaskCategory, CategoryMeta> = {
  study: {
    id: 'study',
    label: 'Study',
    textColor: '#3B82F6',
    bgColor: '#EFF6FF',
    borderColor: '#DBEAFE',
    barColor: '#3B82F6',
    description: 'Reading notes, coursework, research papers, and skill drills.',
  },
  projects: {
    id: 'projects',
    label: 'Projects',
    textColor: '#10B981',
    bgColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    barColor: '#10B981',
    description: 'Active deliverables, engineering sprints, and product milestones.',
  },
  personal: {
    id: 'personal',
    label: 'Personal',
    textColor: '#D97706',
    bgColor: '#FEF3C7',
    borderColor: '#FDE68A',
    barColor: '#F59E0B',
    description: 'Errands, health routines, finances, and home logistics.',
  },
  inbox: {
    id: 'inbox',
    label: 'Inbox',
    textColor: '#475569',
    bgColor: '#F1F5F9',
    borderColor: '#E2E8F0',
    barColor: '#64748B',
    description: 'Quick-captured tasks waiting to be categorized and scheduled.',
  },
};

export const PRIORITY_META: Record<
  TaskPriority,
  { label: string; shortLabel: string; color: string; weight: number }
> = {
  high: {
    label: 'High priority',
    shortLabel: 'High',
    color: '#BA1A1A',
    weight: 3,
  },
  medium: {
    label: 'Medium priority',
    shortLabel: 'Medium',
    color: '#464555',
    weight: 2,
  },
  low: {
    label: 'Low priority',
    shortLabel: 'Low',
    color: '#64748B',
    weight: 1,
  },
};
