import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    // Perform a lightweight query to wake / keep-alive the Supabase database
    const { count, error } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })

    if (error) {
      return NextResponse.json({ status: 'error', error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      status: 'ok',
      message: 'Supabase database is active and keep-alive ping succeeded!',
      timestamp: new Date().toISOString(),
      userCount: count ?? 0,
    })
  } catch (err: unknown) {
    const error = err as Error
    return NextResponse.json({ status: 'error', error: error.message }, { status: 500 })
  }
}
