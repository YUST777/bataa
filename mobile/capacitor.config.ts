import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.bataa.learn',
  appName: 'Bataa',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
  android: {
    backgroundColor: '#fff6e9',
    allowMixedContent: true,
  },
  ios: {
    backgroundColor: '#fff6e9',
    contentInset: 'automatic',
  },
};

export default config;
