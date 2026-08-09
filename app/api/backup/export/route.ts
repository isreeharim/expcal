import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getBackupSnapshot } from '@/lib/actions/backup'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const format = searchParams.get('format') || 'json'

    const payload = await getBackupSnapshot(user.email || 'User')

    const dateStr = new Date().toISOString().split('T')[0]

    if (format === 'csv') {
      // Export entries as CSV
      const headers = [
        'Entry ID',
        'Date',
        'Project',
        'User',
        'Start Time',
        'End Time',
        'Hours',
        'Income',
        'Total Expense',
        'Expenses Breakdown',
        'Notes',
        'Photo URL',
        'Created At'
      ]

      const rows = payload.entries.map(e => [
        `"${e.id}"`,
        `"${e.date}"`,
        `"${e.project_title.replace(/"/g, '""')}"`,
        `"${e.user_name.replace(/"/g, '""')}"`,
        `"${e.start_time}"`,
        `"${e.end_time}"`,
        e.hours,
        e.income,
        e.total_expense,
        `"${e.expenses_breakdown.replace(/"/g, '""')}"`,
        `"${(e.notes || '').replace(/"/g, '""')}"`,
        `"${e.photo_url || ''}"`,
        `"${e.created_at}"`
      ])

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="expcal-entries-backup-${dateStr}.csv"`
        }
      })
    }

    // Default: full JSON backup
    const jsonContent = JSON.stringify(payload, null, 2)
    return new NextResponse(jsonContent, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="expcal-full-backup-${dateStr}.json"`
      }
    })
  } catch (err: unknown) {
    const error = err as Error
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
