'use client'
import { useState, useEffect, useCallback } from 'react'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'

type T = 'success' | 'error' | 'info'
type Item = { id: number; msg: string; type: T }

const bus = new Set<(i: Item) => void>()

export function showToast(msg: string, type: T = 'success') {
  bus.forEach(fn => fn({ id: Date.now() + Math.random(), msg, type }))
}

export function Toast() {
  const [list, setList] = useState<Item[]>([])
  const remove = useCallback((id: number) => setList(l => l.filter(x => x.id !== id)), [])

  useEffect(() => {
    const h = (item: Item) => {
      setList(l => [...l.slice(-3), item])
      setTimeout(() => remove(item.id), 3500)
    }
    bus.add(h)
    return () => { bus.delete(h) }
  }, [remove])

  if (!list.length) return null

  const icons = { success: <CheckCircle size={16} className="text-emerald-400 shrink-0" />, error: <XCircle size={16} className="text-red-400 shrink-0" />, info: <Info size={16} className="text-blue-400 shrink-0" /> }
  const borders = { success: 'border-emerald-500/20', error: 'border-red-500/25', info: 'border-blue-500/20' }

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 items-center pointer-events-none">
      {list.map(t => (
        <div key={t.id} className={`toast flex items-center gap-3 rounded-xl border ${borders[t.type]} bg-[#18181f] px-4 py-3 shadow-2xl pointer-events-auto min-w-[220px] max-w-sm`}>
          {icons[t.type]}
          <span className="text-sm font-medium flex-1">{t.msg}</span>
          <button onClick={() => remove(t.id)} className="text-white/25 hover:text-white ml-1 transition-colors"><X size={13} /></button>
        </div>
      ))}
    </div>
  )
}
