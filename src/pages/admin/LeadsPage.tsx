import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, Download, Search, Trash2, UsersRound } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Field'
import { deleteRaffleLead, fetchRaffleLeads } from '../../services/api'
import { downloadLeadsCsv } from '../../utils/leads-csv'

export function LeadsPage() {
  const [search, setSearch] = useState('')
  const queryClient = useQueryClient()
  const leadsQuery = useQuery({ queryKey: ['raffle-leads', search], queryFn: () => fetchRaffleLeads(search) })
  const leads = leadsQuery.data ?? []
  const totalToday = leads.filter((lead) => new Date(lead.createdAt).toDateString() === new Date().toDateString()).length
  const remove = useMutation({
    mutationFn: deleteRaffleLead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['raffle-leads'] })
      toast.success('Cadastro removido.')
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Não foi possível excluir.'),
  })

  return <div className="admin-page">
    <header className="page-header">
      <div><p className="page-kicker">Sorteio do ar-condicionado</p><h1>Cadastros</h1><p>Consulte e exporte os clientes cadastrados para o sorteio.</p></div>
      <Button variant="secondary" disabled={!leads.length} onClick={() => downloadLeadsCsv(leads)}><Download /> Exportar CSV</Button>
    </header>
    <section className="metric-grid lead-metrics">
      <article className="metric-card"><div><span>Total encontrado</span><strong>{leads.length}</strong></div><UsersRound /></article>
      <article className="metric-card"><div><span>Hoje</span><strong>{totalToday}</strong></div><CalendarDays /></article>
    </section>
    <section className="panel">
      <div className="history-toolbar">
        <label className="search-field"><Search /><Input aria-label="Buscar cadastro" placeholder="Buscar por nome, telefone, e-mail ou endereço" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
      </div>
      {leadsQuery.isLoading ? <div className="skeleton-list" /> : leadsQuery.error ? <div className="notice notice--error">Não foi possível carregar os cadastros.</div> : leads.length === 0 ? <div className="admin-empty"><UsersRound /><h2>Nenhum cadastro encontrado</h2><p>Os participantes aparecerão aqui automaticamente.</p></div> :
        <div className="leads-table">
          <div className="leads-head"><span>Cliente</span><span>Contato</span><span>Endereço</span><span>Data</span><span /></div>
          {leads.map((lead) => <div className="leads-row" key={lead.id}>
            <div><strong>{lead.fullName}</strong><code>{lead.id.slice(0, 8)}</code></div>
            <div><a href={`tel:${lead.phone}`}>{lead.phone}</a><a href={`mailto:${lead.email}`}>{lead.email}</a></div>
            <p>{lead.address}</p>
            <span><CalendarDays />{new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(lead.createdAt))}</span>
            <button className="danger-icon" title="Excluir cadastro" disabled={remove.isPending} onClick={() => { if (window.confirm(`Excluir cadastro de ${lead.fullName}?`)) remove.mutate(lead.id) }}><Trash2 /></button>
          </div>)}
        </div>}
    </section>
  </div>
}
