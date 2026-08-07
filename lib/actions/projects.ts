'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { generateProjectColor } from '@/lib/utils'

export async function getProjects() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getAllProjects() {
  // Admin only
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*, profiles(full_name, role)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getProject(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) return null
  return data
}

export async function getProjectStats(projectId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('project_stats')
    .select('*')
    .eq('project_id', projectId)
    .maybeSingle()
  if (error) return null
  return data
}

export async function getUserDashboardStats(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('project_stats')
    .select('total_income, total_expenses, net_cash, total_hours')
    .eq('user_id', userId)
  if (error) return { total_hours: 0, total_income: 0, total_expenses: 0, net_cash: 0 }

  const stats = (data ?? []).reduce(
    (acc, row) => ({
      total_hours: acc.total_hours + Number(row.total_hours),
      total_income: acc.total_income + Number(row.total_income),
      total_expenses: acc.total_expenses + Number(row.total_expenses),
      net_cash: acc.net_cash + Number(row.net_cash),
    }),
    { total_hours: 0, total_income: 0, total_expenses: 0, net_cash: 0 }
  )
  return stats
}

export async function createProject(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const title = formData.get('title') as string
  const description = formData.get('description') as string

  if (!title?.trim()) throw new Error('Project title is required')

  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: user.id,
      title: title.trim(),
      description: description?.trim() || null,
      color: generateProjectColor(),
    })
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard')
  return data
}

export async function updateProject(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const title = formData.get('title') as string
  const description = formData.get('description') as string

  const { error } = await supabase
    .from('projects')
    .update({ title: title.trim(), description: description?.trim() || null })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath('/dashboard')
  revalidatePath(`/project/${id}`)
}

export async function deleteProject(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath('/dashboard')
}
