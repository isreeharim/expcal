'use client'

import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('SW registered:', reg.scope))
        .catch((err) => console.error('SW registration failed:', err))
    }

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowBanner(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setShowBanner(false)
    setDeferredPrompt(null)
  }

  if (!showBanner) return null

  return (
    <div
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 animate-fade-in"
      style={{
        background: 'oklch(0.14 0.012 260)',
        border: '1px solid oklch(1 0 0 / 12%)',
        borderRadius: '1rem',
        padding: '1rem',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 20px 40px oklch(0 0 0 / 40%)',
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--gradient-primary)' }}
        >
          <span className="text-lg">📲</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">Install ExpCal</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Install as an app for quick access and offline support
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleInstall}
              className="pwa-install-btn flex-1 text-center"
            >
              Install App
            </button>
            <button
              onClick={() => setShowBanner(false)}
              className="text-xs text-muted-foreground hover:text-foreground px-3 transition-colors"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
