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
import { MoreVertical, Pencil, Trash2, Eye, Image as ImageIcon, Clock, Plus, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface EntriesTableProps {
  entries: Entry[]
  projectId: string
  userId: string
  pageSize?: number
}

export function EntriesTable({ entries, projectId, userId, pageSize = 25 }: EntriesTableProps) {
  const [editEntry, setEditEntry] = useState<Entry | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [photoEntry, setPhotoEntry] = useState<Entry | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const totalPages = Math.ceil(entries.length / pageSize) || 1
  const paginatedEntries = entries.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleDelete = () => {
    if (!deleteId) return
    startTransition(async () => {
      await deleteEntry(deleteId)
      setDeleteId(null)
      router.refresh()
    })
  }

  if (entries.length === 0) {
    return (
      <div className="card-elevated p-10 sm:p-12 text-center">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 bg-muted/60 border border-border/50 text-muted-foreground">
          <Clock className="w-6 h-6 text-primary" />
        </div>
        <h3 className="text-base font-bold text-foreground mb-1">No entries yet</h3>
        <p className="text-muted-foreground text-xs max-w-xs mx-auto mb-5 leading-relaxed">Log time, income, and itemized expenses to track this project.</p>
        <Button
          onClick={() => setAddOpen(true)}
          id="add-first-entry-btn"
          className="gap-2 text-xs font-semibold rounded-xl"
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
        {paginatedEntries.map((entry) => {
          const hours = calculateHours(entry.start_time, entry.end_time)
          const expTotal = totalExpenses(entry.expenses)
          const net = Number(entry.income) - expTotal
          const isExpanded = expandedId === entry.id
          const hasDetails = (entry.expenses && entry.expenses.length > 0) || !!entry.notes

          return (
            <div
              key={entry.id}
              className="card-elevated p-3.5 space-y-2.5 relative border border-border/70 transition-all duration-150"
            >
              {/* Header: Date + Net Balance Badge */}
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{formatDate(entry.date)}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {entry.start_time && entry.end_time
                      ? `${formatTime(entry.start_time)} – ${formatTime(entry.end_time)}`
                      : 'No time logged'
                    }
                  </p>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold font-mono ${
                    net > 0 ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25' :
                    net < 0 ? 'bg-red-500/15 text-red-400 border border-red-500/25' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {formatCurrency(net)}
                  </span>

                  {entry.photo_url && (
                    <button
                      onClick={() => setPhotoEntry(entry)}
                      className="w-8 h-8 rounded-lg overflow-hidden border border-border hover:border-primary transition-colors relative block"
                      aria-label="View receipt photo"
                    >
                      <Image src={entry.photo_url} alt="Receipt thumbnail" width={32} height={32} className="w-full h-full object-cover" />
                    </button>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                      aria-label="Entry actions menu"
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
                </div>
              </div>

              {/* Compact 3-Column Metrics */}
              <div className="grid grid-cols-3 gap-1.5 pt-1 text-center font-mono">
                <div className="bg-muted/20 border border-border/40 p-1.5 rounded-lg min-w-0">
                  <p className="text-[9px] text-muted-foreground uppercase font-sans tracking-wider">Hours</p>
                  <p className="text-xs font-semibold text-foreground mt-0.5 truncate">{hours > 0 ? formatHours(hours) : '0h'}</p>
                </div>
                <div className="bg-emerald-500/[0.04] border border-emerald-500/15 p-1.5 rounded-lg min-w-0">
                  <p className="text-[9px] text-emerald-400 uppercase font-sans tracking-wider">Income</p>
                  <p className="text-xs font-semibold text-emerald-400 mt-0.5 truncate">{entry.income > 0 ? formatCurrency(Number(entry.income)) : '₹0'}</p>
                </div>
                <div className="bg-red-500/[0.04] border border-red-500/15 p-1.5 rounded-lg min-w-0">
                  <p className="text-[9px] text-red-400 uppercase font-sans tracking-wider">Expense</p>
                  <p className="text-xs font-semibold text-red-400 mt-0.5 truncate">{expTotal > 0 ? formatCurrency(expTotal) : '₹0'}</p>
                </div>
              </div>

              {/* Expandable Section for Notes & Expense Breakdown */}
              {hasDetails && (
                <div className="pt-1">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                    className="w-full flex items-center justify-between text-[11px] font-medium text-muted-foreground hover:text-foreground py-1 px-1.5 rounded hover:bg-muted/30 transition-colors"
                    aria-label={isExpanded ? "Collapse entry details" : "Expand entry details"}
                  >
                    <span>{isExpanded ? 'Hide Details' : 'Show Details & Notes'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {isExpanded && (
                    <div className="space-y-2 pt-2 text-xs border-t border-border/40 mt-1">
                      {entry.expenses?.length > 0 && (
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Expense Breakdown:</p>
                          <div className="flex flex-wrap gap-1">
                            {entry.expenses.map((exp, i) => (
                              <Badge key={i} variant="outline" className="text-[10px] px-2 py-0.5 bg-muted/30">
                                {exp.category}: {formatCurrency(exp.amount || 0)}{exp.note ? ` (${exp.note})` : ''}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {entry.notes && (
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Notes:</p>
                          <p className="text-xs text-foreground/90 italic bg-muted/20 p-2 rounded-lg border border-border/30">{entry.notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Desktop Table (>= sm screens) */}
      <div className="hidden sm:block card-elevated overflow-hidden">
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
              {paginatedEntries.map((entry) => {
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
                        <Badge variant="secondary" className="text-xs font-mono">{formatHours(hours)}</Badge>
                      ) : '—'}
                    </TableCell>
                    <TableCell className="text-sm font-semibold font-mono text-emerald-400">
                      {entry.income > 0 ? formatCurrency(Number(entry.income)) : '—'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground font-mono">
                      {expTotal > 0 ? (
                        <div className="space-y-1">
                          <span className="font-semibold text-red-400">{formatCurrency(expTotal)}</span>
                          {entry.expenses?.length > 1 && (
                            <div className="flex flex-wrap gap-1">
                              {entry.expenses.map((exp, i) => (
                                <span key={i} className="text-[10px] text-muted-foreground/80 font-sans">
                                  {exp.category}: {formatCurrency(exp.amount || 0)}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : '—'}
                    </TableCell>
                    <TableCell className="text-sm font-bold font-mono">
                      <span className={net >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                        {formatCurrency(net)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {entry.photo_url ? (
                        <button
                          onClick={() => setPhotoEntry(entry)}
                          className="w-8 h-8 rounded-lg overflow-hidden border border-border hover:border-primary transition-colors relative block"
                          id={`view-photo-${entry.id}`}
                          aria-label="View receipt photo thumbnail"
                        >
                          <Image src={entry.photo_url} alt="Receipt thumbnail" width={32} height={32} className="w-full h-full object-cover" />
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
                          aria-label="Actions menu"
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 text-xs text-muted-foreground">
          <span>Showing {((currentPage - 1) * pageSize) + 1}–{Math.min(currentPage * pageSize, entries.length)} of {entries.length} entries</span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 px-2.5 text-xs"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
            </Button>
            <span className="px-2 font-medium text-foreground">{currentPage} / {totalPages}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-8 px-2.5 text-xs"
              aria-label="Next page"
            >
              Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}

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
        <DialogContent className="max-w-lg card-elevated border border-border/80">
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
