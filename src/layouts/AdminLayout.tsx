import { BarChart3, Gift, History, LogOut, MonitorCog, Palette, Settings, UsersRound } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../features/auth/auth-context'
import { BRAND_ASSETS } from '../lib/brand'
import { useAdminCampaign } from '../features/campaigns/CampaignContext'
import { useEffect } from 'react'

const getLinks = (base: string) => [
  { to: base, label: 'Dashboard', icon: BarChart3, end: true },
  { to: `${base}/premios`, label: 'Prêmios', icon: Gift },
  { to: `${base}/cadastros`, label: 'Cadastros', icon: UsersRound },
  { to: `${base}/aparencia`, label: 'Aparência', icon: Palette },
  { to: `${base}/configuracoes`, label: 'Configurações', icon: Settings },
  { to: `${base}/historico`, label: 'Histórico', icon: History },
]

export function AdminLayout({ basePath = '/admin', campaignSlug = 'default' }: { basePath?: string, campaignSlug?: string }) {
  const auth = useAuth()
  const { setCampaignSlug } = useAdminCampaign()
  
  useEffect(() => {
    setCampaignSlug(campaignSlug)
  }, [campaignSlug, setCampaignSlug])

  const links = getLinks(basePath)
  const isRoleta2 = campaignSlug === 'ar-condicionado'
  const roletaUrl = isRoleta2 ? '#/roleta-2' : '#/'

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <NavLink className="admin-brand" to={basePath}>
          <img src={BRAND_ASSETS.horizontalLight} alt="Virtuz" />
          <span>{isRoleta2 ? 'Painel 2' : 'Painel 1'}</span>
        </NavLink>
        <nav>
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} title={label}>
              <Icon /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <a className="public-link" href={roletaUrl} target="_blank" rel="noreferrer"><MonitorCog /><span>Abrir roleta</span></a>
        <button className="logout-button" onClick={() => void auth.signOut()}><LogOut /><span>Sair</span></button>
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  )
}
