import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAllProjects } from '@/lib/actions/projects'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getInitials, formatDate } from '@/lib/utils'
import { Users, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: myProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (myProfile?.role !== 'admin') redirect('/dashboard')

  const [{ data: profiles }, projects] = await Promise.all([
    supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    getAllProjects(),
  ])

  const allProfiles = profiles ?? []

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8 animate-fade-in">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--gradient-hours)' }}>
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground mt-0.5">{allProfiles.length} registered user{allProfiles.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-1.5 -my-1.5">
          <ArrowLeft className="w-4 h-4" /> Admin Overview
        </Link>
      </div>

      {/* Users Table */}
      <div className="glass-card overflow-x-auto w-full animate-fade-in">
        <Table className="premium-table">
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">User</TableHead>
              <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">Role</TableHead>
              <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">Joined Date</TableHead>
              <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">Total Projects</TableHead>
              <TableHead className="text-right text-muted-foreground text-xs uppercase tracking-wider">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allProfiles.map((p) => {
              const userProjects = projects.filter((proj) => proj.user_id === p.id)
              return (
                <TableRow key={p.id} className="border-border group hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <Link href={`/admin/users/${p.id}`} className="flex items-center gap-3">
                      <Avatar className="w-9 h-9 ring-2 ring-primary/20 flex-shrink-0 group-hover:scale-105 transition-transform">
                        <AvatarFallback style={{ background: 'var(--gradient-primary)', color: 'white', fontSize: '0.75rem' }}>
                          {getInitials(p.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                          {p.full_name || 'Unnamed User'}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">ID: {p.id.slice(0, 8)}...</p>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={p.role === 'admin' ? 'default' : 'secondary'}
                      className="capitalize text-xs font-semibold"
                      style={p.role === 'admin' ? { background: 'var(--gradient-primary)', color: 'white' } : {}}
                    >
                      {p.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(p.created_at)}</TableCell>
                  <TableCell className="text-sm font-medium text-foreground">
                    <span className="px-2.5 py-1 rounded-lg bg-muted/50 border border-border text-xs font-semibold">
                      {userProjects.length} project{userProjects.length !== 1 ? 's' : ''}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/admin/users/${p.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold transition-colors"
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
  )
}
