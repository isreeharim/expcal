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
  FileText,
  Printer,
  Download,
  Share2,
  SlidersHorizontal,
  Eye,
  Building2,
  User,
  DollarSign,
  Calendar,
  CreditCard,
  Palette,
  Check,
  RotateCcw,
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

  // Active accordion section
  const [activeAccordion, setActiveAccordion] = useState<string>('meta')

  // Default Bill Configuration
  const [config, setConfig] = useState<BillConfig>({
    // Document Meta
    documentTitle: 'TAX INVOICE',
    showInvoiceNumber: true,
    invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    showIssueDate: true,
    issueDate: new Date().toISOString().split('T')[0],
    showDueDate: true,
    dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    showPoNumber: false,
    poNumber: '',
    currencySymbol: '₹',

    // Billed From (Sender)
    showSender: true,
    senderName: '',
    senderEmail: '',
    senderPhone: '',
    senderAddress: '',
    senderTaxId: '',
    senderWebsite: '',

    // Billed To (Client)
    showClient: true,
    clientName: '',
    clientCompany: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    clientTaxId: '',

    // Pricing & Financials
    includeHours: true,
    hourlyRate: 500,
    includeExpenses: true,
    includeFixedFee: false,
    fixedFeeAmount: 0,
    fixedFeeDescription: 'Project Professional Fee',
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
    includeNotes: true,
    includeReceipts: true,

    // Notes & Payment
    showPaymentDetails: true,
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: '',
    paymentTerms: 'Payment due within 15 days of issue date.',
    showTerms: true,
    termsAndConditions: 'Thank you for your business! Please make payment via UPI or Bank Transfer.',
    showSignature: true,
    signatoryName: '',
    signatoryTitle: 'Authorized Signatory',

    // Theme
    templateTheme: 'modern'
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
          senderWebsite: parsed.senderWebsite || prev.senderWebsite,
          bankName: parsed.bankName || prev.bankName,
          accountNumber: parsed.accountNumber || prev.accountNumber,
          ifscCode: parsed.ifscCode || prev.ifscCode,
          upiId: parsed.upiId || prev.upiId,
          signatoryName: parsed.signatoryName || prev.signatoryName
        }))
      }
    } catch {
      // ignore
    }
  }, [])

  // Auto-save sender info to localStorage when changed
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
          senderWebsite: updated.senderWebsite,
          bankName: updated.bankName,
          accountNumber: updated.accountNumber,
          ifscCode: updated.ifscCode,
          upiId: updated.upiId,
          signatoryName: updated.signatoryName
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
    const rows = [
      ['Date', 'Item / Description', 'Category / Type', 'Quantity', 'Rate', 'Amount']
    ]

    // Hours
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
        rows.push([
          '',
          'Logged Work Hours',
          'Labor',
          totalH.toFixed(2),
          config.hourlyRate.toString(),
          (totalH * config.hourlyRate).toFixed(2)
        ])
      }
    }

    // Fixed Fee
    if (config.includeFixedFee && config.fixedFeeAmount > 0) {
      rows.push(['', config.fixedFeeDescription, 'Fixed Fee', '1', config.fixedFeeAmount.toString(), config.fixedFeeAmount.toString()])
    }

    // Expenses
    if (config.includeExpenses) {
      entries.forEach((e) => {
        const expList = Array.isArray(e.expenses) ? e.expenses : []
        expList.forEach((exp) => {
          rows.push([
            e.date,
            exp.note ? `${exp.category} - ${exp.note}` : exp.category,
            'Expense',
            '1',
            exp.amount.toString(),
            exp.amount.toString()
          ])
        })
      })
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.map((c) => `"${c}"`).join(',')).join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `${project.title.replace(/\s+/g, '_')}_Bill_${config.invoiceNumber}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Handle WhatsApp / Web Share
  const handleShare = async () => {
    const summaryText = `📄 *${config.documentTitle}*\n` +
      `Project: *${project.title}*\n` +
      `Invoice #: ${config.invoiceNumber}\n` +
      `Date: ${config.issueDate}\n` +
      (config.clientCompany ? `Billed To: ${config.clientCompany}\n` : '') +
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
        // user cancelled or failed, fallback to whatsapp
      }
    }

    const waUrl = `https://wa.me/?text=${encodeURIComponent(summaryText)}`
    window.open(waUrl, '_blank')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[98vw] max-w-7xl h-[94vh] p-0 rounded-3xl shadow-2xl backdrop-blur-3xl border border-white/12 flex flex-col overflow-hidden bg-[#0d0f1d] animate-fade-in"
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-5 sm:px-8 py-4 border-b border-white/10 bg-[#121422]/90 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md flex-shrink-0"
              style={{ background: 'var(--gradient-primary)' }}
            >
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-foreground text-base sm:text-lg font-bold tracking-tight">
                Export Bill & Invoice
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-xs">
                {project.title} — Customize any field or avoid unwanted sections.
              </DialogDescription>
            </div>
          </div>

          {/* Quick Actions (Desktop & Tablet) */}
          <div className="hidden sm:flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportCSV}
              className="rounded-xl h-9 text-xs font-semibold gap-1.5 border-border/80"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" /> Export CSV
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleShare}
              className="rounded-xl h-9 text-xs font-semibold gap-1.5 border-border/80"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-400" /> Share
            </Button>
            <Button
              size="sm"
              onClick={handlePrint}
              className="rounded-xl h-9 text-xs font-semibold gap-1.5 text-white shadow-md shadow-primary/30"
              style={{ background: 'var(--gradient-primary)', border: 'none' }}
            >
              <Printer className="w-3.5 h-3.5" /> Print / Save PDF
            </Button>
          </div>
        </div>

        {/* Mobile Tab Switcher (Visible only on mobile) */}
        <div className="flex sm:hidden p-2 bg-muted/40 border-b border-border/60 flex-shrink-0">
          <button
            onClick={() => setActiveTab('customize')}
            className={cn(
              'flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5',
              activeTab === 'customize'
                ? 'bg-primary text-white shadow-md shadow-primary/30'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" /> Customize Options
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={cn(
              'flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5',
              activeTab === 'preview'
                ? 'bg-primary text-white shadow-md shadow-primary/30'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Eye className="w-3.5 h-3.5" /> Live A4 Preview
          </button>
        </div>

        {/* Main Content Area: Split View on Desktop / Tabbed on Mobile */}
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT: Customizer Panel */}
          <div
            className={cn(
              'w-full lg:w-[460px] flex-shrink-0 border-r border-white/10 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#101223]',
              activeTab === 'preview' && 'hidden sm:block'
            )}
          >
            {/* Accordion 1: Document Identity & Currency */}
            <div className="rounded-2xl border border-white/10 bg-muted/20 overflow-hidden">
              <button
                type="button"
                onClick={() => setActiveAccordion(activeAccordion === 'meta' ? '' : 'meta')}
                className="w-full p-3.5 text-left font-bold text-xs flex items-center justify-between text-foreground hover:bg-muted/40 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" /> Document Title & Numbers
                </span>
                <span className="text-[10px] text-muted-foreground">{activeAccordion === 'meta' ? '▲' : '▼'}</span>
              </button>

              {activeAccordion === 'meta' && (
                <div className="p-4 pt-1 space-y-3.5 border-t border-white/5 text-xs">
                  <div>
                    <Label className="text-[11px] text-muted-foreground font-medium">Document Title</Label>
                    <Input
                      value={config.documentTitle}
                      onChange={(e) => setConfig({ ...config, documentTitle: e.target.value })}
                      placeholder="e.g. TAX INVOICE, BILL, EXPENSE REPORT"
                      className="mt-1 h-9 rounded-xl text-xs bg-muted/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <Label className="text-[11px] text-muted-foreground font-medium">Invoice #</Label>
                        <input
                          type="checkbox"
                          checked={config.showInvoiceNumber}
                          onChange={(e) => setConfig({ ...config, showInvoiceNumber: e.target.checked })}
                          className="rounded accent-primary w-3.5 h-3.5 cursor-pointer"
                        />
                      </div>
                      <Input
                        disabled={!config.showInvoiceNumber}
                        value={config.invoiceNumber}
                        onChange={(e) => setConfig({ ...config, invoiceNumber: e.target.value })}
                        className="h-9 rounded-xl text-xs bg-muted/50 disabled:opacity-40"
                      />
                    </div>

                    <div>
                      <Label className="text-[11px] text-muted-foreground font-medium">Currency Symbol</Label>
                      <select
                        value={config.currencySymbol}
                        onChange={(e) => setConfig({ ...config, currencySymbol: e.target.value })}
                        className="w-full mt-1 h-9 px-2.5 rounded-xl text-xs bg-muted/50 border border-border/80 text-foreground cursor-pointer"
                      >
                        <option value="₹">₹ (INR - Rupee)</option>
                        <option value="$">$ (USD - Dollar)</option>
                        <option value="€">€ (EUR - Euro)</option>
                        <option value="£">£ (GBP - Pound)</option>
                        <option value="AED">AED (Dirham)</option>
                        <option value="¥">¥ (Yen/Yuan)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <Label className="text-[11px] text-muted-foreground font-medium">Issue Date</Label>
                        <input
                          type="checkbox"
                          checked={config.showIssueDate}
                          onChange={(e) => setConfig({ ...config, showIssueDate: e.target.checked })}
                          className="rounded accent-primary w-3.5 h-3.5 cursor-pointer"
                        />
                      </div>
                      <Input
                        type="date"
                        disabled={!config.showIssueDate}
                        value={config.issueDate}
                        onChange={(e) => setConfig({ ...config, issueDate: e.target.value })}
                        className="h-9 rounded-xl text-xs bg-muted/50 disabled:opacity-40"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <Label className="text-[11px] text-muted-foreground font-medium">Due Date</Label>
                        <input
                          type="checkbox"
                          checked={config.showDueDate}
                          onChange={(e) => setConfig({ ...config, showDueDate: e.target.checked })}
                          className="rounded accent-primary w-3.5 h-3.5 cursor-pointer"
                        />
                      </div>
                      <Input
                        type="date"
                        disabled={!config.showDueDate}
                        value={config.dueDate}
                        onChange={(e) => setConfig({ ...config, dueDate: e.target.value })}
                        className="h-9 rounded-xl text-xs bg-muted/50 disabled:opacity-40"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Accordion 2: Billed From (Your Business Info - Auto Saved) */}
            <div className="rounded-2xl border border-white/10 bg-muted/20 overflow-hidden">
              <button
                type="button"
                onClick={() => setActiveAccordion(activeAccordion === 'sender' ? '' : 'sender')}
                className="w-full p-3.5 text-left font-bold text-xs flex items-center justify-between text-foreground hover:bg-muted/40 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-400" /> Billed From (Your Info)
                </span>
                <span className="text-[10px] text-muted-foreground">{activeAccordion === 'sender' ? '▲' : '▼'}</span>
              </button>

              {activeAccordion === 'sender' && (
                <div className="p-4 pt-1 space-y-3 border-t border-white/5 text-xs">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Auto-saved to device
                    </span>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <span className="text-[10px] text-muted-foreground">Show in bill</span>
                      <input
                        type="checkbox"
                        checked={config.showSender}
                        onChange={(e) => setConfig({ ...config, showSender: e.target.checked })}
                        className="rounded accent-primary w-3.5 h-3.5"
                      />
                    </label>
                  </div>

                  <div>
                    <Label className="text-[11px] text-muted-foreground font-medium">Business / Freelancer Name</Label>
                    <Input
                      value={config.senderName}
                      onChange={(e) => updateSenderInfo('senderName', e.target.value)}
                      placeholder="e.g. John Doe Consulting / Acme Studio"
                      className="mt-1 h-9 rounded-xl text-xs bg-muted/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-[11px] text-muted-foreground font-medium">Email</Label>
                      <Input
                        value={config.senderEmail}
                        onChange={(e) => updateSenderInfo('senderEmail', e.target.value)}
                        placeholder="you@domain.com"
                        className="mt-1 h-9 rounded-xl text-xs bg-muted/50"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] text-muted-foreground font-medium">Phone</Label>
                      <Input
                        value={config.senderPhone}
                        onChange={(e) => updateSenderInfo('senderPhone', e.target.value)}
                        placeholder="+91 98765 43210"
                        className="mt-1 h-9 rounded-xl text-xs bg-muted/50"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-[11px] text-muted-foreground font-medium">Address</Label>
                    <Input
                      value={config.senderAddress}
                      onChange={(e) => updateSenderInfo('senderAddress', e.target.value)}
                      placeholder="City, State, Country"
                      className="mt-1 h-9 rounded-xl text-xs bg-muted/50"
                    />
                  </div>

                  <div>
                    <Label className="text-[11px] text-muted-foreground font-medium">GSTIN / Tax ID (Optional)</Label>
                    <Input
                      value={config.senderTaxId}
                      onChange={(e) => updateSenderInfo('senderTaxId', e.target.value)}
                      placeholder="e.g. 29AAAAA0000A1Z5"
                      className="mt-1 h-9 rounded-xl text-xs bg-muted/50"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Accordion 3: Billed To (Client Info) */}
            <div className="rounded-2xl border border-white/10 bg-muted/20 overflow-hidden">
              <button
                type="button"
                onClick={() => setActiveAccordion(activeAccordion === 'client' ? '' : 'client')}
                className="w-full p-3.5 text-left font-bold text-xs flex items-center justify-between text-foreground hover:bg-muted/40 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4 text-cyan-400" /> Billed To (Client Details)
                </span>
                <span className="text-[10px] text-muted-foreground">{activeAccordion === 'client' ? '▲' : '▼'}</span>
              </button>

              {activeAccordion === 'client' && (
                <div className="p-4 pt-1 space-y-3 border-t border-white/5 text-xs">
                  <div className="flex items-center justify-end pb-1">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <span className="text-[10px] text-muted-foreground">Show in bill</span>
                      <input
                        type="checkbox"
                        checked={config.showClient}
                        onChange={(e) => setConfig({ ...config, showClient: e.target.checked })}
                        className="rounded accent-primary w-3.5 h-3.5"
                      />
                    </label>
                  </div>

                  <div>
                    <Label className="text-[11px] text-muted-foreground font-medium">Client / Company Name</Label>
                    <Input
                      value={config.clientCompany}
                      onChange={(e) => setConfig({ ...config, clientCompany: e.target.value })}
                      placeholder="e.g. Global Tech Solutions"
                      className="mt-1 h-9 rounded-xl text-xs bg-muted/50"
                    />
                  </div>

                  <div>
                    <Label className="text-[11px] text-muted-foreground font-medium">Contact Person (Optional)</Label>
                    <Input
                      value={config.clientName}
                      onChange={(e) => setConfig({ ...config, clientName: e.target.value })}
                      placeholder="e.g. Robert Smith"
                      className="mt-1 h-9 rounded-xl text-xs bg-muted/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-[11px] text-muted-foreground font-medium">Client Email</Label>
                      <Input
                        value={config.clientEmail}
                        onChange={(e) => setConfig({ ...config, clientEmail: e.target.value })}
                        placeholder="billing@client.com"
                        className="mt-1 h-9 rounded-xl text-xs bg-muted/50"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] text-muted-foreground font-medium">Client Phone</Label>
                      <Input
                        value={config.clientPhone}
                        onChange={(e) => setConfig({ ...config, clientPhone: e.target.value })}
                        placeholder="+1 555 123 4567"
                        className="mt-1 h-9 rounded-xl text-xs bg-muted/50"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-[11px] text-muted-foreground font-medium">Billing Address</Label>
                    <Input
                      value={config.clientAddress}
                      onChange={(e) => setConfig({ ...config, clientAddress: e.target.value })}
                      placeholder="Street, City, Country"
                      className="mt-1 h-9 rounded-xl text-xs bg-muted/50"
                    />
                  </div>

                  <div>
                    <Label className="text-[11px] text-muted-foreground font-medium">Client Tax ID / GSTIN</Label>
                    <Input
                      value={config.clientTaxId}
                      onChange={(e) => setConfig({ ...config, clientTaxId: e.target.value })}
                      placeholder="Client VAT / Tax ID"
                      className="mt-1 h-9 rounded-xl text-xs bg-muted/50"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Accordion 4: Rates, Taxes & Financials */}
            <div className="rounded-2xl border border-white/10 bg-muted/20 overflow-hidden">
              <button
                type="button"
                onClick={() => setActiveAccordion(activeAccordion === 'pricing' ? '' : 'pricing')}
                className="w-full p-3.5 text-left font-bold text-xs flex items-center justify-between text-foreground hover:bg-muted/40 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-amber-400" /> Rates, Labor & Taxes
                </span>
                <span className="text-[10px] text-muted-foreground">{activeAccordion === 'pricing' ? '▲' : '▼'}</span>
              </button>

              {activeAccordion === 'pricing' && (
                <div className="p-4 pt-1 space-y-4 border-t border-white/5 text-xs">
                  {/* Hours Billing Switch & Rate */}
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="font-semibold text-foreground cursor-pointer">Bill Logged Work Hours</Label>
                      <input
                        type="checkbox"
                        checked={config.includeHours}
                        onChange={(e) => setConfig({ ...config, includeHours: e.target.checked })}
                        className="rounded accent-primary w-4 h-4 cursor-pointer"
                      />
                    </div>
                    {config.includeHours && (
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-muted-foreground text-xs">Hourly Rate ({config.currencySymbol}/hr):</span>
                        <Input
                          type="number"
                          value={config.hourlyRate}
                          onChange={(e) => setConfig({ ...config, hourlyRate: parseFloat(e.target.value) || 0 })}
                          className="h-8 w-28 rounded-lg text-xs bg-muted/70 font-semibold"
                        />
                      </div>
                    )}
                  </div>

                  {/* Expenses Switch */}
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/50 flex items-center justify-between">
                    <div>
                      <Label className="font-semibold text-foreground cursor-pointer">Include Project Expenses</Label>
                      <p className="text-[10px] text-muted-foreground">Itemize travel, material, and tool receipts</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.includeExpenses}
                      onChange={(e) => setConfig({ ...config, includeExpenses: e.target.checked })}
                      className="rounded accent-primary w-4 h-4 cursor-pointer"
                    />
                  </div>

                  {/* Fixed Fee Option */}
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="font-semibold text-foreground cursor-pointer">Add Fixed Deliverable Fee</Label>
                      <input
                        type="checkbox"
                        checked={config.includeFixedFee}
                        onChange={(e) => setConfig({ ...config, includeFixedFee: e.target.checked })}
                        className="rounded accent-primary w-4 h-4 cursor-pointer"
                      />
                    </div>
                    {config.includeFixedFee && (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <Input
                          value={config.fixedFeeDescription}
                          onChange={(e) => setConfig({ ...config, fixedFeeDescription: e.target.value })}
                          placeholder="Fee Description"
                          className="h-8 rounded-lg text-xs bg-muted/70"
                        />
                        <Input
                          type="number"
                          value={config.fixedFeeAmount}
                          onChange={(e) => setConfig({ ...config, fixedFeeAmount: parseFloat(e.target.value) || 0 })}
                          placeholder="Amount"
                          className="h-8 rounded-lg text-xs bg-muted/70 font-semibold"
                        />
                      </div>
                    )}
                  </div>

                  {/* Tax / GST Switch */}
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="font-semibold text-foreground cursor-pointer">Apply Tax / GST / VAT</Label>
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
                          className="h-8 w-24 rounded-lg text-xs bg-muted/70"
                        />
                        <span className="text-muted-foreground">Rate:</span>
                        <Input
                          type="number"
                          value={config.taxRate}
                          onChange={(e) => setConfig({ ...config, taxRate: parseFloat(e.target.value) || 0 })}
                          className="h-8 w-20 rounded-lg text-xs bg-muted/70 font-semibold"
                        />
                        <span className="text-muted-foreground">%</span>
                      </div>
                    )}
                  </div>

                  {/* Discount Switch */}
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="font-semibold text-foreground cursor-pointer">Apply Discount</Label>
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
                          className="h-8 px-2 rounded-lg text-xs bg-muted/70 border border-border"
                        >
                          <option value="percentage">% Percentage</option>
                          <option value="fixed">Fixed Amount</option>
                        </select>
                        <Input
                          type="number"
                          value={config.discountValue}
                          onChange={(e) => setConfig({ ...config, discountValue: parseFloat(e.target.value) || 0 })}
                          className="h-8 w-24 rounded-lg text-xs bg-muted/70 font-semibold"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Accordion 5: Payment Details, Bank, UPI & Terms */}
            <div className="rounded-2xl border border-white/10 bg-muted/20 overflow-hidden">
              <button
                type="button"
                onClick={() => setActiveAccordion(activeAccordion === 'payment' ? '' : 'payment')}
                className="w-full p-3.5 text-left font-bold text-xs flex items-center justify-between text-foreground hover:bg-muted/40 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-purple-400" /> Bank Details, UPI & Terms
                </span>
                <span className="text-[10px] text-muted-foreground">{activeAccordion === 'payment' ? '▲' : '▼'}</span>
              </button>

              {activeAccordion === 'payment' && (
                <div className="p-4 pt-1 space-y-3 border-t border-white/5 text-xs">
                  <div className="flex items-center justify-between pb-1">
                    <Label className="font-semibold text-foreground">Include Bank / UPI in Bill</Label>
                    <input
                      type="checkbox"
                      checked={config.showPaymentDetails}
                      onChange={(e) => setConfig({ ...config, showPaymentDetails: e.target.checked })}
                      className="rounded accent-primary w-3.5 h-3.5"
                    />
                  </div>

                  {config.showPaymentDetails && (
                    <>
                      <div>
                        <Label className="text-[11px] text-muted-foreground">UPI ID (e.g. yourname@upi)</Label>
                        <Input
                          value={config.upiId}
                          onChange={(e) => updateSenderInfo('upiId', e.target.value)}
                          placeholder="user@oksbi"
                          className="mt-1 h-9 rounded-xl text-xs bg-muted/50 font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-[11px] text-muted-foreground">Bank Name</Label>
                          <Input
                            value={config.bankName}
                            onChange={(e) => updateSenderInfo('bankName', e.target.value)}
                            placeholder="HDFC Bank"
                            className="mt-1 h-9 rounded-xl text-xs bg-muted/50"
                          />
                        </div>
                        <div>
                          <Label className="text-[11px] text-muted-foreground">Account #</Label>
                          <Input
                            value={config.accountNumber}
                            onChange={(e) => updateSenderInfo('accountNumber', e.target.value)}
                            placeholder="501002345678"
                            className="mt-1 h-9 rounded-xl text-xs bg-muted/50 font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-[11px] text-muted-foreground">IFSC / Routing Code</Label>
                        <Input
                          value={config.ifscCode}
                          onChange={(e) => updateSenderInfo('ifscCode', e.target.value)}
                          placeholder="HDFC0001234"
                          className="mt-1 h-9 rounded-xl text-xs bg-muted/50 font-mono"
                        />
                      </div>
                    </>
                  )}

                  <div className="pt-2 border-t border-border/40">
                    <div className="flex items-center justify-between mb-1">
                      <Label className="text-[11px] text-muted-foreground font-medium">Terms & Conditions</Label>
                      <input
                        type="checkbox"
                        checked={config.showTerms}
                        onChange={(e) => setConfig({ ...config, showTerms: e.target.checked })}
                        className="rounded accent-primary w-3.5 h-3.5"
                      />
                    </div>
                    <Input
                      disabled={!config.showTerms}
                      value={config.termsAndConditions}
                      onChange={(e) => setConfig({ ...config, termsAndConditions: e.target.value })}
                      placeholder="Payment due in 15 days..."
                      className="h-9 rounded-xl text-xs bg-muted/50 disabled:opacity-40"
                    />
                  </div>

                  <div className="pt-2 border-t border-border/40">
                    <div className="flex items-center justify-between mb-1">
                      <Label className="text-[11px] text-muted-foreground font-medium">Signatory Name</Label>
                      <input
                        type="checkbox"
                        checked={config.showSignature}
                        onChange={(e) => setConfig({ ...config, showSignature: e.target.checked })}
                        className="rounded accent-primary w-3.5 h-3.5"
                      />
                    </div>
                    <Input
                      disabled={!config.showSignature}
                      value={config.signatoryName}
                      onChange={(e) => updateSenderInfo('signatoryName', e.target.value)}
                      placeholder="Authorized Signature Name"
                      className="h-9 rounded-xl text-xs bg-muted/50 disabled:opacity-40"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Accordion 6: Template Style & Receipt Appendix */}
            <div className="rounded-2xl border border-white/10 bg-muted/20 overflow-hidden">
              <button
                type="button"
                onClick={() => setActiveAccordion(activeAccordion === 'theme' ? '' : 'theme')}
                className="w-full p-3.5 text-left font-bold text-xs flex items-center justify-between text-foreground hover:bg-muted/40 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-pink-400" /> Template Style & Receipts
                </span>
                <span className="text-[10px] text-muted-foreground">{activeAccordion === 'theme' ? '▲' : '▼'}</span>
              </button>

              {activeAccordion === 'theme' && (
                <div className="p-4 pt-1 space-y-3 border-t border-white/5 text-xs">
                  <div>
                    <Label className="text-[11px] text-muted-foreground font-medium">Layout Template</Label>
                    <div className="grid grid-cols-3 gap-2 mt-1.5">
                      {[
                        { id: 'modern', label: 'Modern Minimal' },
                        { id: 'corporate', label: 'Corporate Executive' },
                        { id: 'gradient', label: 'ExpCal Gradient' }
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setConfig({ ...config, templateTheme: t.id as 'modern' | 'corporate' | 'gradient' })}
                          className={cn(
                            'p-2 rounded-xl border text-[11px] font-semibold transition-all text-center',
                            config.templateTheme === t.id
                              ? 'border-primary bg-primary/15 text-foreground shadow-sm shadow-primary/20'
                              : 'border-border/60 text-muted-foreground hover:bg-muted/40'
                          )}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-muted/40 border border-border/50 flex items-center justify-between mt-2">
                    <div>
                      <Label className="font-semibold text-foreground cursor-pointer">Attach Receipt Photos</Label>
                      <p className="text-[10px] text-muted-foreground">Appends verified receipt images at the end of the bill</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.includeReceipts}
                      onChange={(e) => setConfig({ ...config, includeReceipts: e.target.checked })}
                      className="rounded accent-primary w-4 h-4 cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Live A4 Document Preview */}
          <div
            className={cn(
              'flex-1 bg-slate-950/70 p-4 sm:p-8 overflow-y-auto flex items-start justify-center',
              activeTab === 'customize' && 'hidden sm:flex'
            )}
          >
            <div className="w-full max-w-[210mm] scale-[0.88] sm:scale-100 origin-top transition-transform">
              <PrintableInvoice project={project} entries={entries} config={config} />
            </div>
          </div>
        </div>

        {/* Mobile Bottom Floating Export Dock */}
        <div className="sm:hidden p-3 bg-[#121422] border-t border-white/10 flex items-center gap-2 flex-shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCSV}
            className="flex-1 rounded-xl h-11 text-xs font-semibold gap-1 border-border/80"
          >
            <Download className="w-4 h-4 text-cyan-400" /> CSV
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleShare}
            className="flex-1 rounded-xl h-11 text-xs font-semibold gap-1 border-border/80"
          >
            <Share2 className="w-4 h-4 text-emerald-400" /> Share
          </Button>
          <Button
            size="sm"
            onClick={handlePrint}
            className="flex-[1.5] rounded-xl h-11 text-xs font-semibold gap-1.5 text-white shadow-md shadow-primary/30"
            style={{ background: 'var(--gradient-primary)', border: 'none' }}
          >
            <Printer className="w-4 h-4" /> Save PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
