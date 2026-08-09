'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function updateUserRole(userId: string, newRole: 'admin' | 'user') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Verify caller is admin
  const { data: callerProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (callerProfile?.role !== 'admin') {
    throw new Error('Only administrators can change user roles')
  }

  // Prevent admin from demoting themselves if they are the only admin
  if (user.id === userId && newRole !== 'admin') {
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'admin')

    if (count && count <= 1) {
      throw new Error('Cannot demote yourself when you are the sole administrator')
    }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      role: newRole,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  if (error) throw error

  revalidatePath('/admin')
  revalidatePath('/admin/users')
  revalidatePath(`/admin/users/${userId}`)
  revalidatePath('/dashboard')
  return { success: true }
}
