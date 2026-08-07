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
              label: 'Income',
              data: incomeData,
              borderColor: 'oklch(0.78 0.15 155)',
              backgroundColor: 'oklch(0.78 0.15 155 / 10%)',
              fill: true,
              tension: 0.4,
              pointRadius: 4,
              pointHoverRadius: 6,
              pointBackgroundColor: 'oklch(0.78 0.15 155)',
              borderWidth: 2,
            },
            {
              label: 'Expenses',
              data: expenseData,
              borderColor: 'oklch(0.65 0.24 25)',
              backgroundColor: 'oklch(0.65 0.24 25 / 10%)',
              fill: true,
              tension: 0.4,
              pointRadius: 4,
              pointHoverRadius: 6,
              pointBackgroundColor: 'oklch(0.65 0.24 25)',
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: {
              labels: {
                color: 'oklch(0.85 0.005 260)',
                font: { family: 'Inter', size: 12, weight: 500 },
                usePointStyle: true,
                pointStyle: 'circle',
                padding: 16
              }
            },
            tooltip: {
              backgroundColor: 'oklch(0.14 0.012 260 / 95%)',
              borderColor: 'oklch(1 0 0 / 14%)',
              borderWidth: 1,
              titleColor: 'oklch(0.98 0 0)',
              bodyColor: 'oklch(0.85 0.005 260)',
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
              grid: { color: 'oklch(1 0 0 / 6%)' },
              ticks: { color: 'oklch(0.65 0.01 260)', font: { size: 11, family: 'Inter' } }
            },
            y: {
              grid: { color: 'oklch(1 0 0 / 6%)' },
              ticks: {
                color: 'oklch(0.65 0.01 260)',
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
    <div className="glass-card p-6 shadow-xl backdrop-blur-2xl border border-white/10 rounded-3xl">
      <h3 className="text-sm font-semibold text-foreground/90 tracking-tight mb-4">Income vs Expenses (Last 14 entries)</h3>
      <div className="h-[220px] sm:h-[280px] relative">
        <canvas ref={canvasRef} />
      </div>
    </div>
  )
}
