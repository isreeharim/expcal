'use server'

import { createClient } from '@/lib/supabase/server'
import { ExpenseCategory, ProjectStats } from '@/lib/types'
import { subMonths, format, startOfMonth, endOfMonth } from 'date-fns'

export async function getCategoryBreakdown(userId: string) {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('entries')
      .select('expenses')
      .eq('user_id', userId)

    if (error || !data) {
      console.error('Error fetching category breakdown:', error)
      return []
    }

    const categoryTotals = new Map<string, number>()
    let grandTotal = 0

    for (const entry of data) {
      if (Array.isArray(entry.expenses)) {
        for (const exp of (entry.expenses as ExpenseCategory[])) {
          const amount = Number(exp.amount || 0)
          if (amount > 0) {
            const current = categoryTotals.get(exp.category) || 0
            categoryTotals.set(exp.category, current + amount)
            grandTotal += amount
          }
        }
      }
    }

    if (grandTotal === 0) return []

    const breakdown = Array.from(categoryTotals.entries()).map(([category, total]) => ({
      category,
      total,
      percentage: (total / grandTotal) * 100
    }))

    // Sort by total descending
    return breakdown.sort((a, b) => b.total - a.total)
  } catch (error) {
    console.error('Failed to get category breakdown:', error)
    return []
  }
}

export async function getMonthlyTrends(userId: string, months: number = 6) {
  try {
    const supabase = await createClient()
    
    // Generate array of last N months
    const monthRange = Array.from({ length: months }, (_, i) => {
      const d = subMonths(new Date(), months - 1 - i)
      return {
        key: format(d, 'yyyy-MM'),
        label: format(d, 'MMM yyyy')
      }
    })
    
    const startDate = format(startOfMonth(subMonths(new Date(), months - 1)), 'yyyy-MM-dd')
    const endDate = format(endOfMonth(new Date()), 'yyyy-MM-dd')
    
    const { data, error } = await supabase
      .from('entries')
      .select('date, income, expenses')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)

    if (error) {
      console.error('Error fetching monthly trends:', error)
      return []
    }

    const map = new Map<string, { income: number; expenses: number }>()
    monthRange.forEach(m => {
      map.set(m.key, { income: 0, expenses: 0 })
    })

    if (data) {
      for (const entry of data) {
        const monthKey = entry.date.substring(0, 7) // yyyy-MM
        if (map.has(monthKey)) {
          const current = map.get(monthKey)!
          const income = current.income + Number(entry.income || 0)
          
          let totalExpenses = 0
          if (Array.isArray(entry.expenses)) {
            totalExpenses = (entry.expenses as ExpenseCategory[]).reduce((sum, exp) => sum + Number(exp.amount || 0), 0)
          }
          
          map.set(monthKey, {
            income,
            expenses: current.expenses + totalExpenses
          })
        }
      }
    }

    return monthRange.map(m => {
      const totals = map.get(m.key)!
      return {
        month: m.key,
        label: m.label,
        income: totals.income,
        expenses: totals.expenses,
        net: totals.income - totals.expenses
      }
    })
  } catch (error) {
    console.error('Failed to get monthly trends:', error)
    return []
  }
}

export async function getProjectComparison(userId: string) {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('project_stats')
      .select('*')
      .eq('user_id', userId)

    if (error || !data) {
      console.error('Error fetching project comparison:', error)
      return []
    }

    const results = (data as ProjectStats[]).map((stat) => ({
      title: stat.title,
      color: stat.color,
      income: Number(stat.total_income || 0),
      expenses: Number(stat.total_expenses || 0),
      net: Number(stat.net_cash || 0)
    }))

    // Sort by net descending
    return results.sort((a, b) => b.net - a.net)
  } catch (error) {
    console.error('Failed to get project comparison:', error)
    return []
  }
}
