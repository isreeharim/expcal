'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  TrendingUp, ArrowRight, CheckCircle, Clock, DollarSign, PieChart,
  Smartphone, Shield, Zap, Camera, BarChart2, Layers, HelpCircle,
  Sparkles, Check, ChevronDown
} from 'lucide-react'

interface LandingPageProps {
  isLoggedIn?: boolean
}

export function LandingPage({ isLoggedIn = false }: LandingPageProps) {
  // Interactive Calculator State
  const [hours, setHours] = useState(40)
  const [hourlyRate, setHourlyRate] = useState(1500)
  const [expenses, setExpenses] = useState(8000)

  const calculatedIncome = hours * hourlyRate
  const calculatedNet = calculatedIncome - expenses

  // FAQ State
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const faqs = [
    {
      q: 'Is ExpCal really 100% free?',
      a: 'Yes! ExpCal is open source and completely free to use. You can track unlimited projects, entries, and photo receipts without any subscription fees.',
    },
    {
      q: 'Can I install ExpCal on my phone like a mobile app?',
      a: 'Absolutely! ExpCal is a Progressive Web App (PWA). Simply tap "Add to Home Screen" on iPhone (Safari) or Android (Chrome) for an installable, full-screen app experience with offline fallback.',
    },
    {
      q: 'Are my receipt photos compressed?',
      a: 'Yes, ExpCal automatically compresses photo receipts on your device before uploading, reducing file sizes by up to 98% while maintaining crisp clarity.',
    },
    {
      q: 'Does ExpCal support multiple team members and Admin controls?',
      a: 'Yes, ExpCal features built-in Role-Based Access Control (RBAC) with User and Admin roles, allowing admins to oversee all projects and platform analytics.',
    },
  ]

  return (
    <div className="min-h-screen bg-[#0d0f1a] text-foreground overflow-hidden selection:bg-primary selection:text-white">
      {/* Background Decorative Glow Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, oklch(0.65 0.22 280), transparent 70%)' }}
        />
        <div
          className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle, oklch(0.72 0.18 195), transparent 70%)' }}
        />
        <div
          className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] rounded-full opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle, oklch(0.68 0.2 155), transparent 70%)' }}
        />
      </div>

      {/* Header Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-border/40 bg-[#0d0f1a]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: 'var(--gradient-primary)' }}
            >
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold gradient-text tracking-tight">ExpCal</span>
          </div>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-2 transition-all hover:scale-105 shadow-md"
                style={{ background: 'var(--gradient-primary)' }}
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-2 transition-all hover:scale-105 shadow-md"
                  style={{ background: 'var(--gradient-primary)' }}
                >
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 sm:pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary/10 border border-primary/20 text-primary mb-6 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" /> Next-Gen PWA Expense & Time Tracker
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-foreground tracking-tight leading-[1.15] max-w-4xl mx-auto">
          Master Your Project{' '}
          <span className="gradient-text">Expenses & Income</span> with Ease
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          The modern, high-speed expense manager built for freelancers, contractors, and teams. Log work hours, itemize costs, compress receipt photos, and track cash flow in real-time.
        </p>

        {/* Hero Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold text-white flex items-center justify-center gap-3 transition-all hover:scale-105 shadow-xl"
            style={{ background: 'var(--gradient-primary)' }}
          >
            Start Tracking Free <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-semibold glass-card text-foreground hover:bg-muted/40 transition-colors"
          >
            Sign In to Demo
          </Link>
        </div>

        {/* Hero Micro Badges */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-muted-foreground font-medium">
          <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> 100% Free & Open Source</span>
          <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Offline Mobile PWA</span>
          <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Sub-50ms Response Speed</span>
        </div>
      </section>

      {/* Interactive Income & Cash Flow Estimator Widget */}
      <section className="relative z-10 py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="glass-card p-6 sm:p-10 relative overflow-hidden border border-border/60 shadow-2xl">
          <div className="mb-8 text-center sm:text-left">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Interactive Simulator</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mt-1">Estimate Your Net Profit</h2>
            <p className="text-sm text-muted-foreground mt-1">Slide hours, rate, and expenses to simulate your project return instantly.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Sliders */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm font-semibold mb-2">
                  <span className="text-muted-foreground">Hours Worked</span>
                  <span className="text-foreground">{hours} hours</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="160"
                  step="5"
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="w-full accent-primary bg-muted/50 rounded-lg h-2 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm font-semibold mb-2">
                  <span className="text-muted-foreground">Hourly Rate (₹)</span>
                  <span className="text-foreground">₹{hourlyRate.toLocaleString('en-IN')}/hr</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="5000"
                  step="100"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full accent-primary bg-muted/50 rounded-lg h-2 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm font-semibold mb-2">
                  <span className="text-muted-foreground">Itemized Expenses (₹)</span>
                  <span className="text-foreground">₹{expenses.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50000"
                  step="1000"
                  value={expenses}
                  onChange={(e) => setExpenses(Number(e.target.value))}
                  className="w-full accent-primary bg-muted/50 rounded-lg h-2 cursor-pointer"
                />
              </div>
            </div>

            {/* Calculated Output Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-muted/30 border border-border/40">
                <p className="text-xs text-muted-foreground font-medium">Gross Revenue</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">₹{calculatedIncome.toLocaleString('en-IN')}</p>
              </div>
              <div className="p-4 rounded-2xl bg-muted/30 border border-border/40">
                <p className="text-xs text-muted-foreground font-medium">Total Spending</p>
                <p className="text-2xl font-bold text-rose-400 mt-1">₹{expenses.toLocaleString('en-IN')}</p>
              </div>
              <div className="sm:col-span-2 p-5 rounded-2xl" style={{ background: 'var(--gradient-primary)' }}>
                <p className="text-xs text-white/80 font-medium">Net Profit / Cash Flow</p>
                <p className="text-3xl font-extrabold text-white mt-1">₹{calculatedNet.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
            Everything You Need to <span className="gradient-text">Run Profitable Projects</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-base sm:text-lg">
            Built from the ground up to solve complex freelance and project expense tracking headaches.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Layers,
              title: 'Multi-Category Expense Items',
              desc: 'Log itemized costs for Food, Water, Transport, Fuel, Materials, and Supplies with exact notes.',
              color: 'var(--gradient-primary)',
            },
            {
              icon: Camera,
              title: 'Client-Side Photo Compression',
              desc: 'Upload receipt photos compressed instantly up to 98% on your device for lightning-fast uploads.',
              color: 'var(--gradient-hours)',
            },
            {
              icon: BarChart2,
              title: 'Visual Financial Analytics',
              desc: 'Dedicated /analysis dashboard with interactive revenue vs spending trend charts and breakdowns.',
              color: 'var(--gradient-income)',
            },
            {
              icon: Smartphone,
              title: 'PWA & Offline Capability',
              desc: 'Install directly on iOS and Android home screens. Includes an offline mode fallback page.',
              color: 'var(--gradient-cash)',
            },
            {
              icon: Clock,
              title: 'Automatic Overnight Shifts',
              desc: 'Accurate time logging that automatically computes overnight work shifts (e.g. 23:00 to 01:00).',
              color: 'var(--gradient-hours)',
            },
            {
              icon: Shield,
              title: 'Role-Based Access Control',
              desc: 'Dedicated Admin panel (/admin) to oversee user accounts, global project metrics, and data permissions.',
              color: 'var(--gradient-primary)',
            },
          ].map((feature) => {
            const Icon = feature.icon
            return (
              <div key={feature.title} className="glass-card p-6 flex flex-col justify-between hover:border-primary/50 transition-all group">
                <div>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform" style={{ background: feature.color }}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 border border-accent/20 text-accent mb-3">
            <HelpCircle className="w-3.5 h-3.5" /> Answers to Your Questions
          </div>
          <h2 className="text-3xl font-bold text-foreground">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={faq.q}
              className="glass-card overflow-hidden transition-colors border border-border/60"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-foreground"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${openFaq === idx ? 'rotate-180 text-primary' : ''}`} />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border/30 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* High-Converting Bottom CTA */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="glass-card p-10 sm:p-16 text-center relative overflow-hidden border border-border/80 shadow-2xl">
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ background: 'radial-gradient(circle at center, oklch(0.65 0.22 280), transparent 70%)' }}
          />
          <h2 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight">
            Ready to Take Control of Your <span className="gradient-text">Expenses?</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
            Join ExpCal today and start tracking income, costs, and project time in one place.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold text-white flex items-center justify-center gap-3 transition-all hover:scale-105 shadow-xl"
              style={{ background: 'var(--gradient-primary)' }}
            >
              Create Free Account <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-semibold glass-card text-foreground hover:bg-muted/40 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-10 bg-[#0d0f1a]/90 text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
              <TrendingUp className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-foreground">ExpCal</span>
            <span>© {new Date().getFullYear()} ExpCal. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link>
            <Link href="/register" className="hover:text-foreground transition-colors">Register</Link>
            <a
              href="https://github.com/isreeharim/expcal.git"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub Repository
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
