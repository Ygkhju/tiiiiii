import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Star, Clock, CircleCheck, Sparkles, ChevronRight, ShoppingCart, Store, ShieldCheck } from 'lucide-react'

const RESTAURANTS = [
  {
    name: 'Ember Table',
    cuisine: 'Grill · Bowls',
    rating: 4.9,
    time: '22-30 min',
    image: 'https://images.unsplash.com/photo-1543353071-10c8ba85a904?auto=format&fit=crop&w=800&q=80',
    badge: 'Top rated',
  },
  {
    name: 'Nori & Flame',
    cuisine: 'Sushi · Asian',
    rating: 4.8,
    time: '28-38 min',
    image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=800&q=80',
    badge: 'Nouveau',
  },
  {
    name: 'Golden Crust',
    cuisine: 'Pizza · Italian',
    rating: 4.7,
    time: '18-25 min',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    badge: 'Rapide',
  },
]

// Each feature gets its own correct icon
const FEATURES = [
  {
    Icon: ShoppingCart,
    title: 'Application client',
    desc: 'Recherche, panier, checkout en 3 étapes, tracking GPS en direct, favoris et avis.',
    color: 'text-savora-orange',
  },
  {
    Icon: Store,
    title: 'Espace restaurant',
    desc: 'Gestion du menu, upload photos, acceptation des commandes et analytics revenus.',
    color: 'text-blue-400',
  },
  {
    Icon: ShieldCheck,
    title: 'Back-office admin',
    desc: 'Approbations, vérification documents, commissions, signalements et suspensions.',
    color: 'text-purple-400',
  },
]

export default function Home() {
  return (
    <div className="page-enter">
      {/* ── Hero ── */}
      <section className="relative mx-auto grid max-w-7xl gap-12 overflow-hidden px-4 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
        <div className="premium-grid pointer-events-none absolute inset-0 -z-10" />

        <div className="flex flex-col justify-center">
          <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-savora-orange/25 bg-savora-orange/8 px-3.5 py-1.5 text-sm text-savora-amber">
            <Sparkles size={13} />
            Livraison premium · Restaurants vérifiés · Tracking live
          </div>

          <h1 className="font-display max-w-xl text-5xl font-bold leading-[1.07] md:text-6xl lg:text-7xl">
            Savora<br />
            <span className="text-white/25">Livraison</span><br />
            <span className="text-savora-orange">Premium</span>
          </h1>

          <p className="mt-6 max-w-lg text-base leading-8 text-white/55">
            Plateforme complète pour clients, restaurants et admins. Paiement multi-canal (D17, SobFlous, Carte, Cash), suivi GPS temps réel, marketplace vérifié.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/customer" className="btn-primary flex items-center gap-2 text-sm">
              Commander maintenant <ArrowRight size={16} />
            </Link>
            <Link href="/restaurant" className="flex items-center gap-2 rounded-lg border border-white/10 px-5 py-3 text-sm font-semibold transition hover:border-white/20 hover:bg-white/5">
              Dashboard restaurant <ChevronRight size={16} />
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {['Auth JWT + OTP', 'Cloudinary uploads', 'Commission 12%', 'D17 · SobFlous · Cash · Carte'].map(t => (
              <span key={t} className="rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 text-xs text-white/45">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Preview panel — desktop only */}
        <div className="hidden lg:block">
          <div className="glass rounded-2xl p-5">
            {/* Fake search bar */}
            <div className="mb-4 flex items-center gap-3 rounded-xl border border-white/[0.07] bg-black/50 px-4 py-3">
              <svg className="text-savora-orange shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
              </svg>
              <span className="text-sm text-white/35">Chercher shawarma, sushi, burgers...</span>
            </div>

            {/* Restaurant cards */}
            <div className="grid gap-3">
              {RESTAURANTS.map(r => (
                <Link
                  href="/customer"
                  key={r.name}
                  className="flex gap-0 overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.03] transition hover:border-white/15 hover:bg-white/[0.05]"
                >
                  <div
                    className="h-20 w-28 shrink-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${r.image})` }}
                  />
                  <div className="flex flex-col justify-center px-4 py-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold">{r.name}</h3>
                      <span className="rounded bg-savora-orange/15 px-1.5 py-0.5 text-[10px] font-bold text-savora-orange">
                        {r.badge}
                      </span>
                    </div>
                    <p className="text-xs text-white/40">{r.cuisine}</p>
                    <div className="mt-1.5 flex items-center gap-3 text-xs text-white/45">
                      <span className="flex items-center gap-1">
                        <Star size={10} fill="currentColor" className="text-savora-amber" /> {r.rating}
                      </span>
                      <span className="flex items-center gap-1"><Clock size={10} /> {r.time}</span>
                      <span className="flex items-center gap-1 text-emerald-400"><CircleCheck size={10} /> Vérifié</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features — each with its own icon ── */}
      <section className="border-y border-white/[0.06] bg-white/[0.01]">
        <div className="mx-auto grid max-w-7xl gap-px px-4 py-12 md:grid-cols-3">
          {FEATURES.map(({ Icon, title, desc, color }) => (
            <div key={title} className="rounded-xl p-6">
              <Icon size={22} className={`mb-4 ${color}`} />
              <h2 className="font-display text-lg font-bold">{title}</h2>
              <p className="mt-2 text-sm leading-7 text-white/50">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { n: '5',    label: 'Modes de paiement', sub: 'D17, SobFlous, PostPay, Carte, Cash' },
            { n: '∞',   label: 'Restaurants',         sub: 'Vérifiés et approuvés par Savora' },
            { n: '<30', label: 'Min de livraison',     sub: 'Tracking GPS chauffeur temps réel' },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-6">
              <p className="font-display text-4xl font-bold text-savora-orange">{s.n}</p>
              <p className="mt-2 font-semibold">{s.label}</p>
              <p className="mt-1 text-sm text-white/40">{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA bottom ── */}
      <section className="border-t border-white/[0.06] bg-gradient-to-b from-transparent to-savora-orange/5">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            Prêt à commencer ?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-white/50">
            Choisissez votre rôle et découvrez la plateforme complète.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/customer"    className="btn-primary flex items-center gap-2 text-sm">Client <ArrowRight size={15} /></Link>
            <Link href="/restaurant" className="flex items-center gap-2 rounded-lg border border-white/10 px-5 py-3 text-sm font-semibold hover:bg-white/5 transition-colors">Restaurant</Link>
            <Link href="/admin"      className="flex items-center gap-2 rounded-lg border border-white/10 px-5 py-3 text-sm font-semibold hover:bg-white/5 transition-colors">Admin</Link>
            <Link href="/login"      className="flex items-center gap-2 rounded-lg border border-white/10 px-5 py-3 text-sm font-semibold hover:bg-white/5 transition-colors">Connexion</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
