import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'site.sreeharim.expcal',
  appName: 'ExpCal',
  webDir: 'public',
  server: {
    // Connects natively to the live production server with real-time Supabase & SSR
    url: 'https://expcal.sreeharim.site',
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#0d0f1a',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#0d0f1a',
      showSpinner: false,
      androidSplashResourceName: 'splash',
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0d0f1a',
    },
  },
}

export default config
