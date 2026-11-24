import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Subtask, Task, TaskCategory, TaskPriority, TaskStatus } from '../types/task';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

const STORAGE_CONFIG_KEY = 'taskflow_supabase_config';

export function getStoredSupabaseConfig(): SupabaseConfig {
  // Check localStorage first
  try {
    const raw = localStorage.getItem(STORAGE_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.url && parsed.anonKey) {
        return parsed;
      }
    }
  } catch {
    // Ignore storage parse errors
  }

  // Fallback to Vite environment variables
  return {
    url: (import.meta.env.VITE_SUPABASE_URL as string) || '',
    anonKey: (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '',
  };
}

export function saveSupabaseConfig(config: SupabaseConfig): void {
  try {
    localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(config));
    // Reset cached client instance so next getSupabaseClient uses new config
    clientInstance = null;
  } catch (err) {
    console.error('Failed to save Supabase config to localStorage:', err);
  }
}

export function clearSupabaseConfig(): void {
  try {
    localStorage.removeItem(STORAGE_CONFIG_KEY);
    clientInstance = null;
  } catch (err) {
    console.error('Failed to clear Supabase config:', err);
  }
}

let clientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (clientInstance) return clientInstance;

  const config = getStoredSupabaseConfig();
  if (!config.url || !config.anonKey) {
    return null;
  }

  try {
    clientInstance = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    return clientInstance;
  } catch (err) {
    console.error('Error creating Supabase client:', err);
    return null;
  }
}

export function isSupabaseConfigured(): boolean {
  const config = getStoredSupabaseConfig();
  return Boolean(config.url && config.anonKey);
}

export interface SupabaseTaskRow {
  id: string;
  user_id?: string | null;
  title: string;
  notes?: string | null;
  category: string;
  status: string;
  priority: string;
  due_date?: string | null;
  due_time?: string | null;
  estimated_minutes?: number | null;
  subtasks?: Subtask[] | null;
  created_at?: string | null;
  completed_at?: string | null;
}

export function dbRowToTask(row: SupabaseTaskRow): Task {
  return {
    id: row.id,
    title: row.title || 'Untitled Task',
    notes: row.notes || '',
    category: (row.category as TaskCategory) || 'inbox',
    status: (row.status as TaskStatus) || 'todo',
    priority: (row.priority as TaskPriority) || 'medium',
    dueDate: row.due_date || '',
    dueTime: row.due_time || undefined,
    estimatedMinutes: row.estimated_minutes ?? undefined,
    subtasks: Array.isArray(row.subtasks) ? row.subtasks : [],
    createdAt: row.created_at || new Date().toISOString(),
    completedAt: row.completed_at || undefined,
  };
}

export function taskToDbRow(task: Task, userId?: string | null): SupabaseTaskRow {
  return {
    id: task.id,
    user_id: userId || null,
    title: task.title,
    notes: task.notes || '',
    category: task.category,
    status: task.status,
    priority: task.priority,
    due_date: task.dueDate || '',
    due_time: task.dueTime || null,
    estimated_minutes: task.estimatedMinutes ?? null,
    subtasks: task.subtasks || [],
    created_at: task.createdAt,
    completed_at: task.completedAt || null,
  };
}

/**
 * Test Supabase connection and verify that the `tasks` table exists.
 */
export async function testSupabaseConnection(config?: SupabaseConfig): Promise<{
  success: boolean;
  message: string;
  tableExists: boolean;
}> {
  const activeConfig = config || getStoredSupabaseConfig();
  if (!activeConfig.url || !activeConfig.anonKey) {
    return {
      success: false,
      message: 'Supabase URL and Anon Key are required.',
      tableExists: false,
    };
  }

  try {
    const testClient = createClient(activeConfig.url, activeConfig.anonKey);
    const { data, error } = await testClient
      .from('tasks')
      .select('id')
      .limit(1);

    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation "public.tasks" does not exist')) {
        return {
          success: true,
          message: 'Connected to Supabase, but the "tasks" table is not created yet. Please execute the schema SQL.',
          tableExists: false,
        };
      }
      return {
        success: false,
        message: `Connection failed: ${error.message}`,
        tableExists: false,
      };
    }

    return {
      success: true,
      message: 'Successfully connected to Supabase and verified the "tasks" table!',
      tableExists: true,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Network or configuration error: ${err.message || String(err)}`,
      tableExists: false,
    };
  }
}
