import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getProjects, getUserDashboardStats } from '@/lib/actions/projects'
import { StatCard } from '@/components/dashboard/stat-card'
import { CreateProjectDialog } from '@/components/dashboard/create-project-dialog'
import { ProjectSearchList } from '@/components/project/project-search-list'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [projects, stats, { data: profile }] = await Promise.all([
    getProjects(user.id),
    getUserDashboardStats(user.id),
    supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle(),
  ])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            {greeting}, <span className="gradient-text">{profile?.full_name?.split(' ')[0] || 'there'}</span> 👋
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Here&apos;s your financial overview across all projects
          </p>
        </div>
        <CreateProjectDialog />
      </div>

      {/* Stats Section — Compact 2x2 Grid on Mobile, 4 Cols on Desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 stagger-children">
        <StatCard type="hours" value={stats.total_hours} label="Total Hours" subLabel="Across all projects" />
        <StatCard type="income" value={stats.total_income} label="Total Income" subLabel="All time earnings" />
        <StatCard type="expense" value={stats.total_expenses} label="Total Expenses" subLabel="All time spending" />
        <StatCard type="cash" value={stats.net_cash} label="Net Cash" subLabel="Income minus expenses" />
      </div>

      {/* Projects Section with Live Search */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground tracking-tight">Your Projects</h2>
          <span className="text-xs text-muted-foreground">{projects.length} total project{projects.length !== 1 ? 's' : ''}</span>
        </div>

        <ProjectSearchList
          projects={projects}
          emptyTitle="No projects yet"
          emptyDescription="Create your first project to start tracking time, income and expenses."
        />
      </div>
    </div>
  )
}
