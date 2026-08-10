'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Entry } from '@/lib/types'
import { deleteEntry } from '@/lib/actions/entries'
import { EntryForm } from './entry-form'
import { formatDate, formatTime, formatCurrency, formatHours, calculateHours, totalExpenses } from '@/lib/utils'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { MoreVertical, Pencil, Trash2, Eye, Image as ImageIcon, Clock, Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface EntriesTableProps {
  entries: Entry[]
  projectId: string
  userId: string
}

export function EntriesTable({ entries, projectId, userId }: EntriesTableProps) {
  const [editEntry, setEditEntry] = useState<Entry | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [photoEntry, setPhotoEntry] = useState<Entry | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleDelete = () => {
    if (!deleteId) return
    startTransition(async () => {
      await deleteEntry(deleteId, projectId)
      setDeleteId(null)
      router.refresh()
    })
  }

  if (entries.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--gradient-hours)' }}>
          <Clock className="w-7 h-7 text-white" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-2">No entries yet</h3>
        <p className="text-muted-foreground text-sm mb-5">Add your first entry to start tracking.</p>
        <Button
          onClick={() => setAddOpen(true)}
          id="add-first-entry-btn"
          className="gap-2"
          style={{ background: 'var(--gradient-primary)', border: 'none' }}
        >
          <Plus className="w-4 h-4" /> Add First Entry
        </Button>
        <EntryForm
          projectId={projectId}
          userId={userId}
          open={addOpen}
          onOpenChange={setAddOpen}
          onSuccess={() => router.refresh()}
        />
      </div>
    )
  }

  return (
    <>
      {/* Mobile Card List (< sm screens) */}
      <div className="space-y-3 sm:hidden">
        {entries.map((entry) => {
          const hours = calculateHours(entry.start_time, entry.end_time)
          const expTotal = totalExpenses(entry.expenses)
          const net = Number(entry.income) - expTotal
          return (
            <div key={entry.id} className="glass-card p-4 space-y-3 relative">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{formatDate(entry.date)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {entry.start_time && entry.end_time
                      ? `${formatTime(entry.start_time)} – ${formatTime(entry.end_time)}`
                      : 'No time logged'
                    }
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {entry.photo_url && (
                    <button
                      onClick={() => setPhotoEntry(entry)}
                      className="w-10 h-10 sm:w-8 sm:h-8 rounded-lg overflow-hidden border border-border flex-shrink-0 relative"
                    >
                      <Image src={entry.photo_url} alt="receipt" width={40} height={40} unoptimized className="w-full h-full object-cover" />
                    </button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger className="w-10 h-10 sm:w-8 sm:h-8 rounded-lg inline-flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50">
                      <MoreVertical className="w-4 h-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" style={{ background: 'oklch(0.16 0.012 260)', border: '1px solid oklch(1 0 0 / 10%)' }}>
                      <DropdownMenuItem onClick={() => setEditEntry(entry)} className="gap-2 cursor-pointer">
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </DropdownMenuItem>
                      {entry.photo_url && (
                        <DropdownMenuItem onClick={() => setPhotoEntry(entry)} className="gap-2 cursor-pointer">
                          <Eye className="w-3.5 h-3.5" /> View Photo
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setDeleteId(entry.id)} className="gap-2 text-destructive cursor-pointer focus:text-destructive">
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/50 text-center">
                <div className="bg-muted/30 p-2 rounded-lg min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase truncate">Hours</p>
                  <p className="text-xs font-semibold text-foreground mt-0.5 truncate">{hours > 0 ? formatHours(hours) : '0h'}</p>
                </div>
                <div className="bg-muted/30 p-2 rounded-lg min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase truncate">Income</p>
                  <p className="text-xs font-semibold text-green-400 mt-0.5 truncate">{entry.income > 0 ? formatCurrency(Number(entry.income)) : '₹0'}</p>
                </div>
                <div className="bg-muted/30 p-2 rounded-lg min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase truncate">Expense</p>
                  <p className="text-xs font-semibold text-red-400 mt-0.5 truncate">{expTotal > 0 ? formatCurrency(expTotal) : '₹0'}</p>
                </div>
              </div>

              {entry.expenses?.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {entry.expenses.map((exp, i) => (
                    <Badge key={i} variant="outline" className="text-[10px] px-2 py-0.5">
                      {exp.category}: {formatCurrency(exp.amount || 0)}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-muted-foreground">Net Balance:</span>
                <span className={`text-sm font-bold ${net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(net)}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Desktop Table (>= sm screens) */}
      <div className="hidden sm:block glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="premium-table">
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Date</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Time</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Hours</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Income</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Expenses</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Net</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Photo</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => {
                const hours = calculateHours(entry.start_time, entry.end_time)
                const expTotal = totalExpenses(entry.expenses)
                const net = Number(entry.income) - expTotal
                return (
                  <TableRow key={entry.id} className="border-border">
                    <TableCell className="text-sm text-foreground font-medium">{formatDate(entry.date)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {entry.start_time && entry.end_time
                        ? `${formatTime(entry.start_time)} – ${formatTime(entry.end_time)}`
                        : '—'
                      }
                    </TableCell>
                    <TableCell>
                      {hours > 0 ? (
                        <Badge variant="secondary" className="text-xs">{formatHours(hours)}</Badge>
                      ) : '—'}
                    </TableCell>
                    <TableCell className="text-sm font-semibold" style={{ color: 'oklch(0.78 0.15 155)' }}>
                      {entry.income > 0 ? formatCurrency(Number(entry.income)) : '—'}
                    </TableCell>
                    <TableCell>
                      {expTotal > 0 ? (
                        <div>
                          <span className="text-sm font-semibold" style={{ color: 'oklch(0.65 0.24 25)' }}>
                            {formatCurrency(expTotal)}
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {entry.expenses.map((exp, i) => (
                              <Badge key={i} variant="outline" className="text-xs px-1.5 py-0">
                                {exp.category}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ) : '—'}
                    </TableCell>
                    <TableCell className={`text-sm font-bold ${net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCurrency(net)}
                    </TableCell>
                    <TableCell>
                      {entry.photo_url ? (
                        <button
                          onClick={() => setPhotoEntry(entry)}
                          className="w-8 h-8 rounded-lg overflow-hidden border border-border hover:border-primary transition-colors relative block"
                          id={`view-photo-${entry.id}`}
                        >
                          <Image src={entry.photo_url} alt="receipt" width={32} height={32} unoptimized className="w-full h-full object-cover" />
                        </button>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-muted/30 flex items-center justify-center">
                          <ImageIcon className="w-3.5 h-3.5 text-muted-foreground/40" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                          id={`entry-menu-${entry.id}`}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" style={{ background: 'oklch(0.16 0.012 260)', border: '1px solid oklch(1 0 0 / 10%)' }}>
                          <DropdownMenuItem onClick={() => setEditEntry(entry)} className="gap-2 cursor-pointer">
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </DropdownMenuItem>
                          {entry.photo_url && (
                            <DropdownMenuItem onClick={() => setPhotoEntry(entry)} className="gap-2 cursor-pointer">
                              <Eye className="w-3.5 h-3.5" /> View Photo
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setDeleteId(entry.id)} className="gap-2 text-destructive cursor-pointer focus:text-destructive">
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit Entry Form */}
      <EntryForm
        projectId={projectId}
        userId={userId}
        entry={editEntry}
        open={!!editEntry}
        onOpenChange={(o) => !o && setEditEntry(null)}
        onSuccess={() => router.refresh()}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent style={{ background: 'oklch(0.14 0.012 260)', border: '1px solid oklch(1 0 0 / 10%)' }}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isPending} className="bg-destructive hover:bg-destructive/90">
              {isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Photo Viewer */}
      <Dialog open={!!photoEntry} onOpenChange={(o) => !o && setPhotoEntry(null)}>
        <DialogContent className="max-w-lg" style={{ background: 'oklch(0.13 0.012 260)', border: '1px solid oklch(1 0 0 / 10%)' }}>
          <DialogHeader>
            <DialogTitle>Receipt Photo</DialogTitle>
          </DialogHeader>
          {photoEntry?.photo_url && (
            <div className="relative w-full aspect-video max-h-[70vh] rounded-xl overflow-hidden bg-black/40">
              <Image src={photoEntry.photo_url} alt="Receipt" fill unoptimized className="object-contain" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
