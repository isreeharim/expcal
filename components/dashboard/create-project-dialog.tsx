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
        className={cn('gap-2 font-semibold rounded-xl transition-all duration-200 hover:opacity-95 hover:shadow-lg hover:shadow-primary/25 active:scale-95 group cursor-pointer', className)}
        style={{ background: 'var(--gradient-primary)', border: 'none' }}
      >
        <Plus className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />
        Create Project
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[92vw] sm:max-w-md p-6 rounded-2xl shadow-2xl backdrop-blur-2xl border border-white/12 animate-fade-in" style={{ background: 'oklch(0.14 0.012 260 / 95%)' }}>
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md shadow-primary/20 flex-shrink-0" style={{ background: 'var(--gradient-primary)' }}>
                <FolderPlus className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-foreground text-xl font-bold tracking-tight">New Project</DialogTitle>
                <DialogDescription className="text-muted-foreground/90 text-sm font-normal">
                  Create a project to track time, income and expenses
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5 mt-2">
            <div className="space-y-2">
              <Label htmlFor="project-title" className="text-foreground/90 font-medium text-sm">
                Project Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="project-title"
                name="title"
                placeholder="e.g., Website Redesign"
                className="bg-muted/40 border-border/80 focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 transition-all duration-200 h-11 rounded-xl"
                required
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-description" className="text-foreground/90 font-medium text-sm">
                Description <span className="text-muted-foreground/70 text-xs font-normal">(optional)</span>
              </Label>
              <Input
                id="project-description"
                name="description"
                placeholder="Brief description of this project"
                className="bg-muted/40 border-border/80 focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 transition-all duration-200 h-11 rounded-xl"
              />
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-sm font-medium animate-fade-in flex items-center gap-2">
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-xl font-medium hover:bg-muted/80 active:scale-[0.98] transition-all cursor-pointer"
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 font-semibold rounded-xl transition-all duration-200 hover:opacity-95 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] group cursor-pointer"
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
                    <Plus className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" /> Create Project
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
