'use client'

import { useState, useTransition, useRef } from 'react'
import { createEntry, updateEntry } from '@/lib/actions/entries'
import { Entry, ExpenseCategory, EXPENSE_CATEGORIES } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Plus, Trash2, Upload, X, Camera, DollarSign, Clock, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface EntryFormProps {
  projectId: string
  userId: string
  entry?: Entry | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const emptyExpense = (): ExpenseCategory => ({ category: 'Food', amount: 0, note: '' })

export function EntryForm({ projectId, userId, entry, open, onOpenChange, onSuccess }: EntryFormProps) {
  const isEditing = !!entry
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [expenses, setExpenses] = useState<ExpenseCategory[]>(
    entry?.expenses?.length ? entry.expenses : [emptyExpense()]
  )
  const [photoUrl, setPhotoUrl] = useState<string>(entry?.photo_url || '')
  const [uploading, setUploading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string>(entry?.photo_url || '')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const today = new Date().toISOString().split('T')[0]

  const addExpense = () => setExpenses(prev => [...prev, emptyExpense()])
  const removeExpense = (i: number) => setExpenses(prev => prev.filter((_, idx) => idx !== i))
  const updateExpense = (i: number, field: keyof ExpenseCategory, value: string | number) => {
    setExpenses(prev => prev.map((e, idx) => idx === i ? { ...e, [field]: field === 'amount' ? Number(value) : value } : e))
  }

  const handlePhotoUpload = async (file: File) => {
    setUploading(true)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const path = `${userId}/${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('entry-photos').upload(path, file)
      if (error) throw error
      const { data } = supabase.storage.from('entry-photos').getPublicUrl(path)
      setPhotoUrl(data.publicUrl)
      setPhotoPreview(data.publicUrl)
    } catch {
      setError('Failed to upload photo')
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    // Show preview immediately
    const reader = new FileReader()
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
    handlePhotoUpload(file)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const form = e.currentTarget
    const formData = new FormData(form)
    formData.set('project_id', projectId)
    formData.set('expenses', JSON.stringify(expenses))
    formData.set('photo_url', photoUrl)

    startTransition(async () => {
      try {
        if (isEditing && entry) {
          await updateEntry(entry.id, formData)
        } else {
          await createEntry(formData)
        }
        onOpenChange(false)
        onSuccess?.()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save entry')
      }
    })
  }

  const totalExpense = expenses.reduce((s, e) => s + (e.amount || 0), 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        style={{ background: 'oklch(0.13 0.012 260)', border: '1px solid oklch(1 0 0 / 10%)' }}
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: isEditing ? 'var(--gradient-hours)' : 'var(--gradient-primary)' }}>
              {isEditing ? <Clock className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
            </div>
            <div>
              <DialogTitle className="text-foreground">{isEditing ? 'Edit Entry' : 'Add New Entry'}</DialogTitle>
              <DialogDescription>{isEditing ? 'Update entry details' : 'Record time, income and expenses'}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-2">
          {/* Date & Time row */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" /> Date & Time
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="date-input" className="text-xs text-muted-foreground">Date *</Label>
                <Input
                  id="date-input"
                  name="date"
                  type="date"
                  defaultValue={entry?.date || today}
                  className="bg-muted/50 h-10"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="start-time" className="text-xs text-muted-foreground">Start Time</Label>
                <Input
                  id="start-time"
                  name="start_time"
                  type="time"
                  defaultValue={entry?.start_time || ''}
                  className="bg-muted/50 h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="end-time" className="text-xs text-muted-foreground">End Time</Label>
                <Input
                  id="end-time"
                  name="end_time"
                  type="time"
                  defaultValue={entry?.end_time || ''}
                  className="bg-muted/50 h-10"
                />
              </div>
            </div>
          </div>

          <Separator className="opacity-30" />

          {/* Income */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-400" /> Income
            </h4>
            <div className="space-y-1.5">
              <Label htmlFor="income-input" className="text-xs text-muted-foreground">Amount (₹)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                <Input
                  id="income-input"
                  name="income"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  defaultValue={entry?.income ?? ''}
                  className="pl-8 bg-muted/50 h-10"
                />
              </div>
            </div>
          </div>

          <Separator className="opacity-30" />

          {/* Expenses */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                </span>
                Expenses
                {totalExpense > 0 && (
                  <span className="text-xs text-muted-foreground font-normal">— ₹{totalExpense.toLocaleString('en-IN')}</span>
                )}
              </h4>
              <Button type="button" variant="outline" size="sm" onClick={addExpense} className="gap-1.5 text-xs h-7">
                <Plus className="w-3 h-3" /> Add
              </Button>
            </div>

            <div className="space-y-3">
              {expenses.map((expense, i) => (
                <div key={i} className="p-3 sm:p-0 rounded-xl bg-muted/20 sm:bg-transparent border sm:border-0 border-border/50 grid grid-cols-12 gap-2 items-center">
                  {/* Category */}
                  <div className="col-span-6 sm:col-span-4">
                    <Select
                      value={expense.category}
                      onValueChange={v => updateExpense(i, 'category', v ?? 'Food')}
                    >
                      <SelectTrigger className="bg-muted/50 h-10 text-sm" id={`expense-cat-${i}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent style={{ background: 'oklch(0.16 0.012 260)' }}>
                        {EXPENSE_CATEGORIES.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Amount */}
                  <div className="col-span-4 sm:col-span-3">
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">₹</span>
                      <Input
                        id={`expense-amount-${i}`}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0"
                        value={expense.amount || ''}
                        onChange={e => updateExpense(i, 'amount', e.target.value)}
                        className="pl-7 bg-muted/50 h-10 text-sm"
                      />
                    </div>
                  </div>
                  {/* Remove - on mobile placed next to amount */}
                  <div className="col-span-2 sm:col-span-1 flex items-center justify-end sm:justify-center">
                    <button
                      type="button"
                      onClick={() => removeExpense(i)}
                      disabled={expenses.length === 1}
                      className={cn(
                        'w-9 h-9 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-colors',
                        expenses.length === 1
                          ? 'text-muted-foreground/30 cursor-not-allowed'
                          : 'text-muted-foreground hover:text-destructive hover:bg-destructive/10'
                      )}
                    >
                      <Trash2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                    </button>
                  </div>
                  {/* Note - full width on mobile */}
                  <div className="col-span-12 sm:col-span-4">
                    <Input
                      id={`expense-note-${i}`}
                      placeholder="Note (optional)"
                      value={expense.note || ''}
                      onChange={e => updateExpense(i, 'note', e.target.value)}
                      className="bg-muted/50 h-10 text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator className="opacity-30" />

          {/* Photo Upload */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Camera className="w-4 h-4 text-primary" /> Photo Receipt
            </h4>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              id="photo-upload"
            />

            {photoPreview ? (
              <div className="relative inline-block">
                <img
                  src={photoPreview}
                  alt="Receipt preview"
                  className="w-32 h-32 object-cover rounded-xl border border-border"
                />
                <button
                  type="button"
                  onClick={() => { setPhotoUrl(''); setPhotoPreview('') }}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive flex items-center justify-center text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-xl text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                {uploading ? (
                  <span className="flex items-center gap-2 text-sm">
                    <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    Uploading...
                  </span>
                ) : (
                  <>
                    <Upload className="w-6 h-6 mb-2" />
                    <span className="text-sm">Click to upload photo</span>
                    <span className="text-xs mt-0.5">JPG, PNG, WEBP up to 10MB</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes-input" className="text-sm font-medium text-foreground">Notes</Label>
            <textarea
              id="notes-input"
              name="notes"
              placeholder="Add any notes about this entry..."
              defaultValue={entry?.notes || ''}
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border text-foreground text-sm resize-none focus:outline-none focus:border-primary placeholder:text-muted-foreground transition-colors"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1" disabled={isPending}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 font-semibold"
              disabled={isPending || uploading}
              style={{ background: 'var(--gradient-primary)', border: 'none' }}
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                isEditing ? 'Save Changes' : 'Add Entry'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
