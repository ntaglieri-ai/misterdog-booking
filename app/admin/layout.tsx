import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MisterDog Desk – Gestionale',
  description: 'Gestisci agenda, appuntamenti e clienti di Mister Dog Pet Salon',
  applicationName: 'MisterDog Desk',
  manifest: '/admin.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'MD Desk',
    statusBarStyle: 'default',
  },
  icons: {
    icon: [
      { url: '/admin-icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/admin-icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: { url: '/admin-apple-icon.png', sizes: '180x180', type: 'image/png' },
  },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children
}
