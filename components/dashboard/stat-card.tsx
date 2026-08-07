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
    iconBg: 'rgba(99, 102, 241, 0.3)',
  },
  income: {
    icon: TrendingUp,
    gradient: 'var(--gradient-income)',
    format: (v: number) => formatCurrency(v),
    iconBg: 'rgba(34, 197, 94, 0.3)',
  },
  expense: {
    icon: TrendingDown,
    gradient: 'var(--gradient-expense)',
    format: (v: number) => formatCurrency(v),
    iconBg: 'rgba(239, 68, 68, 0.3)',
  },
  cash: {
    icon: DollarSign,
    gradient: 'var(--gradient-cash)',
    format: (v: number) => formatCurrency(v),
    iconBg: 'rgba(234, 179, 8, 0.3)',
  },
}

export function StatCard({ type, value, label, subLabel, className, animate = true }: StatCardProps) {
  const { icon: Icon, gradient, format } = config[type]

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl p-4 sm:p-5 text-white shadow-lg transition-transform duration-200 hover:scale-[1.01]',
        animate && 'animate-fade-in',
        className
      )}
      style={{ background: gradient }}
    >
      {/* Background decoration */}
      <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
      <div className="absolute -right-2 -bottom-6 w-16 h-16 rounded-full bg-white/5" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
        </div>

        <div>
          <p className="text-white/70 text-xs sm:text-sm font-medium mb-0.5 sm:mb-1">{label}</p>
          <p className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {format(value)}
          </p>
          {subLabel && (
            <p className="text-white/60 text-[11px] sm:text-xs mt-0.5 sm:mt-1 truncate">{subLabel}</p>
          )}
        </div>
      </div>
    </div>
  )
}
