import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getProject, getProjectStats } from '@/lib/actions/projects'
import { getEntries } from '@/lib/actions/entries'
import { StatCard } from '@/components/dashboard/stat-card'
import { EntriesTable } from '@/components/project/entries-table'
import { AddEntryButton } from '@/components/project/add-entry-button'
import { ProjectChart } from '@/components/project/project-chart'
import { ProjectHeaderActions } from '@/components/project/project-header-actions'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ChevronLeft, Folder, User as UserIcon } from 'lucide-react'
import { Metadata } from 'next'

type PageProps = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  try {
    const project = await getProject(id)
    return { title: `${project?.title || 'Project'} | ExpCal` }
  } catch {
    return { title: 'Project | ExpCal' }
  }
}

export default async function ProjectPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let project, stats, entries
  try {
    ;[project, stats, entries] = await Promise.all([
      getProject(id),
      getProjectStats(id),
      getEntries(id),
    ])
  } catch {
    notFound()
  }

  if (!project) notFound()

  // Fetch current viewer profile and project owner profile
  const [{ data: viewerProfile }, { data: ownerProfile }] = await Promise.all([
    supabase.from('profiles').select('role').eq('id', user.id).maybeSingle(),
    supabase.from('profiles').select('id, full_name, role').eq('id', project.user_id).maybeSingle(),
  ])

  const isAdmin = viewerProfile?.role === 'admin'
  const isOwner = project.user_id === user.id

  // Security guard: Non-admin users cannot access another user's project
  if (!isOwner && !isAdmin) {
    notFound()
  }

  const ownerName = ownerProfile?.full_name || 'User'

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-fade-in">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {isAdmin ? (
          <>
            <Link href="/admin" className="hover:text-foreground transition-colors">
              Admin
            </Link>
            <span className="text-muted-foreground/40">/</span>
            <Link href={`/admin/users/${project.user_id}`} className="hover:text-foreground transition-colors truncate max-w-[150px]">
              {ownerName}
            </Link>
            <span className="text-muted-foreground/40">/</span>
          </>
        ) : (
          <>
            <Link href="/dashboard" className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
              <ChevronLeft className="w-4 h-4" /> Dashboard
            </Link>
            <span className="text-muted-foreground/40">/</span>
            <Link href="/projects" className="hover:text-foreground transition-colors">
              Projects
            </Link>
            <span className="text-muted-foreground/40">/</span>
          </>
        )}
        <span className="text-foreground font-medium truncate">{project.title}</span>
      </div>

      {/* Project Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
            style={{ background: project.color || 'var(--gradient-primary)' }}
          >
            <Folder className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground break-words">{project.title}</h1>
              {isAdmin && !isOwner && (
                <Link href={`/admin/users/${project.user_id}`}>
                  <Badge variant="outline" className="text-xs gap-1 py-0.5 px-2 hover:bg-muted/60 transition-colors cursor-pointer">
                    <UserIcon className="w-3 h-3 text-primary" /> Owner: {ownerName}
                  </Badge>
                </Link>
              )}
            </div>
            {project.description && (
              <p className="text-muted-foreground text-sm mt-0.5 break-words">{project.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <ProjectHeaderActions project={project} isAdmin={isAdmin} isOwner={isOwner} />
          <AddEntryButton projectId={id} userId={user.id} />
        </div>
      </div>

      {/* Project Stats — Compact 2x2 Grid on Mobile, 4 Cols on Desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 stagger-children">
        <StatCard
          compact
          type="hours"
          value={Number(stats?.total_hours || 0)}
          label="Project Hours"
          subLabel="Total time logged"
        />
        <StatCard
          compact
          type="income"
          value={Number(stats?.total_income || 0)}
          label="Project Income"
          subLabel="Total earned"
        />
        <StatCard
          compact
          type="expense"
          value={Number(stats?.total_expenses || 0)}
          label="Project Expenses"
          subLabel="Total spent"
        />
        <StatCard
          compact
          type="cash"
          value={Number(stats?.net_cash || 0)}
          label="Net Cash"
          subLabel="Income minus expenses"
        />
      </div>

      {/* Project Chart */}
      {entries && entries.length > 1 && (
        <div className="mb-8">
          <ProjectChart entries={entries} />
        </div>
      )}

      {/* Entries Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="section-header">Entries</h2>
            <span className="badge-info">{entries?.length || 0} total</span>
          </div>
        </div>
        <EntriesTable entries={entries || []} projectId={id} userId={user.id} />
      </div>
    </div>
  )
}
