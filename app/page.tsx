import Link from 'next/link'
import { ArrowRight, Star, Clock, CircleCheck, Sparkles, Flame, Shield, ChevronRight, Bike, Utensils, MapPin, Zap } from 'lucide-react'

const DISHES = [
  { name: 'Tajine Agneau',    price: 18.5,  img: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80', tag: '🔥 Populaire', rating: 4.9 },
  { name: 'Couscous Royal',  price: 16.0,  img: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&q=80', tag: '⭐ Top', rating: 4.8 },
  { name: 'Brik au Thon',    price: 8.5,   img: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80', tag: '🇹🇳 Local', rating: 4.7 },
  { name: 'Pizza Harissa',   price: 14.0,  img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80', tag: '🌶️ Spicy', rating: 4.6 },
  { name: 'Sushi Fusion',    price: 22.0,  img: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&q=80', tag: '✨ Premium', rating: 4.9 },
  { name: 'Smash Burger',    price: 15.5,  img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80', tag: '💥 New', rating: 4.8 },
]

const STEPS = [
  { n: '01', icon: '🔍', title: 'Parcourez',    desc: 'Explorez les restaurants vérifiés près de chez vous' },
  { n: '02', icon: '🛒', title: 'Commandez',   desc: 'Choisissez vos plats et payez en toute sécurité' },
  { n: '03', icon: '🛵', title: 'Suivez',       desc: 'Tracking GPS en temps réel jusqu&apos;à votre porte' },
]

const STATS = [
  { val: '150+', label: 'Restaurants', icon: Utensils },
  { val: '<30',  label: 'Min livraison', icon: Clock },
  { val: '5★',   label: 'Expérience', icon: Star },
  { val: '24/7', label: 'Support', icon: Shield },
]

export default function Home() {
  return (
    <div className="page-enter">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#07070A]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative h-9 w-9">
              <img src="/savora-logo.svg" alt="Savora" className="h-9 w-9" />
            </div>
            <span className="font-display text-lg font-bold tracking-wide">Savora</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {[['#menu', 'Menu'], ['#how', 'Comment ça marche'], ['#join', 'Rejoindre']].map(([href, label]) => (
              <a key={href} href={href} className="rounded-lg px-3.5 py-2 text-sm text-white/55 hover:bg-white/5 hover:text-white transition-colors">{label}</a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn-ghost text-sm px-4 py-2">Connexion</Link>
            <Link href="/login" className="btn-primary text-sm px-4 py-2">Commander →</Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="hero-bg relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="pointer-events-none absolute inset-0 dot-grid opacity-40" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-px w-3/4 -translate-x-1/2 glow-line" />

        {/* Floating decorative circles */}
        <div className="pointer-events-none absolute -left-20 top-20 h-64 w-64 rounded-full border border-savora-orange/10 opacity-50" />
        <div className="pointer-events-none absolute -left-32 top-28 h-96 w-96 rounded-full border border-savora-orange/5" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full border border-savora-amber/8" />

        <div className="mx-auto max-w-7xl px-4 py-20 lg:py-28">
          <div className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr] items-center">
            <div>
              {/* Badge */}
              <div className="float-badge mb-6 inline-flex items-center gap-2 rounded-full border border-savora-orange/25 bg-savora-orange/8 px-4 py-1.5 text-sm text-savora-amber">
                <Sparkles size={13} /> Livraison premium en Tunisie
              </div>

              <h1 className="font-display text-5xl font-bold leading-[1.06] md:text-6xl lg:text-7xl">
                Savourez<br />
                <span className="relative inline-block">
                  <span className="text-savora-orange">chaque</span>
                  {/* Underline decoration */}
                  <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none" preserveAspectRatio="none">
                    <path d="M2 6 C50 2 150 2 198 6" stroke="#FF6B1A" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"/>
                  </svg>
                </span>
                <br />instant
              </h1>

              <p className="mt-7 max-w-lg text-base leading-8 text-white/55">
                Restaurants vérifiés, paiements sécurisés (D17, SobFlous, Carte, Cash), suivi GPS en temps réel. La meilleure expérience de livraison en Tunisie.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/login" className="btn-primary px-6 py-3.5 text-sm">
                  Commander maintenant <ArrowRight size={16} />
                </Link>
                <Link href="/login" className="btn-ghost px-6 py-3.5 text-sm">
                  Mon restaurant <ChevronRight size={16} />
                </Link>
              </div>

              {/* Trust badges */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                {['✓ CIN vérifiée', '✓ Restaurants certifiés', '✓ Paiement sécurisé', '✓ Support 24/7'].map(t => (
                  <span key={t} className="text-xs text-white/35 flex items-center gap-1">{t}</span>
                ))}
              </div>
            </div>

            {/* Hero card stack */}
            <div className="relative hidden lg:block">
              {/* Background card */}
              <div className="absolute -right-4 -top-4 h-full w-full rounded-2xl border border-white/[0.04] bg-white/[0.01]" />
              <div className="absolute -right-2 -top-2 h-full w-full rounded-2xl border border-white/[0.06] bg-white/[0.02]" />

              {/* Main card */}
              <div className="glass relative rounded-2xl p-5 noise">
                <div className="relative z-10">
                  {/* Live indicator */}
                  <div className="mb-4 flex items-center gap-2">
                    <span className="live-dot" />
                    <span className="text-xs text-white/50">Commandes en direct</span>
                    <span className="ml-auto rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400">+247 aujourd'hui</span>
                  </div>

                  {/* Featured dishes */}
                  {DISHES.slice(0, 3).map((d, i) => (
                    <div key={d.name} className={`flex items-center gap-3 rounded-xl border border-white/[0.06] bg-black/30 p-3 mb-2 last:mb-0 transition-all hover:border-white/10 stagger`}>
                      <div className="h-14 w-16 shrink-0 rounded-lg overflow-hidden">
                        <img src={d.img} alt={d.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold truncate">{d.name}</p>
                          <span className="text-[10px] rounded bg-savora-orange/15 px-1.5 py-0.5 text-savora-orange font-bold shrink-0">{d.tag}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-white/40">
                          <span className="flex items-center gap-0.5"><Star size={10} fill="currentColor" className="text-savora-amber" /> {d.rating}</span>
                          <span>·</span>
                          <span className="flex items-center gap-1"><Clock size={10} /> 25 min</span>
                        </div>
                      </div>
                      <p className="font-display font-black text-savora-orange shrink-0">{d.price.toFixed(2)}<span className="text-xs font-normal text-white/40"> DT</span></p>
                    </div>
                  ))}

                  {/* Map preview strip */}
                  <div className="mt-3 flex items-center gap-2 rounded-xl border border-white/[0.06] bg-black/30 px-3 py-2.5">
                    <MapPin size={14} className="text-savora-orange shrink-0" />
                    <p className="text-xs text-white/50 flex-1">Livreur en route — Tunis Centre</p>
                    <div className="flex items-center gap-1.5">
                      <span className="live-dot" style={{ width: 6, height: 6 }} />
                      <span className="text-xs text-emerald-400 font-semibold">~18 min</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating chips */}
              <div className="absolute -left-8 top-12 float-badge glass rounded-xl px-3 py-2 text-xs font-semibold">
                🛵 12 livreurs actifs
              </div>
              <div className="absolute -right-6 bottom-20 float-badge glass rounded-xl px-3 py-2 text-xs font-semibold" style={{ animationDelay: '.5s' }}>
                ⚡ Livraison express
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Glow separator ── */}
      <div className="glow-line w-full" />

      {/* ── Stats bar ── */}
      <section className="border-b border-white/[0.05] bg-white/[0.01]">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {STATS.map(s => (
              <div key={s.label} className="flex flex-col items-center gap-2 text-center">
                <s.icon size={18} className="text-savora-orange" />
                <p className="font-display text-2xl font-bold">{s.val}</p>
                <p className="text-xs text-white/40">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Menu section ── */}
      <section id="menu" className="mx-auto max-w-7xl px-4 py-20">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.03] px-4 py-1.5 text-sm text-white/50 mb-4">
            <Flame size={13} className="text-savora-orange" /> Plats populaires
          </div>
          <h2 className="font-display text-4xl font-bold">Ce que vous allez <span className="text-savora-orange">adorer</span></h2>
          <p className="mt-3 text-sm text-white/45 max-w-md mx-auto">Sélection culinaire variée de nos restaurants partenaires vérifiés</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger">
          {DISHES.map(d => (
            <Link href="/login" key={d.name}
              className="group glass rounded-2xl overflow-hidden card-lift border-animated">
              <div className="relative h-44 overflow-hidden">
                <img src={d.img} alt={d.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="absolute left-3 top-3 rounded-lg bg-black/50 backdrop-blur-sm px-2 py-1 text-xs font-bold text-white border border-white/10">
                  {d.tag}
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display font-bold">{d.name}</h3>
                    <div className="mt-1.5 flex items-center gap-3 text-xs text-white/40">
                      <span className="flex items-center gap-1"><Star size={11} fill="currentColor" className="text-savora-amber" /> {d.rating}</span>
                      <span className="flex items-center gap-1"><Clock size={11} /> 25-35 min</span>
                      <span className="flex items-center gap-1 text-emerald-400"><CircleCheck size={11} /> Vérifié</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display text-xl font-black text-savora-orange">{d.price.toFixed(2)}</p>
                    <p className="text-xs text-white/30">DT</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex -space-x-1.5">
                    {['🍋','🌿','🌶️'].map(e => <span key={e} className="text-sm">{e}</span>)}
                  </div>
                  <span className="text-xs text-savora-orange group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Commander <ArrowRight size={11} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/login" className="btn-ghost px-8 py-3 text-sm">
            Voir tous les plats →
          </Link>
        </div>
      </section>

      {/* ── Stripe accent separator ── */}
      <div className="stripe-accent h-12 w-full opacity-60" />

      {/* ── How it works ── */}
      <section id="how" className="mx-auto max-w-7xl px-4 py-20">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.03] px-4 py-1.5 text-sm text-white/50 mb-4">
            <Zap size={13} className="text-savora-amber" /> Simple et rapide
          </div>
          <h2 className="font-display text-4xl font-bold">Comment ça <span className="text-savora-orange">marche ?</span></h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-px bg-gradient-to-r from-savora-orange/20 via-savora-orange/40 to-savora-orange/20" />

          {STEPS.map((s, i) => (
            <div key={s.n} className="glass rounded-2xl p-6 text-center border-animated card-lift">
              <div className="relative inline-flex">
                <div className="h-16 w-16 rounded-2xl bg-savora-orange/10 flex items-center justify-center text-3xl mb-4 mx-auto">
                  {s.icon}
                </div>
                <span className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-savora-orange flex items-center justify-center text-[10px] font-black text-black">
                  {i + 1}
                </span>
              </div>
              <h3 className="font-display text-lg font-bold">{s.title}</h3>
              <p className="mt-2 text-sm text-white/45 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Join section ── */}
      <section id="join" className="relative overflow-hidden border-t border-white/[0.05]">
        <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(255,107,26,.08) 0%, transparent 70%)' }} />
        <div className="mx-auto max-w-7xl px-4 py-20">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Client card */}
            <div className="glass rounded-2xl p-6 card-lift border-animated">
              <div className="h-12 w-12 rounded-xl bg-savora-orange/10 flex items-center justify-center mb-4">
                <span className="text-2xl">👤</span>
              </div>
              <h3 className="font-display text-xl font-bold mb-2">Vous êtes client ?</h3>
              <p className="text-sm text-white/45 mb-5 leading-relaxed">
                Créez votre compte, vérifiez votre identité et commandez dès approbation.
              </p>
              <ul className="space-y-2 mb-6 text-sm text-white/55">
                {['Inscription avec CIN', 'Vérification admin 24h', 'Accès à tous les restaurants', 'Suivi GPS en direct'].map(t => (
                  <li key={t} className="flex items-center gap-2"><CircleCheck size={14} className="text-emerald-400 shrink-0" />{t}</li>
                ))}
              </ul>
              <Link href="/login" className="btn-primary w-full justify-center text-sm py-3">
                S&#39;inscrire comme client
              </Link>
            </div>

            {/* Restaurant card */}
            <div className="glass rounded-2xl p-6 card-lift border-animated">
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                <span className="text-2xl">🏪</span>
              </div>
              <h3 className="font-display text-xl font-bold mb-2">Vous êtes restaurant ?</h3>
              <p className="text-sm text-white/45 mb-5 leading-relaxed">
                Rejoignez Savora, publiez votre menu et atteignez de nouveaux clients.
              </p>
              <ul className="space-y-2 mb-6 text-sm text-white/55">
                {['CIN + justificatif propriété', 'Validation équipe Savora', 'Dashboard de gestion', 'Commission 12% seulement'].map(t => (
                  <li key={t} className="flex items-center gap-2"><CircleCheck size={14} className="text-blue-400 shrink-0" />{t}</li>
                ))}
              </ul>
              <Link href="/login" className="btn-ghost w-full justify-center text-sm py-3 border-blue-500/20 text-blue-400 hover:bg-blue-500/10">
                Inscrire mon restaurant
              </Link>
            </div>

            {/* Payment methods */}
            <div className="glass rounded-2xl p-6 card-lift md:col-span-2 lg:col-span-1">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
                <span className="text-2xl">💳</span>
              </div>
              <h3 className="font-display text-xl font-bold mb-2">Modes de paiement</h3>
              <p className="text-sm text-white/45 mb-5">Payez comme vous voulez, en toute sécurité</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: '💵', label: 'Cash',     sub: 'À la livraison' },
                  { icon: '💳', label: 'Carte',    sub: 'Visa · Mastercard' },
                  { icon: '📱', label: 'D17',      sub: 'Paiement mobile' },
                  { icon: '📲', label: 'SobFlous', sub: 'Wallet digital' },
                  { icon: '🏦', label: 'PostPay',  sub: 'La Poste TN' },
                  { icon: '🔒', label: 'Sécurisé', sub: 'SSL + 3DS' },
                ].map(p => (
                  <div key={p.label} className="flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                    <span className="text-lg">{p.icon}</span>
                    <div>
                      <p className="text-xs font-bold">{p.label}</p>
                      <p className="text-[10px] text-white/35">{p.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.06] bg-black/30">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <img src="/savora-logo.svg" alt="Savora" className="h-7 w-7" />
              <span className="font-display font-bold">Savora</span>
              <span className="text-xs text-white/25 ml-2">© 2026 · Tunisie</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-white/35">
              <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
              <a href="#" className="hover:text-white transition-colors">CGU</a>
              <a href="mailto:support@savora.app" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-2">
              <div className="live-dot" style={{ width: 6, height: 6 }} />
              <span className="text-xs text-white/35">Tous les systèmes opérationnels</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
