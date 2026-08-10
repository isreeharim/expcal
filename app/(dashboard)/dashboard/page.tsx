import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getProjects, getUserDashboardStats } from '@/lib/actions/projects'
import { getRecentEntries } from '@/lib/actions/dashboard'
import { DashboardChart } from '@/components/dashboard/dashboard-chart'
import { AccountBreakdown, CalculatorPanel, FinancialHero, InsightStrip, RecentActivity } from '@/components/finance/wealth-components'
import { CreateProjectDialog } from '@/components/dashboard/create-project-dialog'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [projects, stats, recentEntries, { data: profile }] = await Promise.all([
    getProjects(user.id),
    getUserDashboardStats(user.id),
    getRecentEntries(user.id, 6),
    supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle(),
  ])

  return (
    <div className="wealth-page">
      <header className="page-kicker">
        <div>
          <p>Modern Wealth OS</p>
          <h1>Good to see you, {profile?.full_name?.split(' ')[0] || 'there'}.</h1>
          <span>Open ExpCal and understand your money position in seconds.</span>
        </div>
        <CreateProjectDialog />
      </header>

      <FinancialHero balance={stats.net_cash} income={stats.total_income} expenses={stats.total_expenses} />
      <AccountBreakdown projects={projects} />
      <div className="grid gap-5 xl:grid-cols-[1.5fr_0.8fr]">
        <DashboardChart userId={user.id} />
        <CalculatorPanel />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <RecentActivity entries={recentEntries} />
        <InsightStrip income={stats.total_income} expenses={stats.total_expenses} />
      </div>
    </div>
  )
}
