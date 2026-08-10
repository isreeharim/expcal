'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { calculateHours } from '@/lib/utils'
import { requireAdmin } from '@/lib/auth-guards'

export interface BackupPayload {
  action: 'sync_backup'
  source: 'ExpCal Supabase Backup'
  timestamp: string
  triggered_by: string
  summary: {
    total_projects: number
    total_entries: number
    total_users: number
    total_income: number
    total_expenses: number
    net_cash: number
    total_hours: number
  }
  projects: Array<{
    id: string
    title: string
    owner_name: string
    description: string
    color: string
    entry_count: number
    total_hours: number
    total_income: number
    total_expenses: number
    net_cash: number
    created_at: string
  }>
  entries: Array<{
    id: string
    project_title: string
    user_name: string
    date: string
    start_time: string
    end_time: string
    hours: number
    income: number
    total_expense: number
    expenses_breakdown: string
    notes: string
    photo_url: string
    created_at: string
  }>
  profiles: Array<{
    id: string
    full_name: string
    role: string
    created_at: string
  }>
}

/**
 * Fetch and construct the complete backup snapshot payload from Supabase.
 * Strictly enforces server-side administrator authorization.
 * Uses batched pagination for entries to scale across large datasets.
 */
export async function getBackupSnapshot(userEmailOrName?: string, isInternalCron = false): Promise<BackupPayload> {
  if (!isInternalCron) {
    await requireAdmin()
  }

  const supabase = await createClient()

  // 1. Fetch profiles
  const { data: rawProfiles, error: pErr } = await supabase
    .from('profiles')
    .select('id, full_name, role, created_at')
    .order('created_at', { ascending: true })

  if (pErr) throw new Error(`Failed to fetch profiles: ${pErr.message}`)
  const profiles = rawProfiles ?? []
  const profileMap = new Map(profiles.map(p => [p.id, p.full_name || 'Anonymous']))

  // 2. Fetch projects
  const { data: rawProjects, error: prjErr } = await supabase
    .from('projects')
    .select('id, user_id, title, description, color, created_at')
    .order('created_at', { ascending: false })

  if (prjErr) throw new Error(`Failed to fetch projects: ${prjErr.message}`)
  const projects = rawProjects ?? []
  const projectMap = new Map(projects.map(p => [p.id, p.title]))

  // 3. Batched fetching of entries (500 items per batch to preserve memory)
  const BATCH_SIZE = 500
  let allRawEntries: Array<{
    id: string
    project_id: string
    user_id: string
    date: string
    start_time: string | null
    end_time: string | null
    income: number
    expenses: unknown
    photo_url: string | null
    notes: string | null
    created_at: string
  }> = []

  let from = 0
  let hasMore = true

  while (hasMore) {
    const { data: batch, error: eErr } = await supabase
      .from('entries')
      .select('id, project_id, user_id, date, start_time, end_time, income, expenses, photo_url, notes, created_at')
      .order('date', { ascending: false })
      .range(from, from + BATCH_SIZE - 1)

    if (eErr) throw new Error(`Failed to fetch entries: ${eErr.message}`)

    if (!batch || batch.length === 0) {
      hasMore = false
    } else {
      allRawEntries = allRawEntries.concat(batch)
      if (batch.length < BATCH_SIZE) {
        hasMore = false
      } else {
        from += BATCH_SIZE
      }
    }
  }

  // 4. Compute per-project statistics
  const projectStatsMap = new Map<string, {
    entry_count: number
    total_hours: number
    total_income: number
    total_expenses: number
    net_cash: number
  }>()

  projects.forEach(p => {
    projectStatsMap.set(p.id, {
      entry_count: 0,
      total_hours: 0,
      total_income: 0,
      total_expenses: 0,
      net_cash: 0
    })
  })

  // Format and process entries
  const formattedEntries = allRawEntries.map(entry => {
    const hours = calculateHours(entry.start_time, entry.end_time)
    const inc = Number(entry.income) || 0

    let totalExp = 0
    let expItems: Array<{ category?: string; amount?: number; note?: string }> = []
    if (Array.isArray(entry.expenses)) {
      expItems = entry.expenses
      totalExp = expItems.reduce((acc, item) => acc + (Number(item?.amount) || 0), 0)
    }

    const expBreakdown = expItems.length > 0
      ? expItems.map(item => `${item.category || 'Other'}: ₹${item.amount || 0}${item.note ? ` (${item.note})` : ''}`).join(' | ')
      : 'None'

    // Update project stats
    if (projectStatsMap.has(entry.project_id)) {
      const stats = projectStatsMap.get(entry.project_id)!
      stats.entry_count += 1
      stats.total_hours += hours
      stats.total_income += inc
      stats.total_expenses += totalExp
      stats.net_cash = stats.total_income - stats.total_expenses
    }

    return {
      id: entry.id,
      project_title: projectMap.get(entry.project_id) || 'Unknown Project',
      user_name: profileMap.get(entry.user_id) || 'Unknown User',
      date: entry.date,
      start_time: entry.start_time || 'N/A',
      end_time: entry.end_time || 'N/A',
      hours: Number(hours.toFixed(2)),
      income: inc,
      total_expense: totalExp,
      expenses_breakdown: expBreakdown,
      notes: entry.notes || '',
      photo_url: entry.photo_url || '',
      created_at: entry.created_at
    }
  })

  // Format projects
  const formattedProjects = projects.map(p => {
    const stats = projectStatsMap.get(p.id) || {
      entry_count: 0,
      total_hours: 0,
      total_income: 0,
      total_expenses: 0,
      net_cash: 0
    }

    return {
      id: p.id,
      title: p.title,
      owner_name: profileMap.get(p.user_id) || 'Unknown',
      description: p.description || '',
      color: p.color || '#6366f1',
      entry_count: stats.entry_count,
      total_hours: Number(stats.total_hours.toFixed(2)),
      total_income: stats.total_income,
      total_expenses: stats.total_expenses,
      net_cash: stats.net_cash,
      created_at: p.created_at
    }
  })

  // Summary aggregation
  const total_income = formattedEntries.reduce((acc, e) => acc + e.income, 0)
  const total_expenses = formattedEntries.reduce((acc, e) => acc + e.total_expense, 0)
  const total_hours = formattedEntries.reduce((acc, e) => acc + e.hours, 0)

  return {
    action: 'sync_backup',
    source: 'ExpCal Supabase Backup',
    timestamp: new Date().toISOString(),
    triggered_by: userEmailOrName || 'System Admin',
    summary: {
      total_projects: projects.length,
      total_entries: formattedEntries.length,
      total_users: profiles.length,
      total_income,
      total_expenses,
      net_cash: total_income - total_expenses,
      total_hours: Number(total_hours.toFixed(2))
    },
    projects: formattedProjects,
    entries: formattedEntries,
    profiles: profiles.map(p => ({
      id: p.id,
      full_name: p.full_name || 'Anonymous',
      role: p.role,
      created_at: p.created_at
    }))
  }
}

/**
 * Get the saved Google Sheets Webhook URL and backup metadata.
 * Enforces admin authorization. Returns sanitized configuration.
 */
export async function getBackupSettings(isInternalCron = false) {
  if (!isInternalCron) {
    await requireAdmin()
  }

  const supabase = await createClient()

  let webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL || ''
  let lastBackupAt = ''
  let lastBackupStatus = ''
  let lastBackupStats = ''

  try {
    const { data: settings } = await supabase
      .from('app_settings')
      .select('key, value')
      .in('key', [
        'google_sheets_webhook_url',
        'last_backup_at',
        'last_backup_status',
        'last_backup_stats'
      ])

    if (settings) {
      settings.forEach(s => {
        if (s.key === 'google_sheets_webhook_url' && s.value) webhookUrl = s.value
        if (s.key === 'last_backup_at') lastBackupAt = s.value
        if (s.key === 'last_backup_status') lastBackupStatus = s.value
        if (s.key === 'last_backup_stats') lastBackupStats = s.value
      })
    }
  } catch {
    // Fail gracefully if settings table is temporarily unreachable
  }

  return {
    webhookUrl,
    lastBackupAt,
    lastBackupStatus,
    lastBackupStats
  }
}

/**
 * Save Google Sheets Webhook URL.
 * Strictly verifies admin role and validates domain URL prefix.
 */
export async function saveGoogleSheetsWebhookUrl(url: string) {
  await requireAdmin()
  const supabase = await createClient()

  const cleanUrl = url.trim()
  if (cleanUrl && !cleanUrl.startsWith('https://script.google.com/macros/s/')) {
    throw new Error('Invalid Google Apps Script URL. It must start with https://script.google.com/macros/s/')
  }

  const { error } = await supabase
    .from('app_settings')
    .upsert({
      key: 'google_sheets_webhook_url',
      value: cleanUrl,
      updated_at: new Date().toISOString()
    })

  if (error) throw error

  revalidatePath('/admin')
  revalidatePath('/admin/backup')
  return { success: true }
}

/**
 * Execute Sync to Google Sheets Webhook with timeout, error handling, and security guards.
 */
export async function syncGoogleSheetsBackup(customWebhookUrl?: string, isInternalCron = false) {
  let callerName = 'Automated Cron'
  if (!isInternalCron) {
    const auth = await requireAdmin()
    callerName = auth.user.email || 'Admin'
  }

  const supabase = await createClient()
  const settings = await getBackupSettings(true)
  const targetUrl = (customWebhookUrl || settings.webhookUrl || '').trim()

  if (!targetUrl) {
    throw new Error('No Google Sheets Webhook URL configured. Please set your Google Apps Script URL in Admin Backup Settings.')
  }

  if (!targetUrl.startsWith('https://script.google.com/macros/s/')) {
    throw new Error('Invalid Google Apps Script URL for security reasons. It must start with https://script.google.com/macros/s/')
  }

  const payload = await getBackupSnapshot(callerName, true)

  // Send POST request with 30s timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000)

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      redirect: 'follow',
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errMsg = `Google Sheets sync failed with HTTP status ${response.status}`
      try {
        await supabase.from('app_settings').upsert([
          { key: 'last_backup_at', value: new Date().toISOString(), updated_at: new Date().toISOString() },
          { key: 'last_backup_status', value: `Error: HTTP ${response.status}`, updated_at: new Date().toISOString() }
        ])
      } catch {}

      throw new Error(errMsg)
    }

    const result = await response.json().catch(() => ({ status: 'success' }))
    const statsSummary = `${payload.summary.total_projects} projects, ${payload.summary.total_entries} entries, ₹${payload.summary.total_income.toLocaleString('en-IN')} income`

    try {
      await supabase.from('app_settings').upsert([
        { key: 'last_backup_at', value: new Date().toISOString(), updated_at: new Date().toISOString() },
        { key: 'last_backup_status', value: 'Success', updated_at: new Date().toISOString() },
        { key: 'last_backup_stats', value: statsSummary, updated_at: new Date().toISOString() }
      ])
    } catch {}

    revalidatePath('/admin')
    revalidatePath('/admin/backup')

    return {
      success: true,
      timestamp: payload.timestamp,
      summary: payload.summary,
      result
    }
  } catch (err: unknown) {
    clearTimeout(timeoutId)
    const error = err as Error
    const safeError = error.name === 'AbortError' ? 'Google Sheets request timed out after 30 seconds' : error.message
    throw new Error(safeError)
  }
}
