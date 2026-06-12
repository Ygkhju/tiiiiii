'use client'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Search, Filter, Star, Clock, CircleCheck, Heart, Plus, Minus, ShoppingBag, MapPin, ChevronRight, X } from 'lucide-react'
import { PaymentSelector, CardForm } from '@/components/payment/PaymentSelector'
import { showToast } from '@/components/ui/Toast'
import type { PaymentMethod } from '@/lib/supabase'

const DeliveryMap = dynamic(() => import('@/components/map/DeliveryMap').then(m => m.DeliveryMap), { ssr: false })

/* ── Data ── */
const RESTAURANTS = [
  { id: 'r1', name: 'Ember Table',  cuisine: 'Grill · Bowls',  rating: 4.9, time: '22-30', img: 'https://images.unsplash.com/photo-1543353071-10c8ba85a904?w=600&q=80', fee: 2.5 },
  { id: 'r2', name: 'Nori & Flame', cuisine: 'Sushi · Asian',  rating: 4.8, time: '28-38', img: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=600&q=80', fee: 3.0 },
  { id: 'r3', name: 'Golden Crust', cuisine: 'Pizza · Italian',rating: 4.7, time: '18-25', img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80', fee: 1.5 },
]

const ITEMS = [
  { id: 'i1', name: 'Smoked pepper bowl',   desc: 'Charred chicken, grains, citrus sauce', price: 14.8, rating: 4.8, restaurantId: 'r1' },
  { id: 'i2', name: 'Savora burger',         desc: 'Double patty, orange glaze, crisp onions', price: 16.2, rating: 4.8, restaurantId: 'r1' },
  { id: 'i3', name: 'Truffle flatbread',     desc: 'Mozzarella, mushrooms, chilli honey', price: 18.0, rating: 4.8, restaurantId: 'r1' },
  { id: 'i4', name: 'Dragon roll',           desc: 'Shrimp tempura, avocado, eel sauce',  price: 22.5, rating: 4.9, restaurantId: 'r2' },
  { id: 'i5', name: 'Truffle pizza',         desc: 'San Marzano, fior di latte, truffle',  price: 19.9, rating: 4.7, restaurantId: 'r3' },
]

type CartLine = { id: string; name: string; price: number; qty: number }

const STATUS_STEPS = ['Confirmée', 'En préparation', 'Prête', 'En livraison', 'Livrée']

export default function CustomerPage() {
  const [query, setQuery]       = useState('')
  const [cart, setCart]         = useState<CartLine[]>([])
  const [payment, setPayment]   = useState<PaymentMethod>('cash')
  const [view, setView]         = useState<'shop' | 'checkout' | 'tracking'>('shop')
  const [orderStatus]           = useState(1) // 0-4
  const [favs, setFavs]         = useState<Set<string>>(new Set())
  const [address, setAddress]   = useState('Tunis, Rue de la Liberté')

  const filtered = ITEMS.filter(i =>
    i.name.toLowerCase().includes(query.toLowerCase()) ||
    i.desc.toLowerCase().includes(query.toLowerCase())
  )

  const addItem = (item: typeof ITEMS[0]) => {
    setCart(c => {
      const ex = c.find(x => x.id === item.id)
      if (ex) return c.map(x => x.id === item.id ? { ...x, qty: x.qty + 1 } : x)
      return [...c, { id: item.id, name: item.name, price: item.price, qty: 1 }]
    })
    showToast(`${item.name} ajouté au panier`, 'success')
  }

  const setQty = (id: string, qty: number) => {
    if (qty <= 0) setCart(c => c.filter(x => x.id !== id))
    else setCart(c => c.map(x => x.id === id ? { ...x, qty } : x))
  }

  const total     = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const cartCount = cart.reduce((s, i) => s + i.qty, 0)

  const placeOrder = () => {
    if (cart.length === 0) return showToast('Votre panier est vide', 'error')
    showToast('Commande placée avec succès !', 'success')
    setView('tracking')
  }

  return (
    <div className="page-enter mx-auto max-w-7xl px-4 py-8">
      {view === 'shop' && (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Left */}
          <section>
            {/* Search */}
            <div className="flex gap-3">
              <label className="field-wrap flex flex-1 items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3">
                <Search size={17} className="shrink-0 text-savora-orange" />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="w-full bg-transparent text-sm placeholder:text-white/35"
                  placeholder="Chercher un plat ou restaurant..."
                />
              </label>
              <button className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 text-sm text-white/50 hover:text-white transition-colors">
                <Filter size={15} /> Filtrer
              </button>
            </div>

            {/* Restaurants */}
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {RESTAURANTS.map(r => (
                <article key={r.id} className="overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.03] transition hover:border-white/15">
                  <div className="relative h-40 bg-cover bg-center" style={{ backgroundImage: `url(${r.img})` }}>
                    <button
                      onClick={() => setFavs(f => { const n = new Set(f); n.has(r.id) ? n.delete(r.id) : n.add(r.id); return n })}
                      className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/60 backdrop-blur"
                    >
                      <Heart size={13} fill={favs.has(r.id) ? '#FF6B1A' : 'none'} color={favs.has(r.id) ? '#FF6B1A' : 'white'} />
                    </button>
                  </div>
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-display font-bold">{r.name}</h3>
                        <p className="text-xs text-white/45">{r.cuisine}</p>
                      </div>
                      <span className="flex items-center gap-1 rounded-lg bg-savora-orange px-2 py-1 text-xs font-bold text-black">
                        <Star size={10} fill="currentColor" /> {r.rating}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-xs text-white/50">
                      <span className="flex items-center gap-1"><Clock size={11} /> {r.time} min</span>
                      <span className="flex items-center gap-1 text-emerald-400"><CircleCheck size={11} /> Vérifié</span>
                      <span>{r.fee.toFixed(1)} DT livraison</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Menu items */}
            <h2 className="mt-10 font-display text-xl font-bold">Plats populaires</h2>
            <div className="mt-4 grid gap-3">
              {filtered.map(item => {
                const inCart = cart.find(x => x.id === item.id)
                return (
                  <article key={item.id} className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.07] bg-white/[0.03] p-4 transition hover:border-white/10">
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="mt-0.5 text-sm text-white/45">{item.desc}</p>
                      <p className="mt-1.5 flex items-center gap-1 text-xs text-savora-amber">
                        <Star size={11} fill="currentColor" /> {item.rating}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-display font-black">{item.price.toFixed(2)} DT</span>
                      {inCart ? (
                        <div className="flex items-center gap-2 rounded-lg border border-white/[0.07] bg-black/40 px-2 py-1">
                          <button onClick={() => setQty(item.id, inCart.qty - 1)} className="text-white/60 hover:text-white">
                            <Minus size={14} />
                          </button>
                          <span className="w-4 text-center text-sm font-bold">{inCart.qty}</span>
                          <button onClick={() => setQty(item.id, inCart.qty + 1)} className="text-savora-orange">
                            <Plus size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addItem(item)}
                          className="grid h-9 w-9 place-items-center rounded-lg bg-savora-orange text-black transition hover:bg-orange-400 active:scale-95"
                        >
                          <Plus size={16} />
                        </button>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          </section>

          {/* Cart sidebar */}
          <aside className="h-fit rounded-xl border border-white/[0.07] bg-[#0d0d0d] p-5 lg:sticky lg:top-20">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold">
              <ShoppingBag size={20} className="text-savora-orange" />
              Panier
              {cartCount > 0 && (
                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-savora-orange text-[10px] font-black text-black">
                  {cartCount}
                </span>
              )}
            </h2>

            {cart.length === 0 ? (
              <p className="mt-6 text-center text-sm text-white/30">Votre panier est vide</p>
            ) : (
              <>
                <div className="mt-4 space-y-2">
                  {cart.map(line => (
                    <div key={line.id} className="flex items-center justify-between rounded-lg bg-white/[0.03] p-3">
                      <div>
                        <p className="text-sm font-semibold">{line.name}</p>
                        <p className="text-xs text-white/45">{(line.price * line.qty).toFixed(2)} DT</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setQty(line.id, line.qty - 1)} className="text-white/40 hover:text-white"><Minus size={13} /></button>
                        <span className="w-4 text-center text-sm font-bold">{line.qty}</span>
                        <button onClick={() => setQty(line.id, line.qty + 1)} className="text-savora-orange"><Plus size={13} /></button>
                        <button onClick={() => setQty(line.id, 0)} className="ml-1 text-white/20 hover:text-red-400"><X size={13} /></button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3 text-sm">
                  <span className="text-white/50">Total</span>
                  <span className="font-display text-lg font-black text-savora-orange">{total.toFixed(2)} DT</span>
                </div>

                <button
                  onClick={() => setView('checkout')}
                  className="btn-primary mt-4 flex w-full items-center justify-center gap-2 text-sm"
                >
                  Commander <ChevronRight size={16} />
                </button>
              </>
            )}

            {/* Live tracking preview */}
            <div className="mt-6">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold">
                <span className="live-dot" />
                Commande en cours
              </h3>
              <div className="overflow-hidden rounded-xl border border-white/[0.07]" style={{ height: 160 }}>
                <DeliveryMap
                  lat={36.8065} lng={10.1815}
                  driverLat={36.812} driverLng={10.175}
                  restaurantLat={36.795} restaurantLng={10.19}
                />
              </div>
              <p className="mt-2 flex items-center gap-2 text-xs text-white/50">
                <MapPin size={12} className="text-savora-orange" />
                Livreur en route — arrivée ~18 min
              </p>
            </div>

            {/* Order history */}
            <h3 className="mt-6 text-sm font-bold">Historique</h3>
            <div className="mt-2 space-y-1.5">
              {[{ id: 'SV-1042', s: 'En préparation', badge: 'badge-preparing' }, { id: 'SV-1031', s: 'Livré', badge: 'badge-delivered' }].map(o => (
                <div key={o.id} className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2">
                  <span className="font-mono text-xs text-white/60">{o.id}</span>
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

          {/* Address */}
          <div className="mt-6">
            <label className="mb-2 block text-sm font-semibold text-white/70">Adresse de livraison</label>
            <div className="field-wrap flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3">
              <MapPin size={17} className="shrink-0 text-savora-orange" />
              <input
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full bg-transparent text-sm placeholder:text-white/35"
                placeholder="Entrez votre adresse..."
              />
            </div>
            {/* Mini map for address picking */}
            <div className="mt-3 overflow-hidden rounded-xl border border-white/[0.07]" style={{ height: 200 }}>
              <DeliveryMap lat={36.8065} lng={10.1815} interactive onPick={(lat, lng) => console.log(lat, lng)} />
            </div>
            <p className="mt-1.5 text-xs text-white/35">Cliquez sur la carte pour ajuster votre position</p>
          </div>

          {/* Order summary */}
          <div className="mt-6 rounded-xl border border-white/[0.07] bg-[#0d0d0d] p-4">
            <h2 className="mb-3 font-semibold">Récapitulatif</h2>
            {cart.map(l => (
              <div key={l.id} className="flex justify-between py-2 text-sm border-b border-white/[0.05] last:border-0">
                <span className="text-white/70">{l.name} ×{l.qty}</span>
                <span className="font-semibold">{(l.price * l.qty).toFixed(2)} DT</span>
              </div>
            ))}
            <div className="mt-3 flex justify-between text-sm text-white/50">
              <span>Frais de livraison</span><span>2.50 DT</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-white/[0.07] pt-3 font-display font-black">
              <span>Total</span>
              <span className="text-savora-orange">{(total + 2.5).toFixed(2)} DT</span>
            </div>
          </div>

          {/* Payment */}
          <div className="mt-6">
            <h2 className="mb-3 font-semibold">Mode de paiement</h2>
            <PaymentSelector value={payment} onChange={setPayment} />
            {payment === 'card' && <CardForm />}
          </div>

          <button onClick={placeOrder} className="btn-primary mt-6 flex w-full items-center justify-center gap-2">
            Confirmer la commande ({(total + 2.5).toFixed(2)} DT)
          </button>
        </div>
      )}

      {/* ── Tracking ── */}
      {view === 'tracking' && (
        <div className="mx-auto max-w-2xl">
          <h1 className="font-display text-2xl font-bold">Suivi de commande</h1>
          <p className="mt-1 text-sm text-white/45">SV-1043 · Estimée dans ~22 min</p>

          {/* Map */}
          <div className="mt-6 overflow-hidden rounded-2xl border border-white/[0.07]" style={{ height: 320 }}>
            <DeliveryMap
              lat={36.8065} lng={10.1815}
              driverLat={36.815} driverLng={10.172}
              restaurantLat={36.792} restaurantLng={10.195}
            />
          </div>

          {/* Status steps */}
          <div className="mt-6 rounded-xl border border-white/[0.07] bg-[#0d0d0d] p-5">
            <div className="flex items-center justify-between">
              {STATUS_STEPS.map((step, i) => (
                <div key={step} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center">
                    <div className={`h-7 w-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                      i <= orderStatus
                        ? 'border-savora-orange bg-savora-orange text-black'
                        : 'border-white/20 bg-transparent text-white/30'
                    }`}>
                      {i < orderStatus ? '✓' : i + 1}
                    </div>
                    <p className={`mt-1.5 text-[10px] text-center ${i <= orderStatus ? 'text-white/80' : 'text-white/25'}`}>
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

          {/* Driver info */}
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

          <button onClick={() => { setCart([]); setView('shop') }} className="mt-4 w-full rounded-xl border border-white/10 py-3 text-sm text-white/50 hover:text-white transition-colors">
            Nouvelle commande
          </button>
        </div>
      )}
    </div>
  )
}
