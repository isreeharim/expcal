'use client'

import { Project, Entry } from '@/lib/types'
import { formatCurrency, formatHours, formatDate, formatTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Receipt, CheckCircle, Clock, Building2, Phone, Mail, MapPin, Globe, CreditCard } from 'lucide-react'

export interface BillConfig {
  // Document Meta
  documentTitle: string
  showInvoiceNumber: boolean
  invoiceNumber: string
  showIssueDate: boolean
  issueDate: string
  showDueDate: boolean
  dueDate: string
  showPoNumber: boolean
  poNumber: string
  currencySymbol: string

  // Billed From (Sender)
  showSender: boolean
  senderName: string
  senderEmail: string
  senderPhone: string
  senderAddress: string
  senderTaxId: string
  senderWebsite: string

  // Billed To (Client)
  showClient: boolean
  clientName: string
  clientCompany: string
  clientEmail: string
  clientPhone: string
  clientAddress: string
  clientTaxId: string

  // Financials & Pricing
  includeHours: boolean
  hourlyRate: number
  includeExpenses: boolean
  includeFixedFee: boolean
  fixedFeeAmount: number
  fixedFeeDescription: string
  showTax: boolean
  taxName: string
  taxRate: number
  showDiscount: boolean
  discountType: 'percentage' | 'fixed'
  discountValue: number

  // Scope & Filters
  dateRangeType: 'all' | 'custom'
  startDate?: string
  endDate?: string
  includeNotes: boolean
  includeReceipts: boolean

  // Notes & Sign-off
  showPaymentDetails: boolean
  bankName: string
  accountNumber: string
  ifscCode: string
  upiId: string
  paymentTerms: string
  showTerms: boolean
  termsAndConditions: string
  showSignature: boolean
  signatoryName: string
  signatoryTitle: string

  // Theme
  templateTheme: 'modern' | 'corporate' | 'gradient'
}

interface PrintableInvoiceProps {
  project: Project
  entries: Entry[]
  config: BillConfig
  isPrintMode?: boolean
}

export function PrintableInvoice({ project, entries, config, isPrintMode = false }: PrintableInvoiceProps) {
  // 1. Filter entries based on date range
  const filteredEntries = entries.filter((e) => {
    if (config.dateRangeType === 'custom') {
      if (config.startDate && e.date < config.startDate) return false
      if (config.endDate && e.date > config.endDate) return false
    }
    return true
  })

  // 2. Compute Hours Labor
  const totalHours = filteredEntries.reduce((sum, e) => {
    if (e.start_time && e.end_time) {
      const [sh, sm] = e.start_time.split(':').map(Number)
      const [eh, em] = e.end_time.split(':').map(Number)
      const h = eh - sh + (em - sm) / 60
      return sum + (h > 0 ? h : 0)
    }
    return sum
  }, 0)

  const hoursAmount = config.includeHours ? totalHours * (Number(config.hourlyRate) || 0) : 0

  // 3. Compute Individual Expenses
  const allExpenses: { category: string; amount: number; note?: string; date: string }[] = []
  if (config.includeExpenses) {
    filteredEntries.forEach((e) => {
      const expList = Array.isArray(e.expenses) ? e.expenses : []
      expList.forEach((exp) => {
        allExpenses.push({
          category: exp.category || 'General',
          amount: Number(exp.amount) || 0,
          note: exp.note,
          date: e.date
        })
      })
    })
  }

  const totalExpenseAmount = allExpenses.reduce((sum, item) => sum + item.amount, 0)
  const fixedFeeAmount = config.includeFixedFee ? Number(config.fixedFeeAmount) || 0 : 0

  // 4. Subtotal & Grand Total
  const subtotal = hoursAmount + totalExpenseAmount + fixedFeeAmount

  const discountAmount = config.showDiscount
    ? config.discountType === 'percentage'
      ? (subtotal * (Number(config.discountValue) || 0)) / 100
      : Number(config.discountValue) || 0
    : 0

  const taxableAmount = Math.max(0, subtotal - discountAmount)
  const taxAmount = config.showTax ? (taxableAmount * (Number(config.taxRate) || 0)) / 100 : 0
  const grandTotal = taxableAmount + taxAmount

  const formatMoney = (val: number) => {
    return `${config.currencySymbol} ${Number(val || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`
  }

  // Receipt photos list
  const receiptPhotos = config.includeReceipts
    ? filteredEntries.filter((e) => Boolean(e.photo_url)).map((e) => ({ date: e.date, url: e.photo_url! }))
    : []

  const isGradient = config.templateTheme === 'gradient'
  const isCorporate = config.templateTheme === 'corporate'

  return (
    <div
      id="printable-invoice-container"
      className={cn(
        'w-full max-w-[210mm] mx-auto bg-white text-slate-900 shadow-2xl rounded-2xl p-6 sm:p-10 font-sans leading-normal border border-slate-200 transition-all',
        isPrintMode && 'shadow-none border-none p-0 rounded-none w-full max-w-none'
      )}
      style={{ minHeight: '297mm', color: '#0f172a' }}
    >
      {/* 1. Header Banner / Meta Block */}
      <div
        className={cn(
          'flex flex-col sm:flex-row justify-between items-start gap-6 pb-6 border-b',
          isCorporate && 'bg-slate-900 text-white -m-6 sm:-m-10 p-6 sm:p-10 mb-6 rounded-t-2xl border-none',
          isGradient && 'border-indigo-100 bg-gradient-to-r from-indigo-50/70 via-cyan-50/40 to-white -m-6 sm:-m-10 p-6 sm:p-10 mb-6 rounded-t-2xl'
        )}
      >
        <div>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-md flex-shrink-0"
              style={{ background: project.color || 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)' }}
            >
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {config.documentTitle || 'INVOICE'}
              </h1>
              <p className={cn('text-xs font-semibold', isCorporate ? 'text-slate-300' : 'text-slate-500')}>
                Project: {project.title}
              </p>
            </div>
          </div>
        </div>

        {/* Invoice Meta pills */}
        <div className="text-right sm:text-right space-y-1 text-xs">
          {config.showInvoiceNumber && config.invoiceNumber && (
            <p>
              <span className={cn('font-medium', isCorporate ? 'text-slate-300' : 'text-slate-500')}>Invoice #: </span>
              <strong className="font-bold text-sm tracking-wide">{config.invoiceNumber}</strong>
            </p>
          )}
          {config.showIssueDate && config.issueDate && (
            <p>
              <span className={cn('font-medium', isCorporate ? 'text-slate-300' : 'text-slate-500')}>Date: </span>
              <span className="font-semibold">{formatDate(config.issueDate)}</span>
            </p>
          )}
          {config.showDueDate && config.dueDate && (
            <p>
              <span className={cn('font-medium', isCorporate ? 'text-slate-300' : 'text-slate-500')}>Due Date: </span>
              <span className="font-semibold text-indigo-600">{formatDate(config.dueDate)}</span>
            </p>
          )}
          {config.showPoNumber && config.poNumber && (
            <p>
              <span className={cn('font-medium', isCorporate ? 'text-slate-300' : 'text-slate-500')}>PO / Ref #: </span>
              <span className="font-semibold">{config.poNumber}</span>
            </p>
          )}
        </div>
      </div>

      {/* 2. Sender & Client Address Block */}
      {(config.showSender || config.showClient) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 my-6 text-xs">
          {/* Billed From */}
          {config.showSender && (
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Billed From
              </span>
              {config.senderName && <p className="text-sm font-bold text-slate-900">{config.senderName}</p>}
              {config.senderAddress && <p className="text-slate-600 whitespace-pre-line leading-relaxed">{config.senderAddress}</p>}
              {config.senderEmail && <p className="text-slate-600">{config.senderEmail}</p>}
              {config.senderPhone && <p className="text-slate-600">{config.senderPhone}</p>}
              {config.senderTaxId && (
                <p className="text-slate-700 font-semibold pt-1">
                  Tax / GSTIN: <span className="font-mono">{config.senderTaxId}</span>
                </p>
              )}
            </div>
          )}

          {/* Billed To */}
          {config.showClient && (
            <div className="space-y-1 sm:text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Billed To
              </span>
              {config.clientCompany && <p className="text-sm font-bold text-slate-900">{config.clientCompany}</p>}
              {config.clientName && config.clientName !== config.clientCompany && (
                <p className="text-xs font-semibold text-slate-800">Attn: {config.clientName}</p>
              )}
              {config.clientAddress && <p className="text-slate-600 whitespace-pre-line leading-relaxed">{config.clientAddress}</p>}
              {config.clientEmail && <p className="text-slate-600">{config.clientEmail}</p>}
              {config.clientPhone && <p className="text-slate-600">{config.clientPhone}</p>}
              {config.clientTaxId && (
                <p className="text-slate-700 font-semibold pt-1">
                  Client Tax ID: <span className="font-mono">{config.clientTaxId}</span>
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* 3. Itemized Bill Table */}
      <div className="my-6 overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <th className="py-3 px-4">Description / Item</th>
              <th className="py-3 px-3 text-center">Qty / Time</th>
              <th className="py-3 px-3 text-right">Rate</th>
              <th className="py-3 px-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {/* Fixed Project Fee */}
            {config.includeFixedFee && fixedFeeAmount > 0 && (
              <tr>
                <td className="py-3.5 px-4">
                  <p className="font-bold text-slate-900">{config.fixedFeeDescription || 'Project Professional Fee'}</p>
                  <p className="text-[11px] text-slate-500">Agreed milestone / deliverable</p>
                </td>
                <td className="py-3.5 px-3 text-center text-slate-600 font-medium">1</td>
                <td className="py-3.5 px-3 text-right text-slate-600 font-medium">{formatMoney(fixedFeeAmount)}</td>
                <td className="py-3.5 px-4 text-right font-bold text-slate-900">{formatMoney(fixedFeeAmount)}</td>
              </tr>
            )}

            {/* Logged Work Hours */}
            {config.includeHours && totalHours > 0 && (
              <tr>
                <td className="py-3.5 px-4">
                  <p className="font-bold text-slate-900">Work Hours & Time Logged</p>
                  <p className="text-[11px] text-slate-500">
                    {filteredEntries.length} logged sessions across project activities
                  </p>
                </td>
                <td className="py-3.5 px-3 text-center font-semibold text-slate-800">{formatHours(totalHours)}</td>
                <td className="py-3.5 px-3 text-right text-slate-600 font-medium">{formatMoney(Number(config.hourlyRate) || 0)}/hr</td>
                <td className="py-3.5 px-4 text-right font-bold text-slate-900">{formatMoney(hoursAmount)}</td>
              </tr>
            )}

            {/* Categorized Project Expenses */}
            {config.includeExpenses && allExpenses.length > 0 ? (
              allExpenses.map((exp, idx) => (
                <tr key={idx}>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-900">
                      {exp.category} {exp.note ? `— ${exp.note}` : ''}
                    </p>
                    <p className="text-[10px] text-slate-400">{formatDate(exp.date)}</p>
                  </td>
                  <td className="py-3 px-3 text-center text-slate-500">1</td>
                  <td className="py-3 px-3 text-right text-slate-600 font-medium">{formatMoney(exp.amount)}</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">{formatMoney(exp.amount)}</td>
                </tr>
              ))
            ) : null}

            {/* Empty fallback if nothing selected */}
            {!config.includeHours && !config.includeExpenses && !config.includeFixedFee && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-400">
                  No line items selected for this invoice. Toggle Hours, Expenses, or Fixed Fee.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 4. Financial Calculations & Summary */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-8 my-6 text-xs">
        {/* Payment / Bank Details Notes */}
        <div className="flex-1 space-y-3 max-w-sm">
          {config.showPaymentDetails && (config.bankName || config.accountNumber || config.upiId) && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-indigo-600" /> Payment Details
              </span>
              {config.bankName && (
                <p className="text-slate-700">
                  <span className="font-medium">Bank:</span> {config.bankName}
                </p>
              )}
              {config.accountNumber && (
                <p className="text-slate-700">
                  <span className="font-medium">Account #:</span> <strong className="font-mono">{config.accountNumber}</strong>
                </p>
              )}
              {config.ifscCode && (
                <p className="text-slate-700">
                  <span className="font-medium">IFSC / Routing:</span> <strong className="font-mono">{config.ifscCode}</strong>
                </p>
              )}
              {config.upiId && (
                <p className="text-slate-700 pt-0.5">
                  <span className="font-medium">UPI ID:</span> <strong className="text-indigo-600 font-mono">{config.upiId}</strong>
                </p>
              )}
            </div>
          )}

          {/* Terms & Conditions Note */}
          {config.showTerms && config.termsAndConditions && (
            <div className="text-[11px] text-slate-500 whitespace-pre-line leading-relaxed">
              <span className="font-bold text-slate-700">Notes & Terms: </span>
              {config.termsAndConditions}
            </div>
          )}
        </div>

        {/* Calculation Table */}
        <div className="w-full sm:w-72 space-y-2 text-right">
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500 font-medium">Subtotal:</span>
            <span className="font-bold text-slate-900">{formatMoney(subtotal)}</span>
          </div>

          {config.showDiscount && discountAmount > 0 && (
            <div className="flex justify-between py-1 text-emerald-600 border-b border-slate-100">
              <span className="font-medium">
                Discount {config.discountType === 'percentage' ? `(${config.discountValue}%)` : ''}:
              </span>
              <span className="font-bold">-{formatMoney(discountAmount)}</span>
            </div>
          )}

          {config.showTax && (
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">{config.taxName || 'Tax / GST'} ({config.taxRate}%):</span>
              <span className="font-bold text-slate-900">{formatMoney(taxAmount)}</span>
            </div>
          )}

          {/* Grand Total */}
          <div className="flex justify-between py-3 px-3.5 rounded-xl bg-slate-900 text-white font-bold text-sm sm:text-base mt-2 shadow-md">
            <span>Total Due:</span>
            <span className="text-indigo-300 font-extrabold">{formatMoney(grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* 5. Signature & Sign-off Block */}
      {config.showSignature && (config.signatoryName || config.signatoryTitle) && (
        <div className="my-10 pt-6 border-t border-slate-200 flex justify-end text-right">
          <div className="w-56 space-y-1">
            <div className="h-12 border-b border-slate-300 mb-2" />
            <p className="text-xs font-bold text-slate-900">{config.signatoryName || 'Authorized Signatory'}</p>
            {config.signatoryTitle && <p className="text-[11px] text-slate-500">{config.signatoryTitle}</p>}
          </div>
        </div>
      )}

      {/* 6. Receipt Photos Appendix */}
      {config.includeReceipts && receiptPhotos.length > 0 && (
        <div className="mt-12 pt-8 border-t-2 border-dashed border-slate-300 page-break-before">
          <div className="flex items-center gap-2 mb-4">
            <Receipt className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Attached Receipt Photos ({receiptPhotos.length})
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {receiptPhotos.map((item, idx) => (
              <div key={idx} className="rounded-xl border border-slate-200 p-2 text-center bg-slate-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt={`Receipt ${idx + 1}`}
                  className="w-full h-36 object-contain rounded-lg bg-white mb-2"
                />
                <span className="text-[10px] text-slate-500 font-medium">Date: {formatDate(item.date)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
