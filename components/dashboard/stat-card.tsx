'use client'

import { Clock, TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react'
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
    badge: 'Allocation',
    badgeTone: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
    tone: 'bg-card/90 border-border/70 text-foreground',
    iconTone: 'bg-slate-800/80 text-slate-300 border border-slate-700/50',
    valueTone: 'text-foreground',
    format: (v: number) => formatHours(v),
  },
  income: {
    icon: TrendingUp,
    badge: '+ Inflow',
    badgeTone: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    tone: 'bg-card/90 border-emerald-500/20 text-foreground hover:border-emerald-500/35',
    iconTone: 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30',
    valueTone: 'text-emerald-400',
    format: (v: number) => formatCurrency(v),
  },
  expense: {
    icon: TrendingDown,
    badge: '- Outflow',
    badgeTone: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    tone: 'bg-card/90 border-rose-500/20 text-foreground hover:border-rose-500/35',
    iconTone: 'bg-rose-950/60 text-rose-400 border border-rose-500/30',
    valueTone: 'text-rose-400',
    format: (v: number) => formatCurrency(v),
  },
  cash: {
    icon: Wallet,
    badge: 'Net Capital',
    badgeTone: 'bg-primary/15 text-primary-foreground border border-primary/30',
    tone: 'fintech-card-hero text-foreground',
    iconTone: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm shadow-emerald-500/20',
    valueTone: 'text-foreground',
    format: (v: number) => formatCurrency(v),
  },
}

export function StatCard({ type, value, label, subLabel, className, animate = true }: StatCardProps) {
  const { icon: Icon, badge, badgeTone, tone, iconTone, valueTone, format } = config[type]

  // Dynamic status for net cash
  const isCash = type === 'cash'
  const isPositiveCash = isCash && value > 0
  const isNegativeCash = isCash && value < 0

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border p-4 sm:p-5 transition-all duration-200 hover:translate-y-[-2px]',
        tone,
        animate && 'animate-fade-in',
        className
      )}
    >
      {/* Top Row: Metric Icon & Status Pill */}
      <div className="flex items-center justify-between gap-3">
        <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', iconTone)}>
          <Icon className="h-4 w-4" />
        </div>

        {isCash ? (
          <span className={cn(
            'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase font-mono',
            isPositiveCash ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10' :
            isNegativeCash ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' :
            'bg-muted/80 text-muted-foreground border border-border/50'
          )}>
            {isPositiveCash ? <><ArrowUpRight className="w-3 h-3" /> Profit</> :
             isNegativeCash ? <><ArrowDownRight className="w-3 h-3" /> Deficit</> :
             'Balanced'}
          </span>
        ) : (
          <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wider uppercase', badgeTone)}>
            {badge}
          </span>
        )}
      </div>

      {/* Value & Label */}
      <div className="mt-4">
        <p className="text-[11px] font-bold text-muted-foreground/90 uppercase tracking-widest">{label}</p>
        <p className={cn(
          'mt-1.5 truncate text-xl font-extrabold tracking-tight sm:text-2xl font-mono tabular-nums',
          isCash && isPositiveCash ? 'text-emerald-400' :
          isCash && isNegativeCash ? 'text-rose-400' :
          valueTone
        )}>
          {format(value)}
        </p>
        {subLabel && (
          <p className="mt-1 truncate text-[11px] text-muted-foreground/75 font-sans sm:text-xs">{subLabel}</p>
        )}
      </div>
    </div>
  )
}
