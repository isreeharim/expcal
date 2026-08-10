'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { generateProjectColor } from '@/lib/utils'

export async function getProjects(userId?: string, limit: number = 100) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  let targetUserId = user.id

  // If requesting another user's projects, verify caller is an admin
  if (userId && userId !== user.id) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
    if (profile?.role === 'admin') {
      targetUserId = userId
    }
  }

  const { data, error } = await supabase
    .from('projects')
    .select('id, user_id, title, description, color, created_at, updated_at')
    .eq('user_id', targetUserId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data ?? []
}

export async function getAllProjects(limit: number = 200) {
  // Admin only
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  if (profile?.role !== 'admin') {
    throw new Error('Forbidden: Administrator privileges required')
  }

  const { data, error } = await supabase
    .from('projects')
    .select('id, title, description, color, created_at, user_id, profiles(full_name, role)')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data ?? []
}

export async function getProject(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('projects')
    .select('id, user_id, title, description, color, created_at, updated_at')
    .eq('id', id)
    .maybeSingle()
  if (error || !data) return null

  // Ensure caller is owner or admin
  if (data.user_id !== user.id) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
    if (profile?.role !== 'admin') {
      return null
    }
  }

  return data
}

export async function getProjectStats(projectId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('project_stats')
    .select('project_id, user_id, title, color, entry_count, total_income, total_expenses, net_cash, total_hours')
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
  const targetUserId = (formData.get('target_user_id') as string) || user.id

  if (!title?.trim()) throw new Error('Project title is required')

  // If assigning to another user, verify admin status
  let effectiveUserId = user.id
  if (targetUserId !== user.id) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
    if (profile?.role === 'admin') {
      effectiveUserId = targetUserId
    }
  }

  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: effectiveUserId,
      title: title.trim(),
      description: description?.trim() || null,
      color: generateProjectColor(),
    })
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard')
  revalidatePath('/admin/projects')
  revalidatePath(`/admin/users/${effectiveUserId}`)
  return data
}

export async function updateProject(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const title = formData.get('title') as string
  const description = formData.get('description') as string

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  const isAdmin = profile?.role === 'admin'

  let query = supabase
    .from('projects')
    .update({ title: title.trim(), description: description?.trim() || null, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (!isAdmin) {
    query = query.eq('user_id', user.id)
  }

  const { error } = await query
  if (error) throw error

  revalidatePath('/dashboard')
  revalidatePath('/projects')
  revalidatePath('/admin/projects')
  revalidatePath(`/project/${id}`)
}

export async function deleteProject(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  const isAdmin = profile?.role === 'admin'

  let query = supabase
    .from('projects')
    .delete()
    .eq('id', id)

  if (!isAdmin) {
    query = query.eq('user_id', user.id)
  }

  const { error } = await query
  if (error) throw error

  revalidatePath('/dashboard')
  revalidatePath('/projects')
  revalidatePath('/admin/projects')
}
