'use client'

import { Project, Entry } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { CreditCard } from 'lucide-react'

export type InvoiceTemplateType = 'compact'

export interface BillConfig {
  template: InvoiceTemplateType
  accentColor: string
  documentTitle: string
  showInvoiceNumber: boolean
  invoiceNumber: string
  showIssueDate: boolean
  issueDate: string
  showDueDate: boolean
  dueDate: string
  currencySymbol: string
  showSender: boolean
  senderName: string
  senderEmail: string
  senderPhone: string
  senderAddress: string
  senderTaxId: string
  showClient: boolean
  clientName: string
  clientCompany: string
  clientEmail: string
  clientPhone: string
  clientAddress: string
  clientTaxId: string
  billDescription: string
  billAmount: number
  billQuantity: number
  showTax: boolean
  taxName: string
  taxRate: number
  showDiscount: boolean
  discountType: 'percentage' | 'fixed'
  discountValue: number
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

  const formatMoney = (val: number) =>
    `${config.currencySymbol} ${Number(val || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`

  const senderDisplayName = config.senderName || project.title || 'Service Provider'
  const hasClient = !!(config.clientName?.trim() || config.clientCompany?.trim())
  const clientDisplayName = config.clientCompany?.trim() || config.clientName?.trim() || ''

  return (
    <div
      id="printable-invoice-container"
      className={cn(
        'w-full bg-white text-zinc-900 font-sans',
        // flex col + justify-between so footer is always pinned to bottom
        'flex flex-col justify-between',
        isPrintMode
          ? 'shadow-none border-none rounded-none'
          : 'border-2 border-zinc-300 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.18)]'
      )}
      style={{
        color: '#09090b',
        // Explicit A4 portrait height: 210×297mm → at 760px wide = 1075px
        // justify-between guarantees footer sits at the very bottom
        height: '1075px',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* ═══ TOP CONTENT BLOCK ═══ */}
      <div className="flex flex-col">

        {/* ── HEADER ── */}
        <div className="flex flex-row border-b-2 border-zinc-300 flex-shrink-0">
          {/* Left: Sender info */}
          <div className="flex-1 px-8 py-6">
            <span className="text-[10px] uppercase tracking-[0.22em] font-bold text-zinc-400 block mb-1">
              {config.documentTitle || 'INVOICE'}
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950 leading-tight mb-1">
              {senderDisplayName}
            </h1>
            {config.senderEmail && (
              <p className="text-xs text-zinc-500 mt-0.5">{config.senderEmail}</p>
            )}
            {config.senderPhone && (
              <p className="text-xs text-zinc-500">{config.senderPhone}</p>
            )}
            {config.senderAddress && (
              <p className="text-xs text-zinc-500 whitespace-pre-line leading-snug mt-1">
                {config.senderAddress}
              </p>
            )}
            {config.senderTaxId && (
              <p className="text-[11px] text-zinc-600 font-mono mt-1.5">
                GST/Tax: {config.senderTaxId}
              </p>
            )}
          </div>

          {/* Right: Invoice meta */}
          <div className="px-8 py-6 flex flex-col justify-center items-end text-right border-l-2 border-zinc-200 bg-zinc-50/70 min-w-[200px]">
            {config.showInvoiceNumber && config.invoiceNumber && (
              <div className="mb-3">
                <span className="text-[10px] uppercase tracking-widest text-zinc-400 block">
                  Invoice No.
                </span>
                <span className="font-mono font-bold text-zinc-950 text-base">
                  {config.invoiceNumber}
                </span>
              </div>
            )}
            {config.showIssueDate && config.issueDate && (
              <div className="mb-2">
                <span className="text-[10px] text-zinc-400 block">Issue Date</span>
                <span className="text-sm font-semibold text-zinc-800">
                  {formatDate(config.issueDate)}
                </span>
              </div>
            )}
            {config.showDueDate && config.dueDate && (
              <div>
                <span className="text-[10px] text-zinc-400 block">Due Date</span>
                <span className="text-sm font-semibold text-zinc-800">
                  {formatDate(config.dueDate)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── BILLED TO — only if client name/company is entered ── */}
        {config.showClient && hasClient && (
          <div className="px-8 py-5 border-b-2 border-zinc-200 bg-zinc-50/40">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400 block mb-1.5">
              Billed To
            </span>
            <p className="font-bold text-base text-zinc-950">{clientDisplayName}</p>
            {config.clientName?.trim() &&
              config.clientName.trim() !== config.clientCompany?.trim() && (
                <p className="text-xs text-zinc-600 mt-0.5">Attn: {config.clientName}</p>
              )}
            {config.clientAddress && (
              <p className="text-xs text-zinc-600 whitespace-pre-line leading-snug mt-0.5">
                {config.clientAddress}
              </p>
            )}
            {config.clientEmail && (
              <p className="text-xs text-zinc-500 mt-0.5">{config.clientEmail}</p>
            )}
            {config.clientPhone && <p className="text-xs text-zinc-500">{config.clientPhone}</p>}
            {config.clientTaxId && (
              <p className="text-[11px] text-zinc-600 font-mono mt-1">
                Tax ID: {config.clientTaxId}
              </p>
            )}
          </div>
        )}

        {/* ── ITEMS TABLE ── */}
        <div className="px-8 pt-6 pb-5">
          <table className="w-full text-left text-xs border-collapse border border-zinc-200">
            <thead>
              <tr className="bg-zinc-100">
                <th className="px-4 py-3 font-bold text-zinc-600 uppercase tracking-wider text-[10px] border-r border-zinc-200 w-1/2">
                  Description
                </th>
                <th className="px-4 py-3 font-bold text-zinc-600 uppercase tracking-wider text-[10px] text-center border-r border-zinc-200">
                  Qty
                </th>
                <th className="px-4 py-3 font-bold text-zinc-600 uppercase tracking-wider text-[10px] text-right border-r border-zinc-200">
                  Unit Rate
                </th>
                <th className="px-4 py-3 font-bold text-zinc-600 uppercase tracking-wider text-[10px] text-right">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-zinc-200">
                <td className="px-4 py-4 border-r border-zinc-200">
                  <p className="font-semibold text-zinc-950 text-sm">
                    {config.billDescription || project.title || 'Professional Services'}
                  </p>
                </td>
                <td className="px-4 py-4 text-center text-zinc-700 font-medium border-r border-zinc-200">
                  {qty}
                </td>
                <td className="px-4 py-4 text-right text-zinc-700 font-mono border-r border-zinc-200">
                  {formatMoney(unitRate)}
                </td>
                <td className="px-4 py-4 text-right font-bold text-zinc-950 font-mono">
                  {formatMoney(subtotal)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── SUMMARY & PAYMENT ── */}
        <div className="px-8 pb-6">
          <div className="grid grid-cols-2 gap-6 items-start">
            {/* LEFT: Payment + Terms */}
            <div className="space-y-4">
              {config.showPaymentDetails &&
                (config.bankName || config.accountNumber || config.upiId) && (
                  <div className="border border-zinc-200 rounded-lg p-4 bg-zinc-50/60 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5" /> Payment Details
                    </span>
                    {config.upiId && (
                      <p className="text-xs text-zinc-700">
                        <span className="text-zinc-400">UPI: </span>
                        <strong className="font-mono text-zinc-950">{config.upiId}</strong>
                      </p>
                    )}
                    {config.bankName && (
                      <p className="text-xs text-zinc-700">
                        <span className="text-zinc-400">Bank: </span>
                        {config.bankName}
                      </p>
                    )}
                    {config.accountNumber && (
                      <p className="text-xs text-zinc-700">
                        <span className="text-zinc-400">Account: </span>
                        <strong className="font-mono text-zinc-950">{config.accountNumber}</strong>
                      </p>
                    )}
                    {config.ifscCode && (
                      <p className="text-xs text-zinc-700">
                        <span className="text-zinc-400">IFSC: </span>
                        <strong className="font-mono text-zinc-950">{config.ifscCode}</strong>
                      </p>
                    )}
                  </div>
                )}
              {config.showTerms && config.termsAndConditions && (
                <div className="text-[11px] text-zinc-500 leading-relaxed">
                  <span className="font-bold text-zinc-600">Note: </span>
                  {config.termsAndConditions}
                </div>
              )}
            </div>

            {/* RIGHT: Totals */}
            <div className="border-2 border-zinc-200 rounded-lg overflow-hidden">
              <div className="divide-y divide-zinc-200">
                <div className="flex justify-between px-5 py-3 text-xs text-zinc-600">
                  <span>Subtotal</span>
                  <span className="font-mono font-semibold text-zinc-900">{formatMoney(subtotal)}</span>
                </div>
                {config.showDiscount && discountAmount > 0 && (
                  <div className="flex justify-between px-5 py-3 text-xs text-emerald-600">
                    <span>
                      Discount{' '}
                      {config.discountType === 'percentage' ? `(${config.discountValue}%)` : ''}
                    </span>
                    <span className="font-mono font-semibold">-{formatMoney(discountAmount)}</span>
                  </div>
                )}
                {config.showTax && (
                  <div className="flex justify-between px-5 py-3 text-xs text-zinc-600">
                    <span>
                      {config.taxName || 'Tax'} ({config.taxRate}%)
                    </span>
                    <span className="font-mono font-semibold text-zinc-900">
                      {formatMoney(taxAmount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between px-5 py-4 bg-zinc-900 text-white">
                  <span className="font-bold text-sm">Total Due</span>
                  <span className="font-mono font-bold text-base">{formatMoney(grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── SIGNATURE (optional) ── */}
        {config.showSignature && (config.signatoryName || config.signatoryTitle) && (
          <div className="mx-8 pt-4 pb-5 border-t-2 border-zinc-200 flex justify-end">
            <div className="w-48 text-right text-xs space-y-1">
              <div className="h-12 border-b border-zinc-400 mb-2" />
              <p className="font-bold text-zinc-900">
                {config.signatoryName || 'Authorized Signatory'}
              </p>
              {config.signatoryTitle && (
                <p className="text-[10px] text-zinc-500">{config.signatoryTitle}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ═══ BOTTOM: FOOTER — pinned to bottom by justify-between ═══ */}
      <div className="border-t-2 border-zinc-200 px-8 py-4 bg-zinc-50/60 flex justify-between items-center text-[10px] text-zinc-400">
        <span className="font-medium">Thank you for your business.</span>
        {config.invoiceNumber && (
          <span className="font-mono text-zinc-500">#{config.invoiceNumber}</span>
        )}
      </div>
    </div>
  )
}
