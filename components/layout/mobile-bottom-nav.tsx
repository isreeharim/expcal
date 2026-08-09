'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Profile } from '@/lib/types'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FolderOpen,
  BarChart2,
  Shield,
  Plus,
  X,
  FolderPlus,
  Receipt,
  FileSpreadsheet,
  LogOut,
  User
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createProject } from '@/lib/actions/projects'
import { signOut } from '@/lib/actions/auth'

interface MobileBottomNavProps {
  profile: Profile
}

export function MobileBottomNav({ profile }: MobileBottomNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [quickActionOpen, setQuickActionOpen] = useState(false)
  const [newProjectOpen, setNewProjectOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [projectError, setProjectError] = useState<string | null>(null)

  const isAdmin = profile.role === 'admin'

  const handleCreateProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setProjectError(null)
    setIsPending(true)
    const formData = new FormData(e.currentTarget)

    try {
      const project = await createProject(formData)
      setNewProjectOpen(false)
      setQuickActionOpen(false)
      router.push(`/project/${project.id}`)
      router.refresh()
    } catch (err: unknown) {
      const error = err as Error
      setProjectError(error.message || 'Failed to create project')
    } finally {
      setIsPending(false)
    }
  }

  const isHomeActive = pathname === '/dashboard'
  const isProjectsActive = pathname === '/projects' || pathname.startsWith('/project/')
  const isAnalysisActive = pathname === '/analysis'
  const isAdminActive = pathname.startsWith('/admin')

  return (
    <>
      {/* Floating Bottom Navigation Bar for Mobile */}
      <nav
        className="md:hidden fixed bottom-3 inset-x-3 z-40 bg-[#121422]/95 backdrop-blur-2xl border border-white/12 shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-3xl px-1 py-1.5 grid grid-cols-5 items-center transition-all duration-300"
        style={{ paddingBottom: 'calc(0.375rem + env(safe-area-inset-bottom, 0px))' }}
        aria-label="Mobile Navigation"
      >
        {/* 1. Dashboard */}
        <Link
          href="/dashboard"
          className={cn(
            'flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all duration-200 relative group',
            isHomeActive
              ? 'text-primary font-bold'
              : 'text-muted-foreground hover:text-foreground active:scale-95'
          )}
        >
          <div
            className={cn(
              'w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200',
              isHomeActive && 'bg-primary/15 shadow-sm shadow-primary/30 scale-105'
            )}
          >
            <LayoutDashboard className={cn('w-5 h-5', isHomeActive ? 'text-primary' : 'text-muted-foreground')} />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Home</span>
          {isHomeActive && (
            <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-primary shadow-sm shadow-primary" />
          )}
        </Link>

        {/* 2. Projects */}
        <Link
          href="/projects"
          className={cn(
            'flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all duration-200 relative group',
            isProjectsActive
              ? 'text-primary font-bold'
              : 'text-muted-foreground hover:text-foreground active:scale-95'
          )}
        >
          <div
            className={cn(
              'w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200',
              isProjectsActive && 'bg-primary/15 shadow-sm shadow-primary/30 scale-105'
            )}
          >
            <FolderOpen className={cn('w-5 h-5', isProjectsActive ? 'text-primary' : 'text-muted-foreground')} />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Projects</span>
          {isProjectsActive && (
            <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-primary shadow-sm shadow-primary" />
          )}
        </Link>

        {/* 3. Center '+' Action Button (In-Line Perfect Alignment) */}
        <button
          onClick={() => setQuickActionOpen(true)}
          aria-label="Quick Actions"
          className="flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all duration-200 relative group cursor-pointer active:scale-95"
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-md shadow-primary/30 transition-all duration-200 group-hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)' }}
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium text-muted-foreground group-hover:text-foreground">
            Add
          </span>
        </button>

        {/* 4. Analysis */}
        <Link
          href="/analysis"
          className={cn(
            'flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all duration-200 relative group',
            isAnalysisActive
              ? 'text-primary font-bold'
              : 'text-muted-foreground hover:text-foreground active:scale-95'
          )}
        >
          <div
            className={cn(
              'w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200',
              isAnalysisActive && 'bg-primary/15 shadow-sm shadow-primary/30 scale-105'
            )}
          >
            <BarChart2 className={cn('w-5 h-5', isAnalysisActive ? 'text-primary' : 'text-muted-foreground')} />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Analysis</span>
          {isAnalysisActive && (
            <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-primary shadow-sm shadow-primary" />
          )}
        </Link>

        {/* 5. Admin or User Settings */}
        {isAdmin ? (
          <Link
            href="/admin"
            className={cn(
              'flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all duration-200 relative group',
              isAdminActive
                ? 'text-primary font-bold'
                : 'text-muted-foreground hover:text-foreground active:scale-95'
            )}
          >
            <div
              className={cn(
                'w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200',
                isAdminActive && 'bg-primary/15 shadow-sm shadow-primary/30 scale-105'
              )}
            >
              <Shield className={cn('w-5 h-5', isAdminActive ? 'text-primary' : 'text-muted-foreground')} />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">Admin</span>
            {isAdminActive && (
              <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-primary shadow-sm shadow-primary" />
            )}
          </Link>
        ) : (
          <button
            onClick={() => setQuickActionOpen(true)}
            className="flex flex-col items-center justify-center py-1 px-0.5 rounded-xl text-muted-foreground hover:text-foreground active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">Profile</span>
          </button>
        )}
      </nav>

      {/* Quick Action Bottom Sheet Modal */}
      <Dialog open={quickActionOpen} onOpenChange={setQuickActionOpen}>
        <DialogContent
          className="w-[92vw] sm:max-w-md p-6 rounded-3xl shadow-2xl backdrop-blur-2xl border border-white/12 animate-fade-in"
          style={{ background: 'rgba(18, 20, 34, 0.96)' }}
        >
          <DialogHeader className="text-left">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-foreground text-lg font-bold">Quick Actions</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">What would you like to do?</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-2.5 pt-2">
            {/* Create New Project */}
            <button
              onClick={() => {
                setQuickActionOpen(false)
                setNewProjectOpen(true)
              }}
              className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-muted/40 hover:bg-muted/70 border border-border/60 transition-all duration-200 active:scale-[0.98] text-left group cursor-pointer"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-md shadow-primary/20 transition-transform group-hover:scale-105"
                style={{ background: 'var(--gradient-primary)' }}
              >
                <FolderPlus className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">New Project</p>
                <p className="text-xs text-muted-foreground">Start a new client or freelance project</p>
              </div>
            </button>

            {/* Jump to Projects for Entry */}
            <Link
              href="/projects"
              onClick={() => setQuickActionOpen(false)}
              className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-muted/40 hover:bg-muted/70 border border-border/60 transition-all duration-200 active:scale-[0.98] text-left group"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-md shadow-emerald-500/20 transition-transform group-hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #0d9488 100%)' }}
              >
                <Receipt className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">Log Expense & Time</p>
                <p className="text-xs text-muted-foreground">Select a project to add entries and receipts</p>
              </div>
            </Link>

            {/* Google Sheets Backup (if Admin) */}
            {isAdmin && (
              <Link
                href="/admin/backup"
                onClick={() => setQuickActionOpen(false)}
                className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-muted/40 hover:bg-muted/70 border border-border/60 transition-all duration-200 active:scale-[0.98] text-left group"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-md shadow-teal-500/20 transition-transform group-hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)' }}
                >
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">Google Sheets Backup</p>
                  <p className="text-xs text-muted-foreground">Trigger live database sync to Sheets</p>
                </div>
              </Link>
            )}

            {/* Sign Out Button */}
            <form action={signOut} className="pt-2">
              <Button
                type="submit"
                variant="ghost"
                className="w-full h-11 justify-center gap-2 text-destructive hover:bg-destructive/15 transition-all rounded-xl font-medium active:scale-95 cursor-pointer text-xs"
              >
                <LogOut className="w-4 h-4" /> Sign Out from ExpCal
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Direct Create Project Dialog */}
      <Dialog open={newProjectOpen} onOpenChange={setNewProjectOpen}>
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
                <DialogTitle className="text-foreground text-xl font-bold tracking-tight">New Project</DialogTitle>
                <DialogDescription className="text-muted-foreground/90 text-xs font-normal">
                  Create a new project to start tracking your finances.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleCreateProject} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="mobile-title" className="text-foreground text-xs font-medium">
                Project Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="mobile-title"
                name="title"
                placeholder="e.g. Website Redesign, Mobile App"
                required
                className="bg-muted/50 border-border/80 rounded-xl h-11 text-sm focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="mobile-desc" className="text-foreground text-xs font-medium">
                Description (optional)
              </Label>
              <Input
                id="mobile-desc"
                name="description"
                placeholder="Short description of this project"
                className="bg-muted/50 border-border/80 rounded-xl h-11 text-sm focus:border-primary"
              />
            </div>

            {projectError && (
              <div className="p-3 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-xs">
                {projectError}
              </div>
            )}

            <div className="flex gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setNewProjectOpen(false)}
                className="flex-1 rounded-xl h-11 text-xs font-semibold border-border/80"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="flex-1 rounded-xl h-11 text-xs font-semibold text-white transition-all duration-200"
                style={{ background: 'var(--gradient-primary)', border: 'none' }}
              >
                {isPending ? 'Creating...' : 'Create Project'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
