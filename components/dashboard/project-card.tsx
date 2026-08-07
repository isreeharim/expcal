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
        className={cn('glass-card p-5 flex flex-col gap-4 group cursor-pointer animate-fade-in')}
      >
        {/* Card header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: project.color || 'var(--gradient-primary)' }}
            >
              <Folder className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground text-sm truncate">{project.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Created {formatDate(project.created_at)}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors opacity-0 group-hover:opacity-100"
              id={`project-menu-${project.id}`}
            >
              <MoreVertical className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40" style={{ background: 'oklch(0.16 0.012 260)', border: '1px solid oklch(1 0 0 / 10%)' }}>
              <DropdownMenuItem
                onClick={() => setEditOpen(true)}
                className="gap-2 cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" /> Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeleteOpen(true)}
                className="gap-2 text-destructive cursor-pointer focus:text-destructive"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {project.description && (
          <p className="text-muted-foreground text-xs line-clamp-2">{project.description}</p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
          <Badge variant="secondary" className="text-xs">Active</Badge>
          <Link
            href={`/project/${project.id}`}
            className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
            id={`open-project-${project.id}`}
          >
            Open <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent style={{ background: 'oklch(0.14 0.012 260)', border: '1px solid oklch(1 0 0 / 10%)' }}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &quot;{project.title}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the project and all its entries. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isPending ? 'Deleting...' : 'Delete Project'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent style={{ background: 'oklch(0.14 0.012 260)', border: '1px solid oklch(1 0 0 / 10%)' }}>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor={`edit-title-${project.id}`}>Project Title</Label>
              <Input
                id={`edit-title-${project.id}`}
                name="title"
                defaultValue={project.title}
                className="bg-muted/50"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`edit-desc-${project.id}`}>Description</Label>
              <Input
                id={`edit-desc-${project.id}`}
                name="description"
                defaultValue={project.description ?? ''}
                className="bg-muted/50"
              />
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)} className="flex-1" disabled={isPending}>Cancel</Button>
              <Button type="submit" className="flex-1" disabled={isPending} style={{ background: 'var(--gradient-primary)', border: 'none' }}>
                {isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
