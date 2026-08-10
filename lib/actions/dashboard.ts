'use server'

import { createClient } from '@/lib/supabase/server'
import { Entry, ExpenseCategory } from '@/lib/types'
import { subDays, format } from 'date-fns'

type RecentEntry = Entry & { project_title: string; project_color: string }

export async function getRecentEntries(userId: string, limit: number = 5): Promise<RecentEntry[]> {
  try {
    const supabase = await createClient()
    
    // We fetch entries and join with projects
    const { data, error } = await supabase
      .from('entries')
      .select(`
        *,
        projects!inner(
          title,
          color
        )
      `)
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error || !data) {
      console.error('Error fetching recent entries:', error)
      return []
    }

    return (data as Array<Entry & { projects: { title: string; color: string } | null }>).map((entry) => ({
      ...entry,
      project_title: entry.projects?.title || 'Unknown',
      project_color: entry.projects?.color || 'blue'
    }))
  } catch (error) {
    console.error('Failed to get recent entries:', error)
    return []
  }
}

export async function getDashboardChartData(userId: string, days: number = 7) {
  try {
    const supabase = await createClient()
    
    // Generate an array of the last N days
    const dateRange = Array.from({ length: days }, (_, i) => {
      const d = subDays(new Date(), days - 1 - i)
      return format(d, 'yyyy-MM-dd')
    })
    
    const startDate = dateRange[0]
    
    const { data, error } = await supabase
      .from('entries')
      .select('date, income, expenses')
      .eq('user_id', userId)
      .gte('date', startDate)
      .order('date', { ascending: true })

    if (error) {
      console.error('Error fetching chart data:', error)
      return []
    }

    // Initialize the aggregation map
    const map = new Map<string, { income: number; expenses: number }>()
    dateRange.forEach(date => {
      map.set(date, { income: 0, expenses: 0 })
    })

    if (data) {
      for (const entry of data) {
        const entryDate = entry.date
        if (map.has(entryDate)) {
          const current = map.get(entryDate)!
          const income = current.income + Number(entry.income || 0)
          
          let totalExpenses = 0
          if (Array.isArray(entry.expenses)) {
            totalExpenses = (entry.expenses as ExpenseCategory[]).reduce((sum, exp) => sum + Number(exp.amount || 0), 0)
          }
          
          map.set(entryDate, {
            income,
            expenses: current.expenses + totalExpenses
          })
        }
      }
    }

    return dateRange.map(date => ({
      date,
      income: map.get(date)!.income,
      expenses: map.get(date)!.expenses
    }))
  } catch (error) {
    console.error('Failed to get dashboard chart data:', error)
    return []
  }
}

export async function getUserEntries(userId: string, limit: number = 100): Promise<RecentEntry[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('entries')
      .select(`
        *,
        projects!inner(
          title,
          color
        )
      `)
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error || !data) {
      console.error('Error fetching user entries:', error)
      return []
    }

    return (data as Array<Entry & { projects: { title: string; color: string } | null }>).map((entry) => ({
      ...entry,
      project_title: entry.projects?.title || 'Unknown',
      project_color: entry.projects?.color || 'blue'
    }))
  } catch (error) {
    console.error('Failed to get user entries:', error)
    return []
  }
}
