import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAllProjects } from '@/lib/actions/projects'
import { getAllEntries } from '@/lib/actions/entries'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { FolderOpen, ArrowLeft, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default async function AdminProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: myProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (myProfile?.role !== 'admin') redirect('/dashboard')

  const [projects, entries] = await Promise.all([
    getAllProjects(),
    getAllEntries(),
  ])

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'var(--gradient-income)' }}>
            <FolderOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">All Projects</h1>
            <p className="text-muted-foreground mt-0.5">{projects.length} project{projects.length !== 1 ? 's' : ''} platform-wide</p>
          </div>
        </div>
        <Link href="/admin" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Admin Overview
        </Link>
      </div>

      {/* Projects Table */}
      <div className="glass-card overflow-x-auto w-full animate-fade-in">
        <Table className="premium-table">
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">Project</TableHead>
              <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">Owner</TableHead>
              <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">Created Date</TableHead>
              <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">Entries</TableHead>
              <TableHead className="text-muted-foreground text-xs uppercase tracking-wider text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((proj) => {
              const projEntries = entries.filter(e => e.project_id === proj.id)
              // @ts-ignore — joined from profiles
              const ownerName = proj.profiles?.full_name || 'Unknown Owner'
              return (
                <TableRow key={proj.id} className="border-border">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ background: proj.color || '#6366f1' }} />
                      <div>
                        <p className="text-sm font-semibold text-foreground">{proj.title}</p>
                        {proj.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">{proj.description}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{ownerName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(proj.created_at)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {projEntries.length} entries
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/project/${proj.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      View <ExternalLink className="w-3 h-3" />
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
