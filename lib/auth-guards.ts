import { createClient } from '@/lib/supabase/server'
import { User } from '@supabase/supabase-js'

export interface AuthContext {
  user: User
  role: 'admin' | 'user'
  isAdmin: boolean
}

/**
 * Ensures the request is made by an authenticated user.
 * Throws an Error('Unauthorized') if not logged in.
 */
export async function requireUser(): Promise<AuthContext> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error('Unauthorized: Authentication required')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  const role = (profile?.role as 'admin' | 'user') || 'user'
  return {
    user,
    role,
    isAdmin: role === 'admin',
  }
}

/**
 * Ensures the request is made by an authenticated administrator.
 * Throws an Error if not logged in or not an admin.
 */
export async function requireAdmin(): Promise<AuthContext> {
  const auth = await requireUser()
  if (!auth.isAdmin) {
    throw new Error('Forbidden: Administrator privileges required')
  }
  return auth
}

/**
 * Ensures the caller is either the owner of the given project or an admin.
 */
export async function requireProjectAccess(projectId: string): Promise<{ auth: AuthContext; project: { id: string; user_id: string } }> {
  const auth = await requireUser()
  const supabase = await createClient()

  const { data: project, error } = await supabase
    .from('projects')
    .select('id, user_id')
    .eq('id', projectId)
    .maybeSingle()

  if (error || !project) {
    throw new Error('Project not found')
  }

  if (project.user_id !== auth.user.id && !auth.isAdmin) {
    throw new Error('Forbidden: Access denied to this project')
  }

  return { auth, project }
}
