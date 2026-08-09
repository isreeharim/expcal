'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Project, Entry } from '@/lib/types'
import { updateProject, deleteProject } from '@/lib/actions/projects'
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
import { BillCustomizerModal } from '@/components/project/bill-customizer-modal'
import { Pencil, Trash2, FileSpreadsheet, FileText } from 'lucide-react'

interface ProjectHeaderActionsProps {
  project: Project
  entries: Entry[]
  isAdmin: boolean
  isOwner: boolean
}

export function ProjectHeaderActions({ project, entries, isAdmin, isOwner }: ProjectHeaderActionsProps) {
  const router = useRouter()
  const [billModalOpen, setBillModalOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      try {
        await updateProject(project.id, formData)
        setEditOpen(false)
        router.refresh()
      } catch (err: unknown) {
        const error = err as Error
        setError(error.message || 'Failed to update project')
      }
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteProject(project.id)
        setDeleteOpen(false)
        if (isAdmin && !isOwner) {
          router.push(`/admin/users/${project.user_id}`)
        } else {
          router.push('/dashboard')
        }
        router.refresh()
      } catch (err: unknown) {
        const error = err as Error
        setError(error.message || 'Failed to delete project')
      }
    })
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Export Bill / Invoice Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setBillModalOpen(true)}
        className="rounded-xl h-9 text-xs font-semibold gap-1.5 border-border/80 hover:bg-muted/60 text-foreground"
      >
        <FileText className="w-3.5 h-3.5 text-primary" /> Export Bill
      </Button>

      {/* Edit & Delete Controls (Authorized) */}
      {(isAdmin || isOwner) && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditOpen(true)}
            className="rounded-xl h-9 text-xs font-semibold gap-1.5 border-border/80 hover:bg-muted/60"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteOpen(true)}
            className="rounded-xl h-9 text-xs font-semibold gap-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/15"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </>
      )}

      {/* Bill Customizer Modal */}
      <BillCustomizerModal
        project={project}
        open={billModalOpen}
        onOpenChange={setBillModalOpen}
      />

      {/* Edit Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent
          className="w-[92vw] sm:max-w-md p-6 rounded-3xl shadow-2xl backdrop-blur-2xl border border-white/12 animate-fade-in"
          style={{ background: 'rgba(18, 20, 34, 0.96)' }}
        >
          <DialogHeader>
            <DialogTitle className="text-foreground text-lg font-bold">Edit Project</DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Update project title and description.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdate} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-proj-title" className="text-foreground text-xs font-medium">
                Project Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-proj-title"
                name="title"
                defaultValue={project.title}
                required
                className="bg-muted/50 border-border/80 rounded-xl h-11 text-sm focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-proj-desc" className="text-foreground text-xs font-medium">
                Description
              </Label>
              <Input
                id="edit-proj-desc"
                name="description"
                defaultValue={project.description || ''}
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
                onClick={() => setEditOpen(false)}
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
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent
          className="w-[92vw] sm:max-w-md p-6 rounded-3xl shadow-2xl backdrop-blur-2xl border border-white/12 animate-fade-in"
          style={{ background: 'rgba(18, 20, 34, 0.96)' }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground text-lg font-bold">Delete Project?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground text-xs leading-relaxed">
              This action cannot be undone. All expense entries, hours, and receipts attached to this project will be permanently removed.
            </AlertDialogDescription>
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
