import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth'
import { Toast } from '@/components/ui/Toast'

export const metadata: Metadata = {
  title: 'Savora — Livraison Premium Tunisie',
  description: 'Plateforme de livraison de repas premium en Tunisie.',
  icons: { icon: '/savora-logo.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head><link rel="manifest" href="/site.webmanifest" /></head>
      <body className="min-h-screen bg-[#07070A] text-white antialiased">
        <AuthProvider>
          {children}
          <Toast />
        </AuthProvider>
      </body>
    </html>
  )
}
