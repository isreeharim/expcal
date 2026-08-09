'use client'

import { Project, Entry } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { CreditCard, FileCheck, Building, UserCheck } from 'lucide-react'

export type InvoiceTemplateType = 'minimal' | 'agency' | 'corporate' | 'compact'

export interface BillConfig {
  // Template & Theme
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
      maximumFractionDigits: 2
    })}`
  }

  const senderDisplayName = config.senderName || 'Service Provider'
  const clientDisplayName = config.clientCompany || config.clientName || 'Client'
  const template = config.template || 'minimal'
  const accent = config.accentColor || '#18181b'

  // =========================================================================
  // 1. TEMPLATE: SLEEK AGENCY / STUDIO
  // =========================================================================
  if (template === 'agency') {
    return (
      <div
        id="printable-invoice-container"
        className={cn(
          'w-full max-w-[760px] mx-auto bg-white text-zinc-900 font-sans leading-relaxed transition-all box-border overflow-hidden',
          isPrintMode
            ? 'p-0 shadow-none border-none rounded-none'
            : 'shadow-[0_25px_60px_rgba(0,0,0,0.35)] rounded-2xl border border-zinc-200/90 my-auto'
        )}
        style={{ color: '#09090b' }}
      >
        {/* Bold Accent Header Bar */}
        <div
          className="p-8 sm:p-10 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
          style={{ backgroundColor: accent }}
        >
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest opacity-80 block mb-1">
              {config.documentTitle || 'INVOICE'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {config.senderName || project.title}
            </h1>
            {config.senderName && (
              <p className="text-xs opacity-80 mt-0.5 font-medium">
                Project: {project.title}
              </p>
            )}
          </div>

          <div className="text-left sm:text-right space-y-1 text-xs bg-white/10 p-3 rounded-xl backdrop-blur-sm">
            {config.showInvoiceNumber && config.invoiceNumber && (
              <p className="font-mono font-bold text-sm">{config.invoiceNumber}</p>
            )}
            {config.showIssueDate && config.issueDate && (
              <p className="opacity-90">Date: {formatDate(config.issueDate)}</p>
            )}
            {config.showDueDate && config.dueDate && (
              <p className="opacity-90">Due: {formatDate(config.dueDate)}</p>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-8 sm:p-10 space-y-8">
          {/* Addresses Grid */}
          {(config.showSender || config.showClient) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              {config.showSender && (
                <div className="p-4 rounded-xl border border-zinc-100 bg-zinc-50/50 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block mb-1">
                    Issued By
                  </span>
                  <p className="font-bold text-sm text-zinc-900">{senderDisplayName}</p>
                  {config.senderAddress && <p className="text-zinc-600 whitespace-pre-line">{config.senderAddress}</p>}
                  {config.senderEmail && <p className="text-zinc-600">{config.senderEmail}</p>}
                  {config.senderPhone && <p className="text-zinc-600">{config.senderPhone}</p>}
                  {config.senderTaxId && <p className="text-zinc-700 font-mono pt-1">GST/Tax: {config.senderTaxId}</p>}
                </div>
              )}

              {config.showClient && (
                <div className="p-4 rounded-xl border border-zinc-100 bg-zinc-50/50 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block mb-1">
                    Billed To
                  </span>
                  <p className="font-bold text-sm text-zinc-900">{clientDisplayName}</p>
                  {config.clientName && config.clientName !== config.clientCompany && (
                    <p className="text-zinc-700 font-medium">Attn: {config.clientName}</p>
                  )}
                  {config.clientAddress && <p className="text-zinc-600 whitespace-pre-line">{config.clientAddress}</p>}
                  {config.clientEmail && <p className="text-zinc-600">{config.clientEmail}</p>}
                  {config.clientPhone && <p className="text-zinc-600">{config.clientPhone}</p>}
                  {config.clientTaxId && <p className="text-zinc-700 font-mono pt-1">Client Tax: {config.clientTaxId}</p>}
                </div>
              )}
            </div>
          )}

          {/* Line Item Table */}
          <div className="rounded-xl overflow-hidden border border-zinc-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr className="text-zinc-600 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Item & Description</th>
                  <th className="py-3 px-3 text-center">Qty</th>
                  <th className="py-3 px-3 text-right">Rate</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 bg-white">
                <tr>
                  <td className="py-4 px-4">
                    <p className="font-bold text-zinc-950 text-sm">
                      {config.billDescription || project.title || 'Professional Services'}
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Deliverables & milestones</p>
                  </td>
                  <td className="py-4 px-3 text-center text-zinc-600 font-medium">{qty}</td>
                  <td className="py-4 px-3 text-right text-zinc-600 font-mono">{formatMoney(unitRate)}</td>
                  <td className="py-4 px-4 text-right font-bold text-zinc-950 font-mono text-sm">{formatMoney(subtotal)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs items-start">
            <div className="space-y-3">
              {config.showPaymentDetails && (config.bankName || config.accountNumber || config.upiId) && (
                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider flex items-center gap-1">
                    <CreditCard className="w-3 h-3" /> Payment Info
                  </span>
                  {config.upiId && <p><span className="text-zinc-400">UPI:</span> <strong className="font-mono text-zinc-950">{config.upiId}</strong></p>}
                  {config.bankName && <p><span className="text-zinc-400">Bank:</span> {config.bankName}</p>}
                  {config.accountNumber && <p><span className="text-zinc-400">A/C:</span> <strong className="font-mono text-zinc-950">{config.accountNumber}</strong></p>}
                  {config.ifscCode && <p><span className="text-zinc-400">IFSC:</span> <strong className="font-mono text-zinc-950">{config.ifscCode}</strong></p>}
                </div>
              )}
              {config.showTerms && config.termsAndConditions && (
                <p className="text-[11px] text-zinc-500"><span className="font-bold text-zinc-700">Note: </span>{config.termsAndConditions}</p>
              )}
            </div>

            {/* Calculations Box */}
            <div className="p-5 rounded-2xl text-white space-y-2" style={{ backgroundColor: accent }}>
              <div className="flex justify-between py-0.5 text-xs opacity-90">
                <span>Subtotal</span>
                <span className="font-mono">{formatMoney(subtotal)}</span>
              </div>
              {config.showDiscount && discountAmount > 0 && (
                <div className="flex justify-between py-0.5 text-xs text-emerald-300">
                  <span>Discount</span>
                  <span className="font-mono">-{formatMoney(discountAmount)}</span>
                </div>
              )}
              {config.showTax && (
                <div className="flex justify-between py-0.5 text-xs opacity-90">
                  <span>{config.taxName || 'Tax'} ({config.taxRate}%)</span>
                  <span className="font-mono">{formatMoney(taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t border-white/20 text-base font-black">
                <span>Total Due</span>
                <span className="font-mono text-lg">{formatMoney(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // =========================================================================
  // 2. TEMPLATE: CLASSIC CORPORATE
  // =========================================================================
  if (template === 'corporate') {
    return (
      <div
        id="printable-invoice-container"
        className={cn(
          'w-full max-w-[760px] mx-auto bg-white text-zinc-900 font-sans leading-relaxed transition-all box-border',
          isPrintMode
            ? 'p-0 shadow-none border-none rounded-none'
            : 'p-8 sm:p-12 shadow-[0_25px_60px_rgba(0,0,0,0.35)] rounded-2xl border-2 border-zinc-300'
        )}
        style={{ color: '#09090b' }}
      >
        {/* Double Top Header */}
        <div className="pb-6 border-b-2 border-zinc-900 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-serif font-black tracking-tight text-zinc-950 uppercase">
              {config.documentTitle || 'INVOICE'}
            </h1>
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mt-1">
              {config.senderName || project.title}
            </p>
          </div>
          <div className="text-right text-xs space-y-1">
            <p><span className="text-zinc-400">INVOICE #:</span> <strong className="font-mono font-bold text-sm">{config.invoiceNumber}</strong></p>
            <p><span className="text-zinc-400">DATE:</span> <span className="font-bold">{formatDate(config.issueDate)}</span></p>
            {config.showDueDate && <p><span className="text-zinc-400">DUE DATE:</span> <span className="font-bold">{formatDate(config.dueDate)}</span></p>}
          </div>
        </div>

        {/* Corporate 2-Col Info */}
        <div className="grid grid-cols-2 gap-8 py-6 border-b border-zinc-200 text-xs">
          <div>
            <p className="font-bold uppercase text-[10px] text-zinc-400 tracking-wider mb-1">Company / Sender</p>
            <p className="font-bold text-sm text-zinc-900">{senderDisplayName}</p>
            {config.senderAddress && <p className="text-zinc-600 whitespace-pre-line">{config.senderAddress}</p>}
            {config.senderEmail && <p className="text-zinc-600">{config.senderEmail}</p>}
            {config.senderPhone && <p className="text-zinc-600">{config.senderPhone}</p>}
            {config.senderTaxId && <p className="text-zinc-700 font-mono pt-1">TAX ID: {config.senderTaxId}</p>}
          </div>
          <div className="text-right">
            <p className="font-bold uppercase text-[10px] text-zinc-400 tracking-wider mb-1">Client / Bill To</p>
            <p className="font-bold text-sm text-zinc-900">{clientDisplayName}</p>
            {config.clientName && config.clientName !== config.clientCompany && <p className="text-zinc-700 font-medium">{config.clientName}</p>}
            {config.clientAddress && <p className="text-zinc-600 whitespace-pre-line">{config.clientAddress}</p>}
            {config.clientEmail && <p className="text-zinc-600">{config.clientEmail}</p>}
            {config.clientPhone && <p className="text-zinc-600">{config.clientPhone}</p>}
            {config.clientTaxId && <p className="text-zinc-700 font-mono pt-1">CLIENT TAX ID: {config.clientTaxId}</p>}
          </div>
        </div>

        {/* Structured Corporate Table */}
        <div className="py-6">
          <table className="w-full text-left text-xs border border-zinc-300">
            <thead className="bg-zinc-100 border-b border-zinc-300">
              <tr className="text-zinc-900 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3 border-r border-zinc-300">Description</th>
                <th className="py-2.5 px-3 text-center border-r border-zinc-300">Quantity</th>
                <th className="py-2.5 px-3 text-right border-r border-zinc-300">Unit Price</th>
                <th className="py-2.5 px-3 text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-200">
                <td className="py-4 px-3 border-r border-zinc-300 font-semibold text-zinc-950">
                  {config.billDescription || project.title || 'Professional Deliverables'}
                </td>
                <td className="py-4 px-3 text-center border-r border-zinc-300 font-medium">{qty}</td>
                <td className="py-4 px-3 text-right border-r border-zinc-300 font-mono">{formatMoney(unitRate)}</td>
                <td className="py-4 px-3 text-right font-bold text-zinc-950 font-mono">{formatMoney(subtotal)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Corporate Summary & Payment */}
        <div className="grid grid-cols-2 gap-8 text-xs pt-4 border-t-2 border-zinc-900 items-start">
          <div className="space-y-2">
            {config.showPaymentDetails && (config.bankName || config.accountNumber || config.upiId) && (
              <div className="p-3 border border-zinc-300 bg-zinc-50 space-y-1">
                <p className="font-bold uppercase text-[10px] text-zinc-700">Bank & Remittance Details</p>
                {config.bankName && <p>Bank: <strong>{config.bankName}</strong></p>}
                {config.accountNumber && <p>Account: <strong className="font-mono">{config.accountNumber}</strong></p>}
                {config.ifscCode && <p>IFSC: <strong className="font-mono">{config.ifscCode}</strong></p>}
                {config.upiId && <p>UPI: <strong className="font-mono">{config.upiId}</strong></p>}
              </div>
            )}
            {config.showTerms && config.termsAndConditions && (
              <p className="text-[11px] text-zinc-500 pt-1 leading-relaxed"><span className="font-bold">Terms: </span>{config.termsAndConditions}</p>
            )}
          </div>

          <div className="space-y-2 text-right">
            <div className="flex justify-between py-1 border-b border-zinc-100">
              <span className="text-zinc-600">Subtotal:</span>
              <span className="font-mono font-semibold">{formatMoney(subtotal)}</span>
            </div>
            {config.showDiscount && discountAmount > 0 && (
              <div className="flex justify-between py-1 text-emerald-600 border-b border-zinc-100">
                <span>Discount:</span>
                <span className="font-mono font-semibold">-{formatMoney(discountAmount)}</span>
              </div>
            )}
            {config.showTax && (
              <div className="flex justify-between py-1 border-b border-zinc-100">
                <span>{config.taxName || 'Tax'} ({config.taxRate}%):</span>
                <span className="font-mono font-semibold">{formatMoney(taxAmount)}</span>
              </div>
            )}
            <div className="flex justify-between py-2.5 border-t-2 border-zinc-900 text-sm font-black text-zinc-950">
              <span>TOTAL DUE:</span>
              <span className="font-mono text-base">{formatMoney(grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Corporate Signatory */}
        {config.showSignature && (config.signatoryName || config.signatoryTitle) && (
          <div className="mt-12 pt-4 flex justify-end text-right text-xs">
            <div className="w-48 space-y-1">
              <div className="h-10 border-b-2 border-zinc-900 mb-2" />
              <p className="font-bold text-zinc-900">{config.signatoryName || 'Authorized Signatory'}</p>
              {config.signatoryTitle && <p className="text-[10px] text-zinc-500">{config.signatoryTitle}</p>}
            </div>
          </div>
        )}
      </div>
    )
  }

  // =========================================================================
  // 3. TEMPLATE: COMPACT CLEAN
  // =========================================================================
  if (template === 'compact') {
    return (
      <div
        id="printable-invoice-container"
        className={cn(
          'w-full max-w-[760px] mx-auto bg-white text-zinc-900 font-sans leading-normal transition-all box-border',
          isPrintMode
            ? 'p-0 shadow-none border-none rounded-none'
            : 'p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-xl border border-zinc-200 my-auto'
        )}
        style={{ color: '#09090b' }}
      >
        <div className="flex justify-between items-center pb-4 border-b border-zinc-200">
          <div>
            <h2 className="text-xl font-bold uppercase tracking-tight text-zinc-950">
              {config.documentTitle || 'INVOICE'}
            </h2>
            <p className="text-xs text-zinc-500 font-medium">{project.title}</p>
          </div>
          <div className="text-right text-xs space-y-0.5">
            <p className="font-mono font-bold">{config.invoiceNumber}</p>
            <p className="text-zinc-500">{formatDate(config.issueDate)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 py-4 border-b border-zinc-100 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-400">From</span>
            <p className="font-bold text-zinc-900">{senderDisplayName}</p>
            {config.senderEmail && <p className="text-zinc-600">{config.senderEmail}</p>}
            {config.senderPhone && <p className="text-zinc-600">{config.senderPhone}</p>}
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-zinc-400">To</span>
            <p className="font-bold text-zinc-900">{clientDisplayName}</p>
            {config.clientEmail && <p className="text-zinc-600">{config.clientEmail}</p>}
            {config.clientPhone && <p className="text-zinc-600">{config.clientPhone}</p>}
          </div>
        </div>

        <div className="py-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-400 font-bold uppercase text-[10px]">
                <th className="pb-2">Description</th>
                <th className="pb-2 text-center">Qty</th>
                <th className="pb-2 text-right">Rate</th>
                <th className="pb-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-3 font-semibold text-zinc-900">{config.billDescription || project.title || 'Services'}</td>
                <td className="py-3 text-center text-zinc-600">{qty}</td>
                <td className="py-3 text-right text-zinc-600 font-mono">{formatMoney(unitRate)}</td>
                <td className="py-3 text-right font-bold text-zinc-950 font-mono">{formatMoney(subtotal)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="pt-3 border-t border-zinc-200 flex justify-between items-start text-xs">
          <div className="space-y-1 max-w-[280px]">
            {config.upiId && <p className="text-zinc-600"><span className="text-zinc-400">UPI:</span> <strong className="font-mono text-zinc-900">{config.upiId}</strong></p>}
            {config.termsAndConditions && <p className="text-[10px] text-zinc-500">{config.termsAndConditions}</p>}
          </div>
          <div className="w-48 space-y-1 text-right">
            <div className="flex justify-between text-zinc-600">
              <span>Subtotal:</span>
              <span className="font-mono">{formatMoney(subtotal)}</span>
            </div>
            {config.showTax && (
              <div className="flex justify-between text-zinc-600">
                <span>{config.taxName} ({config.taxRate}%):</span>
                <span className="font-mono">{formatMoney(taxAmount)}</span>
              </div>
            )}
            <div className="flex justify-between pt-1 border-t border-zinc-900 font-bold text-sm text-zinc-950">
              <span>Total:</span>
              <span className="font-mono">{formatMoney(grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // =========================================================================
  // 4. TEMPLATE: MODERN MINIMAL (DEFAULT)
  // =========================================================================
  return (
    <div
      id="printable-invoice-container"
      className={cn(
        'w-full max-w-[760px] mx-auto bg-white text-zinc-900 font-sans leading-relaxed transition-all box-border',
        isPrintMode
          ? 'p-0 shadow-none border-none rounded-none'
          : 'p-8 sm:p-14 shadow-[0_25px_60px_rgba(0,0,0,0.35)] rounded-2xl border border-zinc-200/90 my-auto'
      )}
      style={{ color: '#09090b' }}
    >
      {/* Top Header */}
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

        {/* Metadata Grid */}
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

      {/* From & To Cards */}
      {(config.showSender || config.showClient) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-7 border-b border-zinc-100 text-xs">
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

      {/* Minimal Table */}
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
            <tr>
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

      {/* Summary Grid */}
      <div className="pt-6 border-t border-zinc-200 grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs items-start">
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
                  <span className="text-zinc-400">IFSC:</span>{' '}
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

        {/* Calculations Box */}
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

      {/* Signature */}
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
