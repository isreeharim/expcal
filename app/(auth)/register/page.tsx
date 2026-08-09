'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TrendingUp, Mail, Lock, Eye, EyeOff, ArrowRight, User, CheckCircle, Inbox, AlertTriangle, ArrowLeft, MailCheck } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, role: 'user' },
          emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback?next=/dashboard`,
        }
      })
      if (error) {
        setError(error.message)
        return
      }
      setSuccess(true)
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen auth-bg flex items-center justify-center p-4 sm:p-6">
        <div className="glass-card p-6 sm:p-10 text-center max-w-md w-full shadow-2xl backdrop-blur-2xl border border-white/10 rounded-3xl animate-fade-in space-y-5">
          {/* Brand Icon */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/25"
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #0d9488 100%)' }}
          >
            <MailCheck className="w-8 h-8 text-white" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground tracking-tight mb-2">Check Your Email</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              We sent a secure verification link to:
              <br />
              <strong className="text-foreground font-semibold break-all text-sm mt-1 inline-block">{email}</strong>
            </p>
          </div>

          {/* Spam Alert Callout */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-left space-y-1.5 animate-fade-in">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs sm:text-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>Can&apos;t find the email? Check your Spam folder</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed pl-6">
              Verification emails can sometimes land in your <strong>Spam</strong>, <strong>Junk</strong>, or <strong>Promotions</strong> folder. If you find it there, mark it as &quot;Not Spam&quot;.
            </p>
          </div>

          {/* Instant Auto-Login Badge */}
          <div className="p-3 rounded-2xl bg-primary/10 border border-primary/25 text-xs text-primary font-medium text-center">
            ✨ Clicking the verification link in your email will log you directly into your dashboard!
          </div>

          {/* Action Link */}
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors py-2 px-4 rounded-xl hover:bg-muted/50"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen auth-bg flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{background: 'radial-gradient(circle, oklch(0.65 0.22 280), transparent)'}} />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full opacity-15 blur-3xl" style={{background: 'radial-gradient(circle, oklch(0.72 0.18 195), transparent)'}} />
        </div>
        <div className="relative z-10 max-w-md">
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
            Start tracking your{' '}
            <span className="gradient-text">projects</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-12 font-normal leading-relaxed">
            Join thousands of professionals managing their finances with ExpCal.
          </p>
          <ul className="space-y-4">
            {['Track time across multiple projects', 'Categorize income & expenses', 'Photo receipts with every entry', 'Beautiful analytics dashboard'].map(feat => (
              <li key={feat} className="flex items-center gap-3 text-muted-foreground/90 text-sm font-medium hover:text-foreground transition-colors group">
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm transition-transform duration-200 group-hover:scale-110" style={{background: 'var(--gradient-primary)'}}>
                  <CheckCircle className="w-3.5 h-3.5 text-white" />
                </div>
                {feat}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md" style={{background: 'var(--gradient-primary)'}}>
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold gradient-text tracking-tight">ExpCal</h1>
          </div>

          <div className="glass-card p-8 shadow-2xl backdrop-blur-2xl border border-white/10 rounded-3xl">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground tracking-tight mb-2">Create your account</h2>
              <p className="text-muted-foreground text-sm">Start managing your finances today</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-foreground/90 font-medium text-sm">Full Name</Label>
                <div className="relative group">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <Input id="fullName" type="text" placeholder="John Doe" value={fullName} onChange={e => setFullName(e.target.value)} className="pl-10 bg-muted/40 border-border/80 focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 transition-all duration-200 rounded-xl h-11" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground/90 font-medium text-sm">Email address</Label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className="pl-10 bg-muted/40 border-border/80 focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 transition-all duration-200 rounded-xl h-11" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground/90 font-medium text-sm">Password</Label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} className="pl-10 pr-10 bg-muted/40 border-border/80 focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 transition-all duration-200 rounded-xl h-11" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg focus:outline-none focus-visible:ring-1 focus-visible:ring-primary" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground/90 font-medium text-sm">Confirm Password</Label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <Input id="confirmPassword" type={showPassword ? 'text' : 'password'} placeholder="Repeat password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="pl-10 bg-muted/40 border-border/80 focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 transition-all duration-200 rounded-xl h-11" required />
                </div>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-sm font-medium animate-fade-in flex items-center gap-2">
                  <span>{error}</span>
                </div>
              )}

              <Button type="submit" className="w-full h-11 text-sm font-semibold mt-2 rounded-xl transition-all duration-200 hover:opacity-95 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.99] group cursor-pointer" disabled={loading} style={{background: 'var(--gradient-primary)', border: 'none'}}>
                {loading ? (
                  <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating account...</span>
                ) : (
                  <span className="flex items-center gap-2">Create Account <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" /></span>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground text-sm">
                Already have an account?{' '}
                <Link href="/login" className="text-primary hover:text-primary/80 font-semibold transition-colors underline-offset-4 hover:underline">Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
