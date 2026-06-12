'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, KeyRound, Phone, ShieldCheck, Eye, EyeOff, UserRound, Store, ChevronRight, Loader2, AlertCircle } from 'lucide-react'
import { signIn, signUp, supabase } from '@/lib/supabase'
import { showToast } from '@/components/ui/Toast'
import type { Role } from '@/lib/supabase'

type Step = 'role' | 'form' | 'otp'
type Mode = 'login' | 'register'

const ROLES: { id: Role; label: string; sub: string; Icon: any; color: string }[] = [
  { id: 'customer',   label: 'Client',      sub: 'Commander et suivre vos livraisons',    Icon: UserRound,  color: 'text-savora-orange' },
  { id: 'restaurant', label: 'Restaurant',  sub: 'Gérer votre menu et vos commandes',     Icon: Store,      color: 'text-blue-400' },
  { id: 'admin',      label: 'Admin',       sub: 'Accès back-office Savora',              Icon: ShieldCheck,color: 'text-purple-400' },
]

const REDIRECT: Record<Role, string> = {
  customer:   '/customer',
  restaurant: '/restaurant',
  admin:      '/admin',
  driver:     '/customer',
}

export default function LoginPage() {
  const router  = useRouter()
  const [role, setRole]       = useState<Role | null>(null)
  const [step, setStep]       = useState<Step>('role')
  const [mode, setMode]       = useState<Mode>('login')
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [pass, setPass]       = useState('')
  const [phone, setPhone]     = useState('')
  const [otp, setOtp]         = useState(['', '', '', '', '', ''])
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleOtpInput = (i: number, v: string) => {
    const n = [...otp]; n[i] = v.replace(/\D/g, '').slice(-1)
    setOtp(n)
    if (v && i < 5) (document.getElementById(`otp-${i + 1}`) as HTMLInputElement)?.focus()
    if (!v && i > 0) (document.getElementById(`otp-${i - 1}`) as HTMLInputElement)?.focus()
  }

  const submit = async () => {
    if (!email.trim() || !pass) { setError('Remplissez tous les champs'); return }
    setError(''); setLoading(true)

    if (mode === 'login') {
      const { data, error: err } = await signIn(email, pass)
      if (err) { setError(err.message); setLoading(false); return }
      // Get role from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user!.id)
        .single()
      showToast('Connexion réussie !', 'success')
      router.push(REDIRECT[(profile?.role as Role) ?? 'customer'])
    } else {
      if (!name.trim()) { setError('Entrez votre nom'); setLoading(false); return }
      const { error: err } = await signUp(email, pass, name, role ?? 'customer')
      if (err) { setError(err.message); setLoading(false); return }
      showToast('Compte créé ! Vérifiez votre email.', 'success')
      setStep('form') // stay, show success
    }
    setLoading(false)
  }

  const sendOtp = async () => {
    if (!phone) { setError('Entrez votre numéro'); return }
    setLoading(true)
    const { error: err } = await supabase.auth.signInWithOtp({
      phone: `+216${phone.replace(/\s/g, '')}`,
    })
    if (err) { setError(err.message); setLoading(false); return }
    showToast('Code OTP envoyé', 'info')
    setStep('otp')
    setLoading(false)
  }

  const verifyOtp = async () => {
    const code = otp.join('')
    if (code.length < 6) { setError('Entrez les 6 chiffres'); return }
    setLoading(true)
    const { data, error: err } = await supabase.auth.verifyOtp({
      phone: `+216${phone.replace(/\s/g, '')}`,
      token: code,
      type: 'sms',
    })
    if (err) { setError(err.message); setLoading(false); return }
    showToast('Vérification réussie !', 'success')
    router.push(REDIRECT[role ?? 'customer'])
    setLoading(false)
  }

  return (
    <div className="page-enter">
      <section className="mx-auto grid min-h-[calc(100dvh-64px)] max-w-6xl items-center gap-10 px-4 py-10 lg:grid-cols-2">

        {/* Left */}
        <div className="hidden lg:block">
          <p className="text-savora-amber text-sm font-semibold">Accès multi-rôles</p>
          <h1 className="font-display mt-2 text-5xl font-bold leading-tight">
            Connexion<br />sécurisée<br />
            <span className="text-savora-orange">Savora</span>
          </h1>
          <p className="mt-4 text-sm leading-8 text-white/50">
            Auth JWT Supabase. OTP SMS. Rôles vérifiés. RLS row-level security.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {ROLES.map(r => (
              <div key={r.id} className={`rounded-xl border p-4 text-sm font-semibold transition-all ${
                role === r.id ? 'border-savora-orange/40 bg-savora-orange/8' : 'border-white/[0.07] bg-white/[0.02]'
              }`}>
                <r.Icon size={20} className={r.color} />
                <p className="mt-2">{r.label}</p>
                <p className="text-xs text-white/40 font-normal mt-0.5">{r.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div className="glass rounded-2xl p-7 w-full max-w-md mx-auto lg:mx-0">

          {/* Error banner */}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/8 px-4 py-3 text-sm text-red-400">
              <AlertCircle size={15} className="shrink-0" />
              {error}
            </div>
          )}

          {/* ── Step: role ── */}
          {step === 'role' && (
            <>
              <h2 className="font-display text-2xl font-bold mb-5">Je suis...</h2>
              {ROLES.map(r => (
                <button
                  key={r.id}
                  onClick={() => { setRole(r.id); setStep('form'); setError('') }}
                  className="flex w-full items-center gap-4 rounded-xl border border-white/[0.07] p-4 text-left mb-2 transition-all hover:border-white/20 hover:bg-white/[0.04] last:mb-0"
                >
                  <r.Icon size={20} className={`${r.color} opacity-80`} />
                  <div className="flex-1">
                    <p className="font-semibold">{r.label}</p>
                    <p className="text-xs text-white/40">{r.sub}</p>
                  </div>
                  <ChevronRight size={15} className="text-white/25" />
                </button>
              ))}
            </>
          )}

          {/* ── Step: form ── */}
          {step === 'form' && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => { setStep('role'); setError('') }} className="text-white/40 hover:text-white transition-colors text-lg">←</button>
                <h2 className="font-display text-2xl font-bold">{mode === 'login' ? 'Connexion' : 'Inscription'}</h2>
                <button onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError('') }}
                  className="ml-auto text-xs text-savora-orange underline underline-offset-2">
                  {mode === 'login' ? "S'inscrire" : 'Se connecter'}
                </button>
              </div>

              {mode === 'register' && (
                <div className="mb-4">
                  <label className="mb-1.5 block text-xs font-semibold text-white/55">Nom complet</label>
                  <div className="field-wrap flex items-center gap-3 rounded-xl border border-white/[0.07] bg-black/40 px-3 py-3">
                    <UserRound size={16} className="text-savora-orange shrink-0" />
                    <input value={name} onChange={e => setName(e.target.value)}
                      className="w-full bg-transparent text-sm placeholder:text-white/30" placeholder="Votre nom" />
                  </div>
                </div>
              )}

              <label className="mb-1.5 block text-xs font-semibold text-white/55">Email</label>
              <div className="field-wrap flex items-center gap-3 rounded-xl border border-white/[0.07] bg-black/40 px-3 py-3">
                <Mail size={16} className="text-savora-orange shrink-0" />
                <input value={email} onChange={e => setEmail(e.target.value)} type="email"
                  className="w-full bg-transparent text-sm placeholder:text-white/30" placeholder="vous@savora.app" />
              </div>

              <label className="mt-4 mb-1.5 block text-xs font-semibold text-white/55">Mot de passe</label>
              <div className="field-wrap flex items-center gap-3 rounded-xl border border-white/[0.07] bg-black/40 px-3 py-3">
                <KeyRound size={16} className="text-savora-orange shrink-0" />
                <input value={pass} onChange={e => setPass(e.target.value)} type={showPass ? 'text' : 'password'}
                  className="w-full bg-transparent text-sm placeholder:text-white/30" placeholder="••••••••"
                  onKeyDown={e => e.key === 'Enter' && submit()} />
                <button onClick={() => setShowPass(v => !v)} className="text-white/30 hover:text-white transition-colors">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              <button onClick={submit} disabled={loading}
                className="btn-primary mt-5 w-full flex items-center justify-center gap-2 disabled:opacity-60">
                {loading && <Loader2 size={16} className="animate-spin" />}
                {mode === 'login' ? 'Se connecter' : "S'inscrire"}
              </button>

              <div className="mt-3 flex gap-2">
                <button onClick={() => { setStep('otp'); setError('') }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/[0.07] px-3 py-2.5 text-xs transition hover:border-white/20">
                  <Phone size={14} /> Via OTP SMS
                </button>
                {mode === 'login' && (
                  <button onClick={async () => {
                    if (!email) { setError('Entrez votre email'); return }
                    await supabase.auth.resetPasswordForEmail(email)
                    showToast('Email de réinitialisation envoyé', 'info')
                  }} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/[0.07] px-3 py-2.5 text-xs transition hover:border-white/20">
                    Mot de passe oublié
                  </button>
                )}
              </div>
            </>
          )}

          {/* ── Step: OTP ── */}
          {step === 'otp' && (
            <>
              <button onClick={() => { setStep('form'); setError('') }} className="mb-5 text-sm text-white/40 hover:text-white transition-colors">← Retour</button>
              <h2 className="font-display text-2xl font-bold">Code OTP</h2>

              <div className="mt-4">
                <label className="mb-1.5 block text-xs font-semibold text-white/55">Numéro Tunisie</label>
                <div className="field-wrap flex items-center gap-3 rounded-xl border border-white/[0.07] bg-black/40 px-3 py-3">
                  <Phone size={16} className="text-savora-orange shrink-0" />
                  <span className="text-sm text-white/50 shrink-0">+216</span>
                  <input value={phone} onChange={e => setPhone(e.target.value)}
                    className="w-full bg-transparent text-sm placeholder:text-white/30"
                    placeholder="xx xxx xxx" type="tel" />
                </div>
                <button onClick={sendOtp} disabled={loading}
                  className="mt-3 w-full rounded-xl border border-white/[0.07] py-2.5 text-sm transition hover:border-white/20 flex items-center justify-center gap-2 disabled:opacity-60">
                  {loading ? <Loader2 size={15} className="animate-spin" /> : <Phone size={15} />}
                  Envoyer le code
                </button>
              </div>

              <p className="mt-5 mb-3 text-sm text-white/55">Code à 6 chiffres :</p>
              <div className="flex gap-2 justify-center">
                {otp.map((v, i) => (
                  <input key={i} id={`otp-${i}`} value={v} onChange={e => handleOtpInput(i, e.target.value)}
                    className="h-12 w-10 rounded-xl border border-white/[0.07] bg-black/40 text-center font-mono text-lg font-bold focus:border-savora-orange/50 transition-colors outline-none"
                    maxLength={1} inputMode="numeric" />
                ))}
              </div>

              <button onClick={verifyOtp} disabled={loading}
                className="btn-primary mt-6 w-full flex items-center justify-center gap-2 disabled:opacity-60">
                {loading && <Loader2 size={16} className="animate-spin" />}
                Vérifier
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
