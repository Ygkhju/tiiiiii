'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase, getProfile } from '@/lib/supabase'
import type { Profile } from '@/lib/supabase'

type Ctx = { user: Profile | null; loading: boolean; refresh: () => void }
const AuthCtx = createContext<Ctx>({ user: null, loading: true, refresh: () => {} })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      const p = await getProfile(session.user.id)
      setUser(p)
    } else {
      setUser(null)
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => load())
    return () => subscription.unsubscribe()
  }, [])

  return <AuthCtx.Provider value={{ user, loading, refresh: load }}>{children}</AuthCtx.Provider>
}

export const useAuth = () => useContext(AuthCtx)
