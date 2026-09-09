import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { LockKeyhole } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../features/auth/auth-context'
import { Button } from '../../components/ui/Button'
import { Field, Input } from '../../components/ui/Field'

export function LoginPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  if (auth.user && auth.isAdmin) return <Navigate to="/admin" replace />

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!supabase) return
    setBusy(true); setError('')
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    setBusy(false)
    if (signInError) { setError('E-mail ou senha inválidos.'); return }
    if (data.user.app_metadata?.role !== 'admin') { await supabase.auth.signOut(); setError('Esta conta não possui acesso administrativo.'); return }
    const from = (location.state as { from?: string } | null)?.from ?? '/admin'
    navigate(from, { replace: true })
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <img src="/brand/virtuz-logo-stacked-dark.png" alt="Virtuz" />
        <div className="login-title"><LockKeyhole /><div><h1>Painel da roleta</h1><p>Acesso exclusivo da equipe.</p></div></div>
        <form onSubmit={(event) => void submit(event)}>
          <Field label="E-mail"><Input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></Field>
          <Field label="Senha"><Input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></Field>
          {error && <p className="form-error" role="alert">{error}</p>}
          <Button type="submit" disabled={busy}>{busy ? 'Entrando…' : 'Entrar'}</Button>
        </form>
      </section>
    </main>
  )
}
