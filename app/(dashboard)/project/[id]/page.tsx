import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getProject, getProjectStats } from '@/lib/actions/projects'
import { getEntries } from '@/lib/actions/entries'
import { StatCard } from '@/components/dashboard/stat-card'
import { EntriesTable } from '@/components/project/entries-table'
import { AddEntryButton } from '@/components/project/add-entry-button'
import { ProjectChart } from '@/components/project/project-chart'
import Link from 'next/link'
import { ChevronLeft, Folder } from 'lucide-react'
import { Metadata } from 'next'

type PageProps = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  try {
    const project = await getProject(id)
    return { title: project?.title || 'Project' }
  } catch {
    return { title: 'Project' }
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

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 animate-fade-in">
        <Link href="/dashboard" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm transition-colors">
          <ChevronLeft className="w-4 h-4" /> Dashboard
        </Link>
        <span className="text-muted-foreground/40">/</span>
        <span className="text-sm text-foreground font-medium">{project.title}</span>
      </div>

      {/* Project Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: project.color || 'var(--gradient-primary)' }}
          >
            <Folder className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">{project.title}</h1>
            {project.description && (
              <p className="text-muted-foreground text-sm mt-0.5">{project.description}</p>
            )}
          </div>
        </div>
        <AddEntryButton projectId={id} userId={user.id} />
      </div>

      {/* Project Stats — 3-Row Layout */}
      <div className="space-y-4 mb-8 stagger-children">
        {/* Row 1: Total Hours */}
        <div>
          <StatCard
            type="hours"
            value={Number(stats?.total_hours || 0)}
            label="Project Hours"
            subLabel="Total time logged"
          />
        </div>
        {/* Row 2: Income & Expenses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard
            type="income"
            value={Number(stats?.total_income || 0)}
            label="Project Income"
            subLabel="Total earned"
          />
          <StatCard
            type="expense"
            value={Number(stats?.total_expenses || 0)}
            label="Project Expenses"
            subLabel="Total spent"
          />
        </div>
        {/* Row 3: Net Cash */}
        <div>
          <StatCard
            type="cash"
            value={Number(stats?.net_cash || 0)}
            label="Net Cash"
            subLabel="Income minus expenses"
          />
        </div>
      </div>

      {/* Project Chart */}
      {entries && entries.length > 1 && (
        <div className="mb-8">
          <ProjectChart entries={entries} />
        </div>
      )}

      {/* Entries Table */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-foreground">
            Entries
            <span className="ml-2 text-sm font-normal text-muted-foreground">({entries?.length || 0} total)</span>
          </h2>
          <AddEntryButton projectId={id} userId={user.id} compact />
        </div>
        <EntriesTable entries={entries || []} projectId={id} userId={user.id} />
      </div>
    </div>
  )
}
