'use client'

import { useState, useEffect, useRef } from 'react'
import { Project } from '@/lib/types'
import {
  BillConfig,
  PrintableInvoice
} from '@/components/project/printable-invoice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import {
  Printer,
  Download,
  Share2,
  SlidersHorizontal,
  Eye,
  Sparkles,
  FileText,
  FileDown,
  Loader2
} from 'lucide-react'
import { generateInvoicePDF } from '@/lib/pdf-generator'
import { cn } from '@/lib/utils'

interface BillCustomizerModalProps {
  project: Project
  open: boolean
  onOpenChange: (open: boolean) => void
}

const STORAGE_KEY_SENDER = 'expcal_bill_sender_info'
const DEFAULT_INVOICE_NUMBER = 'INV-0000-0000'
const INVOICE_WIDTH = 760
const INVOICE_HEIGHT = 1075

export function BillCustomizerModal({
  project,
  open,
  onOpenChange
}: BillCustomizerModalProps) {
  // Mobile Tab state ('customize' | 'preview')
  const [activeTab, setActiveTab] = useState<'customize' | 'preview'>('customize')
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const previewViewportRef = useRef<HTMLDivElement>(null)
  const [previewScale, setPreviewScale] = useState(1)

  // Minimal Bill Configuration with Direct Total Amount & Template Selection
  const [config, setConfig] = useState<BillConfig>({
    // Template & Theme
    template: 'compact',
    accentColor: '#18181b',

    // Document Meta
    documentTitle: 'INVOICE',
    showInvoiceNumber: true,
    invoiceNumber: DEFAULT_INVOICE_NUMBER,
    showIssueDate: true,
    issueDate: '',
    showDueDate: true,
    dueDate: '',
    currencySymbol: '₹',

    // Billed From (Sender)
    showSender: true,
    senderName: '',
    senderEmail: '',
    senderPhone: '',
    senderAddress: '',
    senderTaxId: '',

    // Billed To (Client)
    showClient: true,
    clientName: '',
    clientCompany: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    clientTaxId: '',

    // Direct Billing Amount & Description
    billDescription: '',
    billAmount: 0,
    billQuantity: 1,

    // Tax & Discount
    showTax: false,
    taxName: 'GST',
    taxRate: 18,
    showDiscount: false,
    discountType: 'percentage',
    discountValue: 0,

    // Payment Details & Terms
    showPaymentDetails: true,
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: '',
    showTerms: true,
    termsAndConditions: 'Thank you for your business!',
    showSignature: false,
    signatoryName: '',
    signatoryTitle: 'Authorized Signatory'
  })

  // Load saved sender details and template preferences from localStorage on mount
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const now = new Date()
      const issueDate = now.toISOString().split('T')[0]
      const dueDateValue = new Date(now)
      dueDateValue.setDate(dueDateValue.getDate() + 15)

      let savedSender: Partial<BillConfig> = {}
      try {
        const savedValue = localStorage.getItem(STORAGE_KEY_SENDER)
        if (savedValue) savedSender = JSON.parse(savedValue)
      } catch {
        // Ignore invalid or unavailable local storage data.
      }

      setConfig((prev) => ({
        ...prev,
        invoiceNumber: prev.invoiceNumber === DEFAULT_INVOICE_NUMBER
          ? `INV-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
          : prev.invoiceNumber,
        issueDate: prev.issueDate || issueDate,
        dueDate: prev.dueDate || dueDateValue.toISOString().split('T')[0],
        senderName: savedSender.senderName || prev.senderName,
        senderEmail: savedSender.senderEmail || prev.senderEmail,
        senderPhone: savedSender.senderPhone || prev.senderPhone,
        senderAddress: savedSender.senderAddress || prev.senderAddress,
        senderTaxId: savedSender.senderTaxId || prev.senderTaxId,
        bankName: savedSender.bankName || prev.bankName,
        accountNumber: savedSender.accountNumber || prev.accountNumber,
        ifscCode: savedSender.ifscCode || prev.ifscCode,
        upiId: savedSender.upiId || prev.upiId
      }))
    })

    return () => cancelAnimationFrame(frame)
  }, [])

  // Keep the preview fully visible at every viewport width without changing
  // the invoice's fixed A4 proportions.
  useEffect(() => {
    const viewport = previewViewportRef.current
    if (!viewport) return

    const updatePreviewScale = () => {
      const availableWidth = Math.max(0, viewport.clientWidth - 48)
      setPreviewScale(Math.min(1, availableWidth / INVOICE_WIDTH || 1))
    }

    const frame = requestAnimationFrame(updatePreviewScale)
    const observer = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(updatePreviewScale)
      : null

    observer?.observe(viewport)
    return () => {
      cancelAnimationFrame(frame)
      observer?.disconnect()
    }
  }, [])

  // Auto-save sender info to localStorage
  const updateSenderInfo = (field: keyof BillConfig, value: string) => {
    setConfig((prev) => {
      const updated = { ...prev, [field]: value }
      try {
        const toSave = {
          senderName: updated.senderName,
          senderEmail: updated.senderEmail,
          senderPhone: updated.senderPhone,
          senderAddress: updated.senderAddress,
          senderTaxId: updated.senderTaxId,
          bankName: updated.bankName,
          accountNumber: updated.accountNumber,
          ifscCode: updated.ifscCode,
          upiId: updated.upiId
        }
        localStorage.setItem(STORAGE_KEY_SENDER, JSON.stringify(toSave))
      } catch {
        // ignore
      }
      return updated
    })
  }

  // Built-in Client-Side PDF Generator
  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true)
    try {
      const fileName = `${project.title.replace(/\s+/g, '_')}_Invoice_${config.invoiceNumber}.pdf`
      await generateInvoicePDF({
        fileName,
        elementId: 'printable-invoice-container',
        scale: 2.5
      })
    } catch (err) {
      console.error('Built-in PDF Generation Error:', err)
      window.print()
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  // Handle Print
  const handlePrint = () => {
    window.print()
  }

  // Handle CSV Export
  const handleExportCSV = () => {
    const qty = Number(config.billQuantity) || 1
    const unitRate = Number(config.billAmount) || 0
    const subtotal = qty * unitRate
    const discountAmount = config.showDiscount
      ? config.discountType === 'percentage'
        ? (subtotal * (Number(config.discountValue) || 0)) / 100
        : Number(config.discountValue) || 0
      : 0
    const taxableAmount = Math.max(0, subtotal - discountAmount)
    const taxAmount = config.showTax
      ? (taxableAmount * (Number(config.taxRate) || 0)) / 100
      : 0
    const total = taxableAmount + taxAmount

    const rows = [
      ['Invoice Number', 'Date', 'Item / Description', 'Quantity', 'Rate', 'Subtotal', 'Discount', 'Tax', 'Total'],
      [
        config.invoiceNumber,
        config.issueDate,
        config.billDescription || project.title || 'Service Item',
        qty.toString(),
        unitRate.toFixed(2),
        subtotal.toFixed(2),
        discountAmount.toFixed(2),
        taxAmount.toFixed(2),
        total.toFixed(2),
      ]
    ]

    const escapeCSV = (value: string) => `"${value.replace(/"/g, '""')}"`
    const csvContent = rows.map((row) => row.map(escapeCSV).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
    const downloadUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', downloadUrl)
    link.setAttribute('download', `${project.title.replace(/\s+/g, '_')}_Invoice_${config.invoiceNumber}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(downloadUrl)
  }

  // Handle WhatsApp / Share
  const handleShare = async () => {
    const summaryText = `📄 *${config.documentTitle}*\n` +
      `Project: *${project.title}*\n` +
      `Invoice #: ${config.invoiceNumber}\n` +
      `Total: ${config.currencySymbol} ${(Number(config.billAmount) || 0).toLocaleString('en-IN')}\n` +
      `Date: ${config.issueDate}\n` +
      (config.clientCompany ? `Client: ${config.clientCompany}\n` : '') +
      `\n🔗 Generated via ExpCal (${window.location.origin})`

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${config.documentTitle} - ${project.title}`,
          text: summaryText,
          url: window.location.href
        })
        return
      } catch {
        // fallback
      }
    }

    const waUrl = `https://wa.me/?text=${encodeURIComponent(summaryText)}`
    window.open(waUrl, '_blank')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[98vw] max-w-[1400px] h-[96vh] max-h-[96vh] p-0 rounded-2xl shadow-2xl border border-white/10 flex flex-col overflow-hidden bg-[#0c0e18]"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#121422]/90 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md flex-shrink-0"
              style={{ background: 'var(--gradient-primary)' }}
            >
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-foreground text-base font-bold tracking-tight">
                Export Invoice
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-xs">
                {project.title} — Customize & export invoice
              </DialogDescription>
            </div>
          </div>

          {/* Action Buttons (Desktop & Tablet) */}
          <div className="hidden sm:flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportCSV}
              className="rounded-xl h-9 text-xs font-semibold gap-1.5 border-border/80 hover:bg-muted/60"
            >
              <Download className="w-3.5 h-3.5" /> CSV
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleShare}
              className="rounded-xl h-9 text-xs font-semibold gap-1.5 border-border/80 hover:bg-muted/60"
            >
              <Share2 className="w-3.5 h-3.5" /> Share
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handlePrint}
              className="rounded-xl h-9 text-xs font-semibold gap-1.5 border-border/80 hover:bg-muted/60"
            >
              <Printer className="w-3.5 h-3.5" /> Print
            </Button>
            <Button
              size="sm"
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="rounded-xl h-9 text-xs font-bold gap-1.5 bg-white text-zinc-950 hover:bg-zinc-100 shadow-lg shadow-white/10 cursor-pointer"
            >
              {isGeneratingPDF ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <FileDown className="w-3.5 h-3.5" />
                  Download PDF
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Tab Switcher */}
        <div className="flex sm:hidden p-2 bg-muted/30 border-b border-border/60 flex-shrink-0">
          <button
            onClick={() => setActiveTab('customize')}
            className={cn(
              'flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5',
              activeTab === 'customize'
                ? 'bg-foreground text-background font-bold shadow-sm'
                : 'text-muted-foreground'
            )}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" /> Edit Invoice
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={cn(
              'flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5',
              activeTab === 'preview'
                ? 'bg-foreground text-background font-bold shadow-sm'
                : 'text-muted-foreground'
            )}
          >
            <Eye className="w-3.5 h-3.5" /> Preview
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* LEFT: Form Panel */}
          <div
            className={cn(
              'w-full sm:w-[360px] lg:w-[400px] flex-shrink-0 border-r border-white/10 overflow-y-auto p-4 space-y-4 bg-[#101220]',
              activeTab === 'preview' && 'hidden sm:block'
            )}
          >


            {/* 1. Direct Billing Amount & Description */}
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-3">
              <h4 className="text-xs uppercase font-bold text-foreground tracking-wider">Bill Amount</h4>
              <div>
                <Label className="text-[11px] text-muted-foreground font-medium">
                  Total Amount ({config.currencySymbol}) <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="number"
                  value={config.billAmount || ''}
                  onChange={(e) => setConfig({ ...config, billAmount: parseFloat(e.target.value) || 0 })}
                  placeholder="e.g. 25000"
                  className="mt-1 h-10 rounded-xl text-base font-bold bg-muted/80 font-mono text-primary focus:border-primary"
                  autoFocus
                />
              </div>

              <div>
                <Label className="text-[11px] text-muted-foreground font-medium">Description (Optional)</Label>
                <Input
                  value={config.billDescription}
                  onChange={(e) => setConfig({ ...config, billDescription: e.target.value })}
                  placeholder="Enter description (optional)"
                  className="mt-1 h-8.5 rounded-xl text-xs bg-muted/80"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div>
                  <Label className="text-[11px] text-muted-foreground">Currency</Label>
                  <select
                    value={config.currencySymbol}
                    onChange={(e) => setConfig({ ...config, currencySymbol: e.target.value })}
                    className="w-full mt-1 h-8.5 px-2 rounded-xl text-xs bg-muted/80 border border-border/70 text-foreground cursor-pointer"
                  >
                    <option value="₹">₹ INR</option>
                    <option value="$">$ USD</option>
                    <option value="€">€ EUR</option>
                    <option value="£">£ GBP</option>
                    <option value="AED">AED</option>
                  </select>
                </div>
                <div>
                  <Label className="text-[11px] text-muted-foreground">Quantity</Label>
                  <Input
                    type="number"
                    value={config.billQuantity}
                    onChange={(e) => setConfig({ ...config, billQuantity: parseFloat(e.target.value) || 1 })}
                    className="mt-1 h-8.5 rounded-xl text-xs bg-muted/80"
                  />
                </div>
              </div>
            </div>

            {/* 2. Document Meta */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Invoice Meta</h4>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <Label className="text-[11px] text-muted-foreground">Title</Label>
                  <Input
                    value={config.documentTitle}
                    onChange={(e) => setConfig({ ...config, documentTitle: e.target.value })}
                    className="h-8.5 rounded-xl text-xs bg-muted/40 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-[11px] text-muted-foreground">Invoice #</Label>
                  <Input
                    value={config.invoiceNumber}
                    onChange={(e) => setConfig({ ...config, invoiceNumber: e.target.value })}
                    className="h-8.5 rounded-xl text-xs bg-muted/40 mt-1 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <Label className="text-[11px] text-muted-foreground">Date</Label>
                  <Input
                    type="date"
                    value={config.issueDate}
                    onChange={(e) => setConfig({ ...config, issueDate: e.target.value })}
                    className="h-8.5 rounded-xl text-xs bg-muted/40 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-[11px] text-muted-foreground">Due Date</Label>
                  <Input
                    type="date"
                    value={config.dueDate}
                    onChange={(e) => setConfig({ ...config, dueDate: e.target.value })}
                    className="h-8.5 rounded-xl text-xs bg-muted/40 mt-1"
                  />
                </div>
              </div>
            </div>

            {/* 3. Tax & Discounts */}
            <div className="space-y-3 pt-3 border-t border-white/5">
              <h4 className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Taxes & Discounts</h4>

              {/* Tax */}
              <div className="p-3 rounded-xl bg-muted/30 border border-border/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">Apply Tax / GST / VAT</span>
                  <input
                    type="checkbox"
                    checked={config.showTax}
                    onChange={(e) => setConfig({ ...config, showTax: e.target.checked })}
                    className="rounded accent-primary w-4 h-4 cursor-pointer"
                  />
                </div>
                {config.showTax && (
                  <div className="flex items-center gap-2 pt-1">
                    <Input
                      value={config.taxName}
                      onChange={(e) => setConfig({ ...config, taxName: e.target.value })}
                      placeholder="GST / VAT"
                      className="h-7.5 w-24 rounded-lg text-xs bg-muted/60"
                    />
                    <Input
                      type="number"
                      value={config.taxRate}
                      onChange={(e) => setConfig({ ...config, taxRate: parseFloat(e.target.value) || 0 })}
                      className="h-7.5 w-20 rounded-lg text-xs bg-muted/60 font-semibold"
                    />
                    <span className="text-xs text-muted-foreground">%</span>
                  </div>
                )}
              </div>

              {/* Discount */}
              <div className="p-3 rounded-xl bg-muted/30 border border-border/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">Discount</span>
                  <input
                    type="checkbox"
                    checked={config.showDiscount}
                    onChange={(e) => setConfig({ ...config, showDiscount: e.target.checked })}
                    className="rounded accent-primary w-4 h-4 cursor-pointer"
                  />
                </div>
                {config.showDiscount && (
                  <div className="flex items-center gap-2 pt-1">
                    <select
                      value={config.discountType}
                      onChange={(e) => setConfig({ ...config, discountType: e.target.value as 'percentage' | 'fixed' })}
                      className="h-7.5 px-2 rounded-lg text-xs bg-muted/60 border border-border"
                    >
                      <option value="percentage">%</option>
                      <option value="fixed">Fixed</option>
                    </select>
                    <Input
                      type="number"
                      value={config.discountValue}
                      onChange={(e) => setConfig({ ...config, discountValue: parseFloat(e.target.value) || 0 })}
                      className="h-7.5 w-24 rounded-lg text-xs bg-muted/60 font-semibold"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 4. Sender & Client Info */}
            <div className="space-y-3 pt-3 border-t border-white/5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Your Info (From)</h4>
                <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Auto-saved
                </span>
              </div>
              <Input
                value={config.senderName}
                onChange={(e) => updateSenderInfo('senderName', e.target.value)}
                placeholder="Your Name / Studio Name"
                className="h-8.5 rounded-xl text-xs bg-muted/40"
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  value={config.senderEmail}
                  onChange={(e) => updateSenderInfo('senderEmail', e.target.value)}
                  placeholder="Email"
                  className="h-8.5 rounded-xl text-xs bg-muted/40"
                />
                <Input
                  value={config.senderPhone}
                  onChange={(e) => updateSenderInfo('senderPhone', e.target.value)}
                  placeholder="Phone"
                  className="h-8.5 rounded-xl text-xs bg-muted/40"
                />
              </div>
              <Input
                value={config.senderAddress}
                onChange={(e) => updateSenderInfo('senderAddress', e.target.value)}
                placeholder="Address (Optional)"
                className="h-8.5 rounded-xl text-xs bg-muted/40"
              />
            </div>

            <div className="space-y-3 pt-3 border-t border-white/5">
              <h4 className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Client Info (To)</h4>
              <Input
                value={config.clientCompany}
                onChange={(e) => setConfig({ ...config, clientCompany: e.target.value })}
                placeholder="Client / Company Name"
                className="h-8.5 rounded-xl text-xs bg-muted/40"
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  value={config.clientEmail}
                  onChange={(e) => setConfig({ ...config, clientEmail: e.target.value })}
                  placeholder="Client Email"
                  className="h-8.5 rounded-xl text-xs bg-muted/40"
                />
                <Input
                  value={config.clientPhone}
                  onChange={(e) => setConfig({ ...config, clientPhone: e.target.value })}
                  placeholder="Client Phone"
                  className="h-8.5 rounded-xl text-xs bg-muted/40"
                />
              </div>
              <Input
                value={config.clientAddress}
                onChange={(e) => setConfig({ ...config, clientAddress: e.target.value })}
                placeholder="Client Address (Optional)"
                className="h-8.5 rounded-xl text-xs bg-muted/40"
              />
            </div>

            {/* 5. Payment Details */}
            <div className="space-y-3 pt-3 border-t border-white/5">
              <h4 className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Payment Info</h4>
              <Input
                value={config.upiId}
                onChange={(e) => updateSenderInfo('upiId', e.target.value)}
                placeholder="UPI ID (e.g. user@oksbi)"
                className="h-8.5 rounded-xl text-xs bg-muted/40 font-mono"
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  value={config.bankName}
                  onChange={(e) => updateSenderInfo('bankName', e.target.value)}
                  placeholder="Bank Name"
                  className="h-8.5 rounded-xl text-xs bg-muted/40"
                />
                <Input
                  value={config.accountNumber}
                  onChange={(e) => updateSenderInfo('accountNumber', e.target.value)}
                  placeholder="Account Number"
                  className="h-8.5 rounded-xl text-xs bg-muted/40 font-mono"
                />
              </div>
              <Input
                value={config.termsAndConditions}
                onChange={(e) => setConfig({ ...config, termsAndConditions: e.target.value })}
                placeholder="Payment Note / Terms"
                className="h-8.5 rounded-xl text-xs bg-muted/40"
              />
            </div>
          </div>

          {/* RIGHT: Live Invoice Preview — scales to fit the available height */}
          <div
            ref={previewViewportRef}
            className={cn(
              'flex-1 bg-[#090b14] overflow-y-auto overflow-x-hidden flex items-start justify-center p-6',
              activeTab === 'customize' && 'hidden sm:flex'
            )}
          >
            <div
              className="flex-shrink-0"
              style={{
                width: `${INVOICE_WIDTH * previewScale}px`,
                height: `${INVOICE_HEIGHT * previewScale}px`,
              }}
            >
              <div
                style={{
                  width: `${INVOICE_WIDTH}px`,
                  height: `${INVOICE_HEIGHT}px`,
                  transform: `scale(${previewScale})`,
                  transformOrigin: 'top left',
                }}
              >
                <PrintableInvoice project={project} config={config} />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Bottom Bar */}
        <div className="sm:hidden p-3 bg-[#141624] border-t border-white/10 flex items-center gap-2 flex-shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCSV}
            className="flex-1 rounded-xl h-11 text-xs font-semibold gap-1 border-border/80"
          >
            <Download className="w-4 h-4" /> CSV
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleShare}
            className="flex-1 rounded-xl h-11 text-xs font-semibold gap-1 border-border/80"
          >
            <Share2 className="w-4 h-4" /> Share
          </Button>
          <Button
            size="sm"
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="flex-[1.5] rounded-xl h-11 text-xs font-bold gap-1.5 bg-white text-zinc-950 hover:bg-zinc-100 cursor-pointer shadow-md"
          >
            {isGeneratingPDF ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4" />
                Save PDF
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
