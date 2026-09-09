import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '../../lib/supabase'
import { AuthContext, type AuthState } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!supabase) return
    void supabase.auth.getSession().then(({ data }) => { setUser(data.session?.user ?? null); setLoading(false) })
    const { data } = supabase.auth.onAuthStateChange((_event, session) => { setUser(session?.user ?? null); setLoading(false) })
    return () => data.subscription.unsubscribe()
  }, [])

  const value = useMemo<AuthState>(() => ({
    user,
    loading,
    configured: isSupabaseConfigured,
    isAdmin: user?.app_metadata?.role === 'admin',
    signOut: async () => { if (supabase) await supabase.auth.signOut() },
  }), [loading, user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
