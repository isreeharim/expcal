import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserEntries } from '@/lib/actions/dashboard'
import { EmptyState, RecentActivity } from '@/components/finance/wealth-components'
import { ReceiptText } from 'lucide-react'

export default async function TransactionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const entries = await getUserEntries(user.id, 100)
  return <div className="wealth-page"><header className="page-kicker"><div><p>Transactions</p><h1>Complete financial activity.</h1><span>Scan income, expenses, receipts, and notes without opening every account.</span></div></header>{entries.length === 0 ? <EmptyState icon={ReceiptText} title="No transactions yet" description="Transactions appear here after you record income or expenses in a financial source." cta="Choose a source" href="/money" /> : <RecentActivity entries={entries} />}</div>
}
