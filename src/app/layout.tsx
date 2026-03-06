import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Court Hero — Run Your Court Like a Hero',
  description: 'The #1 pickleball event management tool. Create brackets in seconds, live scoring from player phones, instant leaderboards. Round robin, single/double elimination, king of the court, and mixer formats.',
  keywords: ['pickleball', 'tournament', 'bracket', 'round robin', 'scoring', 'leaderboard', 'event management', 'pickleball software'],
  authors: [{ name: 'Court Hero' }],
  metadataBase: new URL('https://courthero.app'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://courthero.app',
    siteName: 'Court Hero',
    title: 'Court Hero — Run Your Court Like a Hero',
    description: 'Create brackets in seconds. Players score from their phones. Leaderboard updates live. The easiest way to run pickleball events.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Court Hero — The #1 Pickleball Event Tool',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Court Hero — Run Your Court Like a Hero',
    description: 'Create brackets in seconds. Players score from their phones. Leaderboard updates live.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

import { AuthProvider } from '@/contexts/AuthContext';
import { PWAInstaller } from '@/components/PWAInstaller';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <PWAInstaller />
        </AuthProvider>
      </body>
    </html>
  );
}
