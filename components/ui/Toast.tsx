'use client'
import { useState, useEffect, createContext, useContext } from 'react'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'
type ToastData = { id: number; msg: string; type: ToastType } | null

// Simple singleton pattern using module-level variable
let _show: ((msg: string, type: ToastType) => void) | null = null

export function showToast(msg: string, type: ToastType = 'success') {
  _show?.(msg, type)
}

export function Toast() {
  const [toast, setToast] = useState<ToastData>(null)

  useEffect(() => {
    _show = (msg, type) => {
      const id = Date.now()
      setToast({ id, msg, type })
      setTimeout(() => setToast(t => t?.id === id ? null : t), 3000)
    }
    return () => { _show = null }
  }, [])

  if (!toast) return null

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle size={17} className="text-emerald-400 shrink-0" />,
    error:   <XCircle    size={17} className="text-red-400 shrink-0" />,
    info:    <Info       size={17} className="text-savora-orange shrink-0" />,
  }

  const colors: Record<ToastType, string> = {
    success: 'border-emerald-500/20',
    error:   'border-red-500/20',
    info:    'border-savora-orange/25',
  }

  return (
    <div className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 toast pointer-events-none">
      <div className={`flex items-center gap-3 rounded-xl border ${colors[toast.type]} bg-[#1c1c1c] px-4 py-3 shadow-2xl pointer-events-auto`}>
        {icons[toast.type]}
        <span className="text-sm font-medium max-w-xs">{toast.msg}</span>
        <button
          onClick={() => setToast(null)}
          className="ml-2 text-white/30 hover:text-white transition-colors"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  )
}
