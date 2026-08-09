import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { TooltipProvider } from '@/components/ui/tooltip'
import { PWAInstallPrompt } from '@/components/pwa/install-prompt'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'ExpCal — Smart Expense Manager',
    template: '%s | ExpCal',
  },
  description: 'Track your expenses, income, and projects in one place. Professional expense management for freelancers and teams.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ExpCal',
  },
  formatDetection: { telephone: false },
  keywords: ['expense tracker', 'income tracker', 'project management', 'freelance', 'finance'],
  authors: [{ name: 'ExpCal' }],
  openGraph: {
    title: 'ExpCal — Smart Expense Manager',
    description: 'Track expenses, income, and time across all your projects.',
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
    <html lang="en" className={`dark ${inter.variable}`} suppressHydrationWarning>
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
