-- TaskFlow Core: Supabase Schema Definition
-- Run this in your Supabase project's SQL Editor (Dashboard -> SQL Editor -> New Query)

-- 1. Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    notes TEXT DEFAULT '',
    category TEXT NOT NULL CHECK (category IN ('inbox', 'study', 'projects', 'personal')),
    status TEXT NOT NULL CHECK (status IN ('todo', 'in_progress', 'completed')),
    priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
    due_date TEXT DEFAULT '',
    due_time TEXT,
    estimated_minutes INTEGER,
    subtasks JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 2. Indexes for fast queries & sorting
CREATE INDEX IF NOT EXISTS idx_tasks_category ON public.tasks (category);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks (status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks (due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON public.tasks (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks (user_id);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 4. Policies:
-- Allow full access for anon and authenticated users (supports both personal usage and auth modes)
DROP POLICY IF EXISTS "Allow anonymous and authenticated full access" ON public.tasks;
CREATE POLICY "Allow anonymous and authenticated full access"
    ON public.tasks
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 5. Enable Realtime updates
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'tasks'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
    END IF;
END $$;
