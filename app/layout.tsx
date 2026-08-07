import type { Metadata, Viewport } from 'next'
import './globals.css'
import { TooltipProvider } from '@/components/ui/tooltip'
import { PWAInstallPrompt } from '@/components/pwa/install-prompt'

export const metadata: Metadata = {
  title: {
    default: 'ExpenseTrack — Smart Expense Manager',
    template: '%s | ExpenseTrack'
  },
  description: 'Track your expenses, income, and projects in one place. Professional expense management for freelancers and teams.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ExpenseTrack',
  },
  formatDetection: { telephone: false },
  keywords: ['expense tracker', 'income tracker', 'project management', 'freelance', 'finance'],
  authors: [{ name: 'ExpenseTrack' }],
  openGraph: {
    title: 'ExpenseTrack — Smart Expense Manager',
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
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="gradient-bg min-h-screen">
        <TooltipProvider>
          {children}
          <PWAInstallPrompt />
        </TooltipProvider>
      </body>
    </html>
  )
}
