import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { useAuth } from './auth-context'

export function ProtectedAdmin() {
  const auth = useAuth()
  const location = useLocation()
  if (auth.loading) return <main className="admin-loading"><div className="spinner" /><p>Verificando acesso…</p></main>
  if (!auth.configured) return <main className="setup-needed"><ShieldAlert /><h1>Conecte o Supabase</h1><p>Preencha o arquivo <code>.env</code> para ativar o painel administrativo.</p></main>
  if (!auth.user) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  if (!auth.isAdmin) return <main className="setup-needed"><ShieldAlert /><h1>Acesso não autorizado</h1><p>Esta conta não possui o papel de administrador.</p><button onClick={() => void auth.signOut()}>Sair</button></main>
  return <Outlet />
}
