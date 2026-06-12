'use client'
import { useState } from 'react'
import { Package, UtensilsCrossed, BarChart3, Bell, Plus, Pencil, Trash2, CheckCircle, Clock, XCircle, TrendingUp, DollarSign, Star } from 'lucide-react'
import { showToast } from '@/components/ui/Toast'

type Tab = 'orders' | 'menu' | 'analytics'

const ORDERS = [
  { id: 'SV-1043', customer: 'Amine T.',  items: 'Smoked pepper bowl ×2', total: 31.60, status: 'preparing', time: '5 min' },
  { id: 'SV-1042', customer: 'Sara B.',   items: 'Savora burger ×1',      total: 16.20, status: 'confirmed', time: '12 min' },
  { id: 'SV-1041', customer: 'Karim M.',  items: 'Truffle flatbread ×3',  total: 54.00, status: 'ready',     time: '0 min' },
  { id: 'SV-1040', customer: 'Wafa H.',   items: 'Smoked pepper bowl ×1', total: 14.80, status: 'delivered', time: '—' },
]

const STATUS_CONFIG: Record<string, { label: string; badge: string; icon: React.ReactNode }> = {
  pending:   { label: 'En attente',      badge: 'badge-pending',    icon: <Clock size={14} /> },
  confirmed: { label: 'Confirmée',       badge: 'badge-preparing',  icon: <Clock size={14} /> },
  preparing: { label: 'En préparation',  badge: 'badge-preparing',  icon: <Clock size={14} /> },
  ready:     { label: 'Prête',           badge: 'badge-delivering', icon: <CheckCircle size={14} /> },
  delivered: { label: 'Livrée',          badge: 'badge-delivered',  icon: <CheckCircle size={14} /> },
  cancelled: { label: 'Annulée',         badge: 'badge-cancelled',  icon: <XCircle size={14} /> },
}

const MENU_ITEMS = [
  { id: 'i1', name: 'Smoked pepper bowl', price: 14.80, category: 'Plats',   available: true,  orders: 142 },
  { id: 'i2', name: 'Savora burger',      price: 16.20, category: 'Burgers', available: true,  orders: 98  },
  { id: 'i3', name: 'Truffle flatbread',  price: 18.00, category: 'Pizzas',  available: false, orders: 76  },
]

export default function RestaurantPage() {
  const [tab, setTab]     = useState<Tab>('orders')
  const [orders, setOrders] = useState(ORDERS)
  const [menu, setMenu]   = useState(MENU_ITEMS)

  const advance = (id: string) => {
    const map: Record<string, string> = {
      confirmed: 'preparing', preparing: 'ready', ready: 'delivered'
    }
    setOrders(o => o.map(x => x.id === id ? { ...x, status: map[x.status] || x.status } : x))
    showToast('Statut mis à jour', 'success')
  }

  const toggleAvail = (id: string) => {
    setMenu(m => m.map(x => x.id === id ? { ...x, available: !x.available } : x))
  }

  const TABS = [
    { id: 'orders',    label: 'Commandes',  icon: <Package size={16} />,         count: orders.filter(o => o.status !== 'delivered').length },
    { id: 'menu',      label: 'Menu',       icon: <UtensilsCrossed size={16} />, count: menu.length },
    { id: 'analytics', label: 'Analytics',  icon: <BarChart3 size={16} /> },
  ]

  return (
    <div className="page-enter mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Dashboard Restaurant</h1>
          <p className="text-sm text-white/45">Ember Table · <span className="text-emerald-400">En ligne</span></p>
        </div>
        <button className="flex items-center gap-2 rounded-xl border border-white/[0.07] px-3 py-2 text-sm">
          <Bell size={15} />
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-savora-orange text-[10px] font-black text-black">3</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 rounded-xl border border-white/[0.07] bg-white/[0.02] p-1">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as Tab)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
              tab === t.id ? 'bg-savora-orange text-black' : 'text-white/50 hover:text-white'
            }`}
          >
            {t.icon} {t.label}
            {t.count !== undefined && (
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${tab === t.id ? 'bg-black/20 text-black' : 'bg-white/10'}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders */}
      {tab === 'orders' && (
        <div className="mt-6 grid gap-3">
          {orders.map(o => {
            const cfg = STATUS_CONFIG[o.status]
            return (
              <div key={o.id} className="flex flex-col gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] p-4 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-white/70">{o.id}</span>
                    <span className={`flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-bold ${cfg.badge}`}>
                      {cfg.icon} {cfg.label}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold">{o.customer}</p>
                  <p className="text-xs text-white/40">{o.items}</p>
                </div>
                <div className="flex items-center gap-4">
                  {o.status !== 'delivered' && o.time !== '—' && (
                    <span className="flex items-center gap-1 text-xs text-white/40"><Clock size={11} /> {o.time}</span>
                  )}
                  <span className="font-display font-black text-savora-orange">{o.total.toFixed(2)} DT</span>
                  {!['delivered', 'cancelled'].includes(o.status) && (
                    <button
                      onClick={() => advance(o.id)}
                      className="btn-primary text-xs px-3 py-1.5"
                    >
                      Avancer →
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Menu */}
      {tab === 'menu' && (
        <div className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Articles ({menu.length})</h2>
            <button className="btn-primary flex items-center gap-1.5 text-xs px-3 py-2">
              <Plus size={14} /> Ajouter article
            </button>
          </div>
          <div className="grid gap-3">
            {menu.map(item => (
              <div key={item.id} className="flex items-center gap-4 rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
                <div className="flex-1">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-xs text-white/40">{item.category} · {item.orders} commandes</p>
                </div>
                <span className="font-display font-black">{item.price.toFixed(2)} DT</span>
                <button
                  onClick={() => toggleAvail(item.id)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-all ${
                    item.available
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                      : 'border-white/10 bg-white/5 text-white/30'
                  }`}
                >
                  {item.available ? 'Disponible' : 'Indispo'}
                </button>
                <div className="flex gap-1">
                  <button className="grid h-8 w-8 place-items-center rounded-lg border border-white/[0.07] text-white/40 hover:text-white transition-colors">
                    <Pencil size={13} />
                  </button>
                  <button className="grid h-8 w-8 place-items-center rounded-lg border border-red-500/20 text-red-400/50 hover:text-red-400 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics */}
      {tab === 'analytics' && (
        <div className="mt-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: <DollarSign size={20} />, label: 'Revenus ce mois',   value: '2 840 DT', delta: '+12%', color: 'text-savora-orange' },
              { icon: <Package   size={20} />, label: 'Commandes total',   value: '316',       delta: '+8%',  color: 'text-blue-400'      },
              { icon: <Star      size={20} />, label: 'Note moyenne',       value: '4.9 ⭐',    delta: '+0.1', color: 'text-savora-amber'  },
            ].map(s => (
              <div key={s.label} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5">
                <span className={s.color}>{s.icon}</span>
                <p className="mt-3 font-display text-2xl font-bold">{s.value}</p>
                <p className="text-sm text-white/50">{s.label}</p>
                <p className="mt-1 text-xs text-emerald-400">{s.delta} vs mois précédent</p>
              </div>
            ))}
          </div>

          {/* Revenue chart placeholder */}
          <div className="mt-6 rounded-xl border border-white/[0.07] bg-white/[0.02] p-5">
            <h3 className="mb-4 font-semibold flex items-center gap-2"><TrendingUp size={16} className="text-savora-orange" /> Revenus 7 derniers jours</h3>
            <div className="flex items-end gap-2 h-28">
              {[240, 180, 310, 290, 420, 380, 460].map((v, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-md bg-savora-orange/70 transition-all"
                    style={{ height: `${(v / 460) * 100}%` }}
                  />
                  <span className="text-[9px] text-white/30">{['L','M','M','J','V','S','D'][i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Commission ledger */}
          <div className="mt-4 rounded-xl border border-white/[0.07] bg-white/[0.02] p-5">
            <h3 className="mb-3 font-semibold">Commissions Savora (12%)</h3>
            <div className="space-y-2">
              {[
                { week: 'Semaine 22', rev: 720, comm: 86.4,  paid: true  },
                { week: 'Semaine 21', rev: 640, comm: 76.8,  paid: true  },
                { week: 'Semaine 20', rev: 480, comm: 57.6,  paid: false },
              ].map(r => (
                <div key={r.week} className="flex items-center justify-between rounded-lg bg-white/[0.03] px-4 py-2.5 text-sm">
                  <span className="text-white/60">{r.week}</span>
                  <span>{r.rev.toFixed(2)} DT</span>
                  <span className="text-white/40">−{r.comm.toFixed(2)} DT</span>
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
