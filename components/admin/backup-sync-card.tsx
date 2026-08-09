'use client'

import { useState, useTransition } from 'react'
import {
  saveGoogleSheetsWebhookUrl,
  syncGoogleSheetsBackup
} from '@/lib/actions/backup'
import { GOOGLE_APPS_SCRIPT_CODE } from '@/lib/constants/google-apps-script'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Download,
  ShieldCheck,
  Zap,
  Sparkles,
  Info,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface BackupSyncCardProps {
  initialWebhookUrl: string
  initialLastBackupAt: string
  initialLastBackupStatus: string
  initialLastBackupStats: string
}

export function BackupSyncCard({
  initialWebhookUrl,
  initialLastBackupAt,
  initialLastBackupStatus,
  initialLastBackupStats
}: BackupSyncCardProps) {
  const [webhookUrl, setWebhookUrl] = useState(initialWebhookUrl)
  const [lastBackupAt, setLastBackupAt] = useState(initialLastBackupAt)
  const [lastBackupStatus, setLastBackupStatus] = useState(initialLastBackupStatus)
  const [lastBackupStats, setLastBackupStats] = useState(initialLastBackupStats)

  const [isSaving, startSaving] = useTransition()
  const [isSyncing, startSyncing] = useTransition()

  const [copiedScript, setCopiedScript] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showScriptModal, setShowScriptModal] = useState(false)
  const [showSetupGuide, setShowSetupGuide] = useState(true)

  const isConnected = !!webhookUrl && webhookUrl.startsWith('https://script.google.com/macros/s/')

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMessage(null)
    setErrorMessage(null)

    startSaving(async () => {
      try {
        await saveGoogleSheetsWebhookUrl(webhookUrl)
        setSuccessMessage('Google Sheets Webhook URL saved successfully!')
      } catch (err: unknown) {
        const error = err as Error
        setErrorMessage(error.message || 'Failed to save webhook URL')
      }
    })
  }

  const handleSyncNow = () => {
    if (!webhookUrl) {
      setErrorMessage('Please save a valid Google Apps Script Webhook URL first.')
      return
    }

    setSuccessMessage(null)
    setErrorMessage(null)

    startSyncing(async () => {
      try {
        const res = await syncGoogleSheetsBackup(webhookUrl)
        setLastBackupAt(res.timestamp)
        setLastBackupStatus('Success')
        setLastBackupStats(`${res.summary.total_projects} projects, ${res.summary.total_entries} entries`)
        setSuccessMessage(`Backup completed successfully! ${res.summary.total_projects} projects and ${res.summary.total_entries} entries synced to Google Sheets.`)
      } catch (err: unknown) {
        const error = err as Error
        setErrorMessage(error.message || 'Sync failed')
      }
    })
  }

  const handleCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE)
      setCopiedScript(true)
      setTimeout(() => setCopiedScript(false), 3000)
    } catch {
      // Fallback
    }
  }

  return (
    <div className="space-y-6 animate-fade-in w-full max-w-full overflow-hidden">
      {/* Top Status & Sync Banner */}
      <div className="glass-card p-5 sm:p-7 lg:p-8 relative overflow-hidden border border-border/80 shadow-2xl rounded-3xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start gap-3.5 sm:gap-4">
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20"
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
            >
              <FileSpreadsheet className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-2xl font-bold text-foreground tracking-tight">
                  Google Sheets Live Backup
                </h2>
                {isConnected ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm">
                    <CheckCircle className="w-3 h-3" /> Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    <AlertCircle className="w-3 h-3" /> Setup Required
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed max-w-2xl">
                Automatically backup all projects, itemized expense entries, time logs, and user data directly to your private Google Sheet.
              </p>
            </div>
          </div>

          {/* Sync Trigger Button */}
          <div className="w-full lg:w-auto">
            <Button
              onClick={handleSyncNow}
              disabled={isSyncing || !isConnected}
              className="w-full sm:w-auto h-12 px-6 font-semibold rounded-2xl transition-all duration-200 hover:opacity-95 hover:shadow-xl hover:shadow-emerald-500/20 active:scale-95 text-white flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 text-sm"
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #0d9488 100%)', border: 'none' }}
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing to Google Sheets...' : 'Sync to Google Sheets Now'}
            </Button>
          </div>
        </div>

        {/* Status Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 mt-6 pt-5 border-t border-border/40 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground truncate">
            <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="truncate">
              Last Backup: <strong className="text-foreground">{lastBackupAt ? new Date(lastBackupAt).toLocaleString() : 'Never'}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground truncate">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="truncate">
              Status: <strong className={lastBackupStatus?.includes('Error') ? 'text-destructive' : 'text-emerald-400'}>{lastBackupStatus || 'Ready'}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground truncate">
            <Layers className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span className="truncate">
              Snapshot: <strong className="text-foreground">{lastBackupStats || 'No sync records yet'}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-medium animate-fade-in flex items-center gap-3">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-destructive/15 border border-destructive/30 text-destructive text-xs sm:text-sm font-medium animate-fade-in flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Webhook Configuration Card */}
      <div className="glass-card p-5 sm:p-7 lg:p-8 rounded-3xl border border-border/80 shadow-xl space-y-5">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-foreground">Google Apps Script Webhook URL</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Enter the Web App URL generated from your Google Sheet Apps Script deployment.
          </p>
        </div>

        <form onSubmit={handleSaveUrl} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url" className="text-foreground/90 font-medium text-xs sm:text-sm">
              Webhook URL (Starts with <code className="text-primary bg-primary/10 px-1 py-0.5 rounded text-[11px] font-mono break-all">https://script.google.com/macros/s/...</code>)
            </Label>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <Input
                id="webhook-url"
                type="url"
                placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                value={webhookUrl}
                onChange={e => setWebhookUrl(e.target.value)}
                className="flex-1 bg-muted/40 border-border/80 focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 transition-all duration-200 rounded-xl h-11 text-xs sm:text-sm font-mono min-w-0"
              />
              <Button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto h-11 px-6 font-semibold rounded-xl transition-all duration-200 hover:opacity-95 text-white active:scale-95 flex items-center justify-center gap-2 cursor-pointer flex-shrink-0 text-sm"
                style={{ background: 'var(--gradient-primary)', border: 'none' }}
              >
                {isSaving ? 'Saving...' : 'Save URL'}
              </Button>
            </div>
          </div>
        </form>

        {/* Quick actions row */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowScriptModal(!showScriptModal)}
            className="w-full sm:w-auto rounded-xl text-xs font-semibold gap-2 border-border/80 hover:bg-muted/80 active:scale-95 h-10"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            {showScriptModal ? 'Hide Apps Script Code' : 'View / Copy Apps Script Code'}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleCopyScript}
            className="w-full sm:w-auto rounded-xl text-xs font-semibold gap-2 border-border/80 hover:bg-muted/80 active:scale-95 h-10"
          >
            {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedScript ? 'Script Copied!' : 'Copy Script to Clipboard'}
          </Button>

          <a
            href="https://sheets.new"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-primary hover:text-primary/80 hover:bg-primary/10 transition-colors h-10 border border-primary/20"
          >
            Open New Google Sheet <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Apps Script Code Viewer Modal / Accordion */}
      {showScriptModal && (
        <div className="glass-card p-4 sm:p-6 rounded-3xl border border-primary/30 shadow-2xl space-y-3.5 animate-fade-in max-w-full overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
              <h4 className="font-bold text-foreground text-xs sm:text-sm truncate">Google Apps Script Code (Code.gs)</h4>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyScript}
              className="gap-1.5 text-xs rounded-xl flex-shrink-0 h-8 px-3"
            >
              {copiedScript ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copiedScript ? 'Copied!' : 'Copy Code'}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Paste this entire code in your Google Sheet under <strong>Extensions → Apps Script</strong> and click <strong>Deploy → New deployment → Web app</strong>.
          </p>

          <div className="rounded-2xl bg-[#090a10] border border-border/60 p-3 sm:p-4 max-w-full overflow-x-auto">
            <pre className="text-[11px] sm:text-xs font-mono text-muted-foreground max-h-80 leading-relaxed select-all whitespace-pre">
              {GOOGLE_APPS_SCRIPT_CODE}
            </pre>
          </div>
        </div>
      )}

      {/* Step-by-Step Setup Guide */}
      <div className="glass-card rounded-3xl border border-border/80 shadow-xl overflow-hidden">
        <button
          onClick={() => setShowSetupGuide(!showSetupGuide)}
          className="w-full p-5 sm:p-7 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary/15 text-primary flex-shrink-0">
              <Zap className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-sm sm:text-base">2-Minute Setup Guide</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Click to view step-by-step instructions for Google Sheets integration</p>
            </div>
          </div>
          {showSetupGuide ? <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />}
        </button>

        {showSetupGuide && (
          <div className="p-4 sm:p-7 border-t border-border/40 space-y-4 text-xs sm:text-sm text-muted-foreground leading-relaxed bg-muted/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div className="p-3.5 sm:p-4 rounded-2xl bg-muted/30 border border-border/40 space-y-1.5">
                <div className="flex items-center gap-2 text-foreground font-semibold text-xs sm:text-sm">
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">1</span>
                  Create a Google Sheet
                </div>
                <p className="text-xs">
                  Go to <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-primary underline">sheets.new</a> and name the spreadsheet <strong>ExpCal Database Backup</strong>.
                </p>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl bg-muted/30 border border-border/40 space-y-1.5">
                <div className="flex items-center gap-2 text-foreground font-semibold text-xs sm:text-sm">
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">2</span>
                  Open Apps Script
                </div>
                <p className="text-xs">
                  In your Google Sheet menu bar, click <strong>Extensions</strong> → <strong>Apps Script</strong>.
                </p>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl bg-muted/30 border border-border/40 space-y-1.5">
                <div className="flex items-center gap-2 text-foreground font-semibold text-xs sm:text-sm">
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">3</span>
                  Paste Script Code
                </div>
                <p className="text-xs">
                  Delete all sample code in <code className="text-primary font-mono">Code.gs</code>, paste the <strong>ExpCal Apps Script code</strong> from above, and click <strong>Save</strong> (💾).
                </p>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl bg-muted/30 border border-border/40 space-y-1.5">
                <div className="flex items-center gap-2 text-foreground font-semibold text-xs sm:text-sm">
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">4</span>
                  Deploy as Web App
                </div>
                <p className="text-xs">
                  Click <strong>Deploy</strong> → <strong>New deployment</strong> → Select type <strong>Web app</strong>.<br />
                  Set <strong>Execute as: Me</strong> and <strong>Who has access: Anyone</strong>.
                </p>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-primary/10 border border-primary/20 text-foreground text-xs flex items-start gap-2.5">
              <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <strong>Final Step:</strong> Copy the generated Web App URL and paste it into the <strong>Webhook URL</strong> field above, then click <strong>Save URL</strong> and <strong>Sync to Google Sheets Now</strong>!
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Offline Backup & Export Card */}
      <div className="glass-card p-5 sm:p-7 lg:p-8 rounded-3xl border border-border/80 shadow-xl space-y-3.5">
        <h3 className="text-base sm:text-lg font-bold text-foreground">Offline Database Export</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Download a complete raw backup of your Supabase database directly to your device.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
          <a
            href="/api/backup/export?format=json"
            download
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-semibold text-white transition-all duration-200 hover:opacity-95 hover:shadow-lg hover:shadow-primary/20 active:scale-95"
            style={{ background: 'var(--gradient-primary)' }}
          >
            <Download className="w-4 h-4" /> Download Complete JSON Archive (.json)
          </a>

          <a
            href="/api/backup/export?format=csv"
            download
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-semibold text-foreground glass-card hover:bg-muted/60 transition-all duration-200 active:scale-95 border border-border/80"
          >
            <Download className="w-4 h-4 text-emerald-400" /> Download Entries as Spreadsheet (.csv)
          </a>
        </div>
      </div>
    </div>
  )
}
