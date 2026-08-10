'use client'

import { useEffect, useRef } from 'react'
import { Entry } from '@/lib/types'
import { formatCurrency, totalExpenses } from '@/lib/utils'

interface ProjectChartProps {
  entries: Entry[]
}

export function ProjectChart({ entries }: ProjectChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let isMounted = true
    let chart: import('chart.js').Chart | null = null

    async function init() {
      const { Chart, registerables } = await import('chart.js')
      Chart.register(...registerables)

      if (!isMounted) return

      // Sort entries by date
      const sorted = [...entries]
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-14)

      const labels = sorted.map(e => {
        const d = new Date(e.date)
        return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
      })
      const incomeData = sorted.map(e => Number(e.income))
      const expenseData = sorted.map(e => totalExpenses(e.expenses))
      const netData = sorted.map((e, i) => incomeData[i] - expenseData[i])

      if (!canvasRef.current || !isMounted) return

      const existingChart = Chart.getChart(canvasRef.current)
      if (existingChart) existingChart.destroy()

      chart = new Chart(canvasRef.current, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Gross Inflow',
              data: incomeData,
              backgroundColor: 'rgba(16, 185, 129, 0.75)',
              borderColor: '#10b981',
              borderWidth: 1,
              borderRadius: 6,
            },
            {
              label: 'Total Outflow',
              data: expenseData,
              backgroundColor: 'rgba(244, 63, 94, 0.75)',
              borderColor: '#f43f5e',
              borderWidth: 1,
              borderRadius: 6,
            },
            {
              label: 'Net Margin',
              data: netData,
              type: 'line',
              borderColor: '#6366f1',
              backgroundColor: 'transparent',
              tension: 0.35,
              pointRadius: 4,
              borderWidth: 2.5,
              yAxisID: 'y',
            }
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: {
              labels: {
                color: '#94a3b8',
                font: { family: 'Inter', size: 11, weight: 600 },
                usePointStyle: true,
                pointStyle: 'circle',
                padding: 14
              }
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
              callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y ?? 0)}` }
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

    init()
    return () => {
      isMounted = false
      if (chart) chart.destroy()
    }
  }, [entries])

  return (
    <div className="glass-card p-5 overflow-hidden border border-white/10 rounded-3xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-foreground tracking-tight">Financial Breakdown</h3>
          <p className="text-xs text-muted-foreground">Inflow vs Outflow vs Net Margin</p>
        </div>
      </div>
      <div className="h-[220px] sm:h-[260px] relative w-full min-w-0">
        <canvas ref={canvasRef} />
      </div>
    </div>
  )
}
