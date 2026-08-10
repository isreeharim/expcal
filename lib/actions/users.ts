'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth-guards'

export async function updateUserRole(userId: string, newRole: 'admin' | 'user') {
  const { user } = await requireAdmin()
  const supabase = await createClient()

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
