'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createProject } from '@/lib/actions/projects'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Plus, FolderPlus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CreateProjectDialogProps {
  className?: string
}

export function CreateProjectDialog({ className }: CreateProjectDialogProps) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      try {
        const project = await createProject(formData)
        setOpen(false)
        router.push(`/project/${project.id}`)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create project')
      }
    })
  }

  return (
    <>
      <Button
        id="create-project-btn"
        onClick={() => setOpen(true)}
        className={cn('gap-2 font-semibold', className)}
        style={{ background: 'var(--gradient-primary)', border: 'none' }}
      >
        <Plus className="w-4 h-4" />
        Create Project
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[92vw] sm:max-w-md p-5 sm:p-6" style={{ background: 'oklch(0.14 0.012 260)', border: '1px solid oklch(1 0 0 / 10%)' }}>
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
                <FolderPlus className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-foreground text-xl">New Project</DialogTitle>
                <DialogDescription className="text-muted-foreground text-sm">
                  Create a project to track time, income and expenses
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5 mt-2">
            <div className="space-y-2">
              <Label htmlFor="project-title" className="text-foreground font-medium">
                Project Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="project-title"
                name="title"
                placeholder="e.g., Website Redesign"
                className="bg-muted/50 border-border focus:border-primary h-11"
                required
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-description" className="text-foreground font-medium">
                Description <span className="text-muted-foreground text-xs font-normal">(optional)</span>
              </Label>
              <Input
                id="project-description"
                name="description"
                placeholder="Brief description of this project"
                className="bg-muted/50 border-border focus:border-primary h-11"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1"
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 font-semibold"
                disabled={isPending}
                style={{ background: 'var(--gradient-primary)', border: 'none' }}
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Create Project
                  </span>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
