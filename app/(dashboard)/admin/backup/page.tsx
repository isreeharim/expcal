import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Metadata } from 'next'
import { FileSpreadsheet, ArrowLeft } from 'lucide-react'
import { getBackupSettings } from '@/lib/actions/backup'
import { BackupSyncCard } from '@/components/admin/backup-sync-card'

export const metadata: Metadata = {
  title: 'Google Sheets Live Backup | ExpCal Admin',
  description: 'Automated Supabase database sync to Google Sheets.'
}

export default async function AdminBackupPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const settings = await getBackupSettings()

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20"
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
          >
            <FileSpreadsheet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">Database Backup & Sync</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Automated live sync from Supabase to Google Sheets</p>
          </div>
        </div>

        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-1.5 -my-1.5 font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Admin Overview
        </Link>
      </div>

      {/* Main Backup Sync Card */}
      <BackupSyncCard
        initialWebhookUrl={settings.webhookUrl}
        initialLastBackupAt={settings.lastBackupAt}
        initialLastBackupStatus={settings.lastBackupStatus}
        initialLastBackupStats={settings.lastBackupStats}
      />
    </div>
  )
}
