'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { EntryForm } from './entry-form'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface AddEntryButtonProps {
  projectId: string
  userId: string
  compact?: boolean
}

export function AddEntryButton({ projectId, userId, compact = false }: AddEntryButtonProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  return (
    <>
      <Button
        id={compact ? 'add-entry-compact-btn' : 'add-entry-btn'}
        onClick={() => setOpen(true)}
        size={compact ? 'sm' : 'default'}
        className="gap-2 font-semibold min-h-[36px]"
        style={{ background: 'var(--gradient-primary)', border: 'none' }}
      >
        <Plus className={compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        {compact ? 'Add' : 'Add Entry'}
      </Button>
      <EntryForm
        projectId={projectId}
        userId={userId}
        open={open}
        onOpenChange={setOpen}
        onSuccess={() => router.refresh()}
      />
    </>
  )
}
