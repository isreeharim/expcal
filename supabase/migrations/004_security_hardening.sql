-- ============================================================
-- Migration 004: Security Hardening & RLS Lockdown
-- ============================================================

-- 1. Restrict App Settings (Google Sheets Webhook & Backup Meta) to Admins Only
DROP POLICY IF EXISTS "Authenticated users can view app settings" ON public.app_settings;
DROP POLICY IF EXISTS "Admins can manage app settings" ON public.app_settings;
DROP POLICY IF EXISTS "Admins can view app settings" ON public.app_settings;

CREATE POLICY "Admins can manage app settings"
  ON public.app_settings FOR ALL USING (
    public.is_admin(auth.uid())
  );

-- 2. Restrict Storage Policies on entry-photos bucket
-- Enforce that authenticated users can only upload into their own user_id folder
DROP POLICY IF EXISTS "Authenticated users can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own photos" ON storage.objects;

CREATE POLICY "Users can upload own photos"
  ON storage.objects FOR INSERT WITH CHECK (
    auth.role() = 'authenticated'
    AND bucket_id = 'entry-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can only view photos from their own folder or if they are admin
DROP POLICY IF EXISTS "Authenticated users can view photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own photos or admins" ON storage.objects;

CREATE POLICY "Users can view own photos or admins"
  ON storage.objects FOR SELECT USING (
    bucket_id = 'entry-photos'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.is_admin(auth.uid())
    )
  );
