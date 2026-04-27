import type { CapacitorConfig } from '@capacitor/cli'

const isDev = process.env.NODE_ENV !== 'production'

const config: CapacitorConfig = {
  appId: 'com.edusonkids.app',
  appName: 'Eduson Kids',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
    webContentsDebuggingEnabled: isDev,
    backgroundColor: '#0C0533',
  },
  ios: {
    contentInset: 'always',
    backgroundColor: '#0C0533',
    limitsNavigationsToAppBoundDomains: false,
    preferredContentMode: 'mobile',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: true,
      backgroundColor: '#0C0533',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0C0533',
      overlaysWebView: false,
    },
    Keyboard: {
      resize: 'native',
      resizeOnFullScreen: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
}

export default config
