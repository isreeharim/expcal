'use client'

import { Project, Entry } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { CreditCard } from 'lucide-react'

export type InvoiceTemplateType = 'compact'

export interface BillConfig {
  // Template & Theme (kept for API compat, only compact used)
  template: InvoiceTemplateType
  accentColor: string

  // Document Meta
  documentTitle: string
  showInvoiceNumber: boolean
  invoiceNumber: string
  showIssueDate: boolean
  issueDate: string
  showDueDate: boolean
  dueDate: string
  currencySymbol: string

  // Billed From (Sender)
  showSender: boolean
  senderName: string
  senderEmail: string
  senderPhone: string
  senderAddress: string
  senderTaxId: string

  // Billed To (Client)
  showClient: boolean
  clientName: string
  clientCompany: string
  clientEmail: string
  clientPhone: string
  clientAddress: string
  clientTaxId: string

  // Direct Billing Amount & Description
  billDescription: string
  billAmount: number
  billQuantity: number

  // Tax & Discount
  showTax: boolean
  taxName: string
  taxRate: number
  showDiscount: boolean
  discountType: 'percentage' | 'fixed'
  discountValue: number

  // Payment & Notes
  showPaymentDetails: boolean
  bankName: string
  accountNumber: string
  ifscCode: string
  upiId: string
  showTerms: boolean
  termsAndConditions: string
  showSignature: boolean
  signatoryName: string
  signatoryTitle: string
}

interface PrintableInvoiceProps {
  project: Project
  entries?: Entry[]
  config: BillConfig
  isPrintMode?: boolean
}

export function PrintableInvoice({ project, config, isPrintMode = false }: PrintableInvoiceProps) {
  const qty = Number(config.billQuantity) > 0 ? Number(config.billQuantity) : 1
  const unitRate = Number(config.billAmount) || 0
  const subtotal = qty * unitRate

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
      maximumFractionDigits: 2,
    })}`
  }

  const senderDisplayName = config.senderName || project.title || 'Service Provider'
  // Only show client section if there's a client name or company entered
  const hasClient = !!(config.clientName?.trim() || config.clientCompany?.trim())
  const clientDisplayName = config.clientCompany?.trim() || config.clientName?.trim() || ''

  return (
    <div
      id="printable-invoice-container"
      className={cn(
        'w-full bg-white text-zinc-900 font-sans box-border',
        isPrintMode
          ? 'shadow-none border-none rounded-none'
          : 'border-2 border-zinc-300 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.18)] my-auto'
      )}
      style={{
        color: '#09090b',
        // Fill A4 portrait proportions when in preview
        minHeight: isPrintMode ? 'auto' : undefined,
      }}
    >
      {/* ── HEADER BAR ── */}
      <div className="flex flex-row justify-between items-stretch border-b-2 border-zinc-300">
        {/* Left: Business name & title */}
        <div className="px-6 py-5 flex flex-col justify-center flex-1">
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400 mb-0.5">
            {config.documentTitle || 'INVOICE'}
          </span>
          <h1 className="text-xl font-extrabold tracking-tight text-zinc-950 leading-tight">
            {senderDisplayName}
          </h1>
          {config.senderEmail && (
            <p className="text-[11px] text-zinc-500 mt-0.5">{config.senderEmail}</p>
          )}
          {config.senderPhone && (
            <p className="text-[11px] text-zinc-500">{config.senderPhone}</p>
          )}
          {config.senderAddress && (
            <p className="text-[11px] text-zinc-500 whitespace-pre-line leading-snug mt-0.5">
              {config.senderAddress}
            </p>
          )}
          {config.senderTaxId && (
            <p className="text-[10px] text-zinc-600 font-mono mt-1">
              GST/Tax: {config.senderTaxId}
            </p>
          )}
        </div>

        {/* Right: Invoice meta */}
        <div className="px-6 py-5 flex flex-col justify-center items-end text-right border-l-2 border-zinc-200 bg-zinc-50/60 min-w-[160px]">
          {config.showInvoiceNumber && config.invoiceNumber && (
            <div className="mb-2">
              <span className="text-[10px] uppercase tracking-widest text-zinc-400 block">
                Invoice No.
              </span>
              <span className="font-mono font-bold text-zinc-950 text-sm">
                {config.invoiceNumber}
              </span>
            </div>
          )}
          {config.showIssueDate && config.issueDate && (
            <div className="mb-1">
              <span className="text-[10px] text-zinc-400 block">Issue Date</span>
              <span className="text-xs font-semibold text-zinc-800">
                {formatDate(config.issueDate)}
              </span>
            </div>
          )}
          {config.showDueDate && config.dueDate && (
            <div>
              <span className="text-[10px] text-zinc-400 block">Due Date</span>
              <span className="text-xs font-semibold text-zinc-800">
                {formatDate(config.dueDate)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── BILLED TO ── only if client name/company is present */}
      {config.showClient && hasClient && (
        <div className="px-6 py-4 border-b-2 border-zinc-200 bg-zinc-50/40">
          <span className="text-[10px] uppercase tracking-[0.18em] font-bold text-zinc-400 block mb-1">
            Billed To
          </span>
          <p className="font-bold text-sm text-zinc-950">{clientDisplayName}</p>
          {config.clientName?.trim() &&
            config.clientName.trim() !== config.clientCompany?.trim() && (
              <p className="text-[11px] text-zinc-600">Attn: {config.clientName}</p>
            )}
          {config.clientAddress && (
            <p className="text-[11px] text-zinc-600 whitespace-pre-line leading-snug mt-0.5">
              {config.clientAddress}
            </p>
          )}
          {config.clientEmail && (
            <p className="text-[11px] text-zinc-500">{config.clientEmail}</p>
          )}
          {config.clientPhone && (
            <p className="text-[11px] text-zinc-500">{config.clientPhone}</p>
          )}
          {config.clientTaxId && (
            <p className="text-[10px] text-zinc-600 font-mono mt-1">
              Tax ID: {config.clientTaxId}
            </p>
          )}
        </div>
      )}

      {/* ── ITEMS TABLE ── */}
      <div className="px-6 pt-5 pb-4">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-zinc-100 border border-zinc-200">
              <th className="px-3 py-2.5 font-bold text-zinc-600 uppercase tracking-wider text-[10px] border-r border-zinc-200 w-1/2">
                Description
              </th>
              <th className="px-3 py-2.5 font-bold text-zinc-600 uppercase tracking-wider text-[10px] text-center border-r border-zinc-200">
                Qty
              </th>
              <th className="px-3 py-2.5 font-bold text-zinc-600 uppercase tracking-wider text-[10px] text-right border-r border-zinc-200">
                Unit Rate
              </th>
              <th className="px-3 py-2.5 font-bold text-zinc-600 uppercase tracking-wider text-[10px] text-right">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border border-zinc-200 border-t-0">
              <td className="px-3 py-3.5 border-r border-zinc-200">
                <p className="font-semibold text-zinc-950 text-[13px]">
                  {config.billDescription || project.title || 'Professional Services'}
                </p>
              </td>
              <td className="px-3 py-3.5 text-center text-zinc-700 font-medium border-r border-zinc-200">
                {qty}
              </td>
              <td className="px-3 py-3.5 text-right text-zinc-700 font-mono border-r border-zinc-200">
                {formatMoney(unitRate)}
              </td>
              <td className="px-3 py-3.5 text-right font-bold text-zinc-950 font-mono">
                {formatMoney(subtotal)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── SUMMARY & PAYMENT ── */}
      <div className="px-6 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
        {/* LEFT: Payment details + Terms */}
        <div className="space-y-3">
          {config.showPaymentDetails &&
            (config.bankName || config.accountNumber || config.upiId) && (
              <div className="border border-zinc-200 rounded-lg p-3 bg-zinc-50/50 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider flex items-center gap-1">
                  <CreditCard className="w-3 h-3" /> Payment Details
                </span>
                {config.upiId && (
                  <p className="text-[11px] text-zinc-700">
                    <span className="text-zinc-400">UPI: </span>
                    <strong className="font-mono text-zinc-950">{config.upiId}</strong>
                  </p>
                )}
                {config.bankName && (
                  <p className="text-[11px] text-zinc-700">
                    <span className="text-zinc-400">Bank: </span>
                    {config.bankName}
                  </p>
                )}
                {config.accountNumber && (
                  <p className="text-[11px] text-zinc-700">
                    <span className="text-zinc-400">Account: </span>
                    <strong className="font-mono text-zinc-950">{config.accountNumber}</strong>
                  </p>
                )}
                {config.ifscCode && (
                  <p className="text-[11px] text-zinc-700">
                    <span className="text-zinc-400">IFSC: </span>
                    <strong className="font-mono text-zinc-950">{config.ifscCode}</strong>
                  </p>
                )}
              </div>
            )}

          {config.showTerms && config.termsAndConditions && (
            <div className="text-[10px] text-zinc-500 leading-relaxed">
              <span className="font-bold text-zinc-600">Note: </span>
              {config.termsAndConditions}
            </div>
          )}
        </div>

        {/* RIGHT: Totals box */}
        <div className="border-2 border-zinc-200 rounded-lg overflow-hidden">
          <div className="divide-y divide-zinc-200">
            <div className="flex justify-between px-4 py-2.5 text-xs text-zinc-600">
              <span>Subtotal</span>
              <span className="font-mono font-semibold text-zinc-900">{formatMoney(subtotal)}</span>
            </div>

            {config.showDiscount && discountAmount > 0 && (
              <div className="flex justify-between px-4 py-2.5 text-xs text-emerald-600">
                <span>
                  Discount{' '}
                  {config.discountType === 'percentage' ? `(${config.discountValue}%)` : ''}
                </span>
                <span className="font-mono font-semibold">-{formatMoney(discountAmount)}</span>
              </div>
            )}

            {config.showTax && (
              <div className="flex justify-between px-4 py-2.5 text-xs text-zinc-600">
                <span>
                  {config.taxName || 'Tax'} ({config.taxRate}%)
                </span>
                <span className="font-mono font-semibold text-zinc-900">
                  {formatMoney(taxAmount)}
                </span>
              </div>
            )}

            <div className="flex justify-between px-4 py-3 bg-zinc-900 text-white">
              <span className="font-bold text-sm">Total Due</span>
              <span className="font-mono font-bold text-base">{formatMoney(grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── SIGNATURE ── */}
      {config.showSignature && (config.signatoryName || config.signatoryTitle) && (
        <div className="mx-6 pt-4 pb-5 border-t-2 border-zinc-200 flex justify-end">
          <div className="w-44 text-right text-xs space-y-1">
            <div className="h-10 border-b border-zinc-400 mb-2" />
            <p className="font-bold text-zinc-900">
              {config.signatoryName || 'Authorized Signatory'}
            </p>
            {config.signatoryTitle && (
              <p className="text-[10px] text-zinc-500">{config.signatoryTitle}</p>
            )}
          </div>
        </div>
      )}

      {/* ── FOOTER ── */}
      <div className="border-t-2 border-zinc-200 px-6 py-3 bg-zinc-50/60 flex justify-between items-center text-[10px] text-zinc-400">
        <span>Thank you for your business.</span>
        {config.invoiceNumber && (
          <span className="font-mono text-zinc-500">#{config.invoiceNumber}</span>
        )}
      </div>
    </div>
  )
}
