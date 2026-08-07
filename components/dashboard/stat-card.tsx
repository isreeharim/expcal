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
        'relative overflow-hidden rounded-xl sm:rounded-2xl p-3 sm:p-5 text-white shadow-md transition-all duration-200 active:scale-95 sm:hover:scale-[1.01]',
        animate && 'animate-fade-in',
        className
      )}
      style={{ background: gradient }}
    >
      {/* Subtle background decoration */}
      <div className="absolute -right-3 -top-3 w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-white/10" />
      <div className="absolute -right-2 -bottom-4 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/5" />

      <div className="relative z-10 flex flex-col justify-between h-full">
        <div className="flex items-center justify-between mb-2 sm:mb-4">
          <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/20 flex items-center justify-center">
            <Icon className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white" />
          </div>
        </div>

        <div>
          <p className="text-white/80 text-[11px] sm:text-sm font-medium leading-tight mb-0.5 sm:mb-1">{label}</p>
          <p className="text-base sm:text-2xl font-extrabold text-white tracking-tight leading-tight truncate">
            {format(value)}
          </p>
          {subLabel && (
            <p className="text-white/60 text-[10px] sm:text-xs mt-0.5 sm:mt-1 truncate hidden xs:block">{subLabel}</p>
          )}
        </div>
      </div>
    </div>
  )
}
