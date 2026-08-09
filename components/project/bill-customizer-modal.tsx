'use client'

import { useState, useEffect } from 'react'
import { Project } from '@/lib/types'
import { BillConfig, PrintableInvoice } from '@/components/project/printable-invoice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
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
  FileText
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface BillCustomizerModalProps {
  project: Project
  open: boolean
  onOpenChange: (open: boolean) => void
}

const STORAGE_KEY_SENDER = 'expcal_bill_sender_info'

export function BillCustomizerModal({
  project,
  open,
  onOpenChange
}: BillCustomizerModalProps) {
  // Mobile Tab state ('customize' | 'preview')
  const [activeTab, setActiveTab] = useState<'customize' | 'preview'>('customize')

  // Minimal Bill Configuration with Direct Total Amount
  const [config, setConfig] = useState<BillConfig>({
    // Document Meta
    documentTitle: 'INVOICE',
    showInvoiceNumber: true,
    invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    showIssueDate: true,
    issueDate: new Date().toISOString().split('T')[0],
    showDueDate: true,
    dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
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

    // Direct Billing Amount & Description (No pre-filled description)
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

  // Load saved sender details from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SENDER)
      if (saved) {
        const parsed = JSON.parse(saved)
        setConfig((prev) => ({
          ...prev,
          senderName: parsed.senderName || prev.senderName,
          senderEmail: parsed.senderEmail || prev.senderEmail,
          senderPhone: parsed.senderPhone || prev.senderPhone,
          senderAddress: parsed.senderAddress || prev.senderAddress,
          senderTaxId: parsed.senderTaxId || prev.senderTaxId,
          bankName: parsed.bankName || prev.bankName,
          accountNumber: parsed.accountNumber || prev.accountNumber,
          ifscCode: parsed.ifscCode || prev.ifscCode,
          upiId: parsed.upiId || prev.upiId
        }))
      }
    } catch {
      // ignore
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

  // Handle Print
  const handlePrint = () => {
    window.print()
  }

  // Handle CSV Export
  const handleExportCSV = () => {
    const qty = Number(config.billQuantity) || 1
    const unitRate = Number(config.billAmount) || 0
    const total = qty * unitRate

    const rows = [
      ['Date', 'Item / Description', 'Quantity', 'Rate', 'Amount'],
      [config.issueDate, config.billDescription || project.title || 'Service Item', qty.toString(), unitRate.toString(), total.toString()]
    ]

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.map((c) => `"${c}"`).join(',')).join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `${project.title.replace(/\s+/g, '_')}_Invoice_${config.invoiceNumber}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
        className="w-[96vw] max-w-7xl h-[92vh] max-h-[92vh] p-0 rounded-3xl shadow-2xl backdrop-blur-3xl border border-white/10 flex flex-col overflow-hidden bg-[#0c0e18] animate-fade-in"
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
                {project.title}
              </DialogDescription>
            </div>
          </div>

          {/* Action Buttons (Desktop & Tablet) */}
          <div className="hidden sm:flex items-center gap-2.5">
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
              onClick={handlePrint}
              className="rounded-xl h-9 text-xs font-bold gap-1.5 bg-white text-zinc-950 hover:bg-zinc-100 shadow-md shadow-white/10 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> Print / Save PDF
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

        {/* Modal Body: Split view on Desktop / Tabs on Mobile */}
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT: Streamlined Direct Form */}
          <div
            className={cn(
              'w-full md:w-[380px] lg:w-[420px] xl:w-[450px] flex-shrink-0 border-r border-white/10 overflow-y-auto p-5 space-y-5 bg-[#101220]',
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

          {/* RIGHT: Live Minimal Paper Canvas (Desktop Studio) */}
          <div
            className={cn(
              'flex-1 bg-[#090b14] p-4 md:p-8 lg:p-12 overflow-y-auto flex items-start justify-center',
              activeTab === 'customize' && 'hidden sm:flex'
            )}
          >
            <div className="w-full max-w-[210mm] transition-all my-auto">
              <PrintableInvoice project={project} config={config} />
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
            onClick={handlePrint}
            className="flex-[1.5] rounded-xl h-11 text-xs font-bold gap-1.5 bg-white text-zinc-950 hover:bg-zinc-100 cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Print PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
