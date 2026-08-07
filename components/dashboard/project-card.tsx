'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Project } from '@/lib/types'
import { deleteProject, updateProject } from '@/lib/actions/projects'
import { cn, formatDate } from '@/lib/utils'
import { Folder, MoreVertical, Pencil, Trash2, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog'
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
      <div
        className={cn('glass-card p-5 flex flex-col gap-4 group cursor-pointer animate-fade-in relative overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 rounded-2xl')}
      >
        {/* Card header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md shadow-primary/20 transition-transform duration-300 group-hover:scale-105"
              style={{ background: project.color || 'var(--gradient-primary)' }}
            >
              <Folder className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-foreground text-sm truncate tracking-tight group-hover:text-primary transition-colors">{project.title}</h3>
              <p className="text-xs text-muted-foreground/80 mt-0.5 font-medium">
                Created {formatDate(project.created_at)}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
              id={`project-menu-${project.id}`}
            >
              <MoreVertical className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-xl p-1.5 shadow-xl border border-white/12 backdrop-blur-2xl animate-fade-in" style={{ background: 'oklch(0.14 0.012 260 / 95%)' }}>
              <DropdownMenuItem
                onClick={() => setEditOpen(true)}
                className="gap-2 cursor-pointer rounded-lg text-xs font-medium focus:bg-muted/80"
              >
                <Pencil className="w-3.5 h-3.5" /> Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/60" />
              <DropdownMenuItem
                onClick={() => setDeleteOpen(true)}
                className="gap-2 text-destructive cursor-pointer focus:text-destructive focus:bg-destructive/15 rounded-lg text-xs font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {project.description && (
          <p className="text-muted-foreground/90 text-xs line-clamp-2 leading-relaxed font-normal">{project.description}</p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/60">
          <Badge variant="secondary" className="text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 px-2.5 py-0.5 rounded-full">Active</Badge>
          <Link
            href={`/project/${project.id}`}
            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors group/link"
            id={`open-project-${project.id}`}
          >
            Open <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/link:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="rounded-2xl p-6 shadow-2xl backdrop-blur-2xl border border-white/12 animate-fade-in" style={{ background: 'oklch(0.14 0.012 260 / 95%)' }}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground text-xl font-bold tracking-tight">Delete &quot;{project.title}&quot;?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground/90 text-sm font-normal">
              This will permanently delete the project and all its entries. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel disabled={isPending} className="rounded-xl font-medium hover:bg-muted/80 active:scale-[0.98] transition-all cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive hover:bg-destructive/90 text-white rounded-xl font-semibold active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-destructive/20"
            >
              {isPending ? 'Deleting...' : 'Delete Project'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="rounded-2xl p-6 shadow-2xl backdrop-blur-2xl border border-white/12 animate-fade-in" style={{ background: 'oklch(0.14 0.012 260 / 95%)' }}>
          <DialogHeader>
            <DialogTitle className="text-foreground text-xl font-bold tracking-tight">Edit Project</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor={`edit-title-${project.id}`} className="text-foreground/90 font-medium text-sm">Project Title</Label>
              <Input
                id={`edit-title-${project.id}`}
                name="title"
                defaultValue={project.title}
                className="bg-muted/40 border-border/80 focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 transition-all duration-200 h-11 rounded-xl"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`edit-desc-${project.id}`} className="text-foreground/90 font-medium text-sm">Description</Label>
              <Input
                id={`edit-desc-${project.id}`}
                name="description"
                defaultValue={project.description ?? ''}
                className="bg-muted/40 border-border/80 focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 transition-all duration-200 h-11 rounded-xl"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)} className="flex-1 rounded-xl font-medium hover:bg-muted/80 active:scale-[0.98] transition-all cursor-pointer" disabled={isPending}>Cancel</Button>
              <Button type="submit" className="flex-1 rounded-xl font-semibold transition-all duration-200 hover:opacity-95 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] cursor-pointer" disabled={isPending} style={{ background: 'var(--gradient-primary)', border: 'none' }}>
                {isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
