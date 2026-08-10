import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getProjects, getUserDashboardStats } from '@/lib/actions/projects'
import { CreateProjectDialog } from '@/components/dashboard/create-project-dialog'
import { ProjectSearchList } from '@/components/project/project-search-list'
import { MiniMetric } from '@/components/finance/wealth-components'

export default async function MoneyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const [projects, stats] = await Promise.all([getProjects(user.id), getUserDashboardStats(user.id)])
  return <div className="wealth-page"><header className="page-kicker"><div><p>Money</p><h1>Accounts, balances, and financial sources.</h1><span>Existing projects are preserved as financial containers so entries, receipts, and calculations keep working.</span></div><CreateProjectDialog /></header><div className="grid gap-3 sm:grid-cols-3"><MiniMetric label="Total balance" value={stats.net_cash} /><MiniMetric label="Income" value={stats.total_income} tone="positive" /><MiniMetric label="Expenses" value={stats.total_expenses} tone="negative" /></div><section className="finance-panel"><div className="panel-header"><h2>Financial sources</h2><span>{projects.length} total</span></div><ProjectSearchList projects={projects} emptyTitle="No financial accounts yet" emptyDescription="Create your first account or financial source to understand where your money is stored." /></section></div>
}
