'use client'
import { useState } from 'react'
import { Mail, KeyRound, Phone, ShieldCheck, Eye, EyeOff, UserRound, Store, ChevronRight } from 'lucide-react'
import { showToast } from '@/components/ui/Toast'

type Role = 'customer' | 'restaurant' | 'admin'
type Step = 'role' | 'form' | 'otp'

const ROLES: { id: Role; label: string; sub: string; icon: React.ReactNode; color: string }[] = [
  { id: 'customer',   label: 'Client',           sub: 'Commander et tracker votre livraison', icon: <UserRound size={22} />, color: 'text-savora-orange' },
  { id: 'restaurant', label: 'Restaurant',        sub: 'Gérer votre menu et vos commandes',    icon: <Store    size={22} />, color: 'text-blue-400'      },
  { id: 'admin',      label: 'Admin',             sub: 'Accès back-office Savora',             icon: <ShieldCheck size={22}/>, color: 'text-purple-400' },
]

export default function LoginPage() {
  const [role, setRole]       = useState<Role | null>(null)
  const [step, setStep]       = useState<Step>('role')
  const [email, setEmail]     = useState('')
  const [pass, setPass]       = useState('')
  const [phone, setPhone]     = useState('')
  const [otp, setOtp]         = useState(['', '', '', '', '', ''])
  const [showPass, setShowPass] = useState(false)
  const [mode, setMode]       = useState<'login' | 'register'>('login')

  const handleOtp = (i: number, v: string) => {
    const n = [...otp]; n[i] = v.slice(-1)
    setOtp(n)
    if (v && i < 5) (document.getElementById(`otp-${i+1}`) as HTMLInputElement)?.focus()
  }

  const submit = () => {
    if (!email || !pass) return showToast('Remplissez tous les champs', 'error')
    showToast('Connexion réussie !', 'success')
  }

  const sendOtp = () => {
    if (!phone) return showToast('Entrez votre numéro', 'error')
    setStep('otp')
    showToast('Code OTP envoyé', 'info')
  }

  return (
    <div className="page-enter">
      <section className="mx-auto grid min-h-[calc(100dvh-64px)] max-w-6xl items-center gap-10 px-4 py-10 lg:grid-cols-2">
        {/* Left info */}
        <div>
          <p className="text-savora-amber text-sm font-semibold">Accès multi-rôles</p>
          <h1 className="font-display mt-2 text-5xl font-bold leading-tight">
            Connexion<br />sécurisée<br />
            <span className="text-savora-orange">Savora</span>
          </h1>
          <p className="mt-4 text-sm leading-8 text-white/50">
            Clients vérifiés par email et OTP. Restaurants approuvés manuellement avec upload de documents. Drivers gérés par route guards.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {ROLES.map(r => (
              <div key={r.id} className={`rounded-xl border p-4 text-sm font-semibold transition-all ${
                role === r.id ? 'border-savora-orange/40 bg-savora-orange/8' : 'border-white/[0.07] bg-white/[0.02]'
              }`}>
                <span className={r.color}>{r.icon}</span>
                <p className="mt-2">{r.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right form */}
        <div className="glass rounded-2xl p-7">
          {step === 'role' && (
            <>
              <h2 className="font-display text-2xl font-bold">Je suis...</h2>
              <div className="mt-5 grid gap-3">
                {ROLES.map(r => (
                  <button
                    key={r.id}
                    onClick={() => { setRole(r.id); setStep('form') }}
                    className="flex items-center gap-4 rounded-xl border border-white/[0.07] p-4 text-left transition-all hover:border-white/20 hover:bg-white/[0.04]"
                  >
                    <span className={`${r.color} opacity-80`}>{r.icon}</span>
                    <div className="flex-1">
                      <p className="font-semibold">{r.label}</p>
                      <p className="text-xs text-white/40">{r.sub}</p>
                    </div>
                    <ChevronRight size={15} className="text-white/25" />
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 'form' && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setStep('role')} className="text-white/40 hover:text-white text-sm transition-colors">
                  ←
                </button>
                <h2 className="font-display text-2xl font-bold">
                  {mode === 'login' ? 'Connexion' : 'Inscription'}
                </h2>
                <button
                  onClick={() => setMode(m => m === 'login' ? 'register' : 'login')}
                  className="ml-auto text-xs text-savora-orange underline underline-offset-2"
                >
                  {mode === 'login' ? "S'inscrire" : 'Se connecter'}
                </button>
              </div>

              {mode === 'register' && (
                <div className="mb-4">
                  <label className="mb-1.5 block text-xs font-semibold text-white/55">Nom complet</label>
                  <div className="field-wrap flex items-center gap-3 rounded-xl border border-white/[0.07] bg-black/40 px-3 py-3">
                    <UserRound size={16} className="text-savora-orange shrink-0" />
                    <input className="w-full bg-transparent text-sm placeholder:text-white/30" placeholder="Votre nom" />
                  </div>
                </div>
              )}

              <label className="mb-1.5 block text-xs font-semibold text-white/55">Email</label>
              <div className="field-wrap flex items-center gap-3 rounded-xl border border-white/[0.07] bg-black/40 px-3 py-3">
                <Mail size={16} className="text-savora-orange shrink-0" />
                <input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-transparent text-sm placeholder:text-white/30"
                  placeholder="vous@savora.app"
                  type="email"
                />
              </div>

              <label className="mt-4 mb-1.5 block text-xs font-semibold text-white/55">Mot de passe</label>
              <div className="field-wrap flex items-center gap-3 rounded-xl border border-white/[0.07] bg-black/40 px-3 py-3">
                <KeyRound size={16} className="text-savora-orange shrink-0" />
                <input
                  value={pass}
                  onChange={e => setPass(e.target.value)}
                  type={showPass ? 'text' : 'password'}
                  className="w-full bg-transparent text-sm placeholder:text-white/30"
                  placeholder="••••••••"
                />
                <button onClick={() => setShowPass(!showPass)} className="text-white/30 hover:text-white transition-colors">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              <button onClick={submit} className="btn-primary mt-5 w-full">
                {mode === 'login' ? 'Se connecter' : "S'inscrire"}
              </button>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setStep('otp')}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/[0.07] px-3 py-3 text-xs transition hover:border-white/20"
                >
                  <Phone size={14} /> Envoyer OTP
                </button>
                {role === 'restaurant' && (
                  <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/[0.07] px-3 py-3 text-xs transition hover:border-white/20">
                    <ShieldCheck size={14} /> Vérifier documents
                  </button>
                )}
              </div>
            </>
          )}

          {step === 'otp' && (
            <>
              <button onClick={() => setStep('form')} className="mb-5 text-sm text-white/40 hover:text-white transition-colors">← Retour</button>
              <h2 className="font-display text-2xl font-bold">Code OTP</h2>

              <div className="mt-4">
                <label className="mb-1.5 block text-xs font-semibold text-white/55">Numéro de téléphone</label>
                <div className="field-wrap flex items-center gap-3 rounded-xl border border-white/[0.07] bg-black/40 px-3 py-3">
                  <Phone size={16} className="text-savora-orange shrink-0" />
                  <span className="text-sm text-white/50">+216</span>
                  <input
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full bg-transparent text-sm placeholder:text-white/30"
                    placeholder="xx xxx xxx"
                    type="tel"
                  />
                </div>
              </div>

              <p className="mt-5 mb-3 text-sm text-white/55">Entrez le code à 6 chiffres :</p>
              <div className="flex gap-2 justify-center">
                {otp.map((v, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    value={v}
                    onChange={e => handleOtp(i, e.target.value)}
                    className="h-12 w-10 rounded-xl border border-white/[0.07] bg-black/40 text-center font-mono text-lg font-bold focus:border-savora-orange/50 transition-colors outline-none"
                    maxLength={1}
                    inputMode="numeric"
                  />
                ))}
              </div>

              <button
                onClick={() => showToast('OTP vérifié !', 'success')}
                className="btn-primary mt-6 w-full"
              >
                Vérifier
              </button>
              <button onClick={sendOtp} className="mt-3 w-full text-center text-xs text-white/35 hover:text-white/60 transition-colors">
                Renvoyer le code
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
