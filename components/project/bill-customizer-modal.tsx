'use client'

import { useState, useEffect } from 'react'
import { Project, Entry } from '@/lib/types'
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
  FileText,
  Building,
  User,
  DollarSign,
  CreditCard,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface BillCustomizerModalProps {
  project: Project
  entries: Entry[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

const STORAGE_KEY_SENDER = 'expcal_bill_sender_info'

export function BillCustomizerModal({
  project,
  entries,
  open,
  onOpenChange
}: BillCustomizerModalProps) {
  // Mobile Tab state ('customize' | 'preview')
  const [activeTab, setActiveTab] = useState<'customize' | 'preview'>('customize')

  // Default Minimal Bill Configuration
  const [config, setConfig] = useState<BillConfig>({
    // Document Meta
    documentTitle: 'TAX INVOICE',
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

    // Pricing & Items
    useCustomTotal: false,
    customTotalAmount: 0,
    customTotalDescription: 'Project Deliverables & Services',
    includeHours: true,
    hourlyRate: 500,
    includeExpenses: true,
    includeFixedFee: false,
    fixedFeeAmount: 0,
    fixedFeeDescription: 'Project Fee',
    showTax: false,
    taxName: 'GST',
    taxRate: 18,
    showDiscount: false,
    discountType: 'percentage',
    discountValue: 0,

    // Scope & Filters
    dateRangeType: 'all',
    startDate: '',
    endDate: '',
    includeReceipts: false,

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
    const rows = [['Date', 'Item / Description', 'Category', 'Quantity', 'Rate', 'Amount']]

    if (config.useCustomTotal) {
      rows.push([
        '',
        config.customTotalDescription || 'Project Deliverables',
        'Direct Total Fee',
        '1',
        config.customTotalAmount.toString(),
        config.customTotalAmount.toString()
      ])
    } else {
      if (config.includeHours) {
        const totalH = entries.reduce((s, e) => {
          if (e.start_time && e.end_time) {
            const [sh, sm] = e.start_time.split(':').map(Number)
            const [eh, em] = e.end_time.split(':').map(Number)
            return s + Math.max(0, eh - sh + (em - sm) / 60)
          }
          return s
        }, 0)
        if (totalH > 0) {
          rows.push(['', 'Work Hours', 'Labor', totalH.toFixed(2), config.hourlyRate.toString(), (totalH * config.hourlyRate).toFixed(2)])
        }
      }

      if (config.includeFixedFee && config.fixedFeeAmount > 0) {
        rows.push(['', config.fixedFeeDescription, 'Fee', '1', config.fixedFeeAmount.toString(), config.fixedFeeAmount.toString()])
      }

      if (config.includeExpenses) {
        entries.forEach((e) => {
          const expList = Array.isArray(e.expenses) ? e.expenses : []
          expList.forEach((exp) => {
            rows.push([e.date, exp.note ? `${exp.category} - ${exp.note}` : exp.category, 'Expense', '1', exp.amount.toString(), exp.amount.toString()])
          })
        })
      }
    }

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
        className="w-[98vw] max-w-7xl h-[94vh] p-0 rounded-3xl shadow-2xl backdrop-blur-3xl border border-white/10 flex flex-col overflow-hidden bg-[#0e101a] animate-fade-in"
      >
        {/* Clean Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#141624] flex-shrink-0">
          <div>
            <DialogTitle className="text-foreground text-base font-bold tracking-tight">
              Export Bill & Invoice
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              {project.title} — Customize and print minimal invoice.
            </DialogDescription>
          </div>

          {/* Action Buttons */}
          <div className="hidden sm:flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportCSV}
              className="rounded-xl h-9 text-xs font-semibold gap-1.5 border-border/80"
            >
              <Download className="w-3.5 h-3.5" /> CSV
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleShare}
              className="rounded-xl h-9 text-xs font-semibold gap-1.5 border-border/80"
            >
              <Share2 className="w-3.5 h-3.5" /> Share
            </Button>
            <Button
              size="sm"
              onClick={handlePrint}
              className="rounded-xl h-9 text-xs font-semibold gap-1.5 bg-foreground text-background hover:bg-foreground/90 font-bold"
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
            <SlidersHorizontal className="w-3.5 h-3.5" /> Edit Options
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
            <Eye className="w-3.5 h-3.5" /> Preview Bill
          </button>
        </div>

        {/* Modal Body: Split view on Desktop / Tabs on Mobile */}
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT: Streamlined Customizer Form */}
          <div
            className={cn(
              'w-full lg:w-[420px] flex-shrink-0 border-r border-white/10 overflow-y-auto p-5 space-y-5 bg-[#121422]',
              activeTab === 'preview' && 'hidden sm:block'
            )}
          >
            {/* 1. Header & Meta */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Document Details</h4>
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
                    className="h-8.5 rounded-xl text-xs bg-muted/40 mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="col-span-1">
                  <Label className="text-[11px] text-muted-foreground">Currency</Label>
                  <select
                    value={config.currencySymbol}
                    onChange={(e) => setConfig({ ...config, currencySymbol: e.target.value })}
                    className="w-full mt-1 h-8.5 px-2 rounded-xl text-xs bg-muted/40 border border-border/70 text-foreground"
                  >
                    <option value="₹">₹ INR</option>
                    <option value="$">$ USD</option>
                    <option value="€">€ EUR</option>
                    <option value="£">£ GBP</option>
                    <option value="AED">AED</option>
                  </select>
                </div>
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

            {/* 2. From & To */}
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

            {/* 3. Items & Rates */}
            <div className="space-y-3 pt-3 border-t border-white/5">
              <h4 className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Items & Billing Amount</h4>

              {/* Billing Mode Switcher */}
              <div className="flex p-1 rounded-xl bg-muted/50 border border-border/60">
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, useCustomTotal: true })}
                  className={cn(
                    'flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all',
                    config.useCustomTotal
                      ? 'bg-foreground text-background font-bold shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Enter Total Amount
                </button>
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, useCustomTotal: false })}
                  className={cn(
                    'flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all',
                    !config.useCustomTotal
                      ? 'bg-foreground text-background font-bold shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Auto from Hours & Expenses
                </button>
              </div>

              {/* Direct Total Amount Inputs */}
              {config.useCustomTotal ? (
                <div className="p-3.5 rounded-xl bg-muted/30 border border-border/50 space-y-3">
                  <div>
                    <Label className="text-[11px] text-muted-foreground font-medium">
                      Total Bill Amount ({config.currencySymbol}) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="number"
                      value={config.customTotalAmount || ''}
                      onChange={(e) => setConfig({ ...config, customTotalAmount: parseFloat(e.target.value) || 0 })}
                      placeholder="e.g. 25000"
                      className="mt-1 h-9 rounded-xl text-sm font-bold bg-muted/60 font-mono text-primary"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] text-muted-foreground font-medium">
                      Description / Line Item Note
                    </Label>
                    <Input
                      value={config.customTotalDescription}
                      onChange={(e) => setConfig({ ...config, customTotalDescription: e.target.value })}
                      placeholder="Project Deliverables & Services"
                      className="mt-1 h-8.5 rounded-xl text-xs bg-muted/60"
                    />
                  </div>
                </div>
              ) : (
                <>
                  {/* Hours */}
                  <div className="p-3 rounded-xl bg-muted/30 border border-border/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">Bill Work Hours</span>
                      <input
                        type="checkbox"
                        checked={config.includeHours}
                        onChange={(e) => setConfig({ ...config, includeHours: e.target.checked })}
                        className="rounded accent-primary w-4 h-4 cursor-pointer"
                      />
                    </div>
                    {config.includeHours && (
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-xs text-muted-foreground">Hourly Rate ({config.currencySymbol}/hr):</span>
                        <Input
                          type="number"
                          value={config.hourlyRate}
                          onChange={(e) => setConfig({ ...config, hourlyRate: parseFloat(e.target.value) || 0 })}
                          className="h-7.5 w-24 rounded-lg text-xs bg-muted/60 font-semibold"
                        />
                      </div>
                    )}
                  </div>

                  {/* Expenses */}
                  <div className="p-3 rounded-xl bg-muted/30 border border-border/50 flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">Include Project Expenses</span>
                    <input
                      type="checkbox"
                      checked={config.includeExpenses}
                      onChange={(e) => setConfig({ ...config, includeExpenses: e.target.checked })}
                      className="rounded accent-primary w-4 h-4 cursor-pointer"
                    />
                  </div>
                </>
              )}

              {/* Tax */}
              <div className="p-3 rounded-xl bg-muted/30 border border-border/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">Tax / GST / VAT</span>
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

            {/* 4. Payment Details */}
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

          {/* RIGHT: Minimal Paper Sheet Preview */}
          <div
            className={cn(
              'flex-1 bg-[#090a12] p-4 sm:p-8 overflow-y-auto flex items-start justify-center',
              activeTab === 'customize' && 'hidden sm:flex'
            )}
          >
            <div className="w-full max-w-[210mm] scale-[0.88] sm:scale-100 origin-top transition-transform">
              <PrintableInvoice project={project} entries={entries} config={config} />
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
            className="flex-[1.5] rounded-xl h-11 text-xs font-bold gap-1.5 bg-foreground text-background hover:bg-foreground/90"
          >
            <Printer className="w-4 h-4" /> Print PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
