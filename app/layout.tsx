import type { Metadata } from 'next'
import './globals.css'
import { Nav } from '@/components/ui/Nav'
import { Toast } from '@/components/ui/Toast'
import { AppProvider } from '@/lib/store'

export const metadata: Metadata = {
  title: 'Savora — Premium Food Delivery',
  description: 'Premium food delivery platform for customers, restaurants and admins.',
  icons: { icon: '/savora-logo.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className="min-h-screen bg-[#080808] text-white antialiased">
        <AppProvider>
          <Nav />
          <main>{children}</main>
          <Toast />
        </AppProvider>
      </body>
    </html>
  )
}
