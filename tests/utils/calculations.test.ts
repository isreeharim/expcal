import { describe, it, expect } from 'vitest'
import { calculateHours, totalExpenses, formatCurrency, formatHours } from '@/lib/utils'

describe('Time Calculations (calculateHours)', () => {
  it('calculates duration between start and end time correctly', () => {
    expect(calculateHours('09:00', '17:00')).toBe(8)
    expect(calculateHours('09:30', '12:00')).toBe(2.5)
    expect(calculateHours('13:15', '14:45')).toBe(1.5)
  })

  it('handles empty or missing times gracefully', () => {
    expect(calculateHours('', '17:00')).toBe(0)
    expect(calculateHours('09:00', '')).toBe(0)
    expect(calculateHours('', '')).toBe(0)
    expect(calculateHours(null, null)).toBe(0)
  })

  it('handles overnight shifts (end time on next day)', () => {
    // 22:00 to 06:00 = 8 hours
    expect(calculateHours('22:00', '06:00')).toBe(8)
    // 17:00 to 09:00 next morning = 16 hours
    expect(calculateHours('17:00', '09:00')).toBe(16)
  })
})

describe('Expense Aggregations (totalExpenses)', () => {
  it('sums total expenses across multiple categories', () => {
    const expenses = [
      { category: 'Food', amount: 150.50, note: 'Lunch' },
      { category: 'Travel', amount: 350.00, note: 'Taxi' },
      { category: 'Material', amount: 500.00, note: 'Supplies' },
    ]
    expect(totalExpenses(expenses)).toBe(1000.50)
  })

  it('returns 0 for empty or malformed expense lists', () => {
    expect(totalExpenses([])).toBe(0)
    expect(totalExpenses([{ category: 'Other', amount: 0 }])).toBe(0)
  })
})

describe('Formatting Utilities', () => {
  it('formats hours with clean display', () => {
    expect(formatHours(8)).toBe('8h')
    expect(formatHours(2.5)).toBe('2h 30m')
    expect(formatHours(0.5)).toBe('30m')
  })

  it('formats currency with Indian numbering system', () => {
    expect(formatCurrency(124500)).toContain('1,24,500')
    expect(formatCurrency(0)).toContain('0')
  })
})
