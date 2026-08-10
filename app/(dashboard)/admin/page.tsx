import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAllProjects } from '@/lib/actions/projects'
import { getAllEntries } from '@/lib/actions/entries'
import { StatCard } from '@/components/dashboard/stat-card'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getInitials, formatCurrency, formatDate, formatHours, calculateHours, totalExpenses } from '@/lib/utils'
import { Shield, Users, FolderOpen, Receipt, FileSpreadsheet } from 'lucide-react'
import Link from 'next/link'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verify admin
  const { data: myProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (myProfile?.role !== 'admin') redirect('/dashboard')

  const [
    { data: profiles },
    projects,
    entries,
  ] = await Promise.all([
    supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    getAllProjects(),
    getAllEntries(),
  ])

  const allProfiles = profiles ?? []

  // Precompute Maps to turn O(N^2) .filter() operations into O(1) lookups
  const projectsByUserId = new Map<string, typeof projects>()
  projects.forEach((proj) => {
    const list = projectsByUserId.get(proj.user_id) || []
    list.push(proj)
    projectsByUserId.set(proj.user_id, list)
  })

  const entriesCountByProjectId = new Map<string, number>()
  entries.forEach((e) => {
    entriesCountByProjectId.set(e.project_id, (entriesCountByProjectId.get(e.project_id) || 0) + 1)
  })

  // Compute global stats
  const totalIncome = entries.reduce((s, e) => s + Number(e.income || 0), 0)
  const totalExpense = entries.reduce((s, e) => s + totalExpenses(e.expenses || []), 0)
  const totalHours = entries.reduce((s, e) => s + calculateHours(e.start_time, e.end_time), 0)

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 animate-fade-in">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-primary/10 text-primary border border-primary/20">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">Admin Workspace</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Platform overview, database management, and system access</p>
          </div>
        </div>

        {/* Secondary Clean Backup Link */}
        <Link
          href="/admin/backup"
          className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-muted/60 hover:bg-muted text-foreground border border-border transition-colors shadow-sm"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" /> Google Sheets Backup
        </Link>
      </div>

      {/* Primary Financial Overview — 4 Cards with Net Cash Prominence */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 stagger-children">
        <StatCard type="hours" value={totalHours} label="Total Hours" subLabel="All users combined" />
        <StatCard type="income" value={totalIncome} label="Total Income" subLabel="Platform-wide" />
        <StatCard type="expense" value={totalExpense} label="Total Expenses" subLabel="Platform-wide" />
        <StatCard type="cash" value={totalIncome - totalExpense} label="Net Cash" subLabel="Platform-wide" />
      </div>

      {/* Quick counters */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        {[
          { icon: Users, label: 'Total Users', value: allProfiles.length },
          { icon: FolderOpen, label: 'Total Projects', value: projects.length },
          { icon: Receipt, label: 'Total Entries', value: entries.length },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-card border border-border/60 p-3.5 sm:p-4 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground flex-shrink-0">
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-lg sm:text-xl font-bold text-foreground font-mono">{value}</p>
              <p className="text-[11px] text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Data Tabs */}
      <Tabs defaultValue="users" className="animate-fade-in">
        <TabsList className="bg-muted/50 mb-6 w-full h-auto flex flex-wrap sm:flex-nowrap justify-start p-1 gap-1">
          <TabsTrigger value="users" className="gap-2 flex-1 sm:flex-initial">
            <Users className="w-3.5 h-3.5" /> Users ({allProfiles.length})
          </TabsTrigger>
          <TabsTrigger value="projects" className="gap-2 flex-1 sm:flex-initial">
            <FolderOpen className="w-3.5 h-3.5" /> Projects ({projects.length})
          </TabsTrigger>
          <TabsTrigger value="entries" className="gap-2 flex-1 sm:flex-initial">
            <Receipt className="w-3.5 h-3.5" /> Entries ({entries.length})
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users">
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <Table className="premium-table">
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">User</TableHead>
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">Role</TableHead>
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">Joined</TableHead>
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">Projects</TableHead>
                  <TableHead className="text-right text-muted-foreground text-xs uppercase tracking-wider">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allProfiles.map((p) => {
                  const userProjects = projectsByUserId.get(p.id) || []
                  return (
                    <TableRow key={p.id} className="border-border group hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <Link href={`/admin/users/${p.id}`} className="flex items-center gap-3">
                          <Avatar className="w-8 h-8 ring-2 ring-primary/20 flex-shrink-0 group-hover:scale-105 transition-transform">
                            <AvatarFallback style={{ background: 'var(--gradient-primary)', color: 'white', fontSize: '0.7rem' }}>
                              {getInitials(p.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                              {p.full_name || 'Unnamed'}
                            </p>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={p.role === 'admin' ? 'default' : 'secondary'}
                          className="capitalize text-xs"
                          style={p.role === 'admin' ? { background: 'var(--gradient-primary)', color: 'white' } : {}}
                        >
                          {p.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(p.created_at)}</TableCell>
                      <TableCell className="text-sm font-medium text-foreground">
                        <span className="px-2 py-0.5 rounded-md bg-muted/50 border border-border text-xs">
                          {userProjects.length}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/admin/users/${p.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                        >
                          View Projects →
                        </Link>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            </div>
          </div>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects">
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <Table className="premium-table">
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">Project</TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">Owner</TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">Created</TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">Entries</TableHead>
                    <TableHead className="text-right text-muted-foreground text-xs uppercase tracking-wider">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((proj) => {
                    const entryCount = entriesCountByProjectId.get(proj.id) || 0
                    const ownerName = (proj as { profiles?: { full_name?: string } }).profiles?.full_name || 'Unknown'
                    return (
                      <TableRow key={proj.id} className="border-border group hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <Link href={`/project/${proj.id}`} className="flex items-center gap-2">
                            <span className="color-dot" style={{ background: proj.color || '#6366f1' }} />
                            <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                              {proj.title}
                            </span>
                          </Link>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{ownerName}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{formatDate(proj.created_at)}</TableCell>
                        <TableCell className="text-sm font-medium text-foreground font-mono">{entryCount}</TableCell>
                        <TableCell className="text-right">
                          <Link
                            href={`/project/${proj.id}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                          >
                            Open Project →
                          </Link>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        {/* Entries Tab */}
        <TabsContent value="entries">
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <Table className="premium-table">
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">Date</TableHead>
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">User</TableHead>
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">Project</TableHead>
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">Hours</TableHead>
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">Income</TableHead>
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">Expenses</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.slice(0, 50).map((e) => {
                  const hours = calculateHours(e.start_time, e.end_time)
                  const expTotal = totalExpenses(e.expenses || [])
                  const userName = (e as { profiles?: { full_name?: string } }).profiles?.full_name || 'Unknown'
                  const projectName = (e as { projects?: { title?: string } }).projects?.title || 'Unknown'
                  return (
                    <TableRow key={e.id} className="border-border">
                      <TableCell className="text-sm text-foreground">{formatDate(e.date)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{userName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{projectName}</TableCell>
                      <TableCell className="text-sm">
                        {hours > 0 ? <Badge variant="secondary" className="text-xs">{formatHours(hours)}</Badge> : '—'}
                      </TableCell>
                      <TableCell className="text-sm font-semibold" style={{ color: 'oklch(0.78 0.15 155)' }}>
                        {Number(e.income) > 0 ? formatCurrency(Number(e.income)) : '—'}
                      </TableCell>
                      <TableCell className="text-sm font-semibold" style={{ color: expTotal > 0 ? 'oklch(0.65 0.24 25)' : undefined }}>
                        {expTotal > 0 ? formatCurrency(expTotal) : '—'}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            </div>
            {entries.length > 50 && (
              <div className="p-4 text-center text-sm text-muted-foreground border-t border-border">
                Showing 50 of {entries.length} entries
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
