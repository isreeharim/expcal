'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { ExpenseCategory } from '@/lib/types'

export async function getEntries(projectId: string, limit: number = 100) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('entries')
    .select('id, project_id, user_id, date, start_time, end_time, income, expenses, photo_url, notes, created_at, updated_at')
    .eq('project_id', projectId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data ?? []
}

export async function getAllEntries(limit: number = 200) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('entries')
    .select('id, project_id, user_id, date, start_time, end_time, income, expenses, photo_url, notes, created_at, projects(title), profiles(full_name)')
    .order('date', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data ?? []
}

export async function createEntry(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const projectId = formData.get('project_id') as string
  const date = formData.get('date') as string
  const startTime = formData.get('start_time') as string
  const endTime = formData.get('end_time') as string
  const income = parseFloat(formData.get('income') as string) || 0
  const expensesJson = formData.get('expenses') as string
  const notes = formData.get('notes') as string
  const photoUrl = formData.get('photo_url') as string

  let expenses: ExpenseCategory[] = []
  try { expenses = JSON.parse(expensesJson) } catch { expenses = [] }

  // Verify project exists
  const { data: project } = await supabase
    .from('projects')
    .select('id, user_id')
    .eq('id', projectId)
    .single()

  if (!project) throw new Error('Project not found or unauthorized')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  const isAdmin = profile?.role === 'admin'

  // If user is neither the owner nor admin, deny
  if (project.user_id !== user.id && !isAdmin) {
    throw new Error('Unauthorized to add entries to this project')
  }

  const { data, error } = await supabase
    .from('entries')
    .insert({
      project_id: projectId,
      user_id: project.user_id, // ensure entry belongs to project owner
      date,
      start_time: startTime || null,
      end_time: endTime || null,
      income,
      expenses,
      notes: notes || null,
      photo_url: photoUrl || null,
    })
    .select('id, project_id, user_id, date, start_time, end_time, income, expenses, photo_url, notes, created_at')
    .single()

  if (error) throw error
  revalidatePath(`/project/${projectId}`)
  revalidatePath('/dashboard')
  revalidatePath('/admin')
  return data
}

export async function updateEntry(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const date = formData.get('date') as string
  const startTime = formData.get('start_time') as string
  const endTime = formData.get('end_time') as string
  const income = parseFloat(formData.get('income') as string) || 0
  const expensesJson = formData.get('expenses') as string
  const notes = formData.get('notes') as string
  const photoUrl = formData.get('photo_url') as string
  const projectId = formData.get('project_id') as string

  let expenses: ExpenseCategory[] = []
  try { expenses = JSON.parse(expensesJson) } catch { expenses = [] }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  const isAdmin = profile?.role === 'admin'

  let query = supabase
    .from('entries')
    .update({
      date,
      start_time: startTime || null,
      end_time: endTime || null,
      income,
      expenses,
      notes: notes || null,
      photo_url: photoUrl || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (!isAdmin) {
    query = query.eq('user_id', user.id)
  }

  const { error } = await query
  if (error) throw error

  revalidatePath(`/project/${projectId}`)
  revalidatePath('/dashboard')
  revalidatePath('/admin')
}

export async function deleteEntry(id: string, projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  const isAdmin = profile?.role === 'admin'

  let query = supabase
    .from('entries')
    .delete()
    .eq('id', id)

  if (!isAdmin) {
    query = query.eq('user_id', user.id)
  }

  const { error } = await query
  if (error) throw error

  revalidatePath(`/project/${projectId}`)
  revalidatePath('/dashboard')
  revalidatePath('/admin')
}

export async function uploadPhoto(file: File, userId: string): Promise<string> {
  const supabase = await createClient()
  const ext = file.name.split('.').pop()
  const path = `${userId}/${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from('entry-photos')
    .upload(path, file, { upsert: false })

  if (error) throw error

  const { data } = supabase.storage
    .from('entry-photos')
    .getPublicUrl(path)

  return data.publicUrl
}
