import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="font-mono text-8xl font-black text-savora-orange opacity-30">404</p>
      <h1 className="font-display mt-2 text-3xl font-bold">Page introuvable</h1>
      <p className="mt-3 text-sm text-white/40 max-w-xs">
        Cette page n'existe pas ou vous n'avez pas les droits d'accès.
      </p>
      <Link href="/" className="btn-primary mt-8 text-sm px-6 py-3">
        ← Retour à l'accueil
      </Link>
    </div>
  )
}
