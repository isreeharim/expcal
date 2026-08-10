import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserDashboardStats } from '@/lib/actions/projects'
import { EmptyState } from '@/components/finance/wealth-components'
import { Target } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default async function GoalsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const stats = await getUserDashboardStats(user.id)
  const target = Math.max(50000, Math.ceil((stats.net_cash + 18000) / 10000) * 10000)
  const progress = Math.max(0, Math.min(100, Math.round((stats.net_cash / target) * 100)))
  return <div className="wealth-page"><header className="page-kicker"><div><p>Goals</p><h1>Savings targets and financial milestones.</h1><span>Motivating progress without gamification or clutter.</span></div></header>{stats.net_cash <= 0 ? <EmptyState icon={Target} title="No goals ready yet" description="Build a positive balance by recording income and expenses, then track milestones here." cta="Review money" href="/money" /> : <section className="finance-panel max-w-2xl"><div className="panel-header"><h2>Emergency reserve</h2><span>{progress}%</span></div><p className="text-3xl font-bold tabular-nums">{formatCurrency(stats.net_cash)} / {formatCurrency(target)}</p><div className="mt-5 h-3 rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full bg-emerald-400" style={{ width: `${progress}%` }} /></div><p className="mt-4 text-sm text-muted-foreground">{formatCurrency(Math.max(0, target - stats.net_cash))} remaining · expected completion updates as your balance grows.</p></section>}</div>
}
