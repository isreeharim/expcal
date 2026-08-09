'use client'

import { Project, Entry } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Building2, User, CreditCard, ShieldCheck } from 'lucide-react'

export interface BillConfig {
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
      maximumFractionDigits: 2
    })}`
  }

  const senderDisplayName = config.senderName || 'Service Provider'
  const clientDisplayName = config.clientCompany || config.clientName || 'Client'

  return (
    <div
      id="printable-invoice-container"
      className={cn(
        'w-full max-w-[760px] mx-auto bg-white text-zinc-900 font-sans leading-relaxed transition-all box-border',
        isPrintMode
          ? 'p-0 shadow-none border-none rounded-none'
          : 'p-8 sm:p-14 shadow-[0_25px_60px_rgba(0,0,0,0.35)] rounded-2xl border border-zinc-200/90'
      )}
      style={{ color: '#09090b' }}
    >
      {/* Top Header: Brand Name / Project & Invoice Meta */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-8 border-b border-zinc-200">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 block mb-1">
            {config.documentTitle || 'INVOICE'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950">
            {config.senderName ? config.senderName : project.title}
          </h2>
          {config.senderName && (
            <p className="text-xs text-zinc-500 mt-0.5 font-medium">
              Project: <span className="text-zinc-800">{project.title}</span>
            </p>
          )}
        </div>

        {/* Invoice Metadata Pill Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-1 gap-x-6 gap-y-1.5 text-xs text-left sm:text-right">
          {config.showInvoiceNumber && config.invoiceNumber && (
            <div>
              <span className="text-zinc-400 text-[11px] block sm:inline mr-1.5">Invoice No:</span>
              <strong className="font-mono font-bold text-zinc-950 text-sm">{config.invoiceNumber}</strong>
            </div>
          )}
          {config.showIssueDate && config.issueDate && (
            <div>
              <span className="text-zinc-400 text-[11px] block sm:inline mr-1.5">Issue Date:</span>
              <span className="font-semibold text-zinc-800">{formatDate(config.issueDate)}</span>
            </div>
          )}
          {config.showDueDate && config.dueDate && (
            <div>
              <span className="text-zinc-400 text-[11px] block sm:inline mr-1.5">Due Date:</span>
              <span className="font-semibold text-zinc-800">{formatDate(config.dueDate)}</span>
            </div>
          )}
        </div>
      </div>

      {/* From & To Cards Grid */}
      {(config.showSender || config.showClient) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-7 border-b border-zinc-100 text-xs">
          {/* Billed From */}
          {config.showSender && (
            <div className="p-4 rounded-xl bg-zinc-50/60 border border-zinc-100 space-y-1">
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block mb-1">
                Issued By
              </span>
              <p className="font-bold text-sm text-zinc-900">{senderDisplayName}</p>
              {config.senderAddress && <p className="text-zinc-600 whitespace-pre-line leading-relaxed">{config.senderAddress}</p>}
              {config.senderEmail && <p className="text-zinc-600">{config.senderEmail}</p>}
              {config.senderPhone && <p className="text-zinc-600">{config.senderPhone}</p>}
              {config.senderTaxId && (
                <p className="text-zinc-700 font-mono text-[11px] pt-1">GST/Tax ID: {config.senderTaxId}</p>
              )}
            </div>
          )}

          {/* Billed To */}
          {config.showClient && (
            <div className="p-4 rounded-xl bg-zinc-50/60 border border-zinc-100 space-y-1">
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block mb-1">
                Billed To
              </span>
              <p className="font-bold text-sm text-zinc-900">{clientDisplayName}</p>
              {config.clientName && config.clientName !== config.clientCompany && (
                <p className="text-zinc-700 font-medium">Attn: {config.clientName}</p>
              )}
              {config.clientAddress && <p className="text-zinc-600 whitespace-pre-line leading-relaxed">{config.clientAddress}</p>}
              {config.clientEmail && <p className="text-zinc-600">{config.clientEmail}</p>}
              {config.clientPhone && <p className="text-zinc-600">{config.clientPhone}</p>}
              {config.clientTaxId && (
                <p className="text-zinc-700 font-mono text-[11px] pt-1">Client Tax: {config.clientTaxId}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modern Line Items Table */}
      <div className="py-6">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-500 font-bold uppercase text-[10px] tracking-wider">
              <th className="pb-3 pr-4 font-bold">Item Description</th>
              <th className="pb-3 px-3 text-center font-bold">Qty</th>
              <th className="pb-3 px-3 text-right font-bold">Rate</th>
              <th className="pb-3 pl-4 text-right font-bold">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            <tr className="group">
              <td className="py-4 sm:py-5 pr-4">
                <p className="font-bold text-zinc-950 text-sm">
                  {config.billDescription || project.title || 'Professional Services'}
                </p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Agreed deliverable & services</p>
              </td>
              <td className="py-4 sm:py-5 px-3 text-center text-zinc-600 font-medium">{qty}</td>
              <td className="py-4 sm:py-5 px-3 text-right text-zinc-600 font-mono font-medium">{formatMoney(unitRate)}</td>
              <td className="py-4 sm:py-5 pl-4 text-right font-bold text-zinc-950 font-mono text-sm">{formatMoney(subtotal)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Summary & Payment Grid */}
      <div className="pt-6 border-t border-zinc-200 grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs items-start">
        {/* Left: Payment Notes Card */}
        <div className="space-y-3">
          {config.showPaymentDetails && (config.bankName || config.accountNumber || config.upiId) && (
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider flex items-center gap-1">
                <CreditCard className="w-3 h-3 text-zinc-700" /> Payment Details
              </span>
              {config.upiId && (
                <p className="text-zinc-700">
                  <span className="text-zinc-400">UPI ID:</span>{' '}
                  <strong className="font-mono text-zinc-950">{config.upiId}</strong>
                </p>
              )}
              {config.bankName && (
                <p className="text-zinc-700">
                  <span className="text-zinc-400">Bank:</span> {config.bankName}
                </p>
              )}
              {config.accountNumber && (
                <p className="text-zinc-700">
                  <span className="text-zinc-400">Account No:</span>{' '}
                  <strong className="font-mono text-zinc-950">{config.accountNumber}</strong>
                </p>
              )}
              {config.ifscCode && (
                <p className="text-zinc-700">
                  <span className="text-zinc-400">IFSC / Code:</span>{' '}
                  <strong className="font-mono text-zinc-950">{config.ifscCode}</strong>
                </p>
              )}
            </div>
          )}

          {config.showTerms && config.termsAndConditions && (
            <div className="text-[11px] text-zinc-500 leading-relaxed pt-1">
              <span className="font-bold text-zinc-700">Note: </span>
              {config.termsAndConditions}
            </div>
          )}
        </div>

        {/* Right: Calculations Summary Card */}
        <div className="p-4 rounded-xl bg-zinc-50/70 border border-zinc-200/80 space-y-2.5">
          <div className="flex justify-between py-1 text-zinc-600 text-xs">
            <span>Subtotal</span>
            <span className="font-mono font-semibold text-zinc-900">{formatMoney(subtotal)}</span>
          </div>

          {config.showDiscount && discountAmount > 0 && (
            <div className="flex justify-between py-1 text-emerald-600 text-xs">
              <span>Discount {config.discountType === 'percentage' ? `(${config.discountValue}%)` : ''}</span>
              <span className="font-mono font-semibold">-{formatMoney(discountAmount)}</span>
            </div>
          )}

          {config.showTax && (
            <div className="flex justify-between py-1 text-zinc-600 text-xs">
              <span>{config.taxName || 'Tax'} ({config.taxRate}%)</span>
              <span className="font-mono font-semibold text-zinc-900">{formatMoney(taxAmount)}</span>
            </div>
          )}

          <div className="flex justify-between pt-3 border-t border-zinc-300/80 text-base font-extrabold text-zinc-950">
            <span>Total Due</span>
            <span className="font-mono text-lg text-zinc-950">{formatMoney(grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Signature Block */}
      {config.showSignature && (config.signatoryName || config.signatoryTitle) && (
        <div className="mt-12 pt-6 flex justify-end text-right text-xs">
          <div className="w-48 space-y-1">
            <div className="h-10 border-b border-zinc-400 mb-2" />
            <p className="font-bold text-zinc-900">{config.signatoryName || 'Authorized Signatory'}</p>
            {config.signatoryTitle && <p className="text-[10px] text-zinc-500">{config.signatoryTitle}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
