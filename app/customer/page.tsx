'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Search, Star, Clock, CircleCheck, Heart, Plus, Minus, ShoppingBag, MapPin, X, Filter, ChevronRight, Loader2, ArrowLeft, Send, LogOut } from 'lucide-react'
import { supabase, signOut } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { showToast } from '@/components/ui/Toast'
import { PaymentSelector, CardForm } from '@/components/payment/PaymentSelector'
import { useRouter } from 'next/navigation'
import type { PaymentMethod, MenuItem, Review } from '@/lib/supabase'

const DeliveryMap = dynamic(() => import('@/components/map/DeliveryMap').then(m => m.DeliveryMap), { ssr: false })

/* ── Demo data ── */
const DEMO_RESTAURANTS = [
  { id: 'r1', name: 'Ember Table',   cuisine: ['Grill', 'Bowls'],   rating: 4.9, review_count: 142, delivery_time: '22-30 min', delivery_fee: 2.5, min_order: 10, restaurant_address: 'Tunis Centre', restaurant_logo_url: '', cover: 'https://images.unsplash.com/photo-1543353071-10c8ba85a904?w=800&q=80', lat: 36.806, lng: 10.181 },
  { id: 'r2', name: 'Nori & Flame',  cuisine: ['Sushi', 'Asian'],   rating: 4.8, review_count: 98,  delivery_time: '28-38 min', delivery_fee: 3.0, min_order: 15, restaurant_address: 'La Marsa',     restaurant_logo_url: '', cover: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&q=80', lat: 36.878, lng: 10.325 },
  { id: 'r3', name: 'Golden Crust',  cuisine: ['Pizza', 'Italian'], rating: 4.7, review_count: 76,  delivery_time: '18-25 min', delivery_fee: 1.5, min_order: 12, restaurant_address: 'Lac 1',        restaurant_logo_url: '', cover: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80', lat: 36.832, lng: 10.237 },
  { id: 'r4', name: 'Zitouna Grill', cuisine: ['Tunisien', 'Grill'],rating: 4.6, review_count: 54,  delivery_time: '25-35 min', delivery_fee: 2.0, min_order: 10, restaurant_address: 'Médina',       restaurant_logo_url: '', cover: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80', lat: 36.799, lng: 10.169 },
]

const DEMO_ITEMS: Record<string, MenuItem[]> = {
  r1: [
    { id: 'i1', restaurant_id: 'r1', name: 'Smoked Pepper Bowl',  description: 'Poulet grillé, céréales, sauce citrus maison', price: 14.800, category: 'Plats',   available: true, created_at: '' },
    { id: 'i2', restaurant_id: 'r1', name: 'Savora Burger',        description: 'Double patty, glaçage orange, oignons crispy',  price: 16.200, category: 'Burgers', available: true, created_at: '' },
    { id: 'i3', restaurant_id: 'r1', name: 'Truffle Flatbread',    description: 'Mozzarella, champignons, miel pimenté',          price: 18.000, category: 'Plats',   available: true, created_at: '' },
  ],
  r2: [
    { id: 'i4', restaurant_id: 'r2', name: 'Dragon Roll',          description: 'Tempura crevette, avocat, sauce anguille',        price: 22.500, category: 'Sushi',   available: true, created_at: '' },
    { id: 'i5', restaurant_id: 'r2', name: 'Salmon Tartare',       description: 'Saumon frais, sésame, wasabi léger',               price: 19.800, category: 'Entrées', available: true, created_at: '' },
  ],
  r3: [
    { id: 'i6', restaurant_id: 'r3', name: 'Truffle Pizza',        description: 'San Marzano, fior di latte, truffe noire',         price: 19.900, category: 'Pizzas',  available: true, created_at: '' },
    { id: 'i7', restaurant_id: 'r3', name: 'Margherita Classique', description: 'Tomate, mozzarella, basilic frais',                 price: 12.500, category: 'Pizzas',  available: true, created_at: '' },
  ],
  r4: [
    { id: 'i8', restaurant_id: 'r4', name: 'Tajine Agneau',        description: 'Agneau mijoté, pruneaux, amandes, épices',          price: 18.500, category: 'Plats',   available: true, created_at: '' },
    { id: 'i9', restaurant_id: 'r4', name: 'Couscous Royal',       description: 'Semoule, légumes, merguez, agneau',                  price: 16.000, category: 'Plats',   available: true, created_at: '' },
  ],
}

const DEMO_REVIEWS: Review[] = [
  { id: 'rv1', customer_id: 'c1', restaurant_id: 'r1', order_id: 'o1', rating: 5, comment: 'Excellent ! Livraison rapide et plats délicieux. Je recommande vivement.', customer_name: 'Amine T.', created_at: '2026-06-10' },
  { id: 'rv2', customer_id: 'c2', restaurant_id: 'r1', order_id: 'o2', rating: 4, comment: 'Très bon rapport qualité/prix. Le burger était juteux.', customer_name: 'Sara B.', created_at: '2026-06-08' },
  { id: 'rv3', customer_id: 'c3', restaurant_id: 'r1', order_id: 'o3', rating: 5, comment: 'Parfait pour une soirée en famille. Service impeccable.', customer_name: 'Karim M.', created_at: '2026-06-06' },
]

type CartLine = { id: string; name: string; price: number; qty: number; restaurantId: string }
type View = 'browse' | 'restaurant' | 'checkout' | 'tracking'

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={size} fill={i <= Math.round(rating) ? '#FFAB40' : 'none'} className={i <= Math.round(rating) ? 'text-savora-amber' : 'text-white/20'} />
      ))}
    </span>
  )
}

export default function CustomerPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [view, setView]                 = useState<View>('browse')
  const [activeResto, setActiveResto]   = useState<typeof DEMO_RESTAURANTS[0] | null>(null)
  const [cart, setCart]                 = useState<CartLine[]>([])
  const [favs, setFavs]                 = useState<Set<string>>(new Set())
  const [query, setQuery]               = useState('')
  const [payment, setPayment]           = useState<PaymentMethod>('cash')
  const [address, setAddress]           = useState(user?.address ?? '')
  const [placingOrder, setPlacingOrder] = useState(false)
  const [orderStatus]                   = useState(1)
  const [newReview, setNewReview]       = useState({ rating: 5, comment: '' })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [cuisineFilter, setCuisineFilter] = useState('')

  // Redirect if not approved
  useEffect(() => {
    if (user && user.status !== 'approved') {
      showToast('Votre compte est en attente d\'approbation', 'info')
      router.push('/login')
    }
  }, [user])

  const items    = activeResto ? (DEMO_ITEMS[activeResto.id] ?? []) : []
  const total    = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const count    = cart.reduce((s, i) => s + i.qty, 0)
  const filtered = DEMO_RESTAURANTS.filter(r =>
    (query === '' || r.name.toLowerCase().includes(query.toLowerCase()) || r.cuisine.some(c => c.toLowerCase().includes(query.toLowerCase()))) &&
    (cuisineFilter === '' || r.cuisine.includes(cuisineFilter))
  )

  const addItem = (item: MenuItem) => {
    if (cart.length > 0 && cart[0].restaurantId !== item.restaurant_id) {
      showToast('Panier d\'un seul restaurant à la fois', 'error'); return
    }
    setCart(c => {
      const ex = c.find(x => x.id === item.id)
      if (ex) return c.map(x => x.id === item.id ? { ...x, qty: x.qty + 1 } : x)
      return [...c, { id: item.id, name: item.name, price: item.price, qty: 1, restaurantId: item.restaurant_id }]
    })
    showToast(`${item.name} ajouté`, 'success')
  }

  const setQty = (id: string, qty: number) => {
    if (qty <= 0) setCart(c => c.filter(x => x.id !== id))
    else setCart(c => c.map(x => x.id === id ? { ...x, qty } : x))
  }

  const placeOrder = async () => {
    if (!cart.length) { showToast('Panier vide', 'error'); return }
    if (!address.trim()) { showToast('Entrez votre adresse', 'error'); return }
    setPlacingOrder(true)

    const { error } = await supabase.from('orders').insert({
      customer_id: user?.id ?? 'guest',
      restaurant_id: cart[0].restaurantId,
      items: cart.map(l => ({ item_id: l.id, name: l.name, price: l.price, qty: l.qty })),
      subtotal: +total.toFixed(3),
      delivery_fee: 2.5,
      total: +(total + 2.5).toFixed(3),
      payment_method: payment,
      payment_status: 'pending',
      status: 'pending',
      delivery_address: address,
      estimated_minutes: 30,
    })

    setPlacingOrder(false)
    showToast(error ? 'Commande placée (mode démo) !' : 'Commande confirmée !', 'success')
    setCart([])
    setView('tracking')
  }

  const submitReview = async () => {
    if (!newReview.comment.trim()) { showToast('Écrivez un commentaire', 'error'); return }
    setSubmittingReview(true)
    await supabase.from('reviews').insert({
      customer_id: user?.id ?? 'guest',
      restaurant_id: activeResto?.id,
      order_id: null,
      rating: newReview.rating,
      comment: newReview.comment,
    })
    showToast('Avis envoyé, merci !', 'success')
    setNewReview({ rating: 5, comment: '' })
    setSubmittingReview(false)
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
  }

  const allCuisines = [...new Set(DEMO_RESTAURANTS.flatMap(r => r.cuisine))]

  return (
    <div className="min-h-screen page-enter">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#07070A]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <img src="/savora-logo.svg" alt="" className="h-8 w-8" />
            <span className="font-display font-bold hidden sm:block">Savora</span>
          </div>
          {view !== 'browse' && (
            <button onClick={() => { setView('browse'); setActiveResto(null) }}
              className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors">
              <ArrowLeft size={15} /> Retour
            </button>
          )}
          <div className="flex-1 flex items-center justify-center">
            {view === 'browse' && (
              <div className="field-wrap flex w-full max-w-sm items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2.5">
                <Search size={15} className="text-savora-orange shrink-0" />
                <input value={query} onChange={e => setQuery(e.target.value)}
                  className="w-full bg-transparent text-sm placeholder:text-white/30"
                  placeholder="Restaurants, plats..." />
                {query && <button onClick={() => setQuery('')}><X size={13} className="text-white/30" /></button>}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {count > 0 && (
              <button onClick={() => setView('checkout')}
                className="flex items-center gap-2 rounded-xl bg-savora-orange px-3 py-2 text-sm font-bold text-black">
                <ShoppingBag size={15} />
                <span>{count}</span>
                <span className="hidden sm:block">· {total.toFixed(2)} DT</span>
              </button>
            )}
            <div className="hidden sm:flex items-center gap-2 rounded-xl border border-white/[0.07] px-3 py-2">
              <div className="h-6 w-6 rounded-full bg-savora-orange/20 flex items-center justify-center text-xs font-bold text-savora-orange">
                {user?.name?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <span className="text-xs text-white/60 max-w-[100px] truncate">{user?.name ?? 'Client'}</span>
            </div>
            <button onClick={handleLogout} className="grid h-9 w-9 place-items-center rounded-xl border border-white/[0.07] text-white/40 hover:text-red-400 transition-colors">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Browse ── */}
      {view === 'browse' && (
        <div className="mx-auto max-w-7xl px-4 py-8">
          {/* Welcome */}
          <div className="mb-8">
            <h1 className="font-display text-2xl font-bold">
              Bonjour{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋
            </h1>
            <p className="text-sm text-white/45 mt-1">Qu'est-ce qui vous ferait plaisir aujourd'hui ?</p>
          </div>

          {/* Cuisine filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
            <button onClick={() => setCuisineFilter('')}
              className={`shrink-0 rounded-xl border px-4 py-2 text-sm font-semibold transition-all ${
                cuisineFilter === '' ? 'border-savora-orange/40 bg-savora-orange/10 text-savora-orange' : 'border-white/[0.07] text-white/50 hover:text-white'
              }`}>
              Tout
            </button>
            {allCuisines.map(c => (
              <button key={c} onClick={() => setCuisineFilter(c === cuisineFilter ? '' : c)}
                className={`shrink-0 rounded-xl border px-4 py-2 text-sm font-semibold transition-all ${
                  cuisineFilter === c ? 'border-savora-orange/40 bg-savora-orange/10 text-savora-orange' : 'border-white/[0.07] text-white/50 hover:text-white'
                }`}>
                {c}
              </button>
            ))}
          </div>

          {/* Restaurant grid */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-2 stagger">
            {filtered.map(r => (
              <article key={r.id}
                onClick={() => { setActiveResto(r); setView('restaurant') }}
                className="glass rounded-2xl overflow-hidden card-lift cursor-pointer group border-animated">
                <div className="relative h-48 overflow-hidden">
                  <img src={r.cover} alt={r.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <button
                    onClick={e => { e.stopPropagation(); setFavs(f => { const n = new Set(f); n.has(r.id) ? n.delete(r.id) : n.add(r.id); return n }) }}
                    className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-black/50 backdrop-blur"
                  >
                    <Heart size={14} fill={favs.has(r.id) ? '#FF6B1A' : 'none'} color={favs.has(r.id) ? '#FF6B1A' : 'white'} />
                  </button>
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <div>
                      <h3 className="font-display text-lg font-bold drop-shadow">{r.name}</h3>
                      <p className="text-xs text-white/70">{r.cuisine.join(' · ')}</p>
                    </div>
                    <div className="flex items-center gap-1 rounded-lg bg-savora-orange px-2.5 py-1.5 text-xs font-black text-black">
                      <Star size={11} fill="currentColor" /> {r.rating.toFixed(1)}
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3 flex items-center gap-4 text-xs text-white/50">
                  <span className="flex items-center gap-1.5"><Clock size={12} /> {r.delivery_time}</span>
                  <span className="flex items-center gap-1.5 text-emerald-400"><CircleCheck size={12} /> Vérifié</span>
                  <span className="flex items-center gap-1.5"><MapPin size={12} /> {r.restaurant_address}</span>
                  <span className="ml-auto">{r.delivery_fee.toFixed(1)} DT livraison</span>
                </div>
              </article>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="py-20 text-center text-sm text-white/25">
              Aucun résultat pour « {query} »
            </div>
          )}
        </div>
      )}

      {/* ── Restaurant detail ── */}
      {view === 'restaurant' && activeResto && (
        <div className="mx-auto max-w-4xl px-4 py-8">
          {/* Cover */}
          <div className="relative h-52 rounded-2xl overflow-hidden mb-6">
            <img src={activeResto.cover} alt={activeResto.name} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-4 left-5 right-5">
              <div className="flex items-end justify-between">
                <div>
                  <h1 className="font-display text-3xl font-bold">{activeResto.name}</h1>
                  <p className="text-white/60 text-sm mt-0.5">{activeResto.cuisine.join(' · ')} · {activeResto.restaurant_address}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1 rounded-xl bg-savora-orange px-3 py-1.5 text-sm font-black text-black">
                    <Star size={13} fill="currentColor" /> {activeResto.rating.toFixed(1)}
                  </div>
                  <p className="text-xs text-white/45">{activeResto.review_count} avis</p>
                </div>
              </div>
            </div>
          </div>

          {/* Info chips */}
          <div className="flex flex-wrap gap-2 mb-8">
            {[
              { icon: '🕐', text: activeResto.delivery_time },
              { icon: '🛵', text: `${activeResto.delivery_fee.toFixed(2)} DT livraison` },
              { icon: '📦', text: `Min. ${activeResto.min_order} DT` },
              { icon: '✅', text: 'Restaurant vérifié' },
            ].map(c => (
              <span key={c.text} className="flex items-center gap-1.5 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-xs text-white/55">
                {c.icon} {c.text}
              </span>
            ))}
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            {/* Left: menu + reviews */}
            <div>
              <h2 className="font-display text-xl font-bold mb-4">Menu</h2>
              <div className="space-y-3">
                {items.map(item => {
                  const inCart = cart.find(x => x.id === item.id)
                  return (
                    <div key={item.id} className="glass rounded-xl p-4 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{item.name}</h3>
                          {item.category && (
                            <span className="rounded-lg bg-white/5 px-2 py-0.5 text-[10px] text-white/35">{item.category}</span>
                          )}
                        </div>
                        <p className="mt-0.5 text-sm text-white/45 leading-relaxed">{item.description}</p>
                        <p className="mt-2 font-display font-black text-savora-orange">
                          {item.price.toFixed(3)} DT
                        </p>
                      </div>
                      {inCart ? (
                        <div className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-black/40 px-2 py-1 shrink-0">
                          <button onClick={() => setQty(item.id, inCart.qty - 1)} className="text-white/50 hover:text-white"><Minus size={14} /></button>
                          <span className="w-5 text-center font-bold">{inCart.qty}</span>
                          <button onClick={() => addItem(item)} className="text-savora-orange"><Plus size={14} /></button>
                        </div>
                      ) : (
                        <button onClick={() => addItem(item)}
                          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-savora-orange text-black hover:bg-orange-400 active:scale-95 transition-all">
                          <Plus size={16} />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Reviews */}
              <div className="mt-10">
                <h2 className="font-display text-xl font-bold mb-2">Avis clients</h2>
                <div className="flex items-center gap-3 mb-5">
                  <Stars rating={activeResto.rating} size={16} />
                  <span className="font-display text-2xl font-black">{activeResto.rating.toFixed(1)}</span>
                  <span className="text-sm text-white/40">({activeResto.review_count} avis)</span>
                </div>

                <div className="space-y-3 mb-6">
                  {DEMO_REVIEWS.map(rv => (
                    <div key={rv.id} className="glass rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-savora-orange/20 flex items-center justify-center text-xs font-bold text-savora-orange">
                            {rv.customer_name?.[0] ?? 'U'}
                          </div>
                          <span className="text-sm font-semibold">{rv.customer_name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Stars rating={rv.rating} size={12} />
                          <span className="text-xs text-white/35">{new Date(rv.created_at).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                      <p className="text-sm text-white/60 leading-relaxed">{rv.comment}</p>
                    </div>
                  ))}
                </div>

                {/* Write review */}
                <div className="glass rounded-xl p-4">
                  <h3 className="text-sm font-bold mb-3">Laisser un avis</h3>
                  <div className="flex items-center gap-2 mb-3">
                    {[1,2,3,4,5].map(n => (
                      <button key={n} onClick={() => setNewReview(r => ({ ...r, rating: n }))}>
                        <Star size={22} fill={n <= newReview.rating ? '#FFAB40' : 'none'}
                          className={n <= newReview.rating ? 'text-savora-amber' : 'text-white/20'} />
                      </button>
                    ))}
                  </div>
                  <div className="field-wrap flex gap-2 rounded-xl border border-white/[0.07] bg-black/40 p-3">
                    <textarea value={newReview.comment} onChange={e => setNewReview(r => ({ ...r, comment: e.target.value }))}
                      className="w-full bg-transparent text-sm placeholder:text-white/30 resize-none" rows={2}
                      placeholder="Partagez votre expérience..." />
                    <button onClick={submitReview} disabled={submittingReview}
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-savora-orange text-black disabled:opacity-50">
                      {submittingReview ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: map + cart summary */}
            <div className="space-y-4 lg:sticky lg:top-20 h-fit">
              {/* Mini map */}
              <div className="glass rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-white/[0.06]">
                  <p className="text-sm font-semibold flex items-center gap-2">
                    <MapPin size={14} className="text-savora-orange" /> Localisation
                  </p>
                </div>
                <DeliveryMap lat={activeResto.lat} lng={activeResto.lng} height={180} />
                <div className="px-4 py-2.5 text-xs text-white/40">{activeResto.restaurant_address}</div>
              </div>

              {/* Cart mini */}
              {cart.filter(c => c.restaurantId === activeResto.id).length > 0 && (
                <div className="glass rounded-xl p-4">
                  <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                    <ShoppingBag size={15} className="text-savora-orange" /> Votre sélection
                  </h3>
                  <div className="space-y-2">
                    {cart.filter(c => c.restaurantId === activeResto.id).map(l => (
                      <div key={l.id} className="flex items-center justify-between text-sm">
                        <span className="text-white/60 truncate flex-1">{l.name} ×{l.qty}</span>
                        <span className="font-semibold ml-2">{(l.price * l.qty).toFixed(2)} DT</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 border-t border-white/[0.06] pt-3 flex justify-between text-sm">
                    <span className="text-white/50">Livraison</span>
                    <span>{activeResto.delivery_fee.toFixed(2)} DT</span>
                  </div>
                  <div className="flex justify-between font-display font-black mt-1">
                    <span>Total</span>
                    <span className="text-savora-orange">{(total + activeResto.delivery_fee).toFixed(2)} DT</span>
                  </div>
                  <button onClick={() => setView('checkout')} className="btn-primary w-full mt-4 text-sm py-3">
                    Commander <ChevronRight size={15} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Checkout ── */}
      {view === 'checkout' && (
        <div className="mx-auto max-w-2xl px-4 py-8">
          <h1 className="font-display text-2xl font-bold mb-6">Finaliser la commande</h1>

          {/* Delivery address */}
          <div className="glass rounded-xl p-5 mb-4">
            <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
              <MapPin size={15} className="text-savora-orange" /> Adresse de livraison
            </h2>
            <div className="field-wrap flex items-center gap-3 rounded-xl border border-white/[0.07] bg-black/40 px-3 py-3">
              <MapPin size={15} className="text-savora-orange shrink-0" />
              <input value={address} onChange={e => setAddress(e.target.value)}
                className="w-full bg-transparent text-sm placeholder:text-white/30"
                placeholder="Entrez votre adresse complète..." />
            </div>
            <div className="mt-3 overflow-hidden rounded-xl border border-white/[0.07]">
              <DeliveryMap lat={36.8065} lng={10.1815} interactive height={180}
                onPick={(lat, lng) => showToast('Position mise à jour', 'info')} />
            </div>
          </div>

          {/* Order recap */}
          <div className="glass rounded-xl p-5 mb-4">
            <h2 className="text-sm font-bold mb-3">Récapitulatif</h2>
            {cart.map(l => (
              <div key={l.id} className="flex items-center justify-between py-2 text-sm border-b border-white/[0.04] last:border-0">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-white/60 truncate">{l.name}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => setQty(l.id, l.qty - 1)} className="text-white/30 hover:text-white"><Minus size={12} /></button>
                    <span className="w-5 text-center font-bold">{l.qty}</span>
                    <button onClick={() => setQty(l.id, l.qty + 1)} className="text-savora-orange"><Plus size={12} /></button>
                  </div>
                </div>
                <span className="font-semibold ml-3 shrink-0">{(l.price * l.qty).toFixed(2)} DT</span>
              </div>
            ))}
            <div className="mt-3 flex justify-between text-sm text-white/45">
              <span>Livraison</span><span>2.50 DT</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-white/[0.06] pt-3 font-display font-black">
              <span>Total</span>
              <span className="text-savora-orange">{(total + 2.5).toFixed(2)} DT</span>
            </div>
          </div>

          {/* Payment */}
          <div className="glass rounded-xl p-5 mb-4">
            <h2 className="text-sm font-bold mb-3">Mode de paiement</h2>
            <PaymentSelector value={payment} onChange={setPayment} />
            {payment === 'card' && <CardForm />}
          </div>

          <button onClick={placeOrder} disabled={placingOrder}
            className="btn-primary w-full py-4 text-base">
            {placingOrder ? <Loader2 size={18} className="animate-spin" /> : `Confirmer · ${(total + 2.5).toFixed(2)} DT`}
          </button>
        </div>
      )}

      {/* ── Tracking ── */}
      {view === 'tracking' && (
        <div className="mx-auto max-w-2xl px-4 py-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/8 px-4 py-1.5 text-sm text-emerald-400 mb-3">
              <span className="live-dot" style={{ background: '#34D399' }} /> Commande en cours
            </div>
            <h1 className="font-display text-2xl font-bold">Suivi en direct</h1>
            <p className="text-sm text-white/45 mt-1">Livraison estimée dans ~22 min</p>
          </div>

          <div className="glass rounded-2xl overflow-hidden mb-5">
            <DeliveryMap lat={36.8065} lng={10.1815}
              driverLat={36.815} driverLng={10.172}
              restaurantLat={36.792} restaurantLng={10.195}
              height={320} />
          </div>

          {/* Status stepper */}
          <div className="glass rounded-xl p-5 mb-4">
            <div className="flex items-start">
              {['Confirmée','Préparation','Prête','En livraison','Livrée'].map((s, i) => (
                <div key={s} className="flex flex-1 items-start">
                  <div className="flex flex-col items-center w-full">
                    <div className={`h-7 w-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                      i <= orderStatus ? 'border-savora-orange bg-savora-orange text-black' : 'border-white/15 text-white/25'
                    }`}>
                      {i < orderStatus ? '✓' : i + 1}
                    </div>
                    <p className={`mt-1.5 text-[10px] text-center leading-tight px-1 ${i <= orderStatus ? 'text-white/70' : 'text-white/25'}`}>{s}</p>
                  </div>
                  {i < 4 && <div className={`h-px flex-1 mt-3.5 ${i < orderStatus ? 'bg-savora-orange' : 'bg-white/10'}`} />}
                </div>
              ))}
            </div>
          </div>

          {/* Driver */}
          <div className="glass rounded-xl flex items-center gap-4 p-4">
            <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center text-2xl">🛵</div>
            <div className="flex-1">
              <p className="font-semibold">Ahmed B.</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Stars rating={4.9} size={11} />
                <span className="text-xs text-white/40 ml-1">4.9 · 234 livraisons</span>
              </div>
            </div>
            <a href="tel:+21612345678"
              className="rounded-xl border border-savora-orange/30 bg-savora-orange/10 px-4 py-2 text-sm text-savora-orange hover:bg-savora-orange/20 transition-colors">
              Appeler
            </a>
          </div>

          <button onClick={() => setView('browse')} className="btn-ghost w-full mt-4 py-3 text-sm">
            Nouvelle commande
          </button>
        </div>
      )}
    </div>
  )
}
