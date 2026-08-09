'use client'

import { useState, useMemo, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Project, ProjectStats } from '@/lib/types'
import { formatCurrency, formatHours, formatDate } from '@/lib/utils'
import {
  FolderOpen,
  Search,
  SearchX,
  SlidersHorizontal,
  ArrowUpDown,
  Plus,
  Trash2,
  Pencil,
  Clock,
  DollarSign,
  TrendingUp,
  Receipt,
  ExternalLink,
  FolderPlus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { createProject, updateProject, deleteProject } from '@/lib/actions/projects'

interface AdminUserProjectsProps {
  userId: string
  userName: string
  projects: Project[]
  statsMap: Record<string, ProjectStats | null>
}

export function AdminUserProjects({
  userId,
  userName,
  projects,
  statsMap
}: AdminUserProjectsProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title' | 'income'>('newest')
  const [createOpen, setCreateOpen] = useState(false)
  const [editProjectData, setEditProjectData] = useState<Project | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Filter and sort
  const filteredProjects = useMemo(() => {
    let result = projects.filter((p) => {
      const q = searchQuery.toLowerCase().trim()
      if (!q) return true
      return (
        p.title.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
      )
    })

    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      if (sortBy === 'title') return a.title.localeCompare(b.title)
      if (sortBy === 'income') {
        const incA = Number(statsMap[a.id]?.total_income || 0)
        const incB = Number(statsMap[b.id]?.total_income || 0)
        return incB - incA
      }
      return 0
    })

    return result
  }, [projects, searchQuery, sortBy, statsMap])

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.append('target_user_id', userId)

    startTransition(async () => {
      try {
        await createProject(formData)
        setCreateOpen(false)
        router.refresh()
      } catch (err: unknown) {
        const error = err as Error
        setError(error.message || 'Failed to create project')
      }
    })
  }

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editProjectData) return
    setError(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      try {
        await updateProject(editProjectData.id, formData)
        setEditProjectData(null)
        router.refresh()
      } catch (err: unknown) {
        const error = err as Error
        setError(error.message || 'Failed to update project')
      }
    })
  }

  const handleDelete = () => {
    if (!deleteId) return
    startTransition(async () => {
      try {
        await deleteProject(deleteId)
        setDeleteId(null)
        router.refresh()
      } catch (err: unknown) {
        const error = err as Error
        setError(error.message || 'Failed to delete project')
      }
    })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search, Sort, and Add Project Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${userName}'s projects...`}
            className="pl-10 h-11 rounded-2xl bg-muted/40 border-border/80 text-sm focus:border-primary"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded bg-muted/70"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'title' | 'income')}
              className="h-11 px-3.5 py-2 rounded-2xl bg-muted/40 border border-border/80 text-xs font-medium text-foreground focus:outline-none focus:border-primary cursor-pointer appearance-none pr-8"
            >
              <option value="newest">Sort: Newest</option>
              <option value="oldest">Sort: Oldest</option>
              <option value="title">Sort: Title A-Z</option>
              <option value="income">Sort: Highest Income</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>

          <Button
            onClick={() => setCreateOpen(true)}
            className="h-11 rounded-2xl gap-2 text-xs font-semibold text-white cursor-pointer shadow-md shadow-primary/20"
            style={{ background: 'var(--gradient-primary)', border: 'none' }}
          >
            <Plus className="w-4 h-4" /> Add Project
          </Button>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="glass-card p-10 text-center rounded-3xl border border-white/10 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto text-muted-foreground">
            {searchQuery ? <SearchX className="w-6 h-6" /> : <FolderOpen className="w-6 h-6" />}
          </div>
          <h3 className="text-base font-semibold text-foreground">
            {searchQuery ? 'No matching projects found' : `No projects yet for ${userName}`}
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {searchQuery ? 'Try adjusting your search query.' : 'Create a project for this user to get started.'}
          </p>
          {!searchQuery && (
            <Button
              onClick={() => setCreateOpen(true)}
              className="gap-2 rounded-xl text-xs mt-2"
              style={{ background: 'var(--gradient-primary)', border: 'none' }}
            >
              <Plus className="w-4 h-4" /> Create First Project
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => {
            const stats = statsMap[project.id]
            const income = Number(stats?.total_income || 0)
            const expense = Number(stats?.total_expenses || 0)
            const net = Number(stats?.net_cash || 0)
            const hours = Number(stats?.total_hours || 0)
            const entryCount = Number(stats?.entry_count || 0)

            return (
              <div
                key={project.id}
                className="glass-card p-5 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-200 flex flex-col justify-between group relative"
              >
                <div>
                  {/* Top Bar with Color Pill and Actions */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-md"
                        style={{ background: project.color || 'var(--gradient-primary)' }}
                      >
                        <FolderOpen className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-foreground text-base truncate group-hover:text-primary transition-colors">
                          {project.title}
                        </h4>
                        <span className="text-[11px] text-muted-foreground">Created {formatDate(project.created_at)}</span>
                      </div>
                    </div>

                    {/* Quick Edit & Delete Controls for Admin */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => setEditProjectData(project)}
                        title="Edit Project"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteId(project.id)}
                        title="Delete Project"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/15 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {project.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                      {project.description}
                    </p>
                  )}

                  {/* Financial Stats Breakdown */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-muted/40 border border-border/50 text-center my-3">
                    <div>
                      <span className="text-[10px] text-muted-foreground font-medium block">Entries</span>
                      <span className="text-xs font-bold text-foreground">{entryCount}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground font-medium block">Hours</span>
                      <span className="text-xs font-bold text-foreground">{formatHours(hours)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground font-medium block">Net Profit</span>
                      <span
                        className="text-xs font-bold truncate block"
                        style={{ color: net >= 0 ? 'oklch(0.78 0.15 155)' : 'oklch(0.65 0.24 25)' }}
                      >
                        {formatCurrency(net)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Open Full Project Link */}
                <div className="pt-3 border-t border-border/40 flex items-center justify-between mt-2">
                  <div className="text-xs text-muted-foreground">
                    Income: <strong className="text-emerald-400 font-semibold">{formatCurrency(income)}</strong>
                  </div>
                  <Link
                    href={`/project/${project.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                  >
                    View All Entries & Edit <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create Project Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent
          className="w-[92vw] sm:max-w-md p-6 rounded-3xl shadow-2xl backdrop-blur-2xl border border-white/12 animate-fade-in"
          style={{ background: 'rgba(18, 20, 34, 0.96)' }}
        >
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md shadow-primary/20 flex-shrink-0"
                style={{ background: 'var(--gradient-primary)' }}
              >
                <FolderPlus className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-foreground text-lg font-bold tracking-tight">
                  New Project for {userName}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground/90 text-xs">
                  Create a new project assigned directly to this user.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="admin-create-title" className="text-foreground text-xs font-medium">
                Project Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="admin-create-title"
                name="title"
                placeholder="e.g. Mobile App Development, Consulting"
                required
                className="bg-muted/50 border-border/80 rounded-xl h-11 text-sm focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="admin-create-desc" className="text-foreground text-xs font-medium">
                Description (optional)
              </Label>
              <Input
                id="admin-create-desc"
                name="description"
                placeholder="Scope of work or project notes"
                className="bg-muted/50 border-border/80 rounded-xl h-11 text-sm focus:border-primary"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-xs">
                {error}
              </div>
            )}

            <div className="flex gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
                className="flex-1 rounded-xl h-11 text-xs font-semibold border-border/80"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="flex-1 rounded-xl h-11 text-xs font-semibold text-white"
                style={{ background: 'var(--gradient-primary)', border: 'none' }}
              >
                {isPending ? 'Creating...' : 'Create Project'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Project Modal */}
      <Dialog open={!!editProjectData} onOpenChange={(open) => !open && setEditProjectData(null)}>
        <DialogContent
          className="w-[92vw] sm:max-w-md p-6 rounded-3xl shadow-2xl backdrop-blur-2xl border border-white/12 animate-fade-in"
          style={{ background: 'rgba(18, 20, 34, 0.96)' }}
        >
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md shadow-primary/20 flex-shrink-0"
                style={{ background: 'var(--gradient-primary)' }}
              >
                <Pencil className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-foreground text-lg font-bold tracking-tight">Edit Project</DialogTitle>
                <DialogDescription className="text-muted-foreground/90 text-xs">
                  Update project title and description.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {editProjectData && (
            <form onSubmit={handleUpdate} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label htmlFor="admin-edit-title" className="text-foreground text-xs font-medium">
                  Project Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="admin-edit-title"
                  name="title"
                  defaultValue={editProjectData.title}
                  required
                  className="bg-muted/50 border-border/80 rounded-xl h-11 text-sm focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="admin-edit-desc" className="text-foreground text-xs font-medium">
                  Description
                </Label>
                <Input
                  id="admin-edit-desc"
                  name="description"
                  defaultValue={editProjectData.description || ''}
                  className="bg-muted/50 border-border/80 rounded-xl h-11 text-sm focus:border-primary"
                />
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-xs">
                  {error}
                </div>
              )}

              <div className="flex gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditProjectData(null)}
                  className="flex-1 rounded-xl h-11 text-xs font-semibold border-border/80"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 rounded-xl h-11 text-xs font-semibold text-white"
                  style={{ background: 'var(--gradient-primary)', border: 'none' }}
                >
                  {isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Project Confirmation Alert */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent
          className="w-[92vw] sm:max-w-md p-6 rounded-3xl shadow-2xl backdrop-blur-2xl border border-white/12 animate-fade-in"
          style={{ background: 'rgba(18, 20, 34, 0.96)' }}
        >
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-destructive/20 text-destructive flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <AlertDialogTitle className="text-foreground text-lg font-bold">Delete Project?</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground text-xs leading-relaxed">
                  This action cannot be undone. All expense entries, logged hours, and receipts attached to this project will be permanently deleted.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2.5 pt-2">
            <AlertDialogCancel className="rounded-xl h-11 text-xs font-semibold border-border/80">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="rounded-xl h-11 text-xs font-semibold bg-destructive hover:bg-destructive/90 text-white"
            >
              {isPending ? 'Deleting...' : 'Yes, Delete Project'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
