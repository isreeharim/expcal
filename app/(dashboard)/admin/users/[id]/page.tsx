import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getProjects, getProjectStats, getUserDashboardStats } from '@/lib/actions/projects'
import { StatCard } from '@/components/dashboard/stat-card'
import { AdminUserProjects } from '@/components/admin/admin-user-projects'
import { UserRoleDialog } from '@/components/admin/user-role-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { getInitials, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft, Calendar, FolderKanban } from 'lucide-react'
import { Metadata } from 'next'

type PageProps = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', id)
    .maybeSingle()

  return {
    title: `${profile?.full_name || 'User'} Projects | ExpCal Admin`,
  }
}

export default async function AdminUserDetailsPage({ params }: PageProps) {
  const { id: targetUserId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verify Admin permissions
  const { data: myProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (myProfile?.role !== 'admin') redirect('/dashboard')

  // Fetch target user profile
  const { data: targetProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', targetUserId)
    .maybeSingle()

  if (!targetProfile) notFound()

  // Fetch user projects & aggregated stats in parallel
  const [projects, overallStats] = await Promise.all([
    getProjects(targetUserId),
    getUserDashboardStats(targetUserId),
  ])

  // Fetch individual project stats
  const statsList = await Promise.all(
    projects.map(p => getProjectStats(p.id))
  )
  const statsMap: Record<string, typeof statsList[0]> = {}
  projects.forEach((p, index) => {
    statsMap[p.id] = statsList[index]
  })

  const userName = targetProfile.full_name || 'User'

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-fade-in">
      {/* Breadcrumb Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/admin" className="hover:text-foreground transition-colors">
            Admin
          </Link>
          <span>/</span>
          <Link href="/admin/users" className="hover:text-foreground transition-colors">
            Users
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium truncate">{userName}</span>
        </div>

        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Users List
        </Link>
      </div>

      {/* User Header Profile Card */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 sm:w-20 sm:h-20 ring-4 ring-primary/20 shadow-xl flex-shrink-0">
              <AvatarImage src={targetProfile.avatar_url ?? undefined} />
              <AvatarFallback
                className="text-xl sm:text-2xl font-bold"
                style={{ background: 'var(--gradient-primary)', color: 'white' }}
              >
                {getInitials(targetProfile.full_name)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">{userName}</h1>
                <Badge
                  variant={targetProfile.role === 'admin' ? 'default' : 'secondary'}
                  className="capitalize text-xs font-semibold"
                  style={targetProfile.role === 'admin' ? { background: 'var(--gradient-primary)', color: 'white' } : {}}
                >
                  {targetProfile.role}
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground font-mono truncate">
                ID: {targetProfile.id}
              </p>

              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  Joined {formatDate(targetProfile.created_at)}
                </span>
                <span className="flex items-center gap-1.5">
                  <FolderKanban className="w-3.5 h-3.5 text-cyan-400" />
                  {projects.length} Project{projects.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Role Change Action Button */}
          <div className="flex items-center gap-3">
            <UserRoleDialog
              userId={targetUserId}
              userName={userName}
              currentRole={targetProfile.role as 'admin' | 'user'}
              triggerVariant="button"
            />
          </div>
        </div>
      </div>

      {/* User Financial Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 stagger-children">
        <StatCard type="hours" value={overallStats.total_hours} label="Total Hours" subLabel="Logged by user" />
        <StatCard type="income" value={overallStats.total_income} label="Total Revenue" subLabel="Across all projects" />
        <StatCard type="expense" value={overallStats.total_expenses} label="Total Expenses" subLabel="Across all projects" />
        <StatCard type="cash" value={overallStats.net_cash} label="Net Cash Flow" subLabel="Net earnings" />
      </div>

      {/* Projects List with Search, Add, Edit, Delete */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">
              {userName}&apos;s Projects ({projects.length})
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Click any project to inspect all entries, receipts, or edit data.
            </p>
          </div>
        </div>

        <AdminUserProjects
          userId={targetUserId}
          userName={userName}
          projects={projects}
          statsMap={statsMap}
        />
      </div>
    </div>
  )
}
