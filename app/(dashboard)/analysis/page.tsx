import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getProjects, getUserDashboardStats } from '@/lib/actions/projects'
import { getCategoryBreakdown, getMonthlyTrends, getProjectComparison } from '@/lib/actions/analysis'
import { StatCard } from '@/components/dashboard/stat-card'
import { DashboardChart } from '@/components/dashboard/dashboard-chart'
import { CategoryChart } from '@/components/dashboard/category-chart'
import { BarChart2, TrendingUp, PieChart, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Metadata } from 'next'
import { formatCurrency, cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Financial Analysis | ExpCal',
  description: 'Visual analytics and financial breakdowns across all your projects.',
}

export default async function AnalysisPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [projects, stats, categoryBreakdown, monthlyTrends, projectComparison] = await Promise.all([
    getProjects(user.id),
    getUserDashboardStats(user.id),
    getCategoryBreakdown(user.id),
    getMonthlyTrends(user.id),
    getProjectComparison(user.id),
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
          <h2 className="section-header flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" /> Revenue & Expense Trends
          </h2>
          <span className="text-xs text-muted-foreground bg-muted/40 px-3 py-1 rounded-full border border-border">
            Recent Activity
          </span>
        </div>
        <DashboardChart userId={user.id} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Category Breakdown */}
        <div className="space-y-4">
          <h2 className="section-header flex items-center gap-2">
            <PieChart className="w-5 h-5 text-accent" /> Expense Categories
          </h2>
          <div className="card-elevated p-6 flex items-center justify-center min-h-[300px]">
            <CategoryChart data={categoryBreakdown} />
          </div>
        </div>

        {/* Monthly Trends Section */}
        <div className="space-y-4">
          <h2 className="section-header flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" /> Monthly Trends
          </h2>
          <div className="card-elevated overflow-hidden">
            <div className="grid grid-cols-4 gap-2 p-4 text-xs font-semibold text-muted-foreground bg-muted/20 border-b border-border/50">
              <div>Month</div>
              <div className="text-right">Income</div>
              <div className="text-right">Expense</div>
              <div className="text-right">Net</div>
            </div>
            <div className="divide-y divide-border/50">
              {monthlyTrends.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">No monthly data</div>
              ) : (
                monthlyTrends.map((trend) => (
                  <div key={trend.month} className="grid grid-cols-4 gap-2 p-4 text-sm items-center transition-colors hover:bg-muted/10">
                    <div className="font-medium text-foreground">{trend.label}</div>
                    <div className="text-right tabular-nums text-emerald-400">{formatCurrency(trend.income)}</div>
                    <div className="text-right tabular-nums text-rose-400">{formatCurrency(trend.expenses)}</div>
                    <div className={cn(
                      "text-right font-semibold tabular-nums flex items-center justify-end gap-1",
                      trend.net >= 0 ? "text-emerald-400" : "text-rose-400"
                    )}>
                      {trend.net >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {formatCurrency(Math.abs(trend.net))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Project Comparison Section */}
      <div className="space-y-4">
        <h2 className="section-header flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-primary" /> Project Comparison
        </h2>
        <div className="card-elevated overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 text-xs font-semibold text-muted-foreground bg-muted/20 border-b border-border/50">
            <div className="col-span-6 md:col-span-4">Project</div>
            <div className="hidden md:block col-span-3 text-right">Total Income</div>
            <div className="hidden md:block col-span-3 text-right">Total Expense</div>
            <div className="col-span-6 md:col-span-2 text-right">Net Profit</div>
          </div>
          <div className="divide-y divide-border/50">
            {projectComparison.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">No project comparison data</div>
            ) : (
              projectComparison.map((proj, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-4 p-4 text-sm items-center transition-colors hover:bg-muted/10">
                  <div className="col-span-6 md:col-span-4 flex items-center gap-3 min-w-0">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: proj.color || '#6366f1' }} />
                    <span className="font-medium text-foreground truncate">{proj.title}</span>
                  </div>
                  <div className="hidden md:block col-span-3 text-right tabular-nums text-muted-foreground">
                    {formatCurrency(proj.income)}
                  </div>
                  <div className="hidden md:block col-span-3 text-right tabular-nums text-muted-foreground">
                    {formatCurrency(proj.expenses)}
                  </div>
                  <div className={cn(
                    "col-span-6 md:col-span-2 text-right font-semibold tabular-nums",
                    proj.net >= 0 ? "text-emerald-400" : "text-rose-400"
                  )}>
                    {formatCurrency(proj.net)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Project Distribution Section - Simplified */}
      <div className="space-y-4">
        <h2 className="section-header flex items-center gap-2">
          <PieChart className="w-5 h-5 text-accent" /> Project Distribution
        </h2>

        {projects.length === 0 ? (
          <div className="card-elevated p-8 text-center text-muted-foreground text-sm">
            No projects available to analyze yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {projects.map((project) => (
              <div key={project.id} className="card-elevated p-4 flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ background: project.color || '#6366f1' }} />
                <span className="font-medium text-foreground truncate text-sm">{project.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
