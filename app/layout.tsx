import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Playfair_Display, DM_Sans, Fraunces } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-playfair',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-dm-sans',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-fraunces',
})

export const metadata: Metadata = {
  title: 'MisterDogDesk – Il tuo assistente per la toelettatura',
  description: 'Gestisci appuntamenti, clienti e libretti sanitari della tua toelettatura',
  generator: 'v0.app',
  applicationName: 'Mister Dog',
  appleWebApp: {
    capable: true,
    title: 'Mister Dog',
    statusBarStyle: 'default',
  },
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#87CEEB',
  userScalable: false,
  initialScale: 1,
  maximumScale: 1,
  width: 'device-width',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="it" className={`light bg-background ${playfair.variable} ${dmSans.variable} ${fraunces.variable}`}>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
