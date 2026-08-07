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
import { Shield, Users, FolderOpen, Receipt } from 'lucide-react'

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

  // Compute global stats
  const totalIncome = entries.reduce((s, e) => s + Number(e.income || 0), 0)
  const totalExpense = entries.reduce((s, e) => s + totalExpenses(e.expenses || []), 0)
  const totalHours = entries.reduce((s, e) => s + calculateHours(e.start_time, e.end_time), 0)

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 animate-fade-in">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-0.5">Full control over all users and data</p>
        </div>
      </div>

      {/* Global Stats — 3-Row Layout */}
      <div className="space-y-4 mb-8 stagger-children">
        {/* Row 1: Total Hours */}
        <div>
          <StatCard type="hours" value={totalHours} label="Total Hours" subLabel="All users combined" />
        </div>
        {/* Row 2: Total Income & Total Expenses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard type="income" value={totalIncome} label="Total Income" subLabel="Platform-wide" />
          <StatCard type="expense" value={totalExpense} label="Total Expenses" subLabel="Platform-wide" />
        </div>
        {/* Row 3: Net Cash */}
        <div>
          <StatCard type="cash" value={totalIncome - totalExpense} label="Net Cash" subLabel="Platform-wide" />
        </div>
      </div>

      {/* Quick counters */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { icon: Users, label: 'Total Users', value: allProfiles.length, color: 'var(--gradient-hours)' },
          { icon: FolderOpen, label: 'Total Projects', value: projects.length, color: 'var(--gradient-income)' },
          { icon: Receipt, label: 'Total Entries', value: entries.length, color: 'var(--gradient-expense)' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="glass-card p-4 flex items-center gap-4 animate-fade-in">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: color }}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Data Tabs */}
      <Tabs defaultValue="users" className="animate-fade-in">
        <TabsList className="bg-muted/50 mb-6">
          <TabsTrigger value="users" className="gap-2">
            <Users className="w-3.5 h-3.5" /> Users ({allProfiles.length})
          </TabsTrigger>
          <TabsTrigger value="projects" className="gap-2">
            <FolderOpen className="w-3.5 h-3.5" /> Projects ({projects.length})
          </TabsTrigger>
          <TabsTrigger value="entries" className="gap-2">
            <Receipt className="w-3.5 h-3.5" /> Entries ({entries.length})
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users">
          <div className="glass-card overflow-hidden">
            <Table className="premium-table">
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">User</TableHead>
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">Role</TableHead>
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">Joined</TableHead>
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">Projects</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allProfiles.map((p) => {
                  const userProjects = projects.filter((proj) => proj.user_id === p.id)
                  return (
                    <TableRow key={p.id} className="border-border">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback style={{ background: 'var(--gradient-primary)', color: 'white', fontSize: '0.7rem' }}>
                              {getInitials(p.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-foreground">{p.full_name || 'Unnamed'}</p>
                          </div>
                        </div>
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
                      <TableCell className="text-sm font-medium text-foreground">{userProjects.length}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects">
          <div className="glass-card overflow-hidden">
            <Table className="premium-table">
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">Project</TableHead>
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">Owner</TableHead>
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">Created</TableHead>
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">Entries</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((proj) => {
                  const projEntries = entries.filter(e => e.project_id === proj.id)
                  // @ts-ignore — joined from getAllProjects
                  const ownerName = proj.profiles?.full_name || 'Unknown'
                  return (
                    <TableRow key={proj.id} className="border-border">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="color-dot" style={{ background: proj.color || '#6366f1' }} />
                          <span className="text-sm font-medium text-foreground">{proj.title}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{ownerName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(proj.created_at)}</TableCell>
                      <TableCell className="text-sm font-medium text-foreground">{projEntries.length}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Entries Tab */}
        <TabsContent value="entries">
          <div className="glass-card overflow-hidden">
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
                  // @ts-ignore — joined
                  const userName = e.profiles?.full_name || 'Unknown'
                  // @ts-ignore — joined
                  const projectName = e.projects?.title || 'Unknown'
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
