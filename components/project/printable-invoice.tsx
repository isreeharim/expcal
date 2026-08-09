'use client'

import { Project, Entry } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

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

  return (
    <div
      id="printable-invoice-container"
      className={cn(
        'w-full max-w-[210mm] mx-auto bg-white text-zinc-900 font-sans leading-relaxed transition-all',
        isPrintMode ? 'p-0 shadow-none' : 'p-8 sm:p-12 shadow-xl rounded-2xl border border-zinc-200/80'
      )}
      style={{ minHeight: '297mm', color: '#18181b' }}
    >
      {/* Top Header: Title & Meta */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-8 border-b border-zinc-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 uppercase">
            {config.documentTitle || 'INVOICE'}
          </h1>
          <p className="text-xs text-zinc-500 mt-1 font-medium">
            Project: <strong className="text-zinc-800">{project.title}</strong>
          </p>
        </div>

        <div className="text-left sm:text-right space-y-1 text-xs">
          {config.showInvoiceNumber && config.invoiceNumber && (
            <p className="text-zinc-600">
              <span className="text-zinc-400">Invoice No:</span>{' '}
              <strong className="font-mono text-zinc-900 font-bold">{config.invoiceNumber}</strong>
            </p>
          )}
          {config.showIssueDate && config.issueDate && (
            <p className="text-zinc-600">
              <span className="text-zinc-400">Date:</span>{' '}
              <span className="text-zinc-800 font-medium">{formatDate(config.issueDate)}</span>
            </p>
          )}
          {config.showDueDate && config.dueDate && (
            <p className="text-zinc-600">
              <span className="text-zinc-400">Due Date:</span>{' '}
              <span className="text-zinc-800 font-medium">{formatDate(config.dueDate)}</span>
            </p>
          )}
        </div>
      </div>

      {/* From & To Addresses */}
      {(config.showSender || config.showClient) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-8 border-b border-zinc-100 text-xs">
          {/* Billed From */}
          {config.showSender && (
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1.5">From</p>
              {config.senderName && <p className="font-bold text-sm text-zinc-900">{config.senderName}</p>}
              {config.senderAddress && <p className="text-zinc-600 whitespace-pre-line leading-relaxed">{config.senderAddress}</p>}
              {config.senderEmail && <p className="text-zinc-600">{config.senderEmail}</p>}
              {config.senderPhone && <p className="text-zinc-600">{config.senderPhone}</p>}
              {config.senderTaxId && (
                <p className="text-zinc-700 font-mono text-[11px] pt-1">GST/Tax: {config.senderTaxId}</p>
              )}
            </div>
          )}

          {/* Billed To */}
          {config.showClient && (
            <div className="space-y-1 sm:text-right">
              <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1.5">Billed To</p>
              {config.clientCompany && <p className="font-bold text-sm text-zinc-900">{config.clientCompany}</p>}
              {config.clientName && config.clientName !== config.clientCompany && (
                <p className="text-zinc-800 font-medium">{config.clientName}</p>
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

      {/* Clean Minimal Table */}
      <div className="py-6">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b-2 border-zinc-900 text-zinc-900 font-bold uppercase text-[10px] tracking-wider">
              <th className="pb-3 pr-4">Description</th>
              <th className="pb-3 px-3 text-center">Qty</th>
              <th className="pb-3 px-3 text-right">Unit Rate</th>
              <th className="pb-3 pl-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            <tr>
              <td className="py-4 pr-4">
                <p className="font-semibold text-zinc-900">{config.billDescription || 'Project Deliverables & Services'}</p>
              </td>
              <td className="py-4 px-3 text-center text-zinc-600 font-medium">{qty}</td>
              <td className="py-4 px-3 text-right text-zinc-600 font-mono">{formatMoney(unitRate)}</td>
              <td className="py-4 pl-4 text-right font-bold text-zinc-900 font-mono">{formatMoney(subtotal)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Financial Summary Calculation */}
      <div className="pt-4 border-t-2 border-zinc-900 flex flex-col sm:flex-row justify-between items-start gap-8 text-xs">
        {/* Payment Notes */}
        <div className="flex-1 space-y-3 max-w-sm">
          {config.showPaymentDetails && (config.bankName || config.accountNumber || config.upiId) && (
            <div className="space-y-1 text-zinc-600">
              <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Payment Information</p>
              {config.upiId && (
                <p>
                  <span className="text-zinc-500">UPI ID:</span>{' '}
                  <strong className="font-mono text-zinc-900">{config.upiId}</strong>
                </p>
              )}
              {config.bankName && (
                <p>
                  <span className="text-zinc-500">Bank:</span> {config.bankName}
                </p>
              )}
              {config.accountNumber && (
                <p>
                  <span className="text-zinc-500">Account:</span>{' '}
                  <strong className="font-mono text-zinc-900">{config.accountNumber}</strong>
                </p>
              )}
              {config.ifscCode && (
                <p>
                  <span className="text-zinc-500">IFSC:</span>{' '}
                  <strong className="font-mono text-zinc-900">{config.ifscCode}</strong>
                </p>
              )}
            </div>
          )}

          {config.showTerms && config.termsAndConditions && (
            <p className="text-[11px] text-zinc-500 leading-relaxed pt-2">
              <span className="font-semibold text-zinc-700">Note: </span>
              {config.termsAndConditions}
            </p>
          )}
        </div>

        {/* Totals Table */}
        <div className="w-full sm:w-64 space-y-2 text-right text-xs">
          <div className="flex justify-between py-1 text-zinc-600">
            <span>Subtotal</span>
            <span className="font-mono font-semibold text-zinc-900">{formatMoney(subtotal)}</span>
          </div>

          {config.showDiscount && discountAmount > 0 && (
            <div className="flex justify-between py-1 text-zinc-600">
              <span>Discount {config.discountType === 'percentage' ? `(${config.discountValue}%)` : ''}</span>
              <span className="font-mono font-semibold text-zinc-900">-{formatMoney(discountAmount)}</span>
            </div>
          )}

          {config.showTax && (
            <div className="flex justify-between py-1 text-zinc-600">
              <span>{config.taxName || 'Tax'} ({config.taxRate}%)</span>
              <span className="font-mono font-semibold text-zinc-900">{formatMoney(taxAmount)}</span>
            </div>
          )}

          <div className="flex justify-between py-3 border-t-2 border-zinc-900 text-sm font-bold text-zinc-950 mt-2">
            <span>Total Due</span>
            <span className="font-mono text-base font-extrabold text-zinc-950">{formatMoney(grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Signature */}
      {config.showSignature && (config.signatoryName || config.signatoryTitle) && (
        <div className="mt-14 pt-6 flex justify-end text-right text-xs">
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
