'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'

interface DashboardChartProps {
  userId: string
}

export function DashboardChart({ userId }: DashboardChartProps) {
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
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              fill: true,
              tension: 0.35,
              pointRadius: 4,
              pointHoverRadius: 6,
              pointBackgroundColor: '#10b981',
              borderWidth: 2.5,
            },
            {
              label: 'Total Outflow',
              data: expenseData,
              borderColor: '#f43f5e',
              backgroundColor: 'rgba(244, 63, 94, 0.08)',
              fill: true,
              tension: 0.35,
              pointRadius: 4,
              pointHoverRadius: 6,
              pointBackgroundColor: '#f43f5e',
              borderWidth: 2.5,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              backgroundColor: 'rgba(18, 22, 34, 0.96)',
              borderColor: 'rgba(255, 255, 255, 0.12)',
              borderWidth: 1,
              titleColor: '#ffffff',
              bodyColor: '#cbd5e1',
              padding: 12,
              boxPadding: 6,
              cornerRadius: 12,
              callbacks: {
                label: (ctx) => ` ${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y ?? 0)}`
              }
            }
          },
          scales: {
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
  }, [userId])

  return (
    <div className="glass-card p-6 border border-white/10 rounded-3xl">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-bold text-foreground tracking-tight">Cash Flow Dynamics</h3>
          <p className="text-xs text-muted-foreground">Inflow vs Outflow over recent transaction timeline</p>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50"></span> Inflow
          </span>
          <span className="flex items-center gap-1.5 text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-400 shadow-sm shadow-rose-400/50"></span> Outflow
          </span>
        </div>
      </div>
      <div className="h-[220px] sm:h-[280px] relative">
        <canvas ref={canvasRef} />
      </div>
    </div>
  )
}
