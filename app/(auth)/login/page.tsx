'use client'

import { useState } from 'react'
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
        return
      }
      router.push('/')
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
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full opacity-20" style={{background: 'radial-gradient(circle, oklch(0.65 0.22 280), transparent)'}} />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full opacity-15" style={{background: 'radial-gradient(circle, oklch(0.72 0.18 195), transparent)'}} />
        </div>

        <div className="relative z-10 max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{background: 'var(--gradient-primary)'}}>
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">ExpenseTrack</h1>
              <p className="text-xs text-muted-foreground">Smart Expense Manager</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold text-foreground mb-4 leading-tight">
            Take control of your{' '}
            <span className="gradient-text">finances</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-12">
            Track income, expenses and time across all your projects in one beautiful dashboard.
          </p>

          {/* Mini stat cards preview */}
          <div className="space-y-3">
            {[
              { icon: Clock, label: 'Hours Tracked', value: '248h', gradient: 'var(--gradient-hours)' },
              { icon: DollarSign, label: 'Total Income', value: '₹1,24,500', gradient: 'var(--gradient-income)' },
              { icon: PieChart, label: 'Net Cash', value: '₹89,200', gradient: 'var(--gradient-cash)' },
            ].map(({ icon: Icon, label, value, gradient }) => (
              <div key={label} className="glass-card flex items-center gap-4 p-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: gradient}}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-lg font-bold text-foreground">{value}</p>
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
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'var(--gradient-primary)'}}>
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold gradient-text">ExpenseTrack</h1>
          </div>

          <div className="glass-card p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Welcome back</h2>
              <p className="text-muted-foreground">Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-medium">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="pl-10 bg-muted/50 border-border focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-muted/50 border-border focus:border-primary"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 text-sm font-semibold"
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
                    Sign In <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground text-sm">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="text-primary hover:text-primary/80 font-medium transition-colors">
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
