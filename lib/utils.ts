import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO, differenceInMinutes } from 'date-fns'
import { ExpenseCategory } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'MMM dd, yyyy')
  } catch {
    return dateStr
  }
}

export function formatTime(timeStr: string | null): string {
  if (!timeStr) return '—'
  try {
    const [h, m] = timeStr.split(':')
    const date = new Date()
    date.setHours(parseInt(h), parseInt(m))
    return format(date, 'hh:mm a')
  } catch {
    return timeStr
  }
}

export function calculateHours(startTime: string | null, endTime: string | null): number {
  if (!startTime || !endTime) return 0
  try {
    const start = new Date(`1970-01-01T${startTime}`)
    const end = new Date(`1970-01-01T${endTime}`)
    const mins = differenceInMinutes(end, start)
    return Math.max(0, mins / 60)
  } catch {
    return 0
  }
}

export function formatHours(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export function totalExpenses(expenses: ExpenseCategory[]): number {
  return expenses.reduce((sum, e) => sum + (e.amount || 0), 0)
}

export function getInitials(name: string | null): string {
  if (!name) return 'U'
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function generateProjectColor(): string {
  const colors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
    '#f97316', '#eab308', '#22c55e', '#14b8a6',
    '#06b6d4', '#3b82f6',
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}
