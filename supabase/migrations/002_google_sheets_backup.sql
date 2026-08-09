-- ============================================================
-- Migration 002: App Settings & Google Sheets Backup Support
-- ============================================================

CREATE TABLE IF NOT EXISTS public.app_settings (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view settings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'app_settings' AND policyname = 'Authenticated users can view app settings'
  ) THEN
    CREATE POLICY "Authenticated users can view app settings"
      ON public.app_settings FOR SELECT USING (auth.role() = 'authenticated');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'app_settings' AND policyname = 'Admins can manage app settings'
  ) THEN
    CREATE POLICY "Admins can manage app settings"
      ON public.app_settings FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END $$;
