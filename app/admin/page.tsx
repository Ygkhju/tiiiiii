'use client'
import { useState, useEffect } from 'react'
import { ShieldCheck, Users, Store, Package, DollarSign, CheckCircle, XCircle, AlertTriangle, TrendingUp, Search, Ban, Eye, Loader2, Download } from 'lucide-react'
import { showToast } from '@/components/ui/Toast'
import { supabase } from '@/lib/supabase'
import type { Profile, Restaurant, Commission } from '@/lib/supabase'

type Tab = 'overview' | 'restaurants' | 'users' | 'commissions'

/* ── Demo fallback ── */
const DEMO_PENDING: (Restaurant & { owner_name?: string })[] = [
  { id: 'r10', owner_id: 'u10', owner_name: 'Mohamed Bouzid', name: 'Le Zitouna Grill', description: '', cuisine: ['Tunisien'], address: 'Tunis', lat: 36.8, lng: 10.18, rating: 0, review_count: 0, delivery_time: '30-40 min', delivery_fee: 2, min_order: 10, verified: true,  approved: false, commission_rate: 12, logo_url: '', cover_url: '', created_at: '2026-06-04' },
  { id: 'r11', owner_id: 'u11', owner_name: 'Sonia Karray',   name: 'Sushi Carthage',  description: '', cuisine: ['Japonais'], address: 'La Marsa', lat: 36.87, lng: 10.32, rating: 0, review_count: 0, delivery_time: '25-35 min', delivery_fee: 3, min_order: 15, verified: true,  approved: false, commission_rate: 12, logo_url: '', cover_url: '', created_at: '2026-06-05' },
  { id: 'r12', owner_id: 'u12', owner_name: 'Amine Louati',   name: 'Pizza Roma',       description: '', cuisine: ['Italien'],  address: 'Lac 1',   lat: 36.83, lng: 10.24, rating: 0, review_count: 0, delivery_time: '20-30 min', delivery_fee: 2, min_order: 12, verified: false, approved: false, commission_rate: 12, logo_url: '', cover_url: '', created_at: '2026-06-06' },
]

const DEMO_USERS: (Profile & { orders?: number })[] = [
  { id: 'u1', email: 'amine@mail.com', name: 'Amine Trabelsi', role: 'customer',   verified: true,  banned: false, orders: 14, created_at: '' },
  { id: 'u2', email: 'sara@mail.com',  name: 'Sara Ben Ali',   role: 'customer',   verified: true,  banned: false, orders: 7,  created_at: '' },
  { id: 'u3', email: 'mbz@mail.com',   name: 'Mohamed Bouzid', role: 'restaurant', verified: false, banned: false, orders: 0,  created_at: '' },
  { id: 'u4', email: 'wafa@mail.com',  name: 'Wafa Hamdi',     role: 'customer',   verified: true,  banned: true,  orders: 3,  created_at: '' },
]

const DEMO_COMMISSIONS: (Commission & { restaurant_name?: string })[] = [
  { id: 'c1', restaurant_id: 'r1', restaurant_name: 'Ember Table',  order_id: 'o1', revenue: 2840, rate: 12, amount: 340.8, paid: true,  created_at: '2026-06-07' },
  { id: 'c2', restaurant_id: 'r2', restaurant_name: 'Nori & Flame', order_id: 'o2', revenue: 1920, rate: 12, amount: 230.4, paid: true,  created_at: '2026-06-07' },
  { id: 'c3', restaurant_id: 'r3', restaurant_name: 'Golden Crust', order_id: 'o3', revenue: 1380, rate: 12, amount: 165.6, paid: false, created_at: '2026-06-07' },
]

const ROLE_BADGE: Record<string, string> = {
  customer:   'bg-blue-500/10 text-blue-400 border-blue-500/20',
  restaurant: 'bg-savora-orange/10 text-savora-orange border-savora-orange/20',
  admin:      'bg-purple-500/10 text-purple-400 border-purple-500/20',
  driver:     'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
}

export default function AdminPage() {
  const [tab, setTab]           = useState<Tab>('overview')
  const [pending, setPending]   = useState(DEMO_PENDING)
  const [users, setUsers]       = useState(DEMO_USERS)
  const [commissions, setCommissions] = useState(DEMO_COMMISSIONS)
  const [query, setQuery]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [stats, setStats]       = useState({ restaurants: 24, users: 1248, orders: 4712, revenue: 6840 })

  // Load real data
  useEffect(() => {
    const load = async () => {
      setLoading(true)

      // Pending restaurants
      const { data: pendingData } = await supabase
        .from('restaurants').select('*, profiles(name)').eq('approved', false).limit(20)
      if (pendingData?.length) setPending(pendingData.map(r => ({ ...r, owner_name: r.profiles?.name })))

      // Users
      const { data: usersData } = await supabase
        .from('profiles').select('*').order('created_at', { ascending: false }).limit(50)
      if (usersData?.length) setUsers(usersData)

      // Commissions
      const { data: commData } = await supabase
        .from('commissions').select('*, restaurants(name)').order('created_at', { ascending: false }).limit(30)
      if (commData?.length) setCommissions(commData.map(c => ({ ...c, restaurant_name: c.restaurants?.name })))

      // Stats
      const [{ count: rCount }, { count: uCount }, { count: oCount }] = await Promise.all([
        supabase.from('restaurants').select('*', { count: 'exact', head: true }).eq('approved', true),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
      ])
      if (rCount || uCount || oCount) {
        setStats(s => ({
          ...s,
          restaurants: rCount ?? s.restaurants,
          users: uCount ?? s.users,
          orders: oCount ?? s.orders,
        }))
      }

      setLoading(false)
    }
    load()
  }, [])

  const approve = async (id: string) => {
    const { error } = await supabase.from('restaurants').update({ approved: true }).eq('id', id)
    setPending(p => p.filter(r => r.id !== id))
    showToast('Restaurant approuvé ✓', 'success')
  }

  const reject = async (id: string) => {
    await supabase.from('restaurants').delete().eq('id', id)
    setPending(p => p.filter(r => r.id !== id))
    showToast('Restaurant rejeté', 'error')
  }

  const toggleBan = async (id: string, banned: boolean) => {
    await supabase.from('profiles').update({ banned: !banned }).eq('id', id)
    setUsers(u => u.map(x => x.id === id ? { ...x, banned: !banned } : x))
    showToast(!banned ? 'Utilisateur banni' : 'Utilisateur débanni', !banned ? 'error' : 'success')
  }

  const markPaid = async (id: string) => {
    await supabase.from('commissions').update({ paid: true, paid_at: new Date().toISOString() }).eq('id', id)
    setCommissions(c => c.map(x => x.id === id ? { ...x, paid: true } : x))
    showToast('Commission marquée payée', 'success')
  }

  const exportCSV = () => {
    const rows = commissions.map(c =>
      `${c.restaurant_name},${c.revenue.toFixed(2)},${c.amount.toFixed(2)},${c.paid ? 'Payée' : 'En attente'},${c.created_at}`
    )
    const csv = ['Restaurant,Revenus,Commission,Statut,Date', ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'commissions-savora.csv'; a.click()
    showToast('Export CSV téléchargé', 'success')
  }

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(query.toLowerCase()) ||
    u.email.toLowerCase().includes(query.toLowerCase())
  )

  const TABS: { id: Tab; label: string; Icon: any; badge?: number }[] = [
    { id: 'overview',    label: 'Vue globale',  Icon: TrendingUp  },
    { id: 'restaurants', label: 'Restaurants',  Icon: Store,       badge: pending.length },
    { id: 'users',       label: 'Utilisateurs', Icon: Users       },
    { id: 'commissions', label: 'Commissions',  Icon: DollarSign, badge: commissions.filter(c => !c.paid).length },
  ]

  return (
    <div className="page-enter mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-purple-500/10 border border-purple-500/20">
          <ShieldCheck size={22} className="text-purple-400" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">Admin Savora</h1>
          <p className="text-sm text-white/40">Back-office · Accès complet</p>
        </div>
        {loading && <Loader2 size={18} className="ml-auto text-white/30 animate-spin" />}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-white/[0.07] bg-white/[0.02] p-1">
        {TABS.map(({ id, label, Icon, badge }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
              tab === id ? 'bg-savora-orange text-black' : 'text-white/50 hover:text-white'
            }`}
          >
            <Icon size={15} /> {label}
            {badge !== undefined && badge > 0 && (
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${tab === id ? 'bg-black/20 text-black' : 'bg-red-500 text-white'}`}>
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {tab === 'overview' && (
        <div className="mt-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { Icon: Store,      label: 'Restaurants actifs', value: stats.restaurants,         color: 'text-savora-orange', delta: '+3 ce mois' },
              { Icon: Users,      label: 'Utilisateurs',        value: stats.users.toLocaleString(), color: 'text-blue-400',      delta: '+87 ce mois' },
              { Icon: Package,    label: 'Commandes total',     value: stats.orders.toLocaleString(),color: 'text-purple-400',    delta: '+312 ce mois' },
              { Icon: DollarSign, label: 'Commissions (DT)',    value: stats.revenue.toLocaleString(),color: 'text-emerald-400',   delta: '+18%' },
            ].map(s => (
              <div key={s.label} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5">
                <s.Icon size={20} className={s.color} />
                <p className="mt-3 font-display text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-white/45 mt-1">{s.label}</p>
                <p className="mt-1 text-xs text-emerald-400">{s.delta}</p>
              </div>
            ))}
          </div>

          {/* Revenue chart */}
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5">
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-sm">
              <TrendingUp size={15} className="text-savora-orange" /> Commissions 30 derniers jours
            </h2>
            <div className="flex items-end gap-0.5 h-28">
              {[120,95,180,160,210,190,240,220,280,260,300,310,290,330,320,350,340,380,360,400,390,420,410,450,440,460,480,470,510,530].map((v, i) => (
                <div key={i} title={`${v} DT`}
                  className="flex-1 rounded-t bg-savora-orange/50 hover:bg-savora-orange transition-colors cursor-pointer"
                  style={{ height: `${(v / 530) * 100}%` }}
                />
              ))}
            </div>
            <div className="mt-2 flex justify-between text-xs text-white/25">
              <span>7 mai</span><span>Aujourd'hui</span>
            </div>
          </div>

          {pending.length > 0 && (
            <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-yellow-400">
                <AlertTriangle size={15} /> {pending.length} restaurant(s) en attente d'approbation
              </p>
              <button onClick={() => setTab('restaurants')} className="mt-1.5 text-xs text-savora-orange underline underline-offset-2">
                Voir les demandes →
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Restaurants ── */}
      {tab === 'restaurants' && (
        <div className="mt-6 space-y-4">
          <h2 className="font-semibold">Demandes en attente ({pending.length})</h2>
          {pending.length === 0 ? (
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-10 text-center text-sm text-white/25">
              ✓ Aucune demande en attente
            </div>
          ) : pending.map(r => (
            <div key={r.id} className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold">{r.name}</h3>
                    <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${r.verified ? 'badge-delivered' : 'badge-pending'}`}>
                      {r.verified ? 'Docs OK' : 'Docs manquants'}
                    </span>
                    <span className="text-xs text-white/35 border border-white/[0.07] rounded px-2 py-0.5">{r.cuisine.join(', ')}</span>
                  </div>
                  <p className="mt-1 text-sm text-white/45">
                    {r.owner_name} · {r.address} · Soumis le {new Date(r.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button className="grid h-8 w-8 place-items-center rounded-lg border border-white/[0.07] text-white/40 hover:text-white transition-colors">
                    <Eye size={14} />
                  </button>
                  <button onClick={() => reject(r.id)}
                    className="flex items-center gap-1.5 rounded-lg border border-red-500/25 bg-red-500/8 px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/15 transition-colors">
                    <XCircle size={13} /> Rejeter
                  </button>
                  <button onClick={() => approve(r.id)}
                    className="flex items-center gap-1.5 rounded-lg bg-savora-orange px-3 py-1.5 text-xs font-bold text-black hover:bg-orange-400 transition-colors">
                    <CheckCircle size={13} /> Approuver
                  </button>
                </div>
              </div>
            </div>
          ))}

          <h2 className="mt-6 font-semibold">Restaurants actifs</h2>
          {['Ember Table', 'Nori & Flame', 'Golden Crust'].map((name, i) => (
            <div key={name} className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3">
              <div>
                <p className="font-semibold">{name}</p>
                <p className="text-xs text-white/40">Commission 12% · Vérifié · {[142, 98, 76][i]} commandes</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-xs font-bold text-savora-amber">
                  ★ {[4.9, 4.8, 4.7][i]}
                </span>
                <span className="badge-delivered rounded-md border px-2.5 py-1 text-xs font-bold">Actif</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Users ── */}
      {tab === 'users' && (
        <div className="mt-6">
          <div className="mb-4 flex gap-3">
            <label className="field-wrap flex flex-1 items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-2.5">
              <Search size={15} className="text-savora-orange shrink-0" />
              <input value={query} onChange={e => setQuery(e.target.value)}
                className="w-full bg-transparent text-sm placeholder:text-white/30"
                placeholder="Chercher un utilisateur..." />
            </label>
          </div>

          <div className="space-y-2">
            {filteredUsers.map(u => (
              <div key={u.id} className={`flex flex-wrap items-center gap-3 rounded-xl border p-4 transition-all ${
                u.banned ? 'border-red-500/20 bg-red-500/5 opacity-70' : 'border-white/[0.07] bg-white/[0.02]'
              }`}>
                <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold shrink-0">
                  {u.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{u.name}</p>
                  <p className="text-xs text-white/40 truncate">{u.email}</p>
                </div>
                <span className={`rounded-md border px-2.5 py-1 text-[10px] font-bold ${ROLE_BADGE[u.role] ?? ''}`}>
                  {u.role}
                </span>
                {(u as any).orders !== undefined && (
                  <span className="text-xs text-white/35">{(u as any).orders} cmd</span>
                )}
                <span className={`rounded-md border px-2.5 py-1 text-[10px] font-bold ${
                  u.banned ? 'badge-cancelled' : u.verified ? 'badge-delivered' : 'badge-pending'
                }`}>
                  {u.banned ? 'Banni' : u.verified ? 'Actif' : 'Non vérifié'}
                </span>
                <button onClick={() => toggleBan(u.id, u.banned)}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
                    u.banned
                      ? 'border-emerald-500/30 bg-emerald-500/8 text-emerald-400 hover:bg-emerald-500/15'
                      : 'border-red-500/25 bg-red-500/8 text-red-400 hover:bg-red-500/15'
                  }`}
                >
                  <Ban size={12} /> {u.banned ? 'Débannir' : 'Bannir'}
                </button>
              </div>
            ))}
            {filteredUsers.length === 0 && (
              <p className="py-10 text-center text-sm text-white/25">Aucun résultat</p>
            )}
          </div>
        </div>
      )}

      {/* ── Commissions ── */}
      {tab === 'commissions' && (
        <div className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Total collecté',  value: `${commissions.filter(c => c.paid).reduce((s, c) => s + c.amount, 0).toFixed(2)} DT`, color: 'text-savora-orange' },
              { label: 'En attente',       value: `${commissions.filter(c => !c.paid).reduce((s, c) => s + c.amount, 0).toFixed(2)} DT`, color: 'text-yellow-400' },
              { label: 'Taux moyen',       value: '12%', color: 'text-blue-400' },
            ].map(s => (
              <div key={s.label} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                <p className={`font-display text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-white/45 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button onClick={exportCSV}
              className="flex items-center gap-2 rounded-xl border border-white/[0.07] px-4 py-2 text-sm hover:bg-white/5 transition-colors">
              <Download size={15} /> Exporter CSV
            </button>
          </div>

          <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
            <div className="grid grid-cols-5 gap-4 px-4 py-3 border-b border-white/[0.07] text-xs font-bold text-white/40 uppercase tracking-wider">
              <span className="col-span-2">Restaurant</span>
              <span>Revenus</span>
              <span>Commission</span>
              <span>Statut</span>
            </div>
            {commissions.map((c) => (
              <div key={c.id} className="grid grid-cols-5 gap-4 items-center px-4 py-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                <div className="col-span-2">
                  <p className="text-sm font-semibold">{c.restaurant_name}</p>
                  <p className="text-xs text-white/35">{new Date(c.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
                <span className="text-sm">{c.revenue.toFixed(2)} DT</span>
                <span className="text-sm font-semibold text-savora-orange">−{c.amount.toFixed(2)} DT</span>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${c.paid ? 'badge-delivered' : 'badge-pending'}`}>
                    {c.paid ? 'Payée' : 'En attente'}
                  </span>
                  {!c.paid && (
                    <button onClick={() => markPaid(c.id)} className="text-[10px] text-savora-orange hover:underline whitespace-nowrap">
                      Marquer payée
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
