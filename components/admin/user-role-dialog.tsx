'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateUserRole } from '@/lib/actions/users'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Shield, ShieldAlert, User, Check, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UserRoleDialogProps {
  userId: string
  userName: string
  currentRole: 'admin' | 'user'
  triggerVariant?: 'button' | 'badge'
}

export function UserRoleDialog({
  userId,
  userName,
  currentRole,
  triggerVariant = 'badge'
}: UserRoleDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<'admin' | 'user'>(currentRole)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleOpen = () => {
    setSelectedRole(currentRole)
    setError(null)
    setOpen(true)
  }

  const handleRoleChange = () => {
    if (selectedRole === currentRole) {
      setOpen(false)
      return
    }

    setError(null)
    startTransition(async () => {
      try {
        await updateUserRole(userId, selectedRole)
        setOpen(false)
        router.refresh()
      } catch (err: unknown) {
        const error = err as Error
        setError(error.message || 'Failed to update role')
      }
    })
  }

  return (
    <>
      {triggerVariant === 'badge' ? (
        <button
          onClick={handleOpen}
          title="Click to change role"
          className="group inline-flex items-center gap-1.5 focus:outline-none cursor-pointer"
        >
          <Badge
            variant={currentRole === 'admin' ? 'default' : 'secondary'}
            className="capitalize text-xs font-semibold gap-1 py-0.5 px-2.5 group-hover:ring-2 group-hover:ring-primary/40 transition-all"
            style={currentRole === 'admin' ? { background: 'var(--gradient-primary)', color: 'white' } : {}}
          >
            {currentRole === 'admin' ? <Shield className="w-3 h-3 text-white" /> : <User className="w-3 h-3 text-muted-foreground" />}
            {currentRole}
          </Badge>
          <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors hidden sm:inline">
            (Change)
          </span>
        </button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={handleOpen}
          className="rounded-xl h-9 text-xs font-semibold gap-1.5 border-border/80 hover:bg-muted/60"
        >
          <Shield className="w-3.5 h-3.5 text-primary" /> Change Role
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
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
                <ShieldAlert className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-foreground text-lg font-bold">Change User Role</DialogTitle>
                <DialogDescription className="text-muted-foreground text-xs">
                  Update system privileges for <strong className="text-foreground font-semibold">{userName}</strong>.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3 py-3">
            {/* Standard User Option */}
            <div
              onClick={() => setSelectedRole('user')}
              className={cn(
                'p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start gap-3.5',
                selectedRole === 'user'
                  ? 'bg-primary/10 border-primary shadow-sm shadow-primary/20'
                  : 'bg-muted/30 border-border/60 hover:bg-muted/50'
              )}
            >
              <div
                className={cn(
                  'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
                  selectedRole === 'user' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                )}
              >
                <User className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-foreground">Standard User</p>
                  {selectedRole === 'user' && <Check className="w-4 h-4 text-primary" />}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Can create and manage personal projects, expenses, income logs, and receipt photos.
                </p>
              </div>
            </div>

            {/* Administrator Option */}
            <div
              onClick={() => setSelectedRole('admin')}
              className={cn(
                'p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start gap-3.5',
                selectedRole === 'admin'
                  ? 'bg-primary/10 border-primary shadow-sm shadow-primary/20'
                  : 'bg-muted/30 border-border/60 hover:bg-muted/50'
              )}
            >
              <div
                className={cn(
                  'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white',
                  selectedRole === 'admin' ? 'shadow-md shadow-primary/30' : 'bg-muted text-muted-foreground'
                )}
                style={selectedRole === 'admin' ? { background: 'var(--gradient-primary)' } : {}}
              >
                <Shield className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    Administrator <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  </p>
                  {selectedRole === 'admin' && <Check className="w-4 h-4 text-primary" />}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Full system access: view/edit all users&apos; projects, entries, role management, and Google Sheets backups.
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-xs">
                {error}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-xl h-11 text-xs font-semibold border-border/80"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleRoleChange}
              disabled={isPending || selectedRole === currentRole}
              className="flex-1 rounded-xl h-11 text-xs font-semibold text-white"
              style={{ background: 'var(--gradient-primary)', border: 'none' }}
            >
              {isPending ? 'Updating...' : 'Save Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
