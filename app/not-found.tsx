import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100dvh-64px)] flex-col items-center justify-center px-4 text-center">
      <p className="font-mono text-7xl font-black text-savora-orange">404</p>
      <h1 className="font-display mt-4 text-2xl font-bold">Page introuvable</h1>
      <p className="mt-2 text-sm text-white/45">Cette page n'existe pas ou a été déplacée.</p>
      <Link href="/" className="btn-primary mt-8 inline-flex items-center gap-2 text-sm">
        ← Retour à l'accueil
      </Link>
    </div>
  )
}
