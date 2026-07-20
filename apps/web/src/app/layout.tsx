import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "CollabBD — Bangladesh's Talent Network | বাংলাদেশের প্রতিভা খুঁজুন",
  description: 'Bangladesh\'s premier platform to find verified nearby talent. Connect with students, freelancers & experts for design, development, tutoring, and more. | বাংলাদেশের সেরা লোকাল ট্যালেন্ট ডিসকভারি প্ল্যাটফর্ম',
  keywords: ['freelance Bangladesh', 'BD talent', 'local skills', 'verified freelancers', 'Dhaka jobs', 'student freelancer', 'CollabBD', 'বাংলাদেশ ফ্রিল্যান্সার'],
  authors: [{ name: 'CollabBD Team' }],
  openGraph: {
    title: 'CollabBD — Bangladesh\'s Talent Network',
    description: 'Find verified nearby talent based on need, skill & interest. Post a need. Get proposals. Collab.',
    type: 'website',
    locale: 'en_BD',
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0A0F1E',
};

import { AuthInitializer } from '../components/AuthInitializer';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthInitializer />
        {children}
      </body>
    </html>
  );
}
