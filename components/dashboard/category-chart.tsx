'use client'

import { useEffect, useRef } from 'react'
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js'
import { PieChart } from 'lucide-react'
import { cn } from '@/lib/utils'

Chart.register(ArcElement, Tooltip, Legend)

interface CategoryChartProps {
  data: Array<{ category: string; total: number; percentage: number }>
  className?: string
}

const CATEGORY_COLORS: Record<string, string> = {
  Food: '#f97316',
  Water: '#06b6d4',
  Transport: '#8b5cf6',
  Accommodation: '#ec4899',
  Equipment: '#6366f1',
  Entertainment: '#f59e0b',
  Medical: '#ef4444',
  Shopping: '#10b981',
  Utilities: '#64748b',
  Other: '#94a3b8',
}

export function CategoryChart({ data, className }: CategoryChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart | null>(null)

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return

    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return

    if (chartRef.current) {
      chartRef.current.destroy()
    }

    const labels = data.map((d) => d.category)
    const values = data.map((d) => d.total)
    const backgroundColor = data.map(
      (d) => CATEGORY_COLORS[d.category] || CATEGORY_COLORS.Other
    )

    chartRef.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor,
            borderWidth: 0,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        cutout: '65%',
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            padding: 10,
            cornerRadius: 4,
            callbacks: {
              label: (context) => {
                const value = context.raw as number
                return ` ${new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  maximumFractionDigits: 0,
                }).format(value)}`
              },
            },
          },
        },
      },
    })

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy()
        chartRef.current = null
      }
    }
  }, [data])

  if (data.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center p-8 text-muted-foreground', className)}>
        <PieChart className="h-8 w-8 mb-2 opacity-50" />
        <p className="text-sm">No expense data</p>
      </div>
    )
  }

  return (
    <div className={cn('w-full', className)}>
      <div className="relative mx-auto w-full max-w-[200px] aspect-square mb-6">
        <canvas ref={canvasRef} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        {data.map((item) => (
          <div key={item.category} className="flex items-center gap-2">
            <div
              className="h-2 w-2 rounded-full shrink-0"
              style={{
                backgroundColor: CATEGORY_COLORS[item.category] || CATEGORY_COLORS.Other,
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="truncate text-foreground font-medium">{item.category}</p>
              <div className="flex items-center justify-between gap-1 text-muted-foreground">
                <span className="tabular-nums">
                  {new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    maximumFractionDigits: 0,
                  }).format(item.total)}
                </span>
                <span className="tabular-nums">{item.percentage.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
