import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type') as 'signup' | 'email' | 'magiclink' | 'recovery' | null
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  const supabase = await createClient()

  // 1. Handle PKCE Code exchange
  if (code) {
    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && sessionData?.user) {
      // Check user role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', sessionData.user.id)
        .maybeSingle()

      const destination = profile?.role === 'admin' ? '/admin' : next
      return NextResponse.redirect(new URL(destination, requestUrl.origin))
    }
  }

  // 2. Handle OTP Token Hash verification (Email confirmation / magiclink)
  if (token_hash && type) {
    const { data: sessionData, error } = await supabase.auth.verifyOtp({
      token_hash,
      type
    })

    if (!error && sessionData?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', sessionData.user.id)
        .maybeSingle()

      const destination = profile?.role === 'admin' ? '/admin' : next
      return NextResponse.redirect(new URL(destination, requestUrl.origin))
    }
  }

  // If already authenticated via cookies
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    const destination = profile?.role === 'admin' ? '/admin' : next
    return NextResponse.redirect(new URL(destination, requestUrl.origin))
  }

  // Verification failed or expired, return to login with notification
  return NextResponse.redirect(new URL('/login?verified=error', requestUrl.origin))
}
