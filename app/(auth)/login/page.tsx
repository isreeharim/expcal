'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TrendingUp, Mail, Lock, Eye, EyeOff, ArrowRight, DollarSign, Clock, PieChart } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.has('code') || params.has('token_hash')) {
        router.replace(`/auth/callback${window.location.search}`)
      }
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
        return
      }

      if (authData?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authData.user.id)
          .maybeSingle()

        if (profile?.role === 'admin') {
          router.push('/admin')
        } else {
          router.push('/dashboard')
        }
      } else {
        router.push('/dashboard')
      }
      router.refresh()
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen auth-bg flex">
      {/* Left decorative panel - hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{background: 'radial-gradient(circle, oklch(0.65 0.22 280), transparent)'}} />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full opacity-15 blur-3xl" style={{background: 'radial-gradient(circle, oklch(0.72 0.18 195), transparent)'}} />
        </div>

        <div className="relative z-10 max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12 group cursor-pointer">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 transition-transform duration-300 group-hover:scale-105" style={{background: 'var(--gradient-primary)'}}>
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text tracking-tight">ExpCal</h1>
              <p className="text-xs text-muted-foreground/90 font-medium">Smart Expense Manager</p>
            </div>
          </div>

          <h2 className="text-4xl font-extrabold text-foreground mb-4 leading-tight tracking-tight">
            Take control of your{' '}
            <span className="gradient-text">finances</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-12 font-normal leading-relaxed">
            Track income, expenses and time across all your projects in one beautiful dashboard.
          </p>

          {/* Mini stat cards preview */}
          <div className="space-y-3">
            {[
              { icon: Clock, label: 'Hours Tracked', value: '248h', gradient: 'var(--gradient-hours)' },
              { icon: DollarSign, label: 'Total Income', value: '₹1,24,500', gradient: 'var(--gradient-income)' },
              { icon: PieChart, label: 'Net Cash', value: '₹89,200', gradient: 'var(--gradient-cash)' },
            ].map(({ icon: Icon, label, value, gradient }) => (
              <div key={label} className="glass-card flex items-center gap-4 p-4 transition-all duration-200 hover:translate-x-1.5 hover:border-white/15 cursor-default">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md flex-shrink-0" style={{background: gradient}}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground/80">{label}</p>
                  <p className="text-lg font-bold text-foreground tracking-tight">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md" style={{background: 'var(--gradient-primary)'}}>
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold gradient-text tracking-tight">ExpCal</h1>
          </div>

          <div className="glass-card p-8 shadow-2xl backdrop-blur-2xl border border-white/10 rounded-3xl">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground tracking-tight mb-2">Welcome back</h2>
              <p className="text-muted-foreground text-sm">Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground/90 font-medium text-sm">Email address</Label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="pl-10 bg-muted/40 border-border/80 focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 transition-all duration-200 rounded-xl h-11"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground/90 font-medium text-sm">Password</Label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-muted/40 border-border/80 focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 transition-all duration-200 rounded-xl h-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg focus:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-sm font-medium animate-fade-in flex items-center gap-2">
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 text-sm font-semibold rounded-xl transition-all duration-200 hover:opacity-95 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.99] group cursor-pointer"
                disabled={loading}
                style={{background: 'var(--gradient-primary)', border: 'none'}}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Sign In <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground text-sm">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="text-primary hover:text-primary/80 font-semibold transition-colors underline-offset-4 hover:underline">
                  Create account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
