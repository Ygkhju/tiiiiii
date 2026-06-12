'use client'
import { useState } from 'react'
import { ShieldCheck, Users, Store, Package, DollarSign, CheckCircle, XCircle, AlertTriangle, TrendingUp, Search, Filter, Eye, Ban } from 'lucide-react'
import { showToast } from '@/components/ui/Toast'

type Tab = 'overview' | 'restaurants' | 'users' | 'orders' | 'commissions'

const PENDING_RESTAURANTS = [
  { id: 'r10', name: 'Le Zitouna Grill',   owner: 'Mohamed B.', cuisine: 'Tunisien',   docs: true,  submitted: '2 juin 2026' },
  { id: 'r11', name: 'Sushi Carthage',     owner: 'Sonia K.',   cuisine: 'Japonais',  docs: true,  submitted: '4 juin 2026' },
  { id: 'r12', name: 'Pizza Roma',         owner: 'Amine L.',   cuisine: 'Italien',   docs: false, submitted: '5 juin 2026' },
]

const ALL_USERS = [
  { id: 'u1', name: 'Amine Trabelsi',  email: 'amine@mail.com',   role: 'customer',   orders: 14, status: 'active'   },
  { id: 'u2', name: 'Sara Ben Ali',    email: 'sara@mail.com',    role: 'customer',   orders: 7,  status: 'active'   },
  { id: 'u3', name: 'Mohamed Bouzid',  email: 'mbouzid@mail.com', role: 'restaurant', orders: 0,  status: 'pending'  },
  { id: 'u4', name: 'Wafa Hamdi',      email: 'wafa@mail.com',    role: 'customer',   orders: 3,  status: 'banned'   },
]

const COMMISSIONS = [
  { restaurant: 'Ember Table',  week: 'Sem. 22', revenue: 2840, rate: 12, amount: 340.8, paid: true  },
  { restaurant: 'Nori & Flame', week: 'Sem. 22', revenue: 1920, rate: 12, amount: 230.4, paid: true  },
  { restaurant: 'Golden Crust', week: 'Sem. 22', revenue: 1380, rate: 12, amount: 165.6, paid: false },
  { restaurant: 'Ember Table',  week: 'Sem. 21', revenue: 2640, rate: 12, amount: 316.8, paid: true  },
]

const STATS = [
  { icon: Store,       label: 'Restaurants actifs', value: '24',       delta: '+3 ce mois',   color: 'text-savora-orange' },
  { icon: Users,       label: 'Utilisateurs',        value: '1 248',    delta: '+87 ce mois',  color: 'text-blue-400'      },
  { icon: Package,     label: 'Commandes total',     value: '4 712',    delta: '+312 ce mois', color: 'text-purple-400'    },
  { icon: DollarSign,  label: 'Commissions perçues', value: '6 840 DT', delta: '+18%',         color: 'text-emerald-400'   },
]

const ROLE_BADGE: Record<string, string> = {
  customer:   'bg-blue-500/10 text-blue-400 border-blue-500/20',
  restaurant: 'bg-savora-orange/10 text-savora-orange border-savora-orange/20',
  admin:      'bg-purple-500/10 text-purple-400 border-purple-500/20',
}

export default function AdminPage() {
  const [tab, setTab]     = useState<Tab>('overview')
  const [pending, setPending] = useState(PENDING_RESTAURANTS)
  const [users, setUsers] = useState(ALL_USERS)
  const [query, setQuery] = useState('')

  const approve = (id: string) => {
    setPending(p => p.filter(r => r.id !== id))
    showToast('Restaurant approuvé ✓', 'success')
  }

  const reject = (id: string) => {
    setPending(p => p.filter(r => r.id !== id))
    showToast('Restaurant rejeté', 'error')
  }

  const toggleBan = (id: string) => {
    setUsers(u => u.map(x => x.id === id ? { ...x, status: x.status === 'banned' ? 'active' : 'banned' } : x))
    showToast('Statut utilisateur mis à jour', 'info')
  }

  const TABS: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview',     label: 'Vue globale',  icon: <TrendingUp size={15} /> },
    { id: 'restaurants',  label: 'Restaurants',  icon: <Store      size={15} />, badge: pending.length },
    { id: 'users',        label: 'Utilisateurs', icon: <Users      size={15} /> },
    { id: 'commissions',  label: 'Commissions',  icon: <DollarSign size={15} /> },
  ]

  return (
    <div className="page-enter mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-purple-500/10 border border-purple-500/20">
          <ShieldCheck size={22} className="text-purple-400" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">Admin Savora</h1>
          <p className="text-sm text-white/40">Back-office · Accès complet</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 overflow-x-auto rounded-xl border border-white/[0.07] bg-white/[0.02] p-1">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
              tab === t.id ? 'bg-savora-orange text-black' : 'text-white/50 hover:text-white'
            }`}
          >
            {t.icon} {t.label}
            {t.badge !== undefined && t.badge > 0 && (
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${tab === t.id ? 'bg-black/20 text-black' : 'bg-red-500 text-white'}`}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {tab === 'overview' && (
        <div className="mt-6 space-y-6">
          {/* KPI cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map(s => (
              <div key={s.label} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5">
                <s.icon size={20} className={s.color} />
                <p className="mt-3 font-display text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-white/45">{s.label}</p>
                <p className="mt-1 text-xs text-emerald-400">{s.delta}</p>
              </div>
            ))}
          </div>

          {/* Revenue chart */}
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5">
            <h2 className="mb-4 flex items-center gap-2 font-semibold">
              <TrendingUp size={16} className="text-savora-orange" />
              Commissions 30 derniers jours
            </h2>
            <div className="flex items-end gap-1 h-32">
              {[120,95,180,160,210,190,240,220,280,260,300,310,290,330,320,350,340,380,360,400,390,420,410,450,440,460,480,470,510,530].map((v, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t bg-savora-orange/60 hover:bg-savora-orange transition-colors"
                  style={{ height: `${(v / 530) * 100}%` }}
                  title={`${v} DT`}
                />
              ))}
            </div>
            <div className="mt-2 flex justify-between text-xs text-white/30">
              <span>7 mai</span><span>Aujourd'hui</span>
            </div>
          </div>

          {/* Pending alerts */}
          {pending.length > 0 && (
            <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-yellow-400">
                <AlertTriangle size={15} /> {pending.length} restaurant(s) en attente d'approbation
              </p>
              <button onClick={() => setTab('restaurants')} className="mt-2 text-xs text-savora-orange underline underline-offset-2">
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
            <p className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-8 text-center text-sm text-white/30">
              Aucune demande en attente
            </p>
          ) : pending.map(r => (
            <div key={r.id} className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold">{r.name}</h3>
                    {!r.docs && (
                      <span className="rounded border border-yellow-500/30 bg-yellow-500/10 px-2 py-0.5 text-[10px] font-bold text-yellow-400">
                        Docs manquants
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-white/45">
                    {r.owner} · {r.cuisine} · Soumis le {r.submitted}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button className="grid h-8 w-8 place-items-center rounded-lg border border-white/[0.07] text-white/40 hover:text-white transition-colors">
                    <Eye size={14} />
                  </button>
                  <button
                    onClick={() => reject(r.id)}
                    className="flex items-center gap-1.5 rounded-lg border border-red-500/25 bg-red-500/8 px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/15 transition-colors"
                  >
                    <XCircle size={13} /> Rejeter
                  </button>
                  <button
                    onClick={() => approve(r.id)}
                    disabled={!r.docs}
                    className="flex items-center gap-1.5 rounded-lg bg-savora-orange px-3 py-1.5 text-xs font-bold text-black disabled:opacity-40 hover:bg-orange-400 transition-colors"
                  >
                    <CheckCircle size={13} /> Approuver
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Approved restaurants */}
          <h2 className="mt-6 font-semibold">Restaurants actifs</h2>
          {['Ember Table', 'Nori & Flame', 'Golden Crust'].map(name => (
            <div key={name} className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3">
              <div>
                <p className="font-semibold">{name}</p>
                <p className="text-xs text-white/40">Commission 12% · Vérifié</p>
              </div>
              <span className="badge-delivered rounded-md border px-2.5 py-1 text-xs font-bold">Actif</span>
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
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full bg-transparent text-sm placeholder:text-white/30"
                placeholder="Chercher un utilisateur..."
              />
            </label>
            <button className="flex items-center gap-2 rounded-xl border border-white/[0.07] px-4 text-sm text-white/50 hover:text-white transition-colors">
              <Filter size={14} /> Rôle
            </button>
          </div>

          <div className="space-y-2">
            {users
              .filter(u => u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase()))
              .map(u => (
                <div key={u.id} className={`flex flex-wrap items-center gap-4 rounded-xl border p-4 transition-all ${
                  u.status === 'banned' ? 'border-red-500/20 bg-red-500/5 opacity-60' : 'border-white/[0.07] bg-white/[0.02]'
                }`}>
                  <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold">
                    {u.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{u.name}</p>
                    <p className="text-xs text-white/40">{u.email}</p>
                  </div>
                  <span className={`rounded-md border px-2.5 py-1 text-[10px] font-bold ${ROLE_BADGE[u.role] || ''}`}>
                    {u.role}
                  </span>
                  <span className="text-xs text-white/40">{u.orders} commandes</span>
                  <span className={`rounded-md border px-2.5 py-1 text-[10px] font-bold ${
                    u.status === 'active'  ? 'badge-delivered' :
                    u.status === 'banned' ? 'badge-cancelled' : 'badge-pending'
                  }`}>
                    {u.status === 'active' ? 'Actif' : u.status === 'banned' ? 'Banni' : 'En attente'}
                  </span>
                  <button
                    onClick={() => toggleBan(u.id)}
                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
                      u.status === 'banned'
                        ? 'border-emerald-500/30 bg-emerald-500/8 text-emerald-400 hover:bg-emerald-500/15'
                        : 'border-red-500/25 bg-red-500/8 text-red-400 hover:bg-red-500/15'
                    }`}
                  >
                    <Ban size={12} /> {u.status === 'banned' ? 'Débannir' : 'Bannir'}
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ── Commissions ── */}
      {tab === 'commissions' && (
        <div className="mt-6 space-y-4">
          {/* Summary */}
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Collectées ce mois', value: '6 840 DT', color: 'text-savora-orange' },
              { label: 'En attente',          value: '165.6 DT', color: 'text-yellow-400'    },
              { label: 'Taux moyen',          value: '12%',      color: 'text-blue-400'      },
            ].map(s => (
              <div key={s.label} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                <p className={`font-display text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-white/45">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Ledger */}
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
            <div className="grid grid-cols-5 gap-4 px-4 py-3 border-b border-white/[0.07] text-xs font-bold text-white/40 uppercase tracking-wider">
              <span className="col-span-2">Restaurant</span>
              <span>Revenus</span>
              <span>Commission</span>
              <span>Statut</span>
            </div>
            {COMMISSIONS.map((c, i) => (
              <div key={i} className="grid grid-cols-5 gap-4 items-center px-4 py-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                <div className="col-span-2">
                  <p className="text-sm font-semibold">{c.restaurant}</p>
                  <p className="text-xs text-white/35">{c.week}</p>
                </div>
                <span className="text-sm">{c.revenue.toFixed(2)} DT</span>
                <span className="text-sm font-semibold text-savora-orange">−{c.amount.toFixed(2)} DT</span>
                <div className="flex items-center gap-2">
                  <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${c.paid ? 'badge-delivered' : 'badge-pending'}`}>
                    {c.paid ? 'Payée' : 'En attente'}
                  </span>
                  {!c.paid && (
                    <button
                      onClick={() => showToast('Commission marquée payée', 'success')}
                      className="text-[10px] text-savora-orange hover:underline"
                    >
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
