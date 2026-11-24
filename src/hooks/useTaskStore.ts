import { useCallback, useEffect, useRef, useState } from 'react';
import { createInitialTasks, getLocalDateStr } from '../data/initialTasks';
import {
  dbRowToTask,
  getSupabaseClient,
  isSupabaseConfigured,
  taskToDbRow,
} from '../lib/supabase';
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
    if (Array.isArray(parsed) && parsed.length > 0) {
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
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(() =>
    isSupabaseConfigured()
  );
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Keep a ref to the latest tasks for background sync closures
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;

  // Persist to local storage whenever tasks state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // Ignore storage quota errors
    }
  }, [tasks]);

  // Auto-dismiss undo notification after 5 seconds
  useEffect(() => {
    if (!undoState) return;
    const timer = window.setTimeout(() => {
      setUndoState(null);
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [undoState]);

  // Fetch tasks from Supabase
  const refreshFromSupabase = useCallback(async () => {
    const client = getSupabaseClient();
    if (!client) {
      setIsCloudConnected(false);
      return;
    }

    setIsSyncing(true);
    setSyncError(null);

    try {
      const { data, error } = await client
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        const loaded = data.map(dbRowToTask);
        setTasks(loaded);
        setIsCloudConnected(true);
        setLastSyncTime(new Date());
      } else {
        // Table is empty in Supabase. Seed initial tasks to Supabase so it's a real working database from the start!
        const initial = createInitialTasks();
        const rows = initial.map((t) => taskToDbRow(t));
        await client.from('tasks').upsert(rows, { onConflict: 'id' });
        setTasks(initial);
        setIsCloudConnected(true);
        setLastSyncTime(new Date());
      }
    } catch (err: any) {
      console.warn('Supabase fetch error:', err);
      setSyncError(err.message || 'Failed to sync with Supabase');
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Set up Supabase real-time channel subscription & initial load
  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) {
      setIsCloudConnected(false);
      return;
    }

    setIsCloudConnected(true);
    refreshFromSupabase();

    // Subscribe to Postgres changes on the tasks table
    const channel = client
      .channel('tasks-realtime-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newTask = dbRowToTask(payload.new as any);
            setTasks((prev) => {
              if (prev.some((t) => t.id === newTask.id)) {
                return prev.map((t) => (t.id === newTask.id ? newTask : t));
              }
              return [newTask, ...prev];
            });
            setLastSyncTime(new Date());
          } else if (payload.eventType === 'UPDATE') {
            const updatedTask = dbRowToTask(payload.new as any);
            setTasks((prev) =>
              prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
            );
            setLastSyncTime(new Date());
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as any)?.id;
            if (deletedId) {
              setTasks((prev) => prev.filter((t) => t.id !== deletedId));
              setLastSyncTime(new Date());
            }
          }
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [refreshFromSupabase]);

  // Method to re-initialize cloud connection after user updates credentials
  const reconnectSupabase = useCallback(() => {
    const configured = isSupabaseConfigured();
    setIsCloudConnected(configured);
    if (configured) {
      refreshFromSupabase();
    }
  }, [refreshFromSupabase]);

  // Method to push local tasks to Supabase database
  const pushLocalToSupabase = useCallback(async (): Promise<{
    success: boolean;
    count: number;
    error?: string;
  }> => {
    const client = getSupabaseClient();
    if (!client) {
      return {
        success: false,
        count: 0,
        error: 'Supabase client is not configured.',
      };
    }

    setIsSyncing(true);
    setSyncError(null);

    try {
      const currentTasks = tasksRef.current;
      const dbRows = currentTasks.map((t) => taskToDbRow(t));

      const { error } = await client.from('tasks').upsert(dbRows, {
        onConflict: 'id',
      });

      if (error) {
        throw error;
      }

      setLastSyncTime(new Date());
      setIsCloudConnected(true);
      return { success: true, count: currentTasks.length };
    } catch (err: any) {
      const msg = err.message || 'Failed to upload tasks to Supabase';
      setSyncError(msg);
      return { success: false, count: 0, error: msg };
    } finally {
      setIsSyncing(false);
    }
  }, []);

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

      // Optimistic local state update
      setTasks((prev) => [newTask, ...prev]);

      // Cloud sync
      const client = getSupabaseClient();
      if (client) {
        Promise.resolve(client.from('tasks').insert(taskToDbRow(newTask)))
          .then(({ error }: { error: any }) => {
            if (error) {
              console.error('Failed to sync new task to Supabase:', error);
              setSyncError(`Sync error on add: ${error.message}`);
            } else {
              setLastSyncTime(new Date());
            }
          })
          .catch((err: any) => {
            console.error('Network error syncing new task:', err);
          });
      }

      return newTask;
    },
    []
  );

  const toggleTaskCompletion = useCallback((taskId: string) => {
    const target = tasksRef.current.find((t) => t.id === taskId);
    if (!target) return;

    const willComplete = target.status !== 'completed';
    const updatedTask: Task = {
      ...target,
      status: willComplete ? 'completed' : 'todo',
      completedAt: willComplete ? new Date().toISOString() : undefined,
    };

    setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));

    const client = getSupabaseClient();
    if (client) {
      Promise.resolve(
        client
          .from('tasks')
          .update({
            status: updatedTask.status,
            completed_at: updatedTask.completedAt || null,
          })
          .eq('id', taskId)
      ).then(({ error }: { error: any }) => {
        if (error) {
          console.error('Supabase toggle error:', error);
          setSyncError(`Toggle error: ${error.message}`);
        } else {
          setLastSyncTime(new Date());
        }
      });
    }
  }, []);

  const updateTaskStatus = useCallback((taskId: string, status: TaskStatus) => {
    const target = tasksRef.current.find((t) => t.id === taskId);
    if (!target) return;

    const updatedTask: Task = {
      ...target,
      status,
      completedAt:
        status === 'completed'
          ? target.completedAt ?? new Date().toISOString()
          : undefined,
    };

    setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));

    const client = getSupabaseClient();
    if (client) {
      Promise.resolve(
        client
          .from('tasks')
          .update({
            status: updatedTask.status,
            completed_at: updatedTask.completedAt || null,
          })
          .eq('id', taskId)
      ).then(({ error }: { error: any }) => {
        if (error) {
          console.error('Supabase status error:', error);
          setSyncError(`Status error: ${error.message}`);
        } else {
          setLastSyncTime(new Date());
        }
      });
    }
  }, []);

  const updateTask = useCallback((taskId: string, patch: Partial<Task>) => {
    const target = tasksRef.current.find((t) => t.id === taskId);
    if (!target) return;

    const nextStatus = patch.status ?? target.status;
    const updatedTask: Task = {
      ...target,
      ...patch,
      completedAt:
        nextStatus === 'completed'
          ? patch.completedAt ?? target.completedAt ?? new Date().toISOString()
          : undefined,
    };

    setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));

    const client = getSupabaseClient();
    if (client) {
      const dbRow = taskToDbRow(updatedTask);
      Promise.resolve(
        client
          .from('tasks')
          .update(dbRow)
          .eq('id', taskId)
      ).then(({ error }: { error: any }) => {
        if (error) {
          console.error('Supabase update error:', error);
          setSyncError(`Update error: ${error.message}`);
        } else {
          setLastSyncTime(new Date());
        }
      });
    }
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    const target = tasksRef.current.find((t) => t.id === taskId);
    if (!target) return;

    const prevTasks = tasksRef.current;
    setUndoState({
      message: `Deleted "${target.title}"`,
      previousTasks: prevTasks,
    });
    setTasks((prev) => prev.filter((t) => t.id !== taskId));

    const client = getSupabaseClient();
    if (client) {
      Promise.resolve(
        client
          .from('tasks')
          .delete()
          .eq('id', taskId)
      ).then(({ error }: { error: any }) => {
        if (error) {
          console.error('Supabase delete error:', error);
          setSyncError(`Delete error: ${error.message}`);
        } else {
          setLastSyncTime(new Date());
        }
      });
    }
  }, []);

  const addSubtask = useCallback((taskId: string, title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;

    const target = tasksRef.current.find((t) => t.id === taskId);
    if (!target) return;

    const sub: Subtask = {
      id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      title: trimmed,
      completed: false,
    };

    const nextSubtasks = [...target.subtasks, sub];
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, subtasks: nextSubtasks } : t))
    );

    const client = getSupabaseClient();
    if (client) {
      Promise.resolve(
        client
          .from('tasks')
          .update({ subtasks: nextSubtasks })
          .eq('id', taskId)
      ).then(({ error }: { error: any }) => {
        if (error) {
          console.error('Supabase subtask add error:', error);
          setSyncError(`Subtask error: ${error.message}`);
        } else {
          setLastSyncTime(new Date());
        }
      });
    }
  }, []);

  const toggleSubtask = useCallback((taskId: string, subtaskId: string) => {
    const target = tasksRef.current.find((t) => t.id === taskId);
    if (!target) return;

    const nextSubtasks = target.subtasks.map((s) =>
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    );

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, subtasks: nextSubtasks } : t))
    );

    const client = getSupabaseClient();
    if (client) {
      Promise.resolve(
        client
          .from('tasks')
          .update({ subtasks: nextSubtasks })
          .eq('id', taskId)
      ).then(({ error }: { error: any }) => {
        if (error) {
          console.error('Supabase subtask toggle error:', error);
          setSyncError(`Subtask error: ${error.message}`);
        } else {
          setLastSyncTime(new Date());
        }
      });
    }
  }, []);

  const deleteSubtask = useCallback((taskId: string, subtaskId: string) => {
    const target = tasksRef.current.find((t) => t.id === taskId);
    if (!target) return;

    const nextSubtasks = target.subtasks.filter((s) => s.id !== subtaskId);

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, subtasks: nextSubtasks } : t))
    );

    const client = getSupabaseClient();
    if (client) {
      Promise.resolve(
        client
          .from('tasks')
          .update({ subtasks: nextSubtasks })
          .eq('id', taskId)
      ).then(({ error }: { error: any }) => {
        if (error) {
          console.error('Supabase subtask delete error:', error);
          setSyncError(`Subtask error: ${error.message}`);
        } else {
          setLastSyncTime(new Date());
        }
      });
    }
  }, []);

  const clearCompletedInScope = useCallback((taskIds: string[]) => {
    if (taskIds.length === 0) return;
    const idSet = new Set(taskIds);

    const prevTasks = tasksRef.current;
    setUndoState({
      message: `Cleared ${taskIds.length} completed task${taskIds.length > 1 ? 's' : ''}`,
      previousTasks: prevTasks,
    });
    setTasks((prev) => prev.filter((t) => !idSet.has(t.id)));

    const client = getSupabaseClient();
    if (client) {
      Promise.resolve(
        client
          .from('tasks')
          .delete()
          .in('id', taskIds)
      ).then(({ error }: { error: any }) => {
        if (error) {
          console.error('Supabase batch clear error:', error);
          setSyncError(`Clear error: ${error.message}`);
        } else {
          setLastSyncTime(new Date());
        }
      });
    }
  }, []);

  const resetDemoTasks = useCallback(() => {
    const demo = createInitialTasks();
    const prevTasks = tasksRef.current;
    setUndoState({
      message: 'Restored default workspace tasks',
      previousTasks: prevTasks,
    });
    setTasks(demo);

    const client = getSupabaseClient();
    if (client) {
      const rows = demo.map((t) => taskToDbRow(t));
      Promise.resolve(
        client
          .from('tasks')
          .upsert(rows, { onConflict: 'id' })
      ).then(({ error }: { error: any }) => {
        if (error) {
          console.error('Supabase reset demo error:', error);
          setSyncError(`Reset error: ${error.message}`);
        } else {
          setLastSyncTime(new Date());
        }
      });
    }
  }, []);

  const undoLastAction = useCallback(() => {
    if (!undoState) return;
    const restored = undoState.previousTasks;
    setTasks(restored);
    setUndoState(null);

    // Sync restored state to Supabase
    const client = getSupabaseClient();
    if (client) {
      const rows = restored.map((t) => taskToDbRow(t));
      Promise.resolve(client.from('tasks').upsert(rows, { onConflict: 'id' })).then(
        ({ error }: { error: any }) => {
          if (error) console.error('Supabase undo error:', error);
          else setLastSyncTime(new Date());
        }
      );
    }
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
    isCloudConnected,
    isSyncing,
    lastSyncTime,
    syncError,
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
    refreshFromSupabase,
    pushLocalToSupabase,
    reconnectSupabase,
  };
}
