'use client'
import { useEffect, useState } from 'react'

export function PageWrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return (
    <div className={mounted ? 'page-enter' : 'opacity-0'}>
      {children}
    </div>
  )
}
