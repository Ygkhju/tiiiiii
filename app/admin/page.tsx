'use client'
import { useState, useEffect } from 'react'
import { ShieldCheck, Users, Store, Package, DollarSign, CheckCircle, XCircle, AlertTriangle, TrendingUp, Search, Ban, Eye, Loader2, Download, FileText, ExternalLink, LogOut } from 'lucide-react'
import { showToast } from '@/components/ui/Toast'
import { supabase, signOut } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import type { Profile } from '@/lib/supabase'

type Tab = 'overview' | 'pending' | 'users' | 'commissions'

const DEMO_PENDING = [
  { id: 'p1', name: 'Mohamed Bouzid', email: 'mb@mail.com', role: 'restaurant' as const, restaurant_name: 'Le Zitouna Grill', restaurant_address: 'Tunis Médina', id_doc_url: 'https://via.placeholder.com/400x250?text=CIN', ownership_doc_url: 'https://via.placeholder.com/400x250?text=Patente', status: 'pending' as const, created_at: '2026-06-10', verified: true },
  { id: 'p2', name: 'Sara Karray',     email: 'sk@mail.com', role: 'customer'   as const, restaurant_name: undefined, restaurant_address: undefined, id_card_url: 'https://via.placeholder.com/400x250?text=CIN+Sara', address: 'La Marsa', status: 'pending' as const, created_at: '2026-06-11', verified: false },
  { id: 'p3', name: 'Amine Louati',    email: 'al@mail.com', role: 'restaurant' as const, restaurant_name: 'Pizza Roma', restaurant_address: 'Lac 1', id_doc_url: 'https://via.placeholder.com/400x250?text=CIN+Amine', ownership_doc_url: null, status: 'pending' as const, created_at: '2026-06-12', verified: false },
]

const DEMO_USERS: Array<{id:string;name:string;email:string;role:'customer'|'restaurant'|'admin';status:string;created_at:string}> = [
  { id: 'u1', name: 'Amine Trabelsi', email: 'amine@mail.com', role: 'customer'   as const, status: 'approved' as const, created_at: '' },
  { id: 'u2', name: 'Sara Ben Ali',   email: 'sara@mail.com',  role: 'customer'   as const, status: 'approved' as const, created_at: '' },
  { id: 'u3', name: 'Ember Table',    email: 'ember@mail.com', role: 'restaurant' as const, status: 'approved' as const, created_at: '' },
  { id: 'u4', name: 'Wafa Hamdi',     email: 'wafa@mail.com',  role: 'customer'   as const, status: 'banned'   as const, created_at: '' },
]

const DEMO_COMMS = [
  { id: 'c1', restaurant_name: 'Ember Table',  revenue: 2840, rate: 12, amount: 340.8, paid: true,  date: '2026-06-07' },
  { id: 'c2', restaurant_name: 'Nori & Flame', revenue: 1920, rate: 12, amount: 230.4, paid: true,  date: '2026-06-07' },
  { id: 'c3', restaurant_name: 'Golden Crust', revenue: 1380, rate: 12, amount: 165.6, paid: false, date: '2026-06-07' },
]

const ROLE_BADGE: Record<string, string> = {
  customer:   'bg-blue-500/10 text-blue-400 border-blue-500/20',
  restaurant: 'bg-savora-orange/10 text-savora-orange border-savora-orange/20',
  admin:      'bg-purple-500/10 text-purple-400 border-purple-500/20',
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth()
  const router   = useRouter()
  const [tab, setTab]             = useState<Tab>('overview')
  const [pending, setPending]     = useState(DEMO_PENDING)
  const [users, setUsers]         = useState(DEMO_USERS)
  const [commissions, setComms]   = useState(DEMO_COMMS)
  const [query, setQuery]         = useState('')
  const [dataLoading, setDataLoading] = useState(false)
  const [previewDoc, setPreviewDoc] = useState<{ url: string; label: string } | null>(null)
  const [stats, setStats]         = useState({ restaurants: 24, users: 1248, orders: 4712, revenue: 6840 })

  // Check admin role — only redirect if user is loaded AND not admin
  useEffect(() => {
    if (!authLoading && user && user.role !== 'admin') {
      router.push('/')
    }
  }, [user, authLoading])

  // Load real pending
  useEffect(() => {
    const load = async () => {
      setDataLoading(true)
      const { data } = await supabase.from('profiles').select('*').eq('status', 'pending').order('created_at')
      if (data?.length) setPending(data as any)

      const { data: ud } = await supabase.from('profiles').select('*').neq('status', 'pending').order('created_at', { ascending: false }).limit(50)
      if (ud?.length) setUsers(ud as any)

      const { data: cd } = await supabase.from('commissions').select('*, restaurants(name)').order('created_at', { ascending: false }).limit(30)
      if (cd?.length) setComms(cd.map((c: any) => ({ ...c, restaurant_name: c.restaurants?.name, date: c.created_at?.slice(0,10) })))

      setDataLoading(false)
    }
    load()
  }, [])

  const approve = async (id: string) => {
    await supabase.from('profiles').update({ status: 'approved' }).eq('id', id)
    setPending(p => p.filter(x => x.id !== id))
    showToast('Compte approuvé ✓', 'success')
  }

  const reject = async (id: string) => {
    await supabase.from('profiles').update({ status: 'rejected' }).eq('id', id)
    setPending(p => p.filter(x => x.id !== id))
    showToast('Compte rejeté', 'error')
  }

  const toggleBan = async (id: string, status: string) => {
    const newStatus = status === 'banned' ? 'approved' : 'banned'
    await supabase.from('profiles').update({ status: newStatus }).eq('id', id)
    setUsers(u => u.map(x => x.id === id ? { ...x, status: newStatus as any } : x))
    showToast(newStatus === 'banned' ? 'Utilisateur banni' : 'Utilisateur débanni', newStatus === 'banned' ? 'error' : 'success')
  }

  const markPaid = async (id: string) => {
    await supabase.from('commissions').update({ paid: true, paid_at: new Date().toISOString() }).eq('id', id)
    setComms(c => c.map(x => x.id === id ? { ...x, paid: true } : x))
    showToast('Commission marquée payée', 'success')
  }

  const exportCSV = () => {
    const rows = commissions.map(c => `${c.restaurant_name},${c.revenue},${c.amount},${c.paid ? 'Payée' : 'En attente'},${c.date}`)
    const csv = ['Restaurant,Revenus,Commission,Statut,Date', ...rows].join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = 'commissions-savora.csv'
    a.click()
    showToast('Export CSV téléchargé', 'success')
  }

  const filtered = (users as any[]).filter((u: any) =>
    u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase())
  )

  const TABS: { id: Tab; label: string; Icon: any; badge?: number }[] = [
    { id: 'overview',    label: 'Vue globale',    Icon: TrendingUp },
    { id: 'pending',     label: 'En attente',     Icon: AlertTriangle, badge: pending.length },
    { id: 'users',       label: 'Utilisateurs',   Icon: Users },
    { id: 'commissions', label: 'Commissions',    Icon: DollarSign, badge: commissions.filter(c => !c.paid).length },
  ]

  return (
    <div className="min-h-screen page-enter">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#07070A]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          <img src="/savora-logo.svg" alt="" className="h-8 w-8" />
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-purple-400" />
            <span className="font-display font-bold">Admin Savora</span>
          </div>
          {dataLoading && <Loader2 size={16} className="ml-2 text-white/30 animate-spin" />}
          <button onClick={async () => { await signOut(); router.push('/login') }}
            className="ml-auto grid h-9 w-9 place-items-center rounded-xl border border-white/[0.07] text-white/40 hover:text-red-400 transition-colors">
            <LogOut size={15} />
          </button>
        </div>
      </header>

      {/* Doc preview modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur p-4" onClick={() => setPreviewDoc(null)}>
          <div className="glass rounded-2xl overflow-hidden max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
              <p className="font-semibold text-sm">{previewDoc.label}</p>
              <div className="flex items-center gap-2">
                <a href={previewDoc.url} target="_blank" rel="noopener" className="flex items-center gap-1.5 text-xs text-savora-orange hover:underline">
                  <ExternalLink size={13} /> Ouvrir
                </a>
                <button onClick={() => setPreviewDoc(null)} className="text-white/40 hover:text-white"><XCircle size={18} /></button>
              </div>
            </div>
            <img src={previewDoc.url} alt="Document" className="w-full object-contain max-h-96" />
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto rounded-xl border border-white/[0.07] bg-white/[0.02] p-1 mb-6">
          {TABS.map(({ id, label, Icon, badge }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                tab === id ? 'bg-savora-orange text-black' : 'text-white/50 hover:text-white'
              }`}>
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
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { Icon: Store,      label: 'Restaurants',   value: stats.restaurants,               color: 'text-savora-orange' },
                { Icon: Users,      label: 'Utilisateurs',   value: stats.users.toLocaleString(),    color: 'text-blue-400' },
                { Icon: Package,    label: 'Commandes',      value: stats.orders.toLocaleString(),   color: 'text-purple-400' },
                { Icon: DollarSign, label: 'Commissions DT', value: stats.revenue.toLocaleString(),  color: 'text-emerald-400' },
              ].map(s => (
                <div key={s.label} className="glass rounded-xl p-5">
                  <s.Icon size={20} className={s.color} />
                  <p className="mt-3 font-display text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-white/45 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="glass rounded-xl p-5">
              <h2 className="flex items-center gap-2 font-semibold text-sm mb-4">
                <TrendingUp size={15} className="text-savora-orange" /> Commissions 30 jours
              </h2>
              <div className="flex items-end gap-0.5 h-28">
                {[120,95,180,160,210,190,240,220,280,260,300,310,290,330,320,350,340,380,360,400,390,420,410,450,440,460,480,470,510,530].map((v,i) => (
                  <div key={i} className="flex-1 rounded-t bg-savora-orange/50 hover:bg-savora-orange transition-colors cursor-pointer"
                    style={{ height: `${(v/530)*100}%` }} title={`${v} DT`} />
                ))}
              </div>
              <div className="mt-2 flex justify-between text-xs text-white/25"><span>7 mai</span><span>Aujourd'hui</span></div>
            </div>
            {pending.length > 0 && (
              <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-yellow-400">
                  <AlertTriangle size={15} /> {pending.length} compte(s) en attente d&#39;approbation
                </p>
                <button onClick={() => setTab('pending')} className="mt-1.5 text-xs text-savora-orange underline underline-offset-2">
                  Examiner →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Pending ── */}
        {tab === 'pending' && (
          <div className="space-y-4">
            <h2 className="font-semibold">Demandes en attente ({pending.length})</h2>
            {pending.length === 0 ? (
              <div className="glass rounded-xl p-12 text-center text-sm text-white/25">
                ✓ Aucune demande en attente
              </div>
            ) : pending.map(p => (
              <div key={p.id} className="glass rounded-xl p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold">{p.name}</h3>
                      <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${ROLE_BADGE[p.role]}`}>{p.role}</span>
                      {p.role === 'restaurant' && p.restaurant_name && (
                        <span className="text-xs text-white/40">— {p.restaurant_name}</span>
                      )}
                    </div>
                    <p className="text-xs text-white/40">{p.email} · {new Date(p.created_at).toLocaleDateString('fr-FR')}</p>
                    {p.role === 'customer' && (p as any).address && (
                      <p className="text-xs text-white/35 mt-0.5">📍 {(p as any).address}</p>
                    )}
                    {p.role === 'restaurant' && p.restaurant_address && (
                      <p className="text-xs text-white/35 mt-0.5">🏪 {p.restaurant_address}</p>
                    )}
                  </div>
                  <div className="flex gap-2 flex-wrap shrink-0">
                    {/* View documents */}
                    {(p as any).id_doc_url || (p as any).id_card_url ? (
                      <button
                        onClick={() => setPreviewDoc({ url: (p as any).id_doc_url ?? (p as any).id_card_url, label: 'CIN' })}
                        className="flex items-center gap-1.5 rounded-lg border border-white/[0.07] px-3 py-1.5 text-xs text-white/50 hover:text-white transition-colors">
                        <FileText size={13} /> CIN
                      </button>
                    ) : (
                      <span className="flex items-center gap-1.5 rounded-lg border border-yellow-500/25 px-3 py-1.5 text-xs text-yellow-400">
                        <AlertTriangle size={12} /> CIN manquante
                      </span>
                    )}
                    {p.role === 'restaurant' && (
                      (p as any).ownership_doc_url ? (
                        <button
                          onClick={() => setPreviewDoc({ url: (p as any).ownership_doc_url, label: 'Justificatif propriété' })}
                          className="flex items-center gap-1.5 rounded-lg border border-white/[0.07] px-3 py-1.5 text-xs text-white/50 hover:text-white transition-colors">
                          <Store size={13} /> Propriété
                        </button>
                      ) : (
                        <span className="flex items-center gap-1.5 rounded-lg border border-yellow-500/25 px-3 py-1.5 text-xs text-yellow-400">
                          <AlertTriangle size={12} /> Doc propriété manquant
                        </span>
                      )
                    )}
                    <button onClick={() => reject(p.id)}
                      className="flex items-center gap-1.5 rounded-lg border border-red-500/25 bg-red-500/8 px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-500/15 transition-colors">
                      <XCircle size={13} /> Rejeter
                    </button>
                    <button onClick={() => approve(p.id)}
                      className="flex items-center gap-1.5 rounded-lg bg-savora-orange px-3 py-2 text-xs font-bold text-black hover:bg-orange-400 transition-colors">
                      <CheckCircle size={13} /> Approuver
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Users ── */}
        {tab === 'users' && (
          <div>
            <div className="mb-4 flex gap-3">
              <label className="field-wrap flex flex-1 items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-2.5">
                <Search size={15} className="text-savora-orange shrink-0" />
                <input value={query} onChange={e => setQuery(e.target.value)}
                  className="w-full bg-transparent text-sm placeholder:text-white/30"
                  placeholder="Rechercher un utilisateur..." />
              </label>
            </div>
            <div className="space-y-2">
              {filtered.map((u: any) => (
                <div key={u.id} className={`glass rounded-xl flex flex-wrap items-center gap-3 p-4 transition-all ${
                  u.status === 'banned' ? 'border-red-500/20 bg-red-500/5 opacity-65' : ''
                }`}>
                  <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold shrink-0">
                    {u.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{u.name}</p>
                    <p className="text-xs text-white/40 truncate">{u.email}</p>
                  </div>
                  <span className={`rounded-md border px-2.5 py-1 text-[10px] font-bold ${ROLE_BADGE[u.role] ?? ''}`}>{u.role}</span>
                  <span className={`rounded-md border px-2.5 py-1 text-[10px] font-bold ${
                    u.status === 'approved' ? 'badge-delivered' :
                    u.status === 'banned'   ? 'badge-cancelled' :
                    u.status === 'rejected' ? 'badge-cancelled' : 'badge-pending'
                  }`}>
                    {u.status === 'approved' ? 'Actif' : u.status === 'banned' ? 'Banni' : u.status === 'rejected' ? 'Rejeté' : 'En attente'}
                  </span>
                  <button onClick={() => toggleBan(u.id, u.status)}
                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
                      u.status === 'banned'
                        ? 'border-emerald-500/30 bg-emerald-500/8 text-emerald-400 hover:bg-emerald-500/15'
                        : 'border-red-500/25 bg-red-500/8 text-red-400 hover:bg-red-500/15'
                    }`}>
                    <Ban size={12} /> {u.status === 'banned' ? 'Débannir' : 'Bannir'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Commissions ── */}
        {tab === 'commissions' && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Total collecté',   value: `${commissions.filter(c => c.paid).reduce((s,c) => s + c.amount, 0).toFixed(2)} DT`, color: 'text-savora-orange' },
                { label: 'En attente',        value: `${commissions.filter(c => !c.paid).reduce((s,c) => s + c.amount, 0).toFixed(2)} DT`, color: 'text-yellow-400' },
                { label: 'Taux moyen',        value: '12%', color: 'text-blue-400' },
              ].map(s => (
                <div key={s.label} className="glass rounded-xl p-4">
                  <p className={`font-display text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-white/45 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <button onClick={exportCSV} className="flex items-center gap-2 rounded-xl border border-white/[0.07] px-4 py-2 text-sm hover:bg-white/5 transition-colors">
                <Download size={15} /> Exporter CSV
              </button>
            </div>
            <div className="glass rounded-xl overflow-hidden">
              <div className="grid grid-cols-5 gap-3 px-4 py-3 border-b border-white/[0.06] text-[11px] font-bold text-white/35 uppercase tracking-wider">
                <span className="col-span-2">Restaurant</span><span>Revenus</span><span>Commission</span><span>Statut</span>
              </div>
              {commissions.map(c => (
                <div key={c.id} className="grid grid-cols-5 gap-3 items-center px-4 py-3.5 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                  <div className="col-span-2">
                    <p className="text-sm font-semibold">{c.restaurant_name}</p>
                    <p className="text-xs text-white/30">{c.date}</p>
                  </div>
                  <span className="text-sm">{c.revenue.toFixed(2)} DT</span>
                  <span className="text-sm font-semibold text-savora-orange">−{c.amount.toFixed(2)} DT</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${c.paid ? 'badge-delivered' : 'badge-pending'}`}>
                      {c.paid ? 'Payée' : 'En attente'}
                    </span>
                    {!c.paid && (
                      <button onClick={() => markPaid(c.id)} className="text-[10px] text-savora-orange hover:underline">
                        Payer
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
