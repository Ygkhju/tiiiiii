'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, User, Phone, MapPin, Store, ShieldCheck, Upload, Loader2, AlertCircle, CheckCircle, Image as Img, FileText, ArrowLeft } from 'lucide-react'
import { supabase, signIn, signUp } from '@/lib/supabase'
import { showToast } from '@/components/ui/Toast'
import type { Role } from '@/lib/supabase'

type Mode = 'landing' | 'login' | 'register-role' | 'register-customer' | 'register-restaurant' | 'pending'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode]         = useState<Mode>('landing')
  const [role, setRole]         = useState<Role>('customer')
  const [loading, setLoading]   = useState(false)
  const [err, setErr]           = useState('')
  const [showPass, setShowPass] = useState(false)

  /* Login fields */
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPass, setLoginPass]   = useState('')

  /* Register common */
  const [email, setEmail]     = useState('')
  const [pass, setPass]       = useState('')
  const [name, setName]       = useState('')
  const [phone, setPhone]     = useState('')

  /* Customer extra */
  const [address, setAddress]       = useState('')
  const [idCardFile, setIdCardFile] = useState<File | null>(null)
  const idCardRef = useRef<HTMLInputElement>(null)

  /* Restaurant extra */
  const [restName, setRestName]       = useState('')
  const [restDesc, setRestDesc]       = useState('')
  const [restAddress, setRestAddress] = useState('')
  const [restPhone, setRestPhone]     = useState('')
  const [restCuisine, setRestCuisine] = useState('')
  const [logoFile, setLogoFile]       = useState<File | null>(null)
  const [idDocFile, setIdDocFile]     = useState<File | null>(null)
  const [ownershipFile, setOwnershipFile] = useState<File | null>(null)
  const logoRef      = useRef<HTMLInputElement>(null)
  const idDocRef     = useRef<HTMLInputElement>(null)
  const ownershipRef = useRef<HTMLInputElement>(null)

  /* Upload file to Supabase Storage */
  const uploadFile = async (file: File, bucket: string, path: string) => {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
    if (error) return null
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path)
    return publicUrl
  }

  const handleLogin = async () => {
    if (!loginEmail || !loginPass) { setErr('Remplissez tous les champs'); return }
    setErr(''); setLoading(true)
    const { data, error } = await signIn(loginEmail, loginPass)
    if (error) { setErr(error.message); setLoading(false); return }

    const { data: profile } = await supabase.from('profiles').select('role,status').eq('id', data.user!.id).single()
    setLoading(false)

    if (!profile) { setErr('Profil introuvable'); return }
    if (profile.status === 'pending')  { setMode('pending'); return }
    if (profile.status === 'rejected') { setErr('Votre compte a été rejeté. Contactez le support.'); return }
    if (profile.status === 'banned')   { setErr('Votre compte est suspendu.'); return }

    showToast('Connexion réussie !', 'success')
    if (profile.role === 'admin')      router.push('/admin')
    else if (profile.role === 'restaurant') router.push('/restaurant')
    else router.push('/customer')
  }

  const handleRegisterCustomer = async () => {
    if (!email || !pass || !name || !phone || !address) { setErr('Tous les champs sont requis'); return }
    if (!idCardFile) { setErr('Veuillez uploader votre CIN'); return }
    if (pass.length < 6) { setErr('Mot de passe minimum 6 caractères'); return }
    setErr(''); setLoading(true)

    const { data, error } = await signUp(email, pass)
    if (error) { setErr(error.message); setLoading(false); return }
    const uid = data.user!.id

    // Upload CIN
    const idUrl = await uploadFile(idCardFile, 'documents', `${uid}/cin.${idCardFile.name.split('.').pop()}`)

    // Create profile
    await supabase.from('profiles').upsert({
      id: uid, email, name, phone, role: 'customer',
      address, id_card_url: idUrl,
      status: 'pending',
    })

    setLoading(false)
    setMode('pending')
  }

  const handleRegisterRestaurant = async () => {
    if (!email || !pass || !name || !phone || !restName || !restAddress) { setErr('Tous les champs sont requis'); return }
    if (!idDocFile || !ownershipFile) { setErr('Documents requis : CIN + justificatif de propriété'); return }
    if (pass.length < 6) { setErr('Mot de passe minimum 6 caractères'); return }
    setErr(''); setLoading(true)

    const { data, error } = await signUp(email, pass)
    if (error) { setErr(error.message); setLoading(false); return }
    const uid = data.user!.id

    // Upload docs
    const [logoUrl, idUrl, ownerUrl] = await Promise.all([
      logoFile ? uploadFile(logoFile, 'restaurants', `${uid}/logo.${logoFile.name.split('.').pop()}`) : null,
      uploadFile(idDocFile, 'documents', `${uid}/cin.${idDocFile.name.split('.').pop()}`),
      uploadFile(ownershipFile, 'documents', `${uid}/ownership.${ownershipFile.name.split('.').pop()}`),
    ])

    await supabase.from('profiles').upsert({
      id: uid, email, name, phone, role: 'restaurant',
      restaurant_name: restName,
      restaurant_description: restDesc,
      restaurant_address: restAddress,
      restaurant_phone: restPhone,
      restaurant_cuisine: restCuisine.split(',').map(s => s.trim()).filter(Boolean),
      restaurant_logo_url: logoUrl,
      id_doc_url: idUrl,
      ownership_doc_url: ownerUrl,
      status: 'pending',
    })

    setLoading(false)
    setMode('pending')
  }

  /* ── File upload button ── */
  const FileBtn = ({ label, file, onClick, icon: Icon }: { label: string; file: File | null; onClick: () => void; icon: any }) => (
    <button type="button" onClick={onClick}
      className={`upload-zone flex items-center gap-3 w-full rounded-xl px-4 py-3 text-left transition-all ${file ? 'border-emerald-500/40 bg-emerald-500/5' : ''}`}>
      {file
        ? <CheckCircle size={16} className="text-emerald-400 shrink-0" />
        : <Icon size={16} className="text-savora-orange shrink-0 opacity-70" />}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{file ? file.name : label}</p>
        {!file && <p className="text-xs text-white/35 mt-0.5">Cliquez pour choisir un fichier</p>}
      </div>
      {!file && <Upload size={14} className="text-white/30 shrink-0" />}
    </button>
  )

  return (
    <div className="min-h-screen hero-bg dot-grid flex flex-col">
      {/* Logo bar */}
      <header className="flex items-center gap-3 px-6 py-5">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative">
            <img src="/savora-logo.svg" alt="Savora" className="h-9 w-9" />
            <div className="absolute inset-0 rounded-lg bg-savora-orange/10 group-hover:bg-savora-orange/20 transition-colors" />
          </div>
          <span className="font-display text-lg font-bold tracking-wide">Savora</span>
        </Link>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-8">

        {/* ── Landing: choose mode ── */}
        {mode === 'landing' && (
          <div className="w-full max-w-md page-enter">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-savora-orange/25 bg-savora-orange/8 px-4 py-1.5 text-sm text-savora-amber mb-4">
                🍽️ Bienvenue sur Savora
              </div>
              <h1 className="font-display text-4xl font-bold leading-tight">
                Accédez à votre<br />
                <span className="text-savora-orange">espace</span>
              </h1>
              <p className="mt-3 text-sm text-white/45 leading-relaxed">
                Connectez-vous ou créez un compte pour commander, gérer votre restaurant ou accéder au back-office.
              </p>
            </div>

            <div className="glass rounded-2xl p-6 space-y-3">
              <button onClick={() => setMode('login')}
                className="btn-primary w-full text-sm py-3.5">
                Se connecter
              </button>
              <button onClick={() => setMode('register-role')}
                className="btn-ghost w-full text-sm py-3.5">
                Créer un compte
              </button>
            </div>

            <p className="mt-6 text-center text-xs text-white/30">
              Besoin d'aide ?{' '}
              <a href="mailto:support@savora.app" className="text-savora-orange underline underline-offset-2">
                support@savora.app
              </a>
            </p>
          </div>
        )}

        {/* ── Login form ── */}
        {mode === 'login' && (
          <div className="w-full max-w-md page-enter">
            <button onClick={() => setMode('landing')} className="flex items-center gap-2 text-sm text-white/45 hover:text-white transition-colors mb-6">
              <ArrowLeft size={15} /> Retour
            </button>
            <h2 className="font-display text-3xl font-bold mb-1">Connexion</h2>
            <p className="text-sm text-white/45 mb-6">Content de vous revoir</p>

            {err && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/8 px-4 py-3 text-sm text-red-400">
                <AlertCircle size={15} className="shrink-0" />{err}
              </div>
            )}

            <div className="glass rounded-2xl p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1.5">Email</label>
                <div className="field-wrap flex items-center gap-3 rounded-xl border border-white/[0.07] bg-black/40 px-3 py-3">
                  <Mail size={15} className="text-savora-orange shrink-0" />
                  <input value={loginEmail} onChange={e => setLoginEmail(e.target.value)} type="email"
                    className="w-full bg-transparent text-sm placeholder:text-white/25"
                    placeholder="vous@example.com" onKeyDown={e => e.key === 'Enter' && handleLogin()} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1.5">Mot de passe</label>
                <div className="field-wrap flex items-center gap-3 rounded-xl border border-white/[0.07] bg-black/40 px-3 py-3">
                  <Lock size={15} className="text-savora-orange shrink-0" />
                  <input value={loginPass} onChange={e => setLoginPass(e.target.value)} type={showPass ? 'text' : 'password'}
                    className="w-full bg-transparent text-sm placeholder:text-white/25"
                    placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && handleLogin()} />
                  <button onClick={() => setShowPass(v => !v)} className="text-white/25 hover:text-white transition-colors">
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <button onClick={handleLogin} disabled={loading}
                className="btn-primary w-full py-3.5 mt-2">
                {loading ? <Loader2 size={16} className="animate-spin" /> : 'Se connecter'}
              </button>
              <p className="text-center text-xs text-white/35">
                Pas encore de compte ?{' '}
                <button onClick={() => setMode('register-role')} className="text-savora-orange underline underline-offset-2">
                  S&#39;inscrire
                </button>
              </p>
            </div>
          </div>
        )}

        {/* ── Register: choose role ── */}
        {mode === 'register-role' && (
          <div className="w-full max-w-md page-enter">
            <button onClick={() => setMode('landing')} className="flex items-center gap-2 text-sm text-white/45 hover:text-white transition-colors mb-6">
              <ArrowLeft size={15} /> Retour
            </button>
            <h2 className="font-display text-3xl font-bold mb-1">Créer un compte</h2>
            <p className="text-sm text-white/45 mb-6">Choisissez votre profil</p>

            <div className="space-y-3">
              <button onClick={() => { setRole('customer'); setMode('register-customer') }}
                className="glass w-full rounded-2xl p-5 text-left hover:border-savora-orange/30 transition-all group card-lift">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-savora-orange/10 flex items-center justify-center group-hover:bg-savora-orange/20 transition-colors">
                    <User size={22} className="text-savora-orange" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">Je suis un client</p>
                    <p className="text-xs text-white/45 mt-0.5">Commander des repas et suivre mes livraisons</p>
                  </div>
                  <div className="text-white/20 group-hover:text-savora-orange transition-colors">→</div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {['CIN requise', 'Validation admin', 'Achat après approbation'].map(t => (
                    <span key={t} className="rounded-lg bg-white/5 px-2 py-0.5 text-[10px] text-white/40">{t}</span>
                  ))}
                </div>
              </button>

              <button onClick={() => { setRole('restaurant'); setMode('register-restaurant') }}
                className="glass w-full rounded-2xl p-5 text-left hover:border-blue-500/30 transition-all group card-lift">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                    <Store size={22} className="text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">Je suis un restaurant</p>
                    <p className="text-xs text-white/45 mt-0.5">Publier mon menu et gérer mes commandes</p>
                  </div>
                  <div className="text-white/20 group-hover:text-blue-400 transition-colors">→</div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {['CIN + justificatif', 'Approbation admin', 'Commission 12%'].map(t => (
                    <span key={t} className="rounded-lg bg-white/5 px-2 py-0.5 text-[10px] text-white/40">{t}</span>
                  ))}
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ── Register customer ── */}
        {mode === 'register-customer' && (
          <div className="w-full max-w-lg page-enter">
            <button onClick={() => setMode('register-role')} className="flex items-center gap-2 text-sm text-white/45 hover:text-white transition-colors mb-6">
              <ArrowLeft size={15} /> Retour
            </button>
            <h2 className="font-display text-2xl font-bold mb-1">Inscription client</h2>
            <p className="text-sm text-white/45 mb-6">
              Votre compte sera vérifié par l&#39;admin avant activation
            </p>

            {err && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/8 px-4 py-3 text-sm text-red-400">
                <AlertCircle size={15} className="shrink-0" />{err}
              </div>
            )}

            <div className="glass rounded-2xl p-6 space-y-4">
              {/* Name + phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/50 mb-1.5">Nom complet *</label>
                  <div className="field-wrap flex items-center gap-2 rounded-xl border border-white/[0.07] bg-black/40 px-3 py-2.5">
                    <User size={14} className="text-savora-orange shrink-0" />
                    <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-transparent text-sm placeholder:text-white/25" placeholder="Votre nom" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/50 mb-1.5">Téléphone *</label>
                  <div className="field-wrap flex items-center gap-2 rounded-xl border border-white/[0.07] bg-black/40 px-3 py-2.5">
                    <Phone size={14} className="text-savora-orange shrink-0" />
                    <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-transparent text-sm placeholder:text-white/25" placeholder="+216 xx xxx xxx" />
                  </div>
                </div>
              </div>
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1.5">Email *</label>
                <div className="field-wrap flex items-center gap-2 rounded-xl border border-white/[0.07] bg-black/40 px-3 py-2.5">
                  <Mail size={14} className="text-savora-orange shrink-0" />
                  <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="w-full bg-transparent text-sm placeholder:text-white/25" placeholder="vous@example.com" />
                </div>
              </div>
              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1.5">Mot de passe *</label>
                <div className="field-wrap flex items-center gap-2 rounded-xl border border-white/[0.07] bg-black/40 px-3 py-2.5">
                  <Lock size={14} className="text-savora-orange shrink-0" />
                  <input value={pass} onChange={e => setPass(e.target.value)} type={showPass ? 'text' : 'password'} className="w-full bg-transparent text-sm placeholder:text-white/25" placeholder="Minimum 6 caractères" />
                  <button onClick={() => setShowPass(v => !v)} className="text-white/25 hover:text-white"><Eye size={13} /></button>
                </div>
              </div>
              {/* Address */}
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1.5">Adresse *</label>
                <div className="field-wrap flex items-center gap-2 rounded-xl border border-white/[0.07] bg-black/40 px-3 py-2.5">
                  <MapPin size={14} className="text-savora-orange shrink-0" />
                  <input value={address} onChange={e => setAddress(e.target.value)} className="w-full bg-transparent text-sm placeholder:text-white/25" placeholder="Votre adresse complète" />
                </div>
              </div>
              {/* CIN upload */}
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1.5">
                  Carte d'identité nationale (CIN) *
                </label>
                <input ref={idCardRef} type="file" accept="image/*,.pdf" className="hidden" onChange={e => setIdCardFile(e.target.files?.[0] ?? null)} />
                <FileBtn label="Uploader votre CIN (photo ou PDF)" file={idCardFile} onClick={() => idCardRef.current?.click()} icon={FileText} />
                <p className="mt-1 text-xs text-white/30">Votre identité sera vérifiée par notre équipe admin</p>
              </div>

              <button onClick={handleRegisterCustomer} disabled={loading}
                className="btn-primary w-full py-3.5 mt-2">
                {loading ? <Loader2 size={16} className="animate-spin" /> : 'Envoyer la demande'}
              </button>
            </div>
          </div>
        )}

        {/* ── Register restaurant ── */}
        {mode === 'register-restaurant' && (
          <div className="w-full max-w-2xl page-enter">
            <button onClick={() => setMode('register-role')} className="flex items-center gap-2 text-sm text-white/45 hover:text-white transition-colors mb-6">
              <ArrowLeft size={15} /> Retour
            </button>
            <h2 className="font-display text-2xl font-bold mb-1">Inscription restaurant</h2>
            <p className="text-sm text-white/45 mb-6">Votre dossier sera examiné sous 48h</p>

            {err && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/8 px-4 py-3 text-sm text-red-400">
                <AlertCircle size={15} className="shrink-0" />{err}
              </div>
            )}

            <div className="glass rounded-2xl p-6 space-y-5">
              {/* Section: Propriétaire */}
              <div>
                <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Informations du propriétaire</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Nom complet *', val: name, set: setName, icon: User, ph: 'Votre nom' },
                    { label: 'Téléphone *',   val: phone, set: setPhone, icon: Phone, ph: '+216 xx xxx xxx' },
                  ].map(f => (
                    <div key={f.label}>
                      <label className="block text-xs font-semibold text-white/50 mb-1.5">{f.label}</label>
                      <div className="field-wrap flex items-center gap-2 rounded-xl border border-white/[0.07] bg-black/40 px-3 py-2.5">
                        <f.icon size={14} className="text-savora-orange shrink-0" />
                        <input value={f.val} onChange={e => f.set(e.target.value)} className="w-full bg-transparent text-sm placeholder:text-white/25" placeholder={f.ph} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-xs font-semibold text-white/50 mb-1.5">Email *</label>
                    <div className="field-wrap flex items-center gap-2 rounded-xl border border-white/[0.07] bg-black/40 px-3 py-2.5">
                      <Mail size={14} className="text-savora-orange shrink-0" />
                      <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="w-full bg-transparent text-sm placeholder:text-white/25" placeholder="email@restaurant.com" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/50 mb-1.5">Mot de passe *</label>
                    <div className="field-wrap flex items-center gap-2 rounded-xl border border-white/[0.07] bg-black/40 px-3 py-2.5">
                      <Lock size={14} className="text-savora-orange shrink-0" />
                      <input value={pass} onChange={e => setPass(e.target.value)} type="password" className="w-full bg-transparent text-sm placeholder:text-white/25" placeholder="Minimum 6 caractères" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Restaurant */}
              <div>
                <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Informations du restaurant</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-white/50 mb-1.5">Nom du restaurant *</label>
                    <div className="field-wrap flex items-center gap-2 rounded-xl border border-white/[0.07] bg-black/40 px-3 py-2.5">
                      <Store size={14} className="text-blue-400 shrink-0" />
                      <input value={restName} onChange={e => setRestName(e.target.value)} className="w-full bg-transparent text-sm placeholder:text-white/25" placeholder="Nom du restaurant" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/50 mb-1.5">Cuisine (ex: Tunisien, Pizza)</label>
                    <div className="field-wrap flex items-center gap-2 rounded-xl border border-white/[0.07] bg-black/40 px-3 py-2.5">
                      <input value={restCuisine} onChange={e => setRestCuisine(e.target.value)} className="w-full bg-transparent text-sm placeholder:text-white/25" placeholder="Tunisien, Grill, Pizza..." />
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block text-xs font-semibold text-white/50 mb-1.5">Adresse du restaurant *</label>
                  <div className="field-wrap flex items-center gap-2 rounded-xl border border-white/[0.07] bg-black/40 px-3 py-2.5">
                    <MapPin size={14} className="text-blue-400 shrink-0" />
                    <input value={restAddress} onChange={e => setRestAddress(e.target.value)} className="w-full bg-transparent text-sm placeholder:text-white/25" placeholder="Adresse complète du restaurant" />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block text-xs font-semibold text-white/50 mb-1.5">Description</label>
                  <textarea value={restDesc} onChange={e => setRestDesc(e.target.value)}
                    className="field-wrap w-full rounded-xl border border-white/[0.07] bg-black/40 px-3 py-2.5 text-sm placeholder:text-white/25 resize-none"
                    rows={2} placeholder="Décrivez votre restaurant..." />
                </div>
              </div>

              {/* Section: Docs */}
              <div>
                <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Documents requis</p>
                <div className="space-y-2.5">
                  <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={e => setLogoFile(e.target.files?.[0] ?? null)} />
                  <FileBtn label="Logo du restaurant (optionnel)" file={logoFile} onClick={() => logoRef.current?.click()} icon={Img} />

                  <input ref={idDocRef} type="file" accept="image/*,.pdf" className="hidden" onChange={e => setIdDocFile(e.target.files?.[0] ?? null)} />
                  <FileBtn label="CIN du propriétaire *" file={idDocFile} onClick={() => idDocRef.current?.click()} icon={FileText} />

                  <input ref={ownershipRef} type="file" accept="image/*,.pdf" className="hidden" onChange={e => setOwnershipFile(e.target.files?.[0] ?? null)} />
                  <FileBtn label="Justificatif de propriété du restaurant * (patente, bail...)" file={ownershipFile} onClick={() => ownershipRef.current?.click()} icon={ShieldCheck} />
                </div>
                <p className="mt-2 text-xs text-white/30">
                  Tous les documents sont stockés de manière sécurisée et ne seront utilisés que pour la vérification.
                </p>
              </div>

              <button onClick={handleRegisterRestaurant} disabled={loading}
                className="btn-primary w-full py-3.5">
                {loading ? <Loader2 size={16} className="animate-spin" /> : 'Soumettre ma demande'}
              </button>
            </div>
          </div>
        )}

        {/* ── Pending ── */}
        {mode === 'pending' && (
          <div className="w-full max-w-md text-center page-enter">
            <div className="glass rounded-2xl p-8">
              <div className="h-16 w-16 rounded-2xl bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck size={32} className="text-yellow-400" />
              </div>
              <h2 className="font-display text-2xl font-bold">Demande envoyée !</h2>
              <p className="mt-3 text-sm text-white/50 leading-relaxed">
                Votre dossier est en cours d&#39;examen par notre équipe. Vous recevrez un email de confirmation une fois approuvé.
              </p>
              <div className="mt-6 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 text-sm text-yellow-400">
                ⏱️ Délai de traitement : 24 à 48 heures ouvrables
              </div>
              <button onClick={() => setMode('login')} className="btn-ghost w-full mt-6">
                Retour à la connexion
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
