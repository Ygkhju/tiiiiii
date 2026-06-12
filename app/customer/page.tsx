'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Search, Filter, Star, Clock, CircleCheck, Heart, Plus, Minus, ShoppingBag, MapPin, ChevronRight, X, Loader2 } from 'lucide-react'
import { PaymentSelector, CardForm } from '@/components/payment/PaymentSelector'
import { showToast } from '@/components/ui/Toast'
import { getRestaurants, createOrder } from '@/lib/supabase'
import { useApp, cartTotal, cartCount } from '@/lib/store'
import type { PaymentMethod, Restaurant } from '@/lib/supabase'

const DeliveryMap = dynamic(() => import('@/components/map/DeliveryMap').then(m => m.DeliveryMap), { ssr: false })

/* ── Fallback data (shown when Supabase not configured) ── */
const DEMO_RESTAURANTS: Restaurant[] = [
  { id: 'r1', owner_id: '', name: 'Ember Table',  description: 'Grill & bowls premium',  cuisine: ['Grill','Bowls'],   address: 'Tunis Centre', lat: 36.8065, lng: 10.1815, rating: 4.9, review_count: 142, delivery_time: '22-30 min', delivery_fee: 2.5, min_order: 10, verified: true, approved: true, commission_rate: 12, logo_url: '', cover_url: 'https://images.unsplash.com/photo-1543353071-10c8ba85a904?w=600&q=80', created_at: '' },
  { id: 'r2', owner_id: '', name: 'Nori & Flame', description: 'Sushi & cuisine asiatique', cuisine: ['Sushi','Asian'],  address: 'La Marsa',     lat: 36.878,  lng: 10.325,  rating: 4.8, review_count: 98,  delivery_time: '28-38 min', delivery_fee: 3.0, min_order: 15, verified: true, approved: true, commission_rate: 12, logo_url: '', cover_url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=600&q=80', created_at: '' },
  { id: 'r3', owner_id: '', name: 'Golden Crust', description: 'Pizza artisanale italienne', cuisine: ['Pizza','Italian'], address: 'Lac 1',       lat: 36.832,  lng: 10.237,  rating: 4.7, review_count: 76,  delivery_time: '18-25 min', delivery_fee: 1.5, min_order: 12, verified: true, approved: true, commission_rate: 12, logo_url: '', cover_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80', created_at: '' },
]

const DEMO_ITEMS = [
  { id: 'i1', restaurant_id: 'r1', name: 'Smoked pepper bowl',   description: 'Poulet grillé, céréales, sauce citrus', price: 14.800, available: true, image_url: '', category: 'Plats', created_at: '' },
  { id: 'i2', restaurant_id: 'r1', name: 'Savora burger',         description: 'Double patty, glaçage orange, oignons croustillants', price: 16.200, available: true, image_url: '', category: 'Burgers', created_at: '' },
  { id: 'i3', restaurant_id: 'r1', name: 'Truffle flatbread',     description: 'Mozzarella, champignons, miel pimenté', price: 18.000, available: true, image_url: '', category: 'Pizzas', created_at: '' },
  { id: 'i4', restaurant_id: 'r2', name: 'Dragon roll',           description: 'Tempura crevette, avocat, sauce anguille', price: 22.500, available: true, image_url: '', category: 'Sushi', created_at: '' },
  { id: 'i5', restaurant_id: 'r3', name: 'Truffle pizza',         description: 'San Marzano, fior di latte, truffe', price: 19.900, available: true, image_url: '', category: 'Pizzas', created_at: '' },
]

type CartLine = { id: string; name: string; price: number; qty: number; restaurantId: string }
const STATUS_STEPS = ['Confirmée', 'En préparation', 'Prête', 'En livraison', 'Livrée']

export default function CustomerPage() {
  const { state } = useApp()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading]         = useState(true)
  const [query, setQuery]             = useState('')
  const [activeResto, setActiveResto] = useState<string | null>(null)
  const [cart, setCart]               = useState<CartLine[]>([])
  const [payment, setPayment]         = useState<PaymentMethod>('cash')
  const [view, setView]               = useState<'shop' | 'checkout' | 'tracking'>('shop')
  const [orderStatus]                 = useState(1)
  const [favs, setFavs]               = useState<Set<string>>(new Set())
  const [address, setAddress]         = useState('Tunis, Rue de la Liberté')
  const [placingOrder, setPlacingOrder] = useState(false)

  // Load restaurants
  useEffect(() => {
    getRestaurants().then(({ data }) => {
      setRestaurants(data?.length ? data : DEMO_RESTAURANTS)
      setLoading(false)
    })
  }, [])

  const items = activeResto
    ? DEMO_ITEMS.filter(i => i.restaurant_id === activeResto)
    : DEMO_ITEMS

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(query.toLowerCase()) ||
    i.description.toLowerCase().includes(query.toLowerCase())
  )

  const addItem = (item: typeof DEMO_ITEMS[0]) => {
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

  const total     = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const itemCount = cart.reduce((s, i) => s + i.qty, 0)

  const placeOrder = async () => {
    if (!cart.length) { showToast('Votre panier est vide', 'error'); return }
    setPlacingOrder(true)
    const restaurantId = cart[0].restaurantId

    const { data, error } = await createOrder({
      customer_id: state.user?.id ?? 'guest',
      restaurant_id: restaurantId,
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

    if (error) {
      // Supabase not configured: continue in demo mode
      showToast('Commande placée (mode démo) !', 'success')
    } else {
      showToast('Commande confirmée !', 'success')
    }

    setPlacingOrder(false)
    setView('tracking')
    setCart([])
  }

  return (
    <div className="page-enter mx-auto max-w-7xl px-4 py-8">
      {view === 'shop' && (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* ── Left ── */}
          <section>
            {/* Search */}
            <div className="flex gap-3">
              <label className="field-wrap flex flex-1 items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3">
                <Search size={17} className="shrink-0 text-savora-orange" />
                <input value={query} onChange={e => setQuery(e.target.value)}
                  className="w-full bg-transparent text-sm placeholder:text-white/35"
                  placeholder="Chercher un plat ou restaurant..." />
                {query && <button onClick={() => setQuery('')} className="text-white/30 hover:text-white"><X size={14} /></button>}
              </label>
              <button className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 text-sm text-white/50 hover:text-white transition-colors">
                <Filter size={15} />
              </button>
            </div>

            {/* Restaurants */}
            <div className="mt-6">
              <h2 className="font-display text-lg font-bold mb-3">Restaurants</h2>
              {loading ? (
                <div className="flex items-center justify-center py-12 text-white/30">
                  <Loader2 size={22} className="animate-spin" />
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-3">
                  {restaurants.map(r => (
                    <article
                      key={r.id}
                      onClick={() => setActiveResto(activeResto === r.id ? null : r.id)}
                      className={`overflow-hidden rounded-xl border transition-all cursor-pointer ${
                        activeResto === r.id
                          ? 'border-savora-orange/40 bg-savora-orange/5'
                          : 'border-white/[0.07] bg-white/[0.03] hover:border-white/15'
                      }`}
                    >
                      <div className="relative h-36 bg-cover bg-center" style={{ backgroundImage: `url(${r.cover_url})` }}>
                        <button
                          onClick={e => { e.stopPropagation(); setFavs(f => { const n = new Set(f); n.has(r.id) ? n.delete(r.id) : n.add(r.id); return n }) }}
                          className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/60"
                        >
                          <Heart size={12} fill={favs.has(r.id) ? '#FF6B1A' : 'none'} color={favs.has(r.id) ? '#FF6B1A' : 'white'} />
                        </button>
                        {activeResto === r.id && (
                          <span className="absolute left-2 top-2 rounded-full bg-savora-orange px-2 py-0.5 text-[10px] font-bold text-black">Sélectionné</span>
                        )}
                      </div>
                      <div className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-display font-bold text-sm">{r.name}</h3>
                            <p className="text-xs text-white/45">{r.cuisine.join(' · ')}</p>
                          </div>
                          <span className="flex items-center gap-1 rounded-lg bg-savora-orange px-2 py-1 text-xs font-bold text-black">
                            <Star size={10} fill="currentColor" /> {r.rating.toFixed(1)}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-3 text-xs text-white/50">
                          <span className="flex items-center gap-1"><Clock size={11} /> {r.delivery_time}</span>
                          <span className="flex items-center gap-1 text-emerald-400"><CircleCheck size={11} /> Vérifié</span>
                          <span>{r.delivery_fee.toFixed(1)} DT</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            {/* Menu items */}
            <h2 className="mt-8 font-display text-lg font-bold">
              {activeResto ? `Menu — ${restaurants.find(r => r.id === activeResto)?.name}` : 'Plats populaires'}
            </h2>
            <div className="mt-3 grid gap-3">
              {filtered.map(item => {
                const inCart = cart.find(x => x.id === item.id)
                return (
                  <article key={item.id} className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.07] bg-white/[0.03] p-4 transition hover:border-white/10">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{item.name}</h3>
                      <p className="mt-0.5 text-sm text-white/45 truncate">{item.description}</p>
                      <p className="mt-1 text-xs text-white/35">{item.category}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-display font-black">{item.price.toFixed(2)} DT</span>
                      {inCart ? (
                        <div className="flex items-center gap-2 rounded-lg border border-white/[0.07] bg-black/40 px-2 py-1">
                          <button onClick={() => setQty(item.id, inCart.qty - 1)} className="text-white/60 hover:text-white"><Minus size={13} /></button>
                          <span className="w-4 text-center text-sm font-bold">{inCart.qty}</span>
                          <button onClick={() => setQty(item.id, inCart.qty + 1)} className="text-savora-orange"><Plus size={13} /></button>
                        </div>
                      ) : (
                        <button onClick={() => addItem(item)}
                          className="grid h-9 w-9 place-items-center rounded-lg bg-savora-orange text-black transition hover:bg-orange-400 active:scale-95">
                          <Plus size={15} />
                        </button>
                      )}
                    </div>
                  </article>
                )
              })}
              {filtered.length === 0 && (
                <p className="py-8 text-center text-sm text-white/30">Aucun résultat pour « {query} »</p>
              )}
            </div>
          </section>

          {/* ── Cart sidebar ── */}
          <aside className="h-fit rounded-xl border border-white/[0.07] bg-[#0d0d0d] p-5 lg:sticky lg:top-20">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold">
              <ShoppingBag size={19} className="text-savora-orange" />
              Panier
              {itemCount > 0 && (
                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-savora-orange text-[10px] font-black text-black">
                  {itemCount}
                </span>
              )}
            </h2>

            {cart.length === 0 ? (
              <p className="mt-6 text-center text-sm text-white/25">Votre panier est vide</p>
            ) : (
              <>
                <div className="mt-4 space-y-2">
                  {cart.map(line => (
                    <div key={line.id} className="flex items-center justify-between rounded-lg bg-white/[0.03] p-3 gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{line.name}</p>
                        <p className="text-xs text-white/45">{(line.price * line.qty).toFixed(2)} DT</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button onClick={() => setQty(line.id, line.qty - 1)} className="text-white/40 hover:text-white"><Minus size={12} /></button>
                        <span className="w-4 text-center text-sm font-bold">{line.qty}</span>
                        <button onClick={() => setQty(line.id, line.qty + 1)} className="text-savora-orange"><Plus size={12} /></button>
                        <button onClick={() => setQty(line.id, 0)} className="ml-1 text-white/20 hover:text-red-400"><X size={12} /></button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3 text-sm">
                  <span className="text-white/50">Total</span>
                  <span className="font-display text-lg font-black text-savora-orange">{total.toFixed(2)} DT</span>
                </div>
                <button onClick={() => setView('checkout')}
                  className="btn-primary mt-4 flex w-full items-center justify-center gap-2 text-sm">
                  Commander <ChevronRight size={15} />
                </button>
              </>
            )}

            {/* Live map preview */}
            <div className="mt-6">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-bold">
                <span className="live-dot" /> Suivi live
              </h3>
              <DeliveryMap
                lat={36.8065} lng={10.1815}
                driverLat={36.812} driverLng={10.175}
                restaurantLat={36.795} restaurantLng={10.19}
                height={150}
              />
            </div>

            {/* Order history */}
            <h3 className="mt-5 text-sm font-bold">Historique</h3>
            <div className="mt-2 space-y-1.5">
              {[{ id: 'SV-1042', s: 'En préparation', badge: 'badge-preparing' }, { id: 'SV-1031', s: 'Livré', badge: 'badge-delivered' }].map(o => (
                <div key={o.id} className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2">
                  <span className="font-mono text-xs text-white/50">{o.id}</span>
                  <span className={`rounded border px-2 py-0.5 text-[10px] font-bold ${o.badge}`}>{o.s}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}

      {/* ── Checkout ── */}
      {view === 'checkout' && (
        <div className="mx-auto max-w-2xl">
          <button onClick={() => setView('shop')} className="mb-6 flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
            ← Retour au menu
          </button>
          <h1 className="font-display text-2xl font-bold">Finaliser la commande</h1>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-semibold text-white/70">Adresse de livraison</label>
            <div className="field-wrap flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3">
              <MapPin size={17} className="shrink-0 text-savora-orange" />
              <input value={address} onChange={e => setAddress(e.target.value)}
                className="w-full bg-transparent text-sm placeholder:text-white/35"
                placeholder="Entrez votre adresse..." />
            </div>
            <div className="mt-3 overflow-hidden rounded-xl border border-white/[0.07]">
              <DeliveryMap lat={36.8065} lng={10.1815} interactive height={200}
                onPick={(lat, lng) => showToast(`Position sélectionnée`, 'info')} />
            </div>
            <p className="mt-1.5 text-xs text-white/30">Cliquez sur la carte pour ajuster votre position</p>
          </div>

          <div className="mt-6 rounded-xl border border-white/[0.07] bg-[#0d0d0d] p-4">
            <h2 className="mb-3 font-semibold text-sm">Récapitulatif</h2>
            {cart.map(l => (
              <div key={l.id} className="flex justify-between py-2 text-sm border-b border-white/[0.05] last:border-0">
                <span className="text-white/70">{l.name} ×{l.qty}</span>
                <span className="font-semibold">{(l.price * l.qty).toFixed(2)} DT</span>
              </div>
            ))}
            <div className="mt-3 flex justify-between text-sm text-white/50">
              <span>Livraison</span><span>2.50 DT</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-white/[0.07] pt-3 font-display font-black">
              <span>Total</span>
              <span className="text-savora-orange">{(total + 2.5).toFixed(2)} DT</span>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="mb-3 font-semibold text-sm">Mode de paiement</h2>
            <PaymentSelector value={payment} onChange={setPayment} />
            {payment === 'card' && <CardForm />}
          </div>

          <button onClick={placeOrder} disabled={placingOrder}
            className="btn-primary mt-6 flex w-full items-center justify-center gap-2 disabled:opacity-60">
            {placingOrder && <Loader2 size={16} className="animate-spin" />}
            Confirmer ({(total + 2.5).toFixed(2)} DT)
          </button>
        </div>
      )}

      {/* ── Tracking ── */}
      {view === 'tracking' && (
        <div className="mx-auto max-w-2xl">
          <h1 className="font-display text-2xl font-bold">Suivi de commande</h1>
          <p className="mt-1 text-sm text-white/45">Estimée dans ~22 min</p>

          <div className="mt-6 overflow-hidden rounded-2xl border border-white/[0.07]">
            <DeliveryMap lat={36.8065} lng={10.1815}
              driverLat={36.815} driverLng={10.172}
              restaurantLat={36.792} restaurantLng={10.195}
              height={300} />
          </div>

          <div className="mt-6 rounded-xl border border-white/[0.07] bg-[#0d0d0d] p-5">
            <div className="flex items-center justify-between">
              {STATUS_STEPS.map((step, i) => (
                <div key={step} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center">
                    <div className={`h-7 w-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                      i <= orderStatus ? 'border-savora-orange bg-savora-orange text-black' : 'border-white/20 text-white/25'
                    }`}>
                      {i < orderStatus ? '✓' : i + 1}
                    </div>
                    <p className={`mt-1.5 text-[10px] text-center leading-tight ${i <= orderStatus ? 'text-white/80' : 'text-white/25'}`}>
                      {step}
                    </p>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`h-px flex-1 mx-1 mb-5 ${i < orderStatus ? 'bg-savora-orange' : 'bg-white/10'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4 rounded-xl border border-white/[0.07] bg-[#0d0d0d] p-4">
            <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center text-xl">🛵</div>
            <div>
              <p className="font-semibold">Ahmed B.</p>
              <p className="text-sm text-white/45">⭐ 4.9 · 234 livraisons</p>
            </div>
            <a href="tel:+21612345678" className="ml-auto rounded-lg border border-white/[0.07] px-3 py-2 text-sm text-savora-orange hover:bg-savora-orange/10 transition-colors">
              Appeler
            </a>
          </div>

          <button onClick={() => setView('shop')} className="mt-4 w-full rounded-xl border border-white/10 py-3 text-sm text-white/50 hover:text-white transition-colors">
            Nouvelle commande
          </button>
        </div>
      )}
    </div>
  )
}
