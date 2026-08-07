import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getProjects } from '@/lib/actions/projects'
import { ProjectCard } from '@/components/dashboard/project-card'
import { CreateProjectDialog } from '@/components/dashboard/create-project-dialog'
import { FolderOpen } from 'lucide-react'

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const projects = await getProjects()

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''} total</p>
        </div>
        <CreateProjectDialog />
      </div>

      {projects.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--gradient-primary)' }}>
            <FolderOpen className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No projects yet</h3>
          <p className="text-muted-foreground mb-6">Create your first project to get started.</p>
          <CreateProjectDialog />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 stagger-children">
          {projects.map(p => <ProjectCard key={p.id} project={p} />)}
        </div>
      )}
    </div>
  )
}
