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
              label: 'Income',
              data: incomeData,
              backgroundColor: 'oklch(0.78 0.15 155 / 70%)',
              borderColor: 'oklch(0.78 0.15 155)',
              borderWidth: 1,
              borderRadius: 6,
            },
            {
              label: 'Expenses',
              data: expenseData,
              backgroundColor: 'oklch(0.65 0.24 25 / 70%)',
              borderColor: 'oklch(0.65 0.24 25)',
              borderWidth: 1,
              borderRadius: 6,
            },
            {
              label: 'Net',
              data: netData,
              type: 'line',
              borderColor: 'oklch(0.65 0.22 280)',
              backgroundColor: 'transparent',
              tension: 0.4,
              pointRadius: 4,
              borderWidth: 2,
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
              labels: { color: 'oklch(0.75 0.01 260)', font: { family: 'Inter', size: 12 } }
            },
            tooltip: {
              backgroundColor: 'oklch(0.16 0.012 260)',
              borderColor: 'oklch(1 0 0 / 10%)',
              borderWidth: 1,
              titleColor: 'oklch(0.95 0.005 260)',
              bodyColor: 'oklch(0.75 0.01 260)',
              callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y ?? 0)}` }
            }
          },
          scales: {
            x: { grid: { color: 'oklch(1 0 0 / 5%)' }, ticks: { color: 'oklch(0.6 0.01 260)', font: { size: 11 } } },
            y: {
              grid: { color: 'oklch(1 0 0 / 5%)' },
              ticks: { color: 'oklch(0.6 0.01 260)', font: { size: 11 }, callback: (v) => `₹${Number(v ?? 0).toLocaleString('en-IN')}` }
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
    <div className="glass-card p-4 sm:p-5 overflow-hidden">
      <h3 className="text-sm font-semibold text-foreground mb-4">Project Analysis</h3>
      <div className="h-[220px] sm:h-[260px] relative w-full min-w-0">
        <canvas ref={canvasRef} />
      </div>
    </div>
  )
}
