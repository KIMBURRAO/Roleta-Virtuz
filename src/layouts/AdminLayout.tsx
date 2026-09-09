import { BarChart3, Gift, History, LogOut, MonitorCog, Palette, Settings } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../features/auth/auth-context'

const links = [
  { to: '/admin', label: 'Dashboard', icon: BarChart3, end: true },
  { to: '/admin/premios', label: 'Prêmios', icon: Gift },
  { to: '/admin/aparencia', label: 'Aparência', icon: Palette },
  { to: '/admin/configuracoes', label: 'Configurações', icon: Settings },
  { to: '/admin/historico', label: 'Histórico', icon: History },
]

export function AdminLayout() {
  const auth = useAuth()
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <NavLink className="admin-brand" to="/admin"><img src="/brand/virtuz-logo-horizontal-light.png" alt="Virtuz" /><span>Roleta</span></NavLink>
        <nav>{links.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} title={label}><Icon /><span>{label}</span></NavLink>)}</nav>
        <a className="public-link" href="/" target="_blank"><MonitorCog /><span>Abrir roleta</span></a>
        <button className="logout-button" onClick={() => void auth.signOut()}><LogOut /><span>Sair</span></button>
      </aside>
      <main className="admin-content"><Outlet /></main>
    </div>
  )
}
