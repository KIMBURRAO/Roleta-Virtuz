import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Copy, Edit3, Gift, PackagePlus, Plus, Power, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../../components/ui/Button'
import { PrizeFormDialog } from '../../features/prizes/PrizeFormDialog'
import { StockDialog } from '../../features/prizes/StockDialog'
import { addStock, deletePrize, duplicatePrize, fetchAllPrizes, savePrize, setPrizeActive } from '../../services/api'
import type { Prize, PrizeInput } from '../../types/domain'

export function PrizesPage() {
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: ['admin-prizes'], queryFn: fetchAllPrizes })
  const [editing, setEditing] = useState<Prize | 'new' | null>(null)
  const [restocking, setRestocking] = useState<Prize | null>(null)
  const refresh = async () => { await Promise.all([queryClient.invalidateQueries({ queryKey: ['admin-prizes'] }), queryClient.invalidateQueries({ queryKey: ['public-data'] }), queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] })]) }
  const action = useMutation({ mutationFn: async (operation: () => Promise<unknown>) => operation(), onSuccess: () => void refresh(), onError: (error) => toast.error(error instanceof Error ? error.message : 'A ação não pôde ser concluída.') })

  const handleSave = async (input: PrizeInput, prize?: Prize) => { await savePrize(input, prize); await refresh(); toast.success('Prêmio salvo.'); setEditing(null) }
  const handleStock = async (quantity: number) => { if (!restocking) return; await addStock(restocking.id, quantity); await refresh(); toast.success('Estoque atualizado.'); setRestocking(null) }

  return <div className="admin-page"><header className="page-header"><div><p className="page-kicker">Catálogo do evento</p><h1>Prêmios</h1><p>Cadastre apenas os brindes que estarão disponíveis.</p></div><Button onClick={() => setEditing('new')}><Plus /> Adicionar prêmio</Button></header>
    {query.error && <div className="notice notice--error">{query.error.message}</div>}
    {query.isLoading ? <div className="skeleton-grid" /> : query.data?.length === 0 ? <div className="panel admin-empty"><Gift /><h2>Nenhum prêmio cadastrado</h2><p>A roleta permanecerá pausada até o primeiro cadastro.</p><Button onClick={() => setEditing('new')}><Plus /> Adicionar primeiro prêmio</Button></div> :
      <section className="prize-grid">{query.data?.map((prize) => <article className={prize.active ? 'prize-card' : 'prize-card prize-card--inactive'} key={prize.id}><div className="prize-visual" style={{ background: prize.color }}>{prize.imageUrl ? <img src={prize.imageUrl} alt="" /> : <Gift />}</div><div className="prize-body"><div className="prize-heading"><div><span className="status-pill">{prize.active ? 'Ativo' : 'Inativo'}</span><h2>{prize.name}</h2></div><span className="color-dot color-dot--large" style={{ background: prize.color }} /></div>{prize.description && <p>{prize.description}</p>}<dl><div><dt>Inicial</dt><dd>{prize.initialStock}</dd></div><div><dt>Disponível</dt><dd className={prize.currentStock === 0 ? 'stock-zero' : ''}>{prize.currentStock}</dd></div><div><dt>Peso</dt><dd>{prize.weight}</dd></div></dl><div className="card-actions"><button title="Editar" onClick={() => setEditing(prize)}><Edit3 /></button><button title="Adicionar estoque" onClick={() => setRestocking(prize)}><PackagePlus /></button><button title="Duplicar" onClick={() => action.mutate(() => duplicatePrize(prize))}><Copy /></button><button title={prize.active ? 'Desativar' : 'Ativar'} onClick={() => action.mutate(() => setPrizeActive(prize.id, !prize.active))}><Power /></button><button className="danger-icon" title="Excluir" onClick={() => { if (window.confirm(`Excluir “${prize.name}”? O histórico existente será preservado.`)) action.mutate(() => deletePrize(prize.id)) }}><Trash2 /></button></div></div></article>)}</section>}
    {editing && <PrizeFormDialog prize={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} onSave={handleSave} />}
    {restocking && <StockDialog prize={restocking} onClose={() => setRestocking(null)} onAdd={handleStock} />}
  </div>
}
