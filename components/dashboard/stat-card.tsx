'use client'

import { Clock, TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { formatCurrency, formatHours, cn } from '@/lib/utils'

interface StatCardProps {
  type: 'hours' | 'income' | 'expense' | 'cash'
  value: number
  label: string
  subLabel?: string
  className?: string
  compact?: boolean
}

const config = {
  hours: {
    icon: Clock,
    accentColor: '#64748b',
    iconBg: 'bg-slate-800/60',
    iconColor: 'text-slate-300',
    valueTone: 'text-foreground',
    format: (v: number) => formatHours(v),
  },
  income: {
    icon: TrendingUp,
    accentColor: '#10b981',
    iconBg: 'bg-emerald-950/50',
    iconColor: 'text-emerald-400',
    valueTone: 'text-emerald-400',
    format: (v: number) => formatCurrency(v),
  },
  expense: {
    icon: TrendingDown,
    accentColor: '#f43f5e',
    iconBg: 'bg-rose-950/50',
    iconColor: 'text-rose-400',
    valueTone: 'text-rose-400',
    format: (v: number) => formatCurrency(v),
  },
  cash: {
    icon: Wallet,
    accentColor: '#10b981',
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-300',
    valueTone: 'text-foreground',
    format: (v: number) => formatCurrency(v),
  },
}

export function StatCard({ type, value, label, subLabel, className, compact = false }: StatCardProps) {
  const { icon: Icon, accentColor, iconBg, iconColor, valueTone, format } = config[type]

  const isCash = type === 'cash'
  const isPositiveCash = isCash && value > 0
  const isNegativeCash = isCash && value < 0

  // Dynamic accent color for cash
  const effectiveAccent = isCash
    ? isNegativeCash ? '#f43f5e' : '#10b981'
    : accentColor

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border bg-card/90 transition-all duration-200',
        compact ? 'p-3 sm:p-4' : 'p-4 sm:p-5',
        isCash
          ? 'border-emerald-500/15 hover:border-emerald-500/25'
          : 'border-border/60 hover:border-border',
        className
      )}
    >
      {/* Left accent stripe */}
      <div
        className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full"
        style={{ background: effectiveAccent, opacity: 0.6 }}
      />

      {/* Header: Icon + Status */}
      <div className="flex items-center justify-between gap-2 pl-2">
        <div className={cn(
          'flex items-center justify-center rounded-lg border border-border/40',
          compact ? 'h-7 w-7' : 'h-8 w-8',
          iconBg,
        )}>
          <Icon className={cn(compact ? 'h-3.5 w-3.5' : 'h-4 w-4', iconColor)} />
        </div>

        {isCash && (
          <span className={cn(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase tabular-nums',
            isPositiveCash
              ? 'bg-emerald-500/12 text-emerald-400 border border-emerald-500/25'
              : isNegativeCash
              ? 'bg-rose-500/12 text-rose-400 border border-rose-500/25'
              : 'bg-muted/60 text-muted-foreground border border-border/50'
          )}>
            {isPositiveCash ? <><ArrowUpRight className="w-3 h-3" /> Profit</> :
             isNegativeCash ? <><ArrowDownRight className="w-3 h-3" /> Deficit</> :
             'Balanced'}
          </span>
        )}
      </div>

      {/* Label + Value */}
      <div className={cn('pl-2', compact ? 'mt-2.5' : 'mt-3.5')}>
        <p className="text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-widest">
          {label}
        </p>
        <p className={cn(
          'mt-1 truncate stat-value tabular-nums',
          compact ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl',
          isCash && isPositiveCash ? 'text-emerald-400' :
          isCash && isNegativeCash ? 'text-rose-400' :
          valueTone
        )}>
          {format(value)}
        </p>
        {subLabel && !compact && (
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground/60 sm:text-xs">
            {subLabel}
          </p>
        )}
      </div>
    </div>
  )
}
