'use client'
import { useState, useEffect } from 'react'
import { Package, UtensilsCrossed, BarChart3, Bell, Plus, Pencil, Trash2, CheckCircle, Clock, XCircle, TrendingUp, DollarSign, Star, Loader2, Upload, AlertCircle } from 'lucide-react'
import { showToast } from '@/components/ui/Toast'
import { supabase, getRestaurantOrders, updateOrderStatus } from '@/lib/supabase'
import { useApp } from '@/lib/store'
import type { Order, OrderStatus, MenuItem } from '@/lib/supabase'

type Tab = 'orders' | 'menu' | 'analytics'

/* ── Demo fallback data ── */
const DEMO_ORDERS: Order[] = [
  { id: 'SV-1043', customer_id: 'c1', restaurant_id: 'r1', items: [{ item_id: 'i1', name: 'Smoked pepper bowl', price: 14.8, qty: 2 }], status: 'preparing', subtotal: 29.6, delivery_fee: 2.5, total: 32.1, payment_method: 'cash', payment_status: 'pending', delivery_address: 'Tunis Centre', estimated_minutes: 25, created_at: new Date().toISOString() },
  { id: 'SV-1042', customer_id: 'c2', restaurant_id: 'r1', items: [{ item_id: 'i2', name: 'Savora burger', price: 16.2, qty: 1 }],     status: 'confirmed', subtotal: 16.2, delivery_fee: 2.5, total: 18.7, payment_method: 'd17',  payment_status: 'paid',    delivery_address: 'La Marsa', estimated_minutes: 30, created_at: new Date().toISOString() },
  { id: 'SV-1041', customer_id: 'c3', restaurant_id: 'r1', items: [{ item_id: 'i3', name: 'Truffle flatbread', price: 18.0, qty: 3 }], status: 'ready',     subtotal: 54.0, delivery_fee: 2.5, total: 56.5, payment_method: 'card', payment_status: 'paid',    delivery_address: 'Lac 1',   estimated_minutes: 5,  created_at: new Date().toISOString() },
  { id: 'SV-1040', customer_id: 'c4', restaurant_id: 'r1', items: [{ item_id: 'i1', name: 'Smoked pepper bowl', price: 14.8, qty: 1 }], status: 'delivered', subtotal: 14.8, delivery_fee: 2.5, total: 17.3, payment_method: 'cash', payment_status: 'pending', delivery_address: 'Ariana',   estimated_minutes: 0,  created_at: new Date(Date.now() - 3600000).toISOString() },
]

const DEMO_MENU: MenuItem[] = [
  { id: 'i1', restaurant_id: 'r1', name: 'Smoked pepper bowl', description: 'Poulet grillé, céréales', price: 14.800, available: true,  category: 'Plats',   created_at: '' },
  { id: 'i2', restaurant_id: 'r1', name: 'Savora burger',       description: 'Double patty orange',    price: 16.200, available: true,  category: 'Burgers', created_at: '' },
  { id: 'i3', restaurant_id: 'r1', name: 'Truffle flatbread',   description: 'Mozza, champ, miel',     price: 18.000, available: false, category: 'Pizzas',  created_at: '' },
]

const STATUS_FLOW: Record<string, OrderStatus> = {
  pending:   'confirmed',
  confirmed: 'preparing',
  preparing: 'ready',
  ready:     'picked_up',
  picked_up: 'delivering',
  delivering:'delivered',
}

const STATUS_CFG: Record<string, { label: string; badge: string }> = {
  pending:    { label: 'En attente',     badge: 'badge-pending' },
  confirmed:  { label: 'Confirmée',      badge: 'badge-preparing' },
  preparing:  { label: 'En préparation', badge: 'badge-preparing' },
  ready:      { label: 'Prête',          badge: 'badge-delivering' },
  picked_up:  { label: 'Récupérée',      badge: 'badge-delivering' },
  delivering: { label: 'En livraison',   badge: 'badge-delivering' },
  delivered:  { label: 'Livrée',         badge: 'badge-delivered' },
  cancelled:  { label: 'Annulée',        badge: 'badge-cancelled' },
}

export default function RestaurantPage() {
  const { state }                   = useApp()
  const [tab, setTab]               = useState<Tab>('orders')
  const [orders, setOrders]         = useState<Order[]>([])
  const [menu, setMenu]             = useState<MenuItem[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [newItem, setNewItem]       = useState({ name: '', description: '', price: '', category: '' })
  const [showAddForm, setShowAddForm] = useState(false)
  const [savingItem, setSavingItem] = useState(false)
  const [notifications, setNotifications] = useState(3)

  // Load orders from Supabase (fallback to demo)
  useEffect(() => {
    const restaurantId = state.user?.id // owner sees their restaurant
    if (restaurantId) {
      getRestaurantOrders(restaurantId).then(({ data }) => {
        setOrders(data?.length ? data : DEMO_ORDERS)
        setLoadingOrders(false)
      })
    } else {
      setOrders(DEMO_ORDERS)
      setLoadingOrders(false)
    }
  }, [state.user])

  // Load menu
  useEffect(() => {
    const fetchMenu = async () => {
      const { data } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', state.user?.id ?? 'r1')
      setMenu(data?.length ? data : DEMO_MENU)
    }
    fetchMenu()
  }, [state.user])

  // Realtime order updates
  useEffect(() => {
    const channel = supabase
      .channel('orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, payload => {
        if (payload.eventType === 'INSERT') {
          setOrders(o => [payload.new as Order, ...o])
          setNotifications(n => n + 1)
          showToast('Nouvelle commande reçue !', 'info')
        }
        if (payload.eventType === 'UPDATE') {
          setOrders(o => o.map(x => x.id === (payload.new as Order).id ? payload.new as Order : x))
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const advance = async (id: string, currentStatus: OrderStatus) => {
    const next = STATUS_FLOW[currentStatus]
    if (!next) return
    // Optimistic update
    setOrders(o => o.map(x => x.id === id ? { ...x, status: next } : x))
    const { error } = await updateOrderStatus(id, next)
    if (error) {
      // Rollback if real DB call fails (demo mode)
      setOrders(o => o.map(x => x.id === id ? { ...x, status: currentStatus } : x))
    }
    showToast(`Statut → ${STATUS_CFG[next].label}`, 'success')
  }

  const toggleAvail = async (id: string, current: boolean) => {
    setMenu(m => m.map(x => x.id === id ? { ...x, available: !current } : x))
    await supabase.from('menu_items').update({ available: !current }).eq('id', id)
    showToast(current ? 'Article masqué' : 'Article disponible', 'success')
  }

  const deleteItem = async (id: string) => {
    setMenu(m => m.filter(x => x.id !== id))
    await supabase.from('menu_items').delete().eq('id', id)
    showToast('Article supprimé', 'success')
  }

  const addItem = async () => {
    if (!newItem.name || !newItem.price) { showToast('Nom et prix requis', 'error'); return }
    setSavingItem(true)
    const item = {
      restaurant_id: state.user?.id ?? 'r1',
      name: newItem.name,
      description: newItem.description,
      price: parseFloat(newItem.price),
      category: newItem.category || 'Autres',
      available: true,
    }
    const { data, error } = await supabase.from('menu_items').insert(item).select().single()
    setMenu(m => [...m, data ?? { ...item, id: Date.now().toString(), created_at: '' }])
    setNewItem({ name: '', description: '', price: '', category: '' })
    setShowAddForm(false)
    setSavingItem(false)
    showToast('Article ajouté !', 'success')
  }

  const activeOrders  = orders.filter(o => !['delivered', 'cancelled'].includes(o.status))
  const revenue       = orders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.total, 0)

  const TABS = [
    { id: 'orders' as Tab,    label: 'Commandes',  Icon: Package,           badge: activeOrders.length },
    { id: 'menu' as Tab,      label: 'Menu',       Icon: UtensilsCrossed,   badge: 0 },
    { id: 'analytics' as Tab, label: 'Analytics',  Icon: BarChart3,         badge: 0 },
  ]

  return (
    <div className="page-enter mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Dashboard Restaurant</h1>
          <p className="text-sm text-white/45 mt-0.5">
            {state.user ? state.user.name : 'Ember Table'} ·{' '}
            <span className="text-emerald-400">● En ligne</span>
          </p>
        </div>
        <button
          onClick={() => setNotifications(0)}
          className="relative flex items-center gap-2 rounded-xl border border-white/[0.07] px-3 py-2 text-sm hover:bg-white/5 transition-colors"
        >
          <Bell size={15} />
          {notifications > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-savora-orange text-[10px] font-black text-black">
              {notifications}
            </span>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-white/[0.07] bg-white/[0.02] p-1">
        {TABS.map(({ id, label, Icon, badge }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
              tab === id ? 'bg-savora-orange text-black' : 'text-white/50 hover:text-white'
            }`}
          >
            <Icon size={15} /> {label}
            {badge > 0 && (
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${tab === id ? 'bg-black/20 text-black' : 'bg-white/10'}`}>
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Orders ── */}
      {tab === 'orders' && (
        <div className="mt-6">
          {loadingOrders ? (
            <div className="flex items-center justify-center py-16 text-white/30">
              <Loader2 size={22} className="animate-spin" />
            </div>
          ) : (
            <div className="grid gap-3">
              {orders.map(o => {
                const cfg  = STATUS_CFG[o.status]
                const next = STATUS_FLOW[o.status]
                return (
                  <div key={o.id} className="flex flex-col gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] p-4 sm:flex-row sm:items-center">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-mono text-sm font-bold text-white/60">{o.id.slice(0, 8)}</span>
                        <span className={`flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-bold ${cfg.badge}`}>
                          {cfg.label}
                        </span>
                        <span className={`rounded-md border px-2 py-0.5 text-[11px] font-bold ${
                          o.payment_status === 'paid' ? 'badge-delivered' : 'badge-pending'
                        }`}>
                          {o.payment_method.toUpperCase()} {o.payment_status === 'paid' ? '✓' : '⏳'}
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm">
                        {o.items.map(i => `${i.name} ×${i.qty}`).join(', ')}
                      </p>
                      <p className="text-xs text-white/40 mt-0.5 truncate">
                        <span className="text-savora-orange">📍</span> {o.delivery_address}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {o.estimated_minutes > 0 && !['delivered','cancelled'].includes(o.status) && (
                        <span className="flex items-center gap-1 text-xs text-white/40">
                          <Clock size={11} /> {o.estimated_minutes} min
                        </span>
                      )}
                      <span className="font-display font-black text-savora-orange">{o.total.toFixed(2)} DT</span>
                      {next && (
                        <button
                          onClick={() => advance(o.id, o.status)}
                          className="btn-primary text-xs px-3 py-1.5 whitespace-nowrap"
                        >
                          {STATUS_CFG[next].label} →
                        </button>
                      )}
                      {o.status === 'pending' && (
                        <button
                          onClick={() => { setOrders(x => x.map(r => r.id === o.id ? { ...r, status: 'cancelled' } : r)); showToast('Commande annulée', 'error') }}
                          className="grid h-8 w-8 place-items-center rounded-lg border border-red-500/25 text-red-400/60 hover:text-red-400 transition-colors"
                        >
                          <XCircle size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
              {orders.length === 0 && (
                <p className="py-12 text-center text-sm text-white/25">Aucune commande pour l'instant</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Menu ── */}
      {tab === 'menu' && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Articles ({menu.length})</h2>
            <button onClick={() => setShowAddForm(v => !v)}
              className="btn-primary flex items-center gap-1.5 text-xs px-3 py-2">
              <Plus size={14} /> Ajouter
            </button>
          </div>

          {/* Add form */}
          {showAddForm && (
            <div className="mb-4 rounded-xl border border-savora-orange/25 bg-savora-orange/5 p-4">
              <h3 className="text-sm font-bold mb-3">Nouvel article</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="field-wrap flex items-center gap-2 rounded-xl border border-white/[0.07] bg-black/40 px-3 py-2.5">
                  <input value={newItem.name} onChange={e => setNewItem(v => ({ ...v, name: e.target.value }))}
                    className="w-full bg-transparent text-sm placeholder:text-white/30" placeholder="Nom du plat *" />
                </div>
                <div className="field-wrap flex items-center gap-2 rounded-xl border border-white/[0.07] bg-black/40 px-3 py-2.5">
                  <input value={newItem.price} onChange={e => setNewItem(v => ({ ...v, price: e.target.value }))}
                    className="w-full bg-transparent text-sm placeholder:text-white/30" placeholder="Prix (DT) *" type="number" step="0.001" />
                </div>
                <div className="field-wrap flex items-center gap-2 rounded-xl border border-white/[0.07] bg-black/40 px-3 py-2.5">
                  <input value={newItem.description} onChange={e => setNewItem(v => ({ ...v, description: e.target.value }))}
                    className="w-full bg-transparent text-sm placeholder:text-white/30" placeholder="Description" />
                </div>
                <div className="field-wrap flex items-center gap-2 rounded-xl border border-white/[0.07] bg-black/40 px-3 py-2.5">
                  <input value={newItem.category} onChange={e => setNewItem(v => ({ ...v, category: e.target.value }))}
                    className="w-full bg-transparent text-sm placeholder:text-white/30" placeholder="Catégorie (Plats, Pizzas…)" />
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={addItem} disabled={savingItem}
                  className="btn-primary flex items-center gap-2 text-xs px-4 py-2 disabled:opacity-60">
                  {savingItem && <Loader2 size={13} className="animate-spin" />}
                  Sauvegarder
                </button>
                <button onClick={() => setShowAddForm(false)}
                  className="rounded-xl border border-white/[0.07] px-4 py-2 text-xs text-white/50 hover:text-white transition-colors">
                  Annuler
                </button>
              </div>
            </div>
          )}

          <div className="grid gap-3">
            {menu.map(item => (
              <div key={item.id} className="flex items-center gap-4 rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{item.name}</p>
                  <p className="text-xs text-white/40 truncate">{item.category} · {item.description}</p>
                </div>
                <span className="font-display font-black shrink-0">{item.price.toFixed(2)} DT</span>
                <button
                  onClick={() => toggleAvail(item.id, item.available)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-all shrink-0 ${
                    item.available
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                      : 'border-white/10 bg-white/5 text-white/30'
                  }`}
                >
                  {item.available ? 'Dispo' : 'Indispo'}
                </button>
                <div className="flex gap-1 shrink-0">
                  <button className="grid h-8 w-8 place-items-center rounded-lg border border-white/[0.07] text-white/40 hover:text-white transition-colors">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => deleteItem(item.id)}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-red-500/20 text-red-400/50 hover:text-red-400 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Analytics ── */}
      {tab === 'analytics' && (
        <div className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { Icon: DollarSign, label: 'Revenus (livré)', value: `${revenue.toFixed(2)} DT`, color: 'text-savora-orange' },
              { Icon: Package,    label: 'Commandes total', value: orders.length.toString(),    color: 'text-blue-400' },
              { Icon: Star,       label: 'Note moyenne',    value: '4.9 ⭐',                    color: 'text-savora-amber' },
            ].map(s => (
              <div key={s.label} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5">
                <s.Icon size={20} className={s.color} />
                <p className="mt-3 font-display text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-white/45 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Revenue bar chart */}
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5">
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-sm">
              <TrendingUp size={16} className="text-savora-orange" /> Revenus 7 jours
            </h3>
            <div className="flex items-end gap-1.5 h-32">
              {[240, 180, 310, 290, 420, 380, 460].map((v, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                  <div
                    className="w-full rounded-t bg-savora-orange/70 hover:bg-savora-orange transition-colors cursor-pointer"
                    style={{ height: `${(v / 460) * 100}%` }}
                    title={`${v} DT`}
                  />
                  <span className="text-[9px] text-white/30">{['L','M','M','J','V','S','D'][i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Commission ledger */}
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5">
            <h3 className="mb-3 font-semibold text-sm flex items-center gap-2">
              <DollarSign size={15} className="text-savora-orange" /> Commissions Savora (12%)
            </h3>
            <div className="space-y-2">
              {[
                { week: 'Semaine 24', rev: revenue || 720, paid: false },
                { week: 'Semaine 23', rev: 640,            paid: true  },
                { week: 'Semaine 22', rev: 480,            paid: true  },
              ].map(r => (
                <div key={r.week} className="flex items-center justify-between rounded-lg bg-white/[0.03] px-4 py-2.5 text-sm">
                  <span className="text-white/60">{r.week}</span>
                  <span>{r.rev.toFixed(2)} DT</span>
                  <span className="text-white/40">−{(r.rev * 0.12).toFixed(2)} DT</span>
                  <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${r.paid ? 'badge-delivered' : 'badge-pending'}`}>
                    {r.paid ? 'Payée' : 'En attente'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
