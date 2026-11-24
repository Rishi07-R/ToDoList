import { useCallback, useEffect, useState } from 'react';
import { createInitialTasks, getLocalDateStr } from '../data/initialTasks';
import {
  Subtask,
  Task,
  TaskCategory,
  TaskPriority,
  TaskStatus,
} from '../types/task';

const STORAGE_KEY = 'taskflow_core_tasks_v1';

function loadStoredTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = createInitialTasks();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // Fallback to initial seeded tasks if storage is unavailable
  }
  return createInitialTasks();
}

export interface UndoState {
  message: string;
  previousTasks: Task[];
}

export function useTaskStore() {
  const [tasks, setTasks] = useState<Task[]>(() => loadStoredTasks());
  const [undoState, setUndoState] = useState<UndoState | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // Ignore storage quota errors
    }
  }, [tasks]);

  useEffect(() => {
    if (!undoState) return;
    const timer = window.setTimeout(() => {
      setUndoState(null);
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [undoState]);

  const addTask = useCallback(
    (payload: {
      title: string;
      category?: TaskCategory;
      priority?: TaskPriority;
      dueDate?: string;
      dueTime?: string;
      status?: TaskStatus;
      notes?: string;
    }): Task => {
      const newTask: Task = {
        id: `tsk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: payload.title.trim(),
        notes: payload.notes ?? '',
        category: payload.category ?? 'inbox',
        status: payload.status ?? 'todo',
        priority: payload.priority ?? 'medium',
        dueDate: payload.dueDate ?? '',
        dueTime: payload.dueTime,
        subtasks: [],
        createdAt: new Date().toISOString(),
        completedAt:
          payload.status === 'completed' ? new Date().toISOString() : undefined,
      };
      setTasks((prev) => [newTask, ...prev]);
      return newTask;
    },
    []
  );

  const toggleTaskCompletion = useCallback((taskId: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        const willComplete = task.status !== 'completed';
        return {
          ...task,
          status: willComplete ? 'completed' : 'todo',
          completedAt: willComplete ? new Date().toISOString() : undefined,
        };
      })
    );
  }, []);

  const updateTaskStatus = useCallback((taskId: string, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        return {
          ...task,
          status,
          completedAt:
            status === 'completed'
              ? task.completedAt ?? new Date().toISOString()
              : undefined,
        };
      })
    );
  }, []);

  const updateTask = useCallback((taskId: string, patch: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        const nextStatus = patch.status ?? task.status;
        return {
          ...task,
          ...patch,
          completedAt:
            nextStatus === 'completed'
              ? patch.completedAt ?? task.completedAt ?? new Date().toISOString()
              : undefined,
        };
      })
    );
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks((prev) => {
      const target = prev.find((t) => t.id === taskId);
      if (target) {
        setUndoState({
          message: `Deleted "${target.title}"`,
          previousTasks: prev,
        });
      }
      return prev.filter((t) => t.id !== taskId);
    });
  }, []);

  const addSubtask = useCallback((taskId: string, title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    const sub: Subtask = {
      id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      title: trimmed,
      completed: false,
    };
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, subtasks: [...t.subtasks, sub] } : t
      )
    );
  }, []);

  const toggleSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              subtasks: t.subtasks.map((s) =>
                s.id === subtaskId ? { ...s, completed: !s.completed } : s
              ),
            }
          : t
      )
    );
  }, []);

  const deleteSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              subtasks: t.subtasks.filter((s) => s.id !== subtaskId),
            }
          : t
      )
    );
  }, []);

  const clearCompletedInScope = useCallback((taskIds: string[]) => {
    if (taskIds.length === 0) return;
    const idSet = new Set(taskIds);
    setTasks((prev) => {
      setUndoState({
        message: `Cleared ${taskIds.length} completed task${taskIds.length > 1 ? 's' : ''}`,
        previousTasks: prev,
      });
      return prev.filter((t) => !idSet.has(t.id));
    });
  }, []);

  const resetDemoTasks = useCallback(() => {
    setTasks((prev) => {
      setUndoState({
        message: 'Restored default workspace tasks',
        previousTasks: prev,
      });
      return createInitialTasks();
    });
  }, []);

  const undoLastAction = useCallback(() => {
    if (!undoState) return;
    setTasks(undoState.previousTasks);
    setUndoState(null);
  }, [undoState]);

  const dismissUndo = useCallback(() => {
    setUndoState(null);
  }, []);

  // Computed counts for sidebar badges
  const todayStr = getLocalDateStr(0);
  const counts = {
    today: tasks.filter(
      (t) => t.status !== 'completed' && t.dueDate !== '' && t.dueDate <= todayStr
    ).length,
    inbox: tasks.filter(
      (t) => t.status !== 'completed' && t.category === 'inbox'
    ).length,
    upcoming: tasks.filter(
      (t) => t.status !== 'completed' && t.dueDate > todayStr
    ).length,
    study: tasks.filter(
      (t) => t.status !== 'completed' && t.category === 'study'
    ).length,
    projects: tasks.filter(
      (t) => t.status !== 'completed' && t.category === 'projects'
    ).length,
    personal: tasks.filter(
      (t) => t.status !== 'completed' && t.category === 'personal'
    ).length,
  };

  return {
    tasks,
    counts,
    undoState,
    addTask,
    toggleTaskCompletion,
    updateTaskStatus,
    updateTask,
    deleteTask,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    clearCompletedInScope,
    resetDemoTasks,
    undoLastAction,
    dismissUndo,
  };
}
