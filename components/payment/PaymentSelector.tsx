'use client'
import { useState } from 'react'
import { CreditCard, Banknote, Smartphone, CheckCircle } from 'lucide-react'
import type { PaymentMethod } from '@/lib/supabase'

type Props = {
  value: PaymentMethod
  onChange: (v: PaymentMethod) => void
}

const METHODS: {
  id: PaymentMethod
  label: string
  sub: string
  icon: React.ReactNode
  color: string
}[] = [
  {
    id: 'cash',
    label: 'Cash on delivery',
    sub: 'Pay when your order arrives',
    icon: <Banknote size={20} />,
    color: 'text-emerald-400',
  },
  {
    id: 'card',
    label: 'Carte bancaire',
    sub: 'Visa · Mastercard · CIB',
    icon: <CreditCard size={20} />,
    color: 'text-savora-orange',
  },
  {
    id: 'd17',
    label: 'D17',
    sub: 'Paiement mobile D17',
    icon: <Smartphone size={20} />,
    color: 'text-blue-400',
  },
  {
    id: 'sobflous',
    label: 'SobFlousse',
    sub: 'Wallet électronique',
    icon: <Smartphone size={20} />,
    color: 'text-purple-400',
  },
  {
    id: 'postpay',
    label: 'PostPay',
    sub: 'La Poste Tunisienne',
    icon: <Smartphone size={20} />,
    color: 'text-yellow-400',
  },
]

export function PaymentSelector({ value, onChange }: Props) {
  return (
    <div className="grid gap-2">
      {METHODS.map(m => {
        const active = value === m.id
        return (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            className={`flex items-center gap-4 rounded-xl border px-4 py-3.5 text-left transition-all ${
              active
                ? 'border-savora-orange/50 bg-savora-orange/8'
                : 'border-white/[0.07] bg-white/[0.02] hover:border-white/15'
            }`}
          >
            <span className={`${m.color} ${active ? 'opacity-100' : 'opacity-50'} transition-opacity`}>
              {m.icon}
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold">{m.label}</p>
              <p className="text-xs text-white/45">{m.sub}</p>
            </div>
            {active && <CheckCircle size={16} className="text-savora-orange shrink-0" />}
          </button>
        )
      })}
    </div>
  )
}

/* ── Card input form ── */
export function CardForm() {
  const [num, setNum] = useState('')
  const [exp, setExp] = useState('')
  const [cvv, setCvv] = useState('')
  const [name, setName] = useState('')

  const fmt = (v: string) =>
    v.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19)

  const fmtExp = (v: string) =>
    v.replace(/\D/g, '').replace(/^(\d{2})(\d)/, '$1/$2').slice(0, 5)

  return (
    <div className="mt-4 rounded-xl border border-white/[0.07] bg-[#0d0d0d] p-4">
      {/* Fake card preview */}
      <div className="relative mb-4 h-44 w-full overflow-hidden rounded-xl bg-gradient-to-br from-[#1a1a1a] to-[#111] p-5 shadow-glow">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, #FF6B1A 0%, transparent 60%)' }}
        />
        <div className="card-chip mb-6" />
        <p className="font-mono text-lg tracking-[0.2em] text-white/80">
          {num || '•••• •••• •••• ••••'}
        </p>
        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className="text-xs text-white/40">Titulaire</p>
            <p className="text-sm font-semibold uppercase">{name || 'VOTRE NOM'}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/40">Expire</p>
            <p className="font-mono text-sm">{exp || 'MM/YY'}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3">
        <div className="field-wrap flex items-center gap-3 rounded-lg border border-white/[0.07] bg-black/40 px-3 py-2.5">
          <CreditCard size={16} className="text-savora-orange shrink-0" />
          <input
            className="w-full bg-transparent font-mono text-sm placeholder:text-white/30"
            placeholder="0000 0000 0000 0000"
            value={num}
            onChange={e => setNum(fmt(e.target.value))}
            maxLength={19}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="field-wrap flex items-center gap-2 rounded-lg border border-white/[0.07] bg-black/40 px-3 py-2.5">
            <input
              className="w-full bg-transparent font-mono text-sm placeholder:text-white/30"
              placeholder="MM/YY"
              value={exp}
              onChange={e => setExp(fmtExp(e.target.value))}
              maxLength={5}
            />
          </div>
          <div className="field-wrap flex items-center gap-2 rounded-lg border border-white/[0.07] bg-black/40 px-3 py-2.5">
            <input
              className="w-full bg-transparent font-mono text-sm placeholder:text-white/30"
              placeholder="CVV"
              type="password"
              value={cvv}
              onChange={e => setCvv(e.target.value.slice(0, 3))}
              maxLength={3}
            />
          </div>
        </div>
        <div className="field-wrap flex items-center gap-2 rounded-lg border border-white/[0.07] bg-black/40 px-3 py-2.5">
          <input
            className="w-full bg-transparent text-sm placeholder:text-white/30"
            placeholder="Nom sur la carte"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
