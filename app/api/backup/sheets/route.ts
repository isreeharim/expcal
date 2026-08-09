import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getBackupSnapshot, getBackupSettings } from '@/lib/actions/backup'

export async function GET(req: NextRequest) {
  return handleSync(req)
}

export async function POST(req: NextRequest) {
  return handleSync(req)
}

async function handleSync(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Also allow cron / automated key authorization if passed
    const authHeader = req.headers.get('Authorization')
    const secretKey = process.env.BACKUP_CRON_SECRET
    const isCronAuthorized = secretKey && authHeader === `Bearer ${secretKey}`

    if (!user && !isCronAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const settings = await getBackupSettings()
    const targetUrl = settings.webhookUrl

    if (!targetUrl) {
      return NextResponse.json({
        error: 'No Google Sheets Webhook URL configured in ExpCal settings'
      }, { status: 400 })
    }

    if (!targetUrl.startsWith('https://script.google.com/macros/s/')) {
      return NextResponse.json({
        error: 'Invalid Google Apps Script URL for security reasons. It must start with https://script.google.com/macros/s/'
      }, { status: 400 })
    }

    const payload = await getBackupSnapshot(user?.email || 'Automated Sync')

    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      redirect: 'follow'
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      throw new Error(`Google Apps Script error: ${res.status} ${errText || res.statusText}`)
    }

    const result = await res.json().catch(() => ({ status: 'success' }))

    // Update settings status
    try {
      await supabase.from('app_settings').upsert([
        { key: 'last_backup_at', value: new Date().toISOString(), updated_at: new Date().toISOString() },
        { key: 'last_backup_status', value: 'Success', updated_at: new Date().toISOString() },
        { key: 'last_backup_stats', value: `${payload.summary.total_projects} projects, ${payload.summary.total_entries} entries`, updated_at: new Date().toISOString() }
      ])
    } catch {}

    return NextResponse.json({
      status: 'success',
      message: 'ExpCal database successfully backed up to Google Sheets!',
      timestamp: payload.timestamp,
      summary: payload.summary,
      result
    })
  } catch (err: unknown) {
    const error = err as Error
    return NextResponse.json({
      status: 'error',
      message: error.message
    }, { status: 500 })
  }
}
