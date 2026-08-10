'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { ExpenseCategory } from '@/lib/types'

export async function getEntries(projectId: string, limit: number = 100) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Verify project ownership or admin status
  const { data: project } = await supabase
    .from('projects')
    .select('id, user_id')
    .eq('id', projectId)
    .maybeSingle()

  if (!project) return []

  if (project.user_id !== user.id) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
    if (profile?.role !== 'admin') {
      return []
    }
  }

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
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  if (profile?.role !== 'admin') {
    throw new Error('Forbidden: Administrator privileges required')
  }

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

  // Security guard: Fetch actual entry from database to verify ownership and trusted project_id
  const { data: existingEntry, error: fetchErr } = await supabase
    .from('entries')
    .select('id, project_id, user_id')
    .eq('id', id)
    .maybeSingle()

  if (fetchErr || !existingEntry) {
    throw new Error('Entry not found')
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  const isAdmin = profile?.role === 'admin'

  if (existingEntry.user_id !== user.id && !isAdmin) {
    throw new Error('Forbidden: Cannot modify another user entry')
  }

  const date = formData.get('date') as string
  const startTime = formData.get('start_time') as string
  const endTime = formData.get('end_time') as string
  const income = parseFloat(formData.get('income') as string) || 0
  const expensesJson = formData.get('expenses') as string
  const notes = formData.get('notes') as string
  const photoUrl = formData.get('photo_url') as string

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
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) throw error

  // Revalidate using the TRUSTED project_id from the database record
  revalidatePath(`/project/${existingEntry.project_id}`)
  revalidatePath('/dashboard')
  revalidatePath('/admin')
}

export async function deleteEntry(id: string, _unusedProjectId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Security guard: Fetch actual entry from database to verify ownership and trusted project_id
  const { data: existingEntry, error: fetchErr } = await supabase
    .from('entries')
    .select('id, project_id, user_id')
    .eq('id', id)
    .maybeSingle()

  if (fetchErr || !existingEntry) {
    throw new Error('Entry not found')
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  const isAdmin = profile?.role === 'admin'

  if (existingEntry.user_id !== user.id && !isAdmin) {
    throw new Error('Forbidden: Cannot delete another user entry')
  }

  const { error } = await supabase
    .from('entries')
    .delete()
    .eq('id', id)

  if (error) throw error

  revalidatePath(`/project/${existingEntry.project_id}`)
  revalidatePath('/dashboard')
  revalidatePath('/admin')
}

function validateImageMagicBytes(buffer: Uint8Array): { isValid: boolean; detectedExt: string } {
  if (buffer.length < 4) return { isValid: false, detectedExt: '' }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return { isValid: true, detectedExt: 'jpg' }
  }

  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return { isValid: true, detectedExt: 'png' }
  }

  // GIF: 47 49 46 38 ('GIF8')
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) {
    return { isValid: true, detectedExt: 'gif' }
  }

  // WebP: RIFF (bytes 0-3) ... WEBP (bytes 8-11)
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
  ) {
    return { isValid: true, detectedExt: 'webp' }
  }

  return { isValid: false, detectedExt: '' }
}

export async function uploadPhoto(file: File, userId: string): Promise<string> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Security guard: User can only upload into their own folder unless they are admin
  if (user.id !== userId) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
    if (profile?.role !== 'admin') {
      throw new Error('Forbidden: Cannot upload photos for another user')
    }
  }

  // Security guard: Validate file size (max 5MB)
  const MAX_FILE_SIZE = 5 * 1024 * 1024
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size exceeds the 5MB limit')
  }

  // Security guard: Validate MIME type header
  const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Allowed formats: JPEG, PNG, WebP, GIF')
  }

  // Security guard: Validate actual binary content magic bytes (prevents disguised executables / HTML scripts)
  const arrayBuffer = await file.arrayBuffer()
  const headerBytes = new Uint8Array(arrayBuffer.slice(0, 16))
  const { isValid, detectedExt } = validateImageMagicBytes(headerBytes)
  if (!isValid) {
    throw new Error('Security Error: Uploaded file is not a valid image format')
  }

  // Security guard: Sanitize userId and generate safe random UUID filename (prevents path traversal)
  const safeUserId = userId.replace(/[^a-zA-Z0-9_-]/g, '')
  const safeExt = detectedExt || 'jpg'
  const randomFileName = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
  const path = `${safeUserId}/${randomFileName}.${safeExt}`

  const { error } = await supabase.storage
    .from('entry-photos')
    .upload(path, Buffer.from(arrayBuffer), {
      upsert: false,
      contentType: file.type || `image/${safeExt}`,
    })

  if (error) throw error

  const { data } = supabase.storage
    .from('entry-photos')
    .getPublicUrl(path)

  return data.publicUrl
}
