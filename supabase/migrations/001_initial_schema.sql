-- ============================================================
-- Expense Tracker PWA — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. PROFILES TABLE
-- Extends auth.users with role and display info
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  role        TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read and update their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Security definer helper function to avoid RLS policy recursion
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE USING (public.is_admin(auth.uid()));

-- 2. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  color       TEXT DEFAULT '#6366f1',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Users can CRUD their own projects
CREATE POLICY "Users can manage own projects"
  ON public.projects FOR ALL USING (auth.uid() = user_id);

-- Admins can view/manage all projects
CREATE POLICY "Admins can manage all projects"
  ON public.projects FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 3. ENTRIES TABLE
CREATE TABLE IF NOT EXISTS public.entries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  start_time  TIME,
  end_time    TIME,
  income      NUMERIC(12, 2) NOT NULL DEFAULT 0,
  expenses    JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- expenses format: [{ "category": "Food", "amount": 50.00, "note": "lunch" }]
  photo_url   TEXT,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;

-- Users can CRUD their own entries
CREATE POLICY "Users can manage own entries"
  ON public.entries FOR ALL USING (auth.uid() = user_id);

-- Admins can manage all entries
CREATE POLICY "Admins can manage all entries"
  ON public.entries FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 4. STORAGE BUCKET for photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('entry-photos', 'entry-photos', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "Authenticated users can upload photos"
  ON storage.objects FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND bucket_id = 'entry-photos'
  );

CREATE POLICY "Anyone can view photos"
  ON storage.objects FOR SELECT USING (bucket_id = 'entry-photos');

CREATE POLICY "Users can delete own photos"
  ON storage.objects FOR DELETE USING (
    auth.uid()::text = (storage.foldername(name))[1]
    AND bucket_id = 'entry-photos'
  );

-- 5. AUTO-CREATE PROFILE TRIGGER
-- Automatically creates a profile row when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_entries_updated_at
  BEFORE UPDATE ON public.entries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 7. USEFUL VIEWS
-- Aggregated project stats view (security_invoker = true enforces querying user's RLS policies)
CREATE OR REPLACE VIEW public.project_stats
WITH (security_invoker = true) AS
SELECT
  p.id AS project_id,
  p.user_id,
  p.title,
  p.color,
  COUNT(e.id) AS entry_count,
  COALESCE(SUM(e.income), 0) AS total_income,
  COALESCE(SUM(
    (SELECT COALESCE(SUM((exp->>'amount')::numeric), 0)
     FROM jsonb_array_elements(e.expenses) AS exp)
  ), 0) AS total_expenses,
  COALESCE(SUM(e.income), 0) - COALESCE(SUM(
    (SELECT COALESCE(SUM((exp->>'amount')::numeric), 0)
     FROM jsonb_array_elements(e.expenses) AS exp)
  ), 0) AS net_cash,
  COALESCE(SUM(
    CASE
      WHEN e.start_time IS NOT NULL AND e.end_time IS NOT NULL
      THEN EXTRACT(EPOCH FROM (e.end_time - e.start_time)) / 3600
      ELSE 0
    END
  ), 0) AS total_hours
FROM public.projects p
LEFT JOIN public.entries e ON e.project_id = p.id
GROUP BY p.id, p.user_id, p.title, p.color;
