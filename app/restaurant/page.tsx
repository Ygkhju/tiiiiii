'use client'
import { useState, useEffect, useRef } from 'react'
import { Package, UtensilsCrossed, BarChart3, Settings, Plus, Pencil, Trash2, CheckCircle, Clock, Upload, Loader2, Image as Img, DollarSign, Star, TrendingUp, LogOut, X } from 'lucide-react'
import { supabase, signOut, updateOrderStatus } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { showToast } from '@/components/ui/Toast'
import { useRouter } from 'next/navigation'
import type { Order, OrderStatus, MenuItem } from '@/lib/supabase'

type Tab = 'orders' | 'menu' | 'profile' | 'analytics'

const STATUS_FLOW: Record<string, OrderStatus> = {
  pending: 'confirmed', confirmed: 'preparing', preparing: 'ready',
  ready: 'picked_up', picked_up: 'delivering', delivering: 'delivered',
}
const STATUS_CFG: Record<string, { label: string; badge: string }> = {
  pending:    { label: 'En attente',    badge: 'badge-pending'    },
  confirmed:  { label: 'Confirmée',     badge: 'badge-preparing'  },
  preparing:  { label: 'Préparation',   badge: 'badge-preparing'  },
  ready:      { label: 'Prête',         badge: 'badge-delivering' },
  picked_up:  { label: 'Récupérée',     badge: 'badge-delivering' },
  delivering: { label: 'En livraison',  badge: 'badge-delivering' },
  delivered:  { label: 'Livrée',        badge: 'badge-delivered'  },
  cancelled:  { label: 'Annulée',       badge: 'badge-cancelled'  },
}

const DEMO_ORDERS: Order[] = [
  { id: 'SV-1043', customer_id: 'c1', restaurant_id: 'r1', items: [{ item_id: 'i1', name: 'Smoked Pepper Bowl', price: 14.8, qty: 2 }], status: 'preparing', subtotal: 29.6, delivery_fee: 2.5, total: 32.1, payment_method: 'cash', payment_status: 'pending', delivery_address: 'Tunis Centre', estimated_minutes: 20, created_at: new Date().toISOString() },
  { id: 'SV-1042', customer_id: 'c2', restaurant_id: 'r1', items: [{ item_id: 'i2', name: 'Savora Burger', price: 16.2, qty: 1 }], status: 'confirmed', subtotal: 16.2, delivery_fee: 2.5, total: 18.7, payment_method: 'd17', payment_status: 'paid', delivery_address: 'La Marsa', estimated_minutes: 30, created_at: new Date().toISOString() },
  { id: 'SV-1041', customer_id: 'c3', restaurant_id: 'r1', items: [{ item_id: 'i3', name: 'Truffle Flatbread', price: 18.0, qty: 3 }], status: 'delivered', subtotal: 54.0, delivery_fee: 2.5, total: 56.5, payment_method: 'card', payment_status: 'paid', delivery_address: 'Lac 1', estimated_minutes: 0, created_at: new Date(Date.now() - 7200000).toISOString() },
]

export default function RestaurantPage() {
  const { user, refresh } = useAuth()
  const router  = useRouter()
  const [tab, setTab]               = useState<Tab>('orders')
  const [orders, setOrders]         = useState<Order[]>(DEMO_ORDERS)
  const [menu, setMenu]             = useState<MenuItem[]>([])
  const [loadingMenu, setLoadingMenu] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [savingItem, setSavingItem] = useState(false)
  const [newItem, setNewItem]       = useState({ name: '', description: '', price: '', category: '' })
  const [itemImageFile, setItemImageFile] = useState<File | null>(null)
  const itemImgRef = useRef<HTMLInputElement>(null)

  // Profile edit state
  const [profileForm, setProfileForm] = useState({
    restaurant_name: user?.restaurant_name ?? '',
    restaurant_description: user?.restaurant_description ?? '',
    restaurant_address: user?.restaurant_address ?? '',
    restaurant_phone: user?.restaurant_phone ?? '',
    restaurant_cuisine: user?.restaurant_cuisine?.join(', ') ?? '',
  })
  const [logoFile, setLogoFile]       = useState<File | null>(null)
  const [coverFile, setCoverFile]     = useState<File | null>(null)
  const [savingProfile, setSavingProfile] = useState(false)
  const logoRef  = useRef<HTMLInputElement>(null)
  const coverRef = useRef<HTMLInputElement>(null)

  // Redirect if not approved
  useEffect(() => {
    if (user && user.status !== 'approved') {
      showToast('Compte en attente d\'approbation admin', 'info')
      router.push('/login')
    }
    if (user) {
      setProfileForm({
        restaurant_name: user.restaurant_name ?? '',
        restaurant_description: user.restaurant_description ?? '',
        restaurant_address: user.restaurant_address ?? '',
        restaurant_phone: user.restaurant_phone ?? '',
        restaurant_cuisine: user.restaurant_cuisine?.join(', ') ?? '',
      })
    }
  }, [user])

  // Load menu
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('menu_items').select('*').eq('restaurant_id', user?.id ?? 'r1').order('created_at')
      setMenu(data?.length ? data : [])
      setLoadingMenu(false)
    }
    load()
  }, [user])

  // Realtime
  useEffect(() => {
    const ch = supabase.channel('rest-orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders', filter: `restaurant_id=eq.${user?.id}` }, p => {
        setOrders(o => [p.new as Order, ...o])
        showToast('🔔 Nouvelle commande !', 'info')
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [user])

  const advance = async (id: string, status: OrderStatus) => {
    const next = STATUS_FLOW[status]
    if (!next) return
    setOrders(o => o.map(x => x.id === id ? { ...x, status: next } : x))
    await updateOrderStatus(id, next)
    showToast(`→ ${STATUS_CFG[next].label}`, 'success')
  }

  const uploadFile = async (file: File, bucket: string, path: string): Promise<string | undefined> => {
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
    if (error) return undefined
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path)
    return publicUrl
  }

  const addItem = async () => {
    if (!newItem.name || !newItem.price) { showToast('Nom et prix requis', 'error'); return }
    setSavingItem(true)
    let imageUrl: string | undefined = undefined
    if (itemImageFile) {
      imageUrl = await uploadFile(itemImageFile, 'menu', `${user?.id}/${Date.now()}.${itemImageFile.name.split('.').pop()}`) ?? undefined
    }
    const item = {
      restaurant_id: user?.id ?? 'r1',
      name: newItem.name, description: newItem.description,
      price: parseFloat(newItem.price), category: newItem.category || 'Plats',
      available: true, image_url: imageUrl,
    }
    const { data } = await supabase.from('menu_items').insert(item).select().single()
    setMenu(m => [...m, data ?? { ...item, id: Date.now().toString(), created_at: '' }])
    setNewItem({ name: '', description: '', price: '', category: '' })
    setItemImageFile(null)
    setShowAddForm(false)
    setSavingItem(false)
    showToast('Article ajouté !', 'success')
  }

  const deleteItem = async (id: string) => {
    setMenu(m => m.filter(x => x.id !== id))
    await supabase.from('menu_items').delete().eq('id', id)
    showToast('Article supprimé', 'success')
  }

  const toggleAvail = async (id: string, val: boolean) => {
    setMenu(m => m.map(x => x.id === id ? { ...x, available: !val } : x))
    await supabase.from('menu_items').update({ available: !val }).eq('id', id)
    showToast(!val ? 'Article disponible' : 'Article masqué', 'success')
  }

  const saveProfile = async () => {
    setSavingProfile(true)
    let logoUrl = user?.restaurant_logo_url
    let coverUrl = user?.restaurant_cover_url
    if (logoFile)  logoUrl  = await uploadFile(logoFile,  'restaurants', `${user?.id}/logo.${logoFile.name.split('.').pop()}`) ?? undefined
    if (coverFile) coverUrl = await uploadFile(coverFile, 'restaurants', `${user?.id}/cover.${coverFile.name.split('.').pop()}`) ?? undefined

    await supabase.from('profiles').update({
      ...profileForm,
      restaurant_cuisine: profileForm.restaurant_cuisine.split(',').map(s => s.trim()).filter(Boolean),
      restaurant_logo_url: logoUrl,
      restaurant_cover_url: coverUrl,
    }).eq('id', user!.id)

    await refresh()
    setSavingProfile(false)
    showToast('Profil mis à jour !', 'success')
  }

  const revenue = orders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.total, 0)
  const active  = orders.filter(o => !['delivered','cancelled'].includes(o.status))

  const TABS: { id: Tab; label: string; Icon: any; badge?: number }[] = [
    { id: 'orders',    label: 'Commandes', Icon: Package,         badge: active.length },
    { id: 'menu',      label: 'Menu',      Icon: UtensilsCrossed },
    { id: 'analytics', label: 'Stats',     Icon: BarChart3       },
    { id: 'profile',   label: 'Profil',    Icon: Settings        },
  ]

  return (
    <div className="min-h-screen page-enter">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#07070A]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          <img src="/savora-logo.svg" alt="" className="h-8 w-8" />
          <div>
            <p className="font-display font-bold text-sm">{user?.restaurant_name ?? 'Mon Restaurant'}</p>
            <div className="flex items-center gap-1.5">
              <span className="live-dot" style={{ width: 6, height: 6 }} />
              <span className="text-xs text-emerald-400">En ligne</span>
            </div>
          </div>
          <button onClick={async () => { await signOut(); router.push('/login') }}
            className="ml-auto grid h-9 w-9 place-items-center rounded-xl border border-white/[0.07] text-white/40 hover:text-red-400 transition-colors">
            <LogOut size={15} />
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-1 rounded-xl border border-white/[0.07] bg-white/[0.02] p-1 mb-6 overflow-x-auto">
          {TABS.map(({ id, label, Icon, badge }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex shrink-0 flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
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

        {/* ── Orders ── */}
        {tab === 'orders' && (
          <div className="space-y-3">
            {orders.map(o => {
              const cfg  = STATUS_CFG[o.status]
              const next = STATUS_FLOW[o.status]
              return (
                <div key={o.id} className="glass rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className="font-mono text-xs font-bold text-white/50">{o.id.slice(0,8)}</span>
                      <span className={`rounded-md border px-2 py-0.5 text-[11px] font-bold ${cfg.badge}`}>{cfg.label}</span>
                      <span className={`rounded-md border px-2 py-0.5 text-[11px] font-bold ${o.payment_status === 'paid' ? 'badge-delivered' : 'badge-pending'}`}>
                        {o.payment_method.toUpperCase()} {o.payment_status === 'paid' ? '✓' : '⏳'}
                      </span>
                    </div>
                    <p className="text-sm">{o.items.map(i => `${i.name} ×${i.qty}`).join(', ')}</p>
                    <p className="text-xs text-white/35 mt-0.5">📍 {o.delivery_address}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {o.estimated_minutes > 0 && !['delivered','cancelled'].includes(o.status) && (
                      <span className="text-xs text-white/35 flex items-center gap-1"><Clock size={11} /> {o.estimated_minutes} min</span>
                    )}
                    <span className="font-display font-black text-savora-orange">{o.total.toFixed(2)} DT</span>
                    {next && (
                      <button onClick={() => advance(o.id, o.status)} className="btn-primary text-xs px-3 py-1.5">
                        {STATUS_CFG[next].label} →
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
            {orders.length === 0 && (
              <p className="py-16 text-center text-sm text-white/25">Aucune commande pour l'instant</p>
            )}
          </div>
        )}

        {/* ── Menu ── */}
        {tab === 'menu' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Articles ({menu.length})</h2>
              <button onClick={() => setShowAddForm(v => !v)} className="btn-primary text-xs px-3 py-2 flex items-center gap-1.5">
                <Plus size={14} /> Ajouter
              </button>
            </div>

            {showAddForm && (
              <div className="glass rounded-xl border border-savora-orange/20 p-5 mb-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold">Nouvel article</h3>
                  <button onClick={() => setShowAddForm(false)}><X size={16} className="text-white/40" /></button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { label: 'Nom *', val: newItem.name, key: 'name', ph: 'Nom du plat' },
                    { label: 'Prix (DT) *', val: newItem.price, key: 'price', ph: '0.000', type: 'number' },
                    { label: 'Catégorie', val: newItem.category, key: 'category', ph: 'Plats, Pizzas, Sushi...' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-xs font-semibold text-white/50 mb-1.5">{f.label}</label>
                      <div className="field-wrap rounded-xl border border-white/[0.07] bg-black/40 px-3 py-2.5">
                        <input value={f.val} onChange={e => setNewItem(v => ({ ...v, [f.key]: e.target.value }))}
                          type={(f as any).type ?? 'text'}
                          className="w-full bg-transparent text-sm placeholder:text-white/25" placeholder={f.ph} />
                      </div>
                    </div>
                  ))}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-white/50 mb-1.5">Description</label>
                    <div className="field-wrap rounded-xl border border-white/[0.07] bg-black/40 px-3 py-2.5">
                      <input value={newItem.description} onChange={e => setNewItem(v => ({ ...v, description: e.target.value }))}
                        className="w-full bg-transparent text-sm placeholder:text-white/25" placeholder="Ingrédients, description..." />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-white/50 mb-1.5">Photo du plat</label>
                    <input ref={itemImgRef} type="file" accept="image/*" className="hidden" onChange={e => setItemImageFile(e.target.files?.[0] ?? null)} />
                    <button onClick={() => itemImgRef.current?.click()}
                      className={`upload-zone flex items-center gap-3 w-full rounded-xl px-4 py-3 ${itemImageFile ? 'border-emerald-500/40' : ''}`}>
                      {itemImageFile
                        ? <><CheckCircle size={16} className="text-emerald-400" /><span className="text-sm">{itemImageFile.name}</span></>
                        : <><Img size={16} className="text-savora-orange/70" /><span className="text-sm text-white/40">Uploader une photo</span><Upload size={14} className="text-white/25 ml-auto" /></>
                      }
                    </button>
                    {itemImageFile && (
                      <img src={URL.createObjectURL(itemImageFile)} alt="preview" className="img-preview mt-2 w-full" style={{ height: 140 }} />
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={addItem} disabled={savingItem} className="btn-primary flex items-center gap-2 text-xs px-4 py-2.5">
                    {savingItem ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Sauvegarder
                  </button>
                  <button onClick={() => setShowAddForm(false)} className="btn-ghost text-xs px-4 py-2.5">Annuler</button>
                </div>
              </div>
            )}

            {loadingMenu ? (
              <div className="flex justify-center py-12"><Loader2 size={22} className="animate-spin text-white/30" /></div>
            ) : menu.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-white/25 text-sm mb-3">Aucun article dans votre menu</p>
                <button onClick={() => setShowAddForm(true)} className="btn-primary text-sm px-6 py-2.5">
                  <Plus size={15} /> Ajouter votre premier plat
                </button>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {menu.map(item => (
                  <div key={item.id} className="glass rounded-xl overflow-hidden">
                    {item.image_url && (
                      <img src={item.image_url} alt={item.name} className="w-full h-32 object-cover" />
                    )}
                    <div className="p-4 flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold truncate">{item.name}</p>
                          {item.category && <span className="text-[10px] rounded bg-white/5 px-1.5 py-0.5 text-white/35 shrink-0">{item.category}</span>}
                        </div>
                        <p className="text-xs text-white/40 mt-0.5 truncate">{item.description}</p>
                        <p className="font-display font-black text-savora-orange mt-1.5">{item.price.toFixed(3)} DT</p>
                      </div>
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <button onClick={() => toggleAvail(item.id, item.available)}
                          className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold transition-all ${
                            item.available ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-white/10 text-white/30'
                          }`}>
                          {item.available ? 'Dispo' : 'Masqué'}
                        </button>
                        <button onClick={() => deleteItem(item.id)}
                          className="grid h-7 w-7 place-items-center rounded-lg border border-red-500/20 text-red-400/40 hover:text-red-400 transition-colors self-end">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Analytics ── */}
        {tab === 'analytics' && (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { Icon: DollarSign, label: 'Revenus livrés', value: `${revenue.toFixed(2)} DT`, color: 'text-savora-orange' },
                { Icon: Package,    label: 'Total commandes', value: orders.length.toString(),   color: 'text-blue-400' },
                { Icon: Star,       label: 'Note moyenne',    value: '4.9 ⭐',                   color: 'text-savora-amber' },
              ].map(s => (
                <div key={s.label} className="glass rounded-xl p-5">
                  <s.Icon size={20} className={s.color} />
                  <p className="mt-3 font-display text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-white/45 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="glass rounded-xl p-5">
              <h3 className="flex items-center gap-2 font-semibold text-sm mb-4">
                <TrendingUp size={16} className="text-savora-orange" /> Revenus 7 jours
              </h3>
              <div className="flex items-end gap-1.5 h-28">
                {[240,180,310,290,420,380,460].map((v, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                    <div className="w-full rounded-t bg-savora-orange/65 hover:bg-savora-orange transition-colors cursor-pointer"
                      style={{ height: `${(v/460)*100}%` }} title={`${v} DT`} />
                    <span className="text-[9px] text-white/30">{['L','M','M','J','V','S','D'][i]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Profile ── */}
        {tab === 'profile' && (
          <div className="max-w-2xl space-y-5">
            <div className="glass rounded-xl p-5">
              <h2 className="font-bold mb-4">Informations du restaurant</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { label: 'Nom du restaurant', key: 'restaurant_name', ph: 'Nom affiché' },
                  { label: 'Téléphone', key: 'restaurant_phone', ph: '+216 xx xxx xxx' },
                  { label: 'Adresse', key: 'restaurant_address', ph: 'Adresse complète' },
                  { label: 'Cuisines (virgules)', key: 'restaurant_cuisine', ph: 'Tunisien, Grill, Pizza' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-semibold text-white/50 mb-1.5">{f.label}</label>
                    <div className="field-wrap rounded-xl border border-white/[0.07] bg-black/40 px-3 py-2.5">
                      <input value={(profileForm as any)[f.key]} onChange={e => setProfileForm(v => ({ ...v, [f.key]: e.target.value }))}
                        className="w-full bg-transparent text-sm placeholder:text-white/25" placeholder={f.ph} />
                    </div>
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-white/50 mb-1.5">Description</label>
                  <div className="field-wrap rounded-xl border border-white/[0.07] bg-black/40 px-3 py-2.5">
                    <textarea value={profileForm.restaurant_description} onChange={e => setProfileForm(v => ({ ...v, restaurant_description: e.target.value }))}
                      className="w-full bg-transparent text-sm placeholder:text-white/25 resize-none" rows={3} placeholder="Décrivez votre restaurant..." />
                  </div>
                </div>
              </div>
            </div>

            <div className="glass rounded-xl p-5">
              <h2 className="font-bold mb-4">Images</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-white/50 mb-1.5">Logo</label>
                  <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={e => setLogoFile(e.target.files?.[0] ?? null)} />
                  <button onClick={() => logoRef.current?.click()}
                    className={`upload-zone flex items-center gap-3 w-full rounded-xl px-4 py-3 ${logoFile ? 'border-emerald-500/40' : ''}`}>
                    {logoFile ? <><CheckCircle size={16} className="text-emerald-400" /><span className="text-sm truncate">{logoFile.name}</span></>
                      : <><Img size={16} className="text-savora-orange/70" /><span className="text-sm text-white/40">Logo du restaurant</span><Upload size={14} className="ml-auto text-white/25" /></>}
                  </button>
                  {(logoFile || user?.restaurant_logo_url) && (
                    <img src={logoFile ? URL.createObjectURL(logoFile) : user!.restaurant_logo_url} alt="logo" className="img-preview mt-2 w-full" style={{ height: 120 }} />
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/50 mb-1.5">Photo de couverture</label>
                  <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={e => setCoverFile(e.target.files?.[0] ?? null)} />
                  <button onClick={() => coverRef.current?.click()}
                    className={`upload-zone flex items-center gap-3 w-full rounded-xl px-4 py-3 ${coverFile ? 'border-emerald-500/40' : ''}`}>
                    {coverFile ? <><CheckCircle size={16} className="text-emerald-400" /><span className="text-sm truncate">{coverFile.name}</span></>
                      : <><Img size={16} className="text-blue-400/70" /><span className="text-sm text-white/40">Photo de couverture</span><Upload size={14} className="ml-auto text-white/25" /></>}
                  </button>
                  {(coverFile || user?.restaurant_cover_url) && (
                    <img src={coverFile ? URL.createObjectURL(coverFile) : user!.restaurant_cover_url} alt="cover" className="img-preview mt-2 w-full" style={{ height: 120 }} />
                  )}
                </div>
              </div>
            </div>

            <button onClick={saveProfile} disabled={savingProfile} className="btn-primary w-full py-3.5">
              {savingProfile ? <Loader2 size={16} className="animate-spin" /> : 'Enregistrer les modifications'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
