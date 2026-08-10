'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Project } from '@/lib/types'
import { deleteProject, updateProject } from '@/lib/actions/projects'
import { cn, formatDate } from '@/lib/utils'
import { Folder, MoreVertical, Pencil, Trash2, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleDelete = () => {
    startTransition(async () => {
      await deleteProject(project.id)
      setDeleteOpen(false)
    })
  }

  const handleEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      await updateProject(project.id, formData)
      setEditOpen(false)
      router.refresh()
    })
  }

  return (
    <>
      <div className={cn('group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-border/70 bg-card p-5 transition-colors duration-200 hover:border-primary/30 hover:bg-muted/[0.18] animate-fade-in')}>
        <div className="flex items-start justify-between gap-3">
          <Link href={`/project/${project.id}`} className="flex min-w-0 items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm" style={{ background: project.color || 'var(--gradient-primary)' }}>
              <Folder className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">{project.title}</h3>
              <p className="mt-0.5 text-xs font-medium text-muted-foreground">Created {formatDate(project.created_at)}</p>
            </div>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-primary/50 sm:opacity-0 sm:group-hover:opacity-100" id={`project-menu-${project.id}`}>
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Project actions</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-xl p-1.5 shadow-xl border border-white/10 backdrop-blur-xl" style={{ background: 'rgba(18, 22, 34, 0.96)' }}>
              <DropdownMenuItem onClick={() => setEditOpen(true)} className="gap-2 cursor-pointer rounded-lg text-xs font-medium focus:bg-muted/80">
                <Pencil className="h-3.5 w-3.5" /> Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/60" />
              <DropdownMenuItem onClick={() => setDeleteOpen(true)} className="gap-2 rounded-lg text-xs font-medium text-destructive focus:bg-destructive/15 focus:text-destructive cursor-pointer">
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {project.description && (
          <Link href={`/project/${project.id}`} className="line-clamp-2 text-xs leading-relaxed text-muted-foreground hover:text-foreground transition-colors">
            {project.description}
          </Link>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-3">
          <Badge variant="secondary" className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">Active</Badge>
          <Link href={`/project/${project.id}`} className="flex items-center gap-1.5 rounded-lg px-1.5 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
            Open <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="rounded-2xl border border-border/80 bg-card p-6 shadow-2xl animate-fade-in">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold tracking-tight text-foreground">Delete &quot;{project.title}&quot;?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-normal text-muted-foreground">This will permanently delete the project and all its entries. This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel disabled={isPending} className="rounded-xl font-medium transition-colors hover:bg-muted">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isPending} className="rounded-xl bg-destructive font-semibold text-white shadow-lg shadow-destructive/20 hover:bg-destructive/90">
              {isPending ? 'Deleting...' : 'Delete Project'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="rounded-2xl border border-border/80 bg-card p-6 shadow-2xl animate-fade-in">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight text-foreground">Edit Project</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="mt-2 space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`edit-title-${project.id}`} className="text-sm font-medium text-foreground/90">Project Title</Label>
              <Input id={`edit-title-${project.id}`} name="title" defaultValue={project.title} className="h-11 rounded-xl border-border/80 bg-muted/40 focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/30" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`edit-desc-${project.id}`} className="text-sm font-medium text-foreground/90">Description</Label>
              <Input id={`edit-desc-${project.id}`} name="description" defaultValue={project.description ?? ''} className="h-11 rounded-xl border-border/80 bg-muted/40 focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/30" />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)} className="flex-1 rounded-xl font-medium" disabled={isPending}>Cancel</Button>
              <Button type="submit" className="flex-1 rounded-xl font-semibold" disabled={isPending} style={{ background: 'var(--gradient-primary)', border: 'none' }}>
                {isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
