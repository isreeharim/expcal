export type UserRole = 'admin' | 'user'

export interface Profile {
  id: string
  full_name: string | null
  role: UserRole
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  user_id: string
  title: string
  description: string | null
  color: string
  created_at: string
  updated_at: string
}

export interface ExpenseCategory {
  category: string
  amount: number
  note?: string
}

export interface Entry {
  id: string
  project_id: string
  user_id: string
  date: string
  start_time: string | null
  end_time: string | null
  income: number
  expenses: ExpenseCategory[]
  photo_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface ProjectStats {
  project_id: string
  user_id: string
  title: string
  color: string
  entry_count: number
  total_income: number
  total_expenses: number
  net_cash: number
  total_hours: number
}

export interface DashboardStats {
  total_hours: number
  total_income: number
  total_expenses: number
  net_cash: number
}

export const EXPENSE_CATEGORIES = [
  'Food',
  'Water',
  'Transport',
  'Accommodation',
  'Equipment',
  'Entertainment',
  'Medical',
  'Shopping',
  'Utilities',
  'Other',
] as const

export type ExpenseCategoryType = typeof EXPENSE_CATEGORIES[number]
