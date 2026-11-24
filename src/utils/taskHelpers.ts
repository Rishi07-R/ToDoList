import { getLocalDateStr } from '../data/initialTasks';
import {
  PRIORITY_META,
  SortOption,
  Task,
  TaskCategory,
  TaskPriority,
} from '../types/task';

export function formatDueDateLabel(dueDate: string, dueTime?: string): {
  label: string;
  isOverdue: boolean;
  isToday: boolean;
} {
  if (!dueDate) {
    return { label: 'Unscheduled', isOverdue: false, isToday: false };
  }

  const today = getLocalDateStr(0);
  const tomorrow = getLocalDateStr(1);
  const yesterday = getLocalDateStr(-1);

  const isOverdue = dueDate < today;
  const isToday = dueDate === today;

  let datePart = dueDate;
  if (dueDate === today) {
    datePart = 'Today';
  } else if (dueDate === tomorrow) {
    datePart = 'Tomorrow';
  } else if (dueDate === yesterday) {
    datePart = 'Yesterday';
  } else {
    const [y, m, d] = dueDate.split('-').map(Number);
    const dateObj = new Date(y, (m || 1) - 1, d || 1);
    datePart = dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }

  const label = dueTime ? `${datePart}, ${dueTime}` : datePart;
  return { label, isOverdue, isToday };
}

export function sortTasks(tasks: Task[], sortBy: SortOption): Task[] {
  return [...tasks].sort((a, b) => {
    // Completed items always go after active items when mixed
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.status !== 'completed' && b.status === 'completed') return -1;

    if (sortBy === 'priority') {
      const diff = PRIORITY_META[b.priority].weight - PRIORITY_META[a.priority].weight;
      if (diff !== 0) return diff;
    }

    if (sortBy === 'dueDate') {
      if (a.dueDate && b.dueDate) {
        if (a.dueDate !== b.dueDate) return a.dueDate.localeCompare(b.dueDate);
        if (a.dueTime && b.dueTime) return a.dueTime.localeCompare(b.dueTime);
        if (a.dueTime) return -1;
        if (b.dueTime) return 1;
      } else if (a.dueDate) {
        return -1;
      } else if (b.dueDate) {
        return 1;
      }
      return PRIORITY_META[b.priority].weight - PRIORITY_META[a.priority].weight;
    }

    return b.createdAt.localeCompare(a.createdAt);
  });
}

export interface ParsedQuickAdd {
  cleanTitle: string;
  detectedCategory: TaskCategory | null;
  detectedPriority: TaskPriority | null;
  detectedDate: string | null;
}

export function parseQuickAddInput(raw: string): ParsedQuickAdd {
  let text = raw;
  let detectedCategory: TaskCategory | null = null;
  let detectedPriority: TaskPriority | null = null;
  let detectedDate: string | null = null;

  const categoryMatch = text.match(/(?:^|\s)#(study|projects|personal|inbox)\b/i);
  if (categoryMatch) {
    detectedCategory = categoryMatch[1].toLowerCase() as TaskCategory;
    text = text.replace(categoryMatch[0], ' ');
  }

  const priorityMatch = text.match(/(?:^|\s)!(high|med|medium|low)\b/i);
  if (priorityMatch) {
    const p = priorityMatch[1].toLowerCase();
    detectedPriority = p === 'med' ? 'medium' : (p as TaskPriority);
    text = text.replace(priorityMatch[0], ' ');
  }

  const dateMatch = text.match(/(?:^|\s)@(today|tomorrow)\b/i);
  if (dateMatch) {
    const token = dateMatch[1].toLowerCase();
    detectedDate = token === 'today' ? getLocalDateStr(0) : getLocalDateStr(1);
    text = text.replace(dateMatch[0], ' ');
  }

  return {
    cleanTitle: text.replace(/\s+/g, ' ').trim(),
    detectedCategory,
    detectedPriority,
    detectedDate,
  };
}
