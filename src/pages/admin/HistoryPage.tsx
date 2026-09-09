import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, Download, History, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Field'
import { NewEventDialog } from '../../features/history/NewEventDialog'
import { fetchAllPrizes, fetchHistory, startNewEvent } from '../../services/api'
import { downloadCsv } from '../../utils/csv'

export function HistoryPage() {
  const [today, setToday] = useState(true)
  const [prizeId, setPrizeId] = useState('')
  const [resetOpen, setResetOpen] = useState(false)
  const queryClient = useQueryClient()
  const filter = useMemo(() => ({ today, prizeId: prizeId || undefined }), [today, prizeId])
  const historyQuery = useQuery({ queryKey: ['history', filter], queryFn: () => fetchHistory(filter) })
  const prizesQuery = useQuery({ queryKey: ['admin-prizes'], queryFn: fetchAllPrizes })
  const reset = async (restore: boolean) => { try { await startNewEvent(restore); await queryClient.invalidateQueries(); toast.success('Novo evento iniciado.'); setResetOpen(false) } catch (error) { toast.error(error instanceof Error ? error.message : 'Não foi possível iniciar o evento.') } }
  return <div className="admin-page"><header className="page-header"><div><p className="page-kicker">Auditoria do evento</p><h1>Histórico</h1><p>Consulte e exporte os giros registrados.</p></div><Button variant="danger" onClick={() => setResetOpen(true)}><RotateCcw /> Novo evento</Button></header><section className="panel"><div className="history-toolbar"><div className="segmented"><button className={today ? 'active' : ''} onClick={() => setToday(true)}>Hoje</button><button className={!today ? 'active' : ''} onClick={() => setToday(false)}>Todos</button></div><Select aria-label="Filtrar por prêmio" value={prizeId} onChange={(event) => setPrizeId(event.target.value)}><option value="">Todos os prêmios</option>{prizesQuery.data?.map((prize) => <option value={prize.id} key={prize.id}>{prize.name}</option>)}</Select><Button variant="secondary" disabled={!historyQuery.data?.length} onClick={() => downloadCsv(historyQuery.data ?? [])}><Download /> Exportar CSV</Button></div>{historyQuery.isLoading ? <div className="skeleton-list" /> : historyQuery.error ? <div className="notice notice--error">Não foi possível carregar o histórico.</div> : historyQuery.data?.length === 0 ? <div className="admin-empty"><History /><h2>Nenhum sorteio encontrado</h2><p>Os giros aparecerão aqui automaticamente.</p></div> : <div className="history-table"><div className="history-head"><span>Data e hora</span><span>Prêmio</span><span>ID</span><span>Estoque</span></div>{historyQuery.data?.map((item) => <div className="history-row" key={item.spinId}><span><CalendarDays />{new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short'}).format(new Date(item.createdAt))}</span><strong>{item.prizeName}</strong><code>{item.spinId.slice(0,8)}</code><b>{item.stockAfterSpin}</b></div>)}</div>}</section>{resetOpen && <NewEventDialog onClose={() => setResetOpen(false)} onConfirm={reset} />}</div>
}
