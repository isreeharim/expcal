import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getProjects, getUserDashboardStats } from '@/lib/actions/projects'
import { getRecentEntries } from '@/lib/actions/dashboard'
import { StatCard } from '@/components/dashboard/stat-card'
import { CreateProjectDialog } from '@/components/dashboard/create-project-dialog'
import { ProjectSearchList } from '@/components/project/project-search-list'
import { DashboardChart } from '@/components/dashboard/dashboard-chart'
import { formatCurrency, formatDate, totalExpenses } from '@/lib/utils'
import { Wallet, ArrowUpRight, ArrowDownRight, Activity, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [projects, stats, recentEntries, { data: profile }] = await Promise.all([
    getProjects(user.id),
    getUserDashboardStats(user.id),
    getRecentEntries(user.id, 5),
    supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle(),
  ])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const isPositive = stats.net_cash > 0
  const isNegative = stats.net_cash < 0

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            {greeting}, <span className="gradient-text">{profile?.full_name?.split(' ')[0] || 'there'}</span> 👋
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Here&apos;s your financial overview across {projects.length} project{projects.length !== 1 ? 's' : ''}
          </p>
        </div>
        <CreateProjectDialog />
      </div>

      {/* Hero Net Cash Card */}
      <div className={`relative overflow-hidden rounded-2xl border p-5 sm:p-6 animate-slide-up ${
        isPositive
          ? 'border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.06] to-card/90'
          : isNegative
          ? 'border-rose-500/20 bg-gradient-to-br from-rose-500/[0.06] to-card/90'
          : 'border-border/60 bg-card/90'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                isPositive ? 'bg-emerald-500/15' : isNegative ? 'bg-rose-500/15' : 'bg-muted/60'
              }`}>
                <Wallet className={`w-4.5 h-4.5 ${
                  isPositive ? 'text-emerald-400' : isNegative ? 'text-rose-400' : 'text-muted-foreground'
                }`} />
              </div>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                isPositive
                  ? 'bg-emerald-500/12 text-emerald-400 border border-emerald-500/25'
                  : isNegative
                  ? 'bg-rose-500/12 text-rose-400 border border-rose-500/25'
                  : 'bg-muted/60 text-muted-foreground border border-border/50'
              }`}>
                {isPositive ? <><ArrowUpRight className="w-3 h-3" /> Net Profit</> :
                 isNegative ? <><ArrowDownRight className="w-3 h-3" /> Net Deficit</> :
                 'Balanced'}
              </span>
            </div>
            <p className="text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-widest mb-1">
              Net Cash Flow
            </p>
            <p className={`text-3xl sm:text-4xl stat-value tabular-nums ${
              isPositive ? 'text-emerald-400' : isNegative ? 'text-rose-400' : 'text-foreground'
            }`}>
              {formatCurrency(stats.net_cash)}
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Income minus expenses across all projects
            </p>
          </div>
          {/* Mini sparkline area — compact chart preview */}
          <div className="hidden sm:block w-48 h-20 opacity-70">
            <DashboardChart userId={user.id} compact />
          </div>
        </div>
      </div>

      {/* Compact Stat Row: Hours, Income, Expenses */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4 stagger-children">
        <StatCard type="hours" value={stats.total_hours} label="Hours" compact />
        <StatCard type="income" value={stats.total_income} label="Income" compact />
        <StatCard type="expense" value={stats.total_expenses} label="Expenses" compact />
      </div>

      {/* Recent Activity */}
      {recentEntries.length > 0 && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="section-header flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Recent Activity
            </h2>
            <Link
              href="/analysis"
              className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              View all <TrendingUp className="w-3 h-3" />
            </Link>
          </div>
          <div className="card-elevated p-1">
            <div className="divide-y divide-border/40">
              {recentEntries.map((entry) => {
                const entryExpenses = totalExpenses(entry.expenses || [])
                const hasIncome = entry.income > 0
                const hasExpense = entryExpenses > 0

                return (
                  <Link
                    key={entry.id}
                    href={`/project/${entry.project_id}`}
                    className="flex items-center gap-3 px-3.5 py-3 hover:bg-muted/30 rounded-lg transition-colors group"
                  >
                    {/* Project color dot */}
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: entry.project_color || '#6366f1' }}
                    />

                    {/* Entry details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                        {entry.project_title}
                      </p>
                      <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                        {formatDate(entry.date)}
                        {entry.notes && <span className="ml-1.5">· {entry.notes.slice(0, 40)}{entry.notes.length > 40 ? '…' : ''}</span>}
                      </p>
                    </div>

                    {/* Financial values */}
                    <div className="flex items-center gap-3 flex-shrink-0 tabular-nums text-xs font-semibold">
                      {hasIncome && (
                        <span className="text-emerald-400">+{formatCurrency(entry.income)}</span>
                      )}
                      {hasExpense && (
                        <span className="text-rose-400">-{formatCurrency(entryExpenses)}</span>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Projects Section with Live Search */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="section-header">Your Projects</h2>
          <span className="text-xs text-muted-foreground bg-muted/40 px-2.5 py-1 rounded-full border border-border/50 tabular-nums">
            {projects.length} total
          </span>
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
