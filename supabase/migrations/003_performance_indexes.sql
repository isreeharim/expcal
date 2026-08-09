-- ============================================================
-- ExpCal — Performance Optimization & Database Indexes
-- ============================================================

-- B-Tree indexes on foreign keys & filter columns to eliminate Seq Scans
CREATE INDEX IF NOT EXISTS idx_entries_project_id ON public.entries(project_id);
CREATE INDEX IF NOT EXISTS idx_entries_user_id ON public.entries(user_id);
CREATE INDEX IF NOT EXISTS idx_entries_date ON public.entries(date DESC);
CREATE INDEX IF NOT EXISTS idx_entries_project_date ON public.entries(project_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
