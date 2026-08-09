import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAllProjects } from '@/lib/actions/projects'
import { getAllEntries } from '@/lib/actions/entries'
import { FolderOpen, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { AdminProjectsTable } from '@/components/admin/admin-projects-table'

export default async function AdminProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: myProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (myProfile?.role !== 'admin') redirect('/dashboard')

  const [projects, entries] = await Promise.all([
    getAllProjects(),
    getAllEntries(),
  ])

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--gradient-income)' }}>
            <FolderOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">All Projects</h1>
            <p className="text-muted-foreground text-sm mt-0.5">{projects.length} project{projects.length !== 1 ? 's' : ''} platform-wide</p>
          </div>
        </div>
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-1.5 -my-1.5 font-medium">
          <ArrowLeft className="w-4 h-4" /> Admin Overview
        </Link>
      </div>

      {/* Searchable Projects Table */}
      <AdminProjectsTable projects={projects} entries={entries} />
    </div>
  )
}
