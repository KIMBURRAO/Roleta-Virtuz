import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, Boxes, Gift, RotateCw } from 'lucide-react'
import { fetchAllPrizes, fetchDashboardMetrics } from '../../services/api'

export function DashboardPage() {
  const metrics = useQuery({ queryKey: ['dashboard-metrics'], queryFn: fetchDashboardMetrics })
  const prizes = useQuery({ queryKey: ['admin-prizes'], queryFn: fetchAllPrizes })
  const cards = [
    { label: 'Sorteios hoje', value: metrics.data?.spinsToday ?? '—', icon: RotateCw },
    { label: 'Prêmios sorteados', value: metrics.data?.prizesDrawn ?? '—', icon: Gift },
    { label: 'Unidades restantes', value: metrics.data?.remainingStock ?? '—', icon: Boxes },
    { label: 'Itens sem estoque', value: metrics.data?.outOfStock ?? '—', icon: AlertTriangle },
  ]
  return (
    <div className="admin-page">
      <header className="page-header"><div><p className="page-kicker">Visão rápida</p><h1>Dashboard</h1><p>Acompanhe o essencial do evento em um só lugar.</p></div></header>
      {metrics.error && <div className="notice notice--error">Não foi possível atualizar os números agora.</div>}
      <section className="metric-grid">{cards.map(({ label, value, icon: Icon }) => <article className="metric-card" key={label}><div><span>{label}</span><strong>{value}</strong></div><Icon /></article>)}</section>
      <section className="panel"><header><div><h2>Resumo dos prêmios</h2><p>Estoque e disponibilidade atuais.</p></div></header>
        {prizes.isLoading ? <div className="skeleton-list" /> : prizes.data?.length === 0 ? <div className="admin-empty"><Gift /><h3>Nenhum prêmio cadastrado</h3><p>Use a área Prêmios para adicionar os brindes reais do evento.</p></div> :
          <div className="compact-prizes">{prizes.data?.map((prize) => <div key={prize.id}><span className="color-dot" style={{ background: prize.color }} />{prize.imageUrl ? <img src={prize.imageUrl} alt="" /> : <div className="image-fallback"><Gift /></div>}<div><strong>{prize.name}</strong><span>{prize.active ? 'Ativo' : 'Inativo'}</span></div><b>{prize.currentStock} / {prize.initialStock}</b></div>)}</div>}
      </section>
    </div>
  )
}
