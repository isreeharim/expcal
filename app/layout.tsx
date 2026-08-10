import type { Metadata, Viewport } from 'next'
import './globals.css'
import { TooltipProvider } from '@/components/ui/tooltip'
import { PWAInstallPrompt } from '@/components/pwa/install-prompt'

export const metadata: Metadata = {
  title: {
    default: 'ExpCal — Personal Financial Control Center',
    template: '%s | ExpCal',
  },
  description: 'Understand balances, income, spending, savings, goals, and financial activity in one premium personal finance control center.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ExpCal',
  },
  formatDetection: { telephone: false },
  keywords: ['personal finance', 'financial control center', 'expense tracker', 'income tracker', 'savings goals'],
  authors: [{ name: 'ExpCal' }],
  openGraph: {
    title: 'ExpCal — Personal Financial Control Center',
    description: 'Track balances, income, expenses, savings, and goals across your financial life.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#6366f1',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="gradient-bg min-h-screen font-sans">
        <TooltipProvider>
          {children}
          <PWAInstallPrompt />
        </TooltipProvider>
      </body>
    </html>
  )
}
