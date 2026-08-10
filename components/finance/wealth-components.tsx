import Link from 'next/link'
import { Calculator, Plus, ReceiptText, Target, WalletCards } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate, totalExpenses } from '@/lib/utils'
import { Project } from '@/lib/types'

type EntryLike = { id: string; project_id: string; project_title: string; project_color: string; date: string; income: number; expenses: { amount: number; category: string; note?: string }[]; notes: string | null }

export function FinancialHero({ balance, income, expenses }: { balance: number; income: number; expenses: number }) {
  const savingsRate = income > 0 ? Math.round(((income - expenses) / income) * 100) : 0
  return (
    <section className="wealth-hero" aria-labelledby="total-balance-title">
      <div>
        <p id="total-balance-title" className="metric-label">Total Balance</p>
        <p className="wealth-balance tabular-nums">{formatCurrency(balance)}</p>
        <p className={balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
          {balance >= 0 ? '+' : '-'}{Math.abs(savingsRate)}% savings position this month
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:min-w-80">
        <MiniMetric label="Income" value={income} tone="positive" />
        <MiniMetric label="Expenses" value={expenses} tone="negative" />
        <MiniMetric label="Savings" value={income - expenses} tone={income - expenses >= 0 ? 'positive' : 'negative'} />
      </div>
    </section>
  )
}

export function MiniMetric({ label, value, tone = 'neutral' }: { label: string; value: number; tone?: 'positive' | 'negative' | 'neutral' }) {
  return <div className="finance-tile"><p className="metric-label">{label}</p><p className={tone === 'positive' ? 'metric-value text-emerald-400' : tone === 'negative' ? 'metric-value text-rose-400' : 'metric-value'}>{formatCurrency(value)}</p></div>
}

export function AccountBreakdown({ projects }: { projects: Project[] }) {
  const labels = ['Bank', 'Cash', 'Savings', 'Other']
  return (
    <div className="finance-panel">
      <div className="panel-header"><h2>Where your money is</h2><Link href="/money">Manage</Link></div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {labels.map((label, index) => <div className="account-row" key={label}><WalletCards className="h-4 w-4 text-primary" /><div><p>{label}</p><span>{projects[index]?.title || 'Not connected'}</span></div></div>)}
      </div>
    </div>
  )
}

export function RecentActivity({ entries }: { entries: EntryLike[] }) {
  return <div className="finance-panel"><div className="panel-header"><h2>Recent activity</h2><Link href="/transactions">View all</Link></div>{entries.length === 0 ? <EmptyState icon={ReceiptText} title="No transactions yet" description="Create an account/project and record your first income or expense to start building your financial timeline." cta="Add activity" href="/money" /> : <div className="divide-y divide-border/60">{entries.map((entry) => { const expense = totalExpenses(entry.expenses); const amount = entry.income > 0 ? entry.income : expense; const positive = entry.income > 0; return <Link className="transaction-row" href={`/project/${entry.project_id}`} key={entry.id}><span className="h-2.5 w-2.5 rounded-full" style={{ background: entry.project_color || '#6366f1' }} /><div className="min-w-0 flex-1"><p>{entry.notes || entry.project_title}</p><span>{formatDate(entry.date)} · {entry.project_title}</span></div><strong className={positive ? 'text-emerald-400' : 'text-rose-400'}>{positive ? '+' : '-'}{formatCurrency(amount)}</strong></Link> })}</div>}</div>
}

export function InsightStrip({ income, expenses }: { income: number; expenses: number }) {
  const saved = income - expenses
  return <div className="insight-strip"><Target className="h-5 w-5 text-amber-300" /><p>{saved >= 0 ? `You saved ${formatCurrency(saved)} across your current financial records.` : `You are ${formatCurrency(Math.abs(saved))} over your income records. Review expenses to regain control.`}</p><Link href="/analysis">Review trends</Link></div>
}

export function EmptyState({ icon: Icon, title, description, cta, href }: { icon: React.ElementType; title: string; description: string; cta: string; href: string }) {
  return <div className="empty-state"><Icon className="h-7 w-7 text-primary" /><h3>{title}</h3><p>{description}</p><Link href={href} className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">{cta}</Link></div>
}

export function CalculatorPanel() {
  return <div className="finance-panel"><div className="panel-header"><h2>ExpCal calculator</h2><span>Quick convert</span></div><div className="rounded-2xl border border-border/70 bg-muted/25 p-4"><div className="mb-3 text-right text-3xl font-bold tabular-nums">₹2,470</div><p className="text-xs text-muted-foreground">₹850 + ₹420 + ₹1,200</p><div className="mt-4 grid grid-cols-2 gap-2"><Button className="rounded-xl"><Plus className="h-4 w-4" /> Save as Expense</Button><Button variant="outline" className="rounded-xl"><Calculator className="h-4 w-4" /> Open Calculator</Button></div></div></div>
}
