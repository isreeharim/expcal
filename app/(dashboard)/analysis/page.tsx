import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getProjects, getUserDashboardStats } from '@/lib/actions/projects'
import { StatCard } from '@/components/dashboard/stat-card'
import { DashboardChart } from '@/components/dashboard/dashboard-chart'
import { BarChart2, TrendingUp, PieChart } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Financial Analysis | ExpCal',
  description: 'Visual analytics and financial breakdowns across all your projects.',
}

export default async function AnalysisPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [projects, stats] = await Promise.all([
    getProjects(user.id),
    getUserDashboardStats(user.id),
  ])

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
              <BarChart2 className="w-5 h-5 text-white" />
            </div>
            Financial <span className="gradient-text">Analysis</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Detailed performance charts, revenue trends, and spending breakdowns.
          </p>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 stagger-children">
        <StatCard type="hours" value={stats.total_hours} label="Total Hours" subLabel="Logged work time" />
        <StatCard type="income" value={stats.total_income} label="Total Revenue" subLabel="Cumulative earnings" />
        <StatCard type="expense" value={stats.total_expenses} label="Total Spending" subLabel="Cumulative expenses" />
        <StatCard type="cash" value={stats.net_cash} label="Net Cash Flow" subLabel="Total profit/loss" />
      </div>

      {/* Main Income vs Expense Trend Chart */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" /> Revenue & Expense Trends
          </h2>
          <span className="text-xs text-muted-foreground bg-muted/40 px-3 py-1 rounded-full border border-border">
            Last 30 Days
          </span>
        </div>
        <DashboardChart userId={user.id} />
      </div>

      {/* Project Performance Distribution */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <PieChart className="w-5 h-5 text-accent" /> Project Distribution
        </h2>

        {projects.length === 0 ? (
          <div className="glass-card p-8 text-center text-muted-foreground text-sm">
            No projects available to analyze yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div key={project.id} className="glass-card p-5 space-y-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ background: project.color || '#6366f1' }} />
                  <span className="font-semibold text-foreground truncate min-w-0">{project.title}</span>
                </div>
                {project.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{project.description}</p>
                )}
                <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                  <span>Created {new Date(project.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
