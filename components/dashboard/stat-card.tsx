'use client'

import { Clock, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { formatCurrency, formatHours } from '@/lib/utils'
import { cn } from '@/lib/utils'

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
    gradient: 'var(--gradient-hours)',
    format: (v: number) => formatHours(v),
  },
  income: {
    icon: TrendingUp,
    gradient: 'var(--gradient-income)',
    format: (v: number) => formatCurrency(v),
  },
  expense: {
    icon: TrendingDown,
    gradient: 'var(--gradient-expense)',
    format: (v: number) => formatCurrency(v),
  },
  cash: {
    icon: DollarSign,
    gradient: 'var(--gradient-cash)',
    format: (v: number) => formatCurrency(v),
  },
}

export function StatCard({ type, value, label, subLabel, className, animate = true }: StatCardProps) {
  const { icon: Icon, gradient, format } = config[type]

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl sm:rounded-2xl p-3.5 sm:p-5 text-white shadow-lg transition-all duration-300 group cursor-default hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/20 active:scale-[0.98]',
        animate && 'animate-fade-in',
        className
      )}
      style={{ background: gradient }}
    >
      {/* Glass shimmer overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Subtle background decoration */}
      <div className="absolute -right-3 -top-3 w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-white/10 blur-sm pointer-events-none" />
      <div className="absolute -right-2 -bottom-4 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/5 blur-sm pointer-events-none" />

      <div className="relative z-10 flex flex-col justify-between h-full">
        <div className="flex items-center justify-between mb-2 sm:mb-4">
          <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner transition-transform duration-300 group-hover:scale-110 group-hover:bg-white/25">
            <Icon className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white" />
          </div>
        </div>

        <div>
          <p className="text-white/90 text-[11px] sm:text-sm font-medium leading-tight mb-0.5 sm:mb-1 tracking-wide">{label}</p>
          <p className="text-base sm:text-2xl font-extrabold text-white tracking-tight leading-tight truncate drop-shadow-sm">
            {format(value)}
          </p>
          {subLabel && (
            <p className="text-white/70 text-[10px] sm:text-xs font-normal mt-0.5 sm:mt-1 truncate hidden xs:block">{subLabel}</p>
          )}
        </div>
      </div>
    </div>
  )
}
