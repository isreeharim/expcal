'use client'

import { Clock, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { formatCurrency, formatHours, cn } from '@/lib/utils'

interface StatCardProps {
  type: 'hours' | 'income' | 'expense' | 'cash'
  value: number
  label: string
  subLabel?: string
  className?: string
  animate?: boolean
}

const config = {
  hours: {
    icon: Clock,
    tone: 'bg-card border-border/70 text-foreground',
    iconTone: 'bg-muted text-muted-foreground',
    valueTone: 'text-foreground',
    format: (v: number) => formatHours(v),
  },
  income: {
    icon: TrendingUp,
    tone: 'bg-card border-emerald-500/20 text-foreground',
    iconTone: 'bg-emerald-500/10 text-emerald-400',
    valueTone: 'text-foreground',
    format: (v: number) => formatCurrency(v),
  },
  expense: {
    icon: TrendingDown,
    tone: 'bg-card border-red-500/20 text-foreground',
    iconTone: 'bg-red-500/10 text-red-400',
    valueTone: 'text-foreground',
    format: (v: number) => formatCurrency(v),
  },
  cash: {
    icon: DollarSign,
    tone: 'bg-primary/[0.08] border-primary/25 text-foreground shadow-sm shadow-primary/5',
    iconTone: 'bg-primary/15 text-primary',
    valueTone: 'text-foreground',
    format: (v: number) => formatCurrency(v),
  },
}

export function StatCard({ type, value, label, subLabel, className, animate = true }: StatCardProps) {
  const { icon: Icon, tone, iconTone, valueTone, format } = config[type]

  // Dynamic status for net cash
  const isCash = type === 'cash'
  const isPositiveCash = isCash && value > 0
  const isNegativeCash = isCash && value < 0

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border p-4 sm:p-5 transition-all duration-200 hover:border-border hover:bg-muted/20',
        tone,
        isCash && 'ring-1 ring-primary/20 bg-gradient-to-br from-primary/[0.08] to-primary/[0.02]',
        animate && 'animate-fade-in',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', iconTone)}>
          <Icon className="h-4 w-4" />
        </div>
        {isCash && (
          <span className={cn(
            'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase',
            isPositiveCash ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
            isNegativeCash ? 'bg-red-500/15 text-red-400 border border-red-500/20' :
            'bg-muted text-muted-foreground'
          )}>
            {isPositiveCash ? 'Profit' : isNegativeCash ? 'Deficit' : 'Balanced'}
          </span>
        )}
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className={cn(
          'mt-1.5 truncate text-xl font-extrabold tracking-tight sm:text-2xl font-mono',
          isCash && isPositiveCash ? 'text-emerald-400' :
          isCash && isNegativeCash ? 'text-red-400' :
          valueTone
        )}>
          {format(value)}
        </p>
        {subLabel && (
          <p className="mt-1 truncate text-[11px] text-muted-foreground/80 sm:text-xs">{subLabel}</p>
        )}
      </div>
    </div>
  )
}
