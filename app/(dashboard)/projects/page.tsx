import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getProjects } from '@/lib/actions/projects'
import { CreateProjectDialog } from '@/components/dashboard/create-project-dialog'
import { ProjectSearchList } from '@/components/project/project-search-list'

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const projects = await getProjects(user.id)

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">Projects</h1>
          <p className="text-muted-foreground text-sm mt-1">{projects.length} total project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <CreateProjectDialog />
      </div>

      {/* Searchable and Filterable Projects Grid */}
      <ProjectSearchList projects={projects} />
    </div>
  )
}
