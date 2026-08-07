import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getProjects, getUserDashboardStats } from '@/lib/actions/projects'
import { StatCard } from '@/components/dashboard/stat-card'
import { CreateProjectDialog } from '@/components/dashboard/create-project-dialog'
import { ProjectCard } from '@/components/dashboard/project-card'
import { DashboardChart } from '@/components/dashboard/dashboard-chart'
import { FolderOpen } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [projects, stats] = await Promise.all([
    getProjects(),
    getUserDashboardStats(user.id),
  ])

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .maybeSingle()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            {greeting}, <span className="gradient-text">{profile?.full_name?.split(' ')[0] || 'there'}</span> 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s your financial overview across all projects
          </p>
        </div>
        <CreateProjectDialog />
      </div>

      {/* Stats Section — Compact 2x2 Grid on Mobile, 4 Cols on Desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-6 sm:mb-8 stagger-children">
        <StatCard type="hours" value={stats.total_hours} label="Total Hours" subLabel="Across all projects" />
        <StatCard type="income" value={stats.total_income} label="Total Income" subLabel="All time earnings" />
        <StatCard type="expense" value={stats.total_expenses} label="Total Expenses" subLabel="All time spending" />
        <StatCard type="cash" value={stats.net_cash} label="Net Cash" subLabel="Income minus expenses" />
      </div>

      {/* Chart */}
      {projects.length > 0 && (
        <div className="mb-8">
          <DashboardChart userId={user.id} />
        </div>
      )}

      {/* Projects */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-foreground">Your Projects</h2>
          <span className="text-sm text-muted-foreground">{projects.length} project{projects.length !== 1 ? 's' : ''}</span>
        </div>

        {projects.length === 0 ? (
          <div className="glass-card p-12 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--gradient-primary)' }}>
              <FolderOpen className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No projects yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Create your first project to start tracking time, income and expenses.
            </p>
            <CreateProjectDialog />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 stagger-children">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
