'use client'
import { useState, useEffect, useCallback } from 'react'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'
type ToastItem = { id: number; msg: string; type: ToastType }

// Event-based singleton — works with multiple renders and HMR
const listeners = new Set<(t: ToastItem) => void>()

export function showToast(msg: string, type: ToastType = 'success') {
  const item: ToastItem = { id: Date.now() + Math.random(), msg, type }
  listeners.forEach(fn => fn(item))
}

export function Toast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const remove = useCallback((id: number) => {
    setToasts(t => t.filter(x => x.id !== id))
  }, [])

  useEffect(() => {
    const handler = (item: ToastItem) => {
      setToasts(t => [...t.slice(-3), item]) // max 4 at once
      setTimeout(() => remove(item.id), 3200)
    }
    listeners.add(handler)
    return () => { listeners.delete(handler) }
  }, [remove])

  if (toasts.length === 0) return null

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle size={16} className="text-emerald-400 shrink-0" />,
    error:   <XCircle    size={16} className="text-red-400 shrink-0" />,
    info:    <Info       size={16} className="text-blue-400 shrink-0" />,
  }
  const borders: Record<ToastType, string> = {
    success: 'border-emerald-500/20',
    error:   'border-red-500/25',
    info:    'border-blue-500/20',
  }

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 items-center pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`toast flex items-center gap-3 rounded-xl border ${borders[t.type]} bg-[#1c1c1c] px-4 py-3 shadow-2xl pointer-events-auto min-w-[220px] max-w-xs`}
        >
          {icons[t.type]}
          <span className="text-sm font-medium flex-1">{t.msg}</span>
          <button onClick={() => remove(t.id)} className="text-white/25 hover:text-white ml-1 transition-colors">
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  )
}
