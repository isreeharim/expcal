'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'

interface DashboardChartProps {
  userId: string
  compact?: boolean
}

export function DashboardChart({ userId, compact = false }: DashboardChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let isMounted = true
    let chartInstance: import('chart.js').Chart | null = null

    async function loadChart() {
      const { Chart, registerables } = await import('chart.js')
      Chart.register(...registerables)

      const supabase = createClient()
      const { data: entries } = await supabase
        .from('entries')
        .select('date, income, expenses')
        .eq('user_id', userId)
        .order('date', { ascending: true })
        .limit(30)

      if (!isMounted || !entries || entries.length === 0) return

      // Group by date
      const grouped: Record<string, { income: number; expense: number }> = {}
      entries.forEach((e) => {
        if (!grouped[e.date]) grouped[e.date] = { income: 0, expense: 0 }
        grouped[e.date].income += Number(e.income) || 0
        const expArr = Array.isArray(e.expenses) ? e.expenses : []
        grouped[e.date].expense += expArr.reduce((sum: number, ex: { amount: number }) => sum + (Number(ex.amount) || 0), 0)
      })

      const labels = Object.keys(grouped).slice(-14)
      const incomeData = labels.map(d => grouped[d].income)
      const expenseData = labels.map(d => grouped[d].expense)

      const formatLabel = (d: string) => {
        const dt = new Date(d)
        return dt.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
      }

      if (!canvasRef.current || !isMounted) return

      const existingChart = Chart.getChart(canvasRef.current)
      if (existingChart) existingChart.destroy()

      chartInstance = new Chart(canvasRef.current, {
        type: 'line',
        data: {
          labels: labels.map(formatLabel),
          datasets: [
            {
              label: 'Gross Inflow',
              data: incomeData,
              borderColor: '#10b981',
              backgroundColor: compact ? 'rgba(16, 185, 129, 0.06)' : 'rgba(16, 185, 129, 0.10)',
              fill: true,
              tension: 0.4,
              pointRadius: compact ? 0 : 3,
              pointHoverRadius: compact ? 0 : 5,
              pointBackgroundColor: '#10b981',
              borderWidth: compact ? 1.5 : 2,
            },
            {
              label: 'Total Outflow',
              data: expenseData,
              borderColor: '#f43f5e',
              backgroundColor: compact ? 'rgba(244, 63, 94, 0.04)' : 'rgba(244, 63, 94, 0.06)',
              fill: true,
              tension: 0.4,
              pointRadius: compact ? 0 : 3,
              pointHoverRadius: compact ? 0 : 5,
              pointBackgroundColor: '#f43f5e',
              borderWidth: compact ? 1.5 : 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: { display: false },
            tooltip: compact ? { enabled: false } : {
              backgroundColor: 'rgba(18, 22, 34, 0.96)',
              borderColor: 'rgba(255, 255, 255, 0.10)',
              borderWidth: 1,
              titleColor: '#ffffff',
              bodyColor: '#cbd5e1',
              padding: 10,
              boxPadding: 5,
              cornerRadius: 10,
              callbacks: {
                label: (ctx) => ` ${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y ?? 0)}`
              }
            }
          },
          scales: compact ? {
            x: { display: false },
            y: { display: false },
          } : {
            x: {
              grid: { color: 'rgba(255, 255, 255, 0.04)' },
              ticks: { color: '#64748b', font: { size: 11, family: 'Inter' } }
            },
            y: {
              grid: { color: 'rgba(255, 255, 255, 0.04)' },
              ticks: {
                color: '#64748b',
                font: { size: 11, family: 'Inter' },
                callback: (v) => `₹${Number(v ?? 0).toLocaleString('en-IN')}`
              }
            }
          }
        }
      })
    }

    loadChart()
    return () => {
      isMounted = false
      if (chartInstance) chartInstance.destroy()
    }
  }, [userId, compact])

  if (compact) {
    return (
      <div className="w-full h-full relative">
        <canvas ref={canvasRef} />
      </div>
    )
  }

  return (
    <div className="card-elevated p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-bold text-foreground tracking-tight">Cash Flow Trends</h3>
          <p className="text-xs text-muted-foreground/70">Income vs Expenses over recent entries</p>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Inflow
          </span>
          <span className="flex items-center gap-1.5 text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-400"></span> Outflow
          </span>
        </div>
      </div>
      <div className="h-[200px] sm:h-[260px] relative">
        <canvas ref={canvasRef} />
      </div>
    </div>
  )
}
