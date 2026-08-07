'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { ExpenseCategory } from '@/lib/types'

export async function getEntries(projectId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .eq('project_id', projectId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getAllEntries() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('entries')
    .select('*, projects(title), profiles(full_name)')
    .order('date', { ascending: false })
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

  const { data, error } = await supabase
    .from('entries')
    .insert({
      project_id: projectId,
      user_id: user.id,
      date,
      start_time: startTime || null,
      end_time: endTime || null,
      income,
      expenses,
      notes: notes || null,
      photo_url: photoUrl || null,
    })
    .select()
    .single()

  if (error) throw error
  revalidatePath(`/project/${projectId}`)
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

  const { error } = await supabase
    .from('entries')
    .update({
      date,
      start_time: startTime || null,
      end_time: endTime || null,
      income,
      expenses,
      notes: notes || null,
      photo_url: photoUrl || null,
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath(`/project/${projectId}`)
}

export async function deleteEntry(id: string, projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('entries')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath(`/project/${projectId}`)
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
