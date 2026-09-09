import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Settings2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../../components/ui/Button'
import { fetchSettings, saveSettings } from '../../services/api'
import type { AppSettings } from '../../types/domain'

const options: { key: keyof AppSettings; label: string; detail: string }[] = [
  { key: 'soundEnabled', label: 'Som', detail: 'Toca uma confirmação curta no resultado.' },
  { key: 'confettiEnabled', label: 'Confete', detail: 'Celebra visualmente o prêmio sorteado.' },
  { key: 'showImages', label: 'Imagens na roleta', detail: 'Mostra a imagem cadastrada dentro das fatias.' },
  { key: 'showNames', label: 'Nomes na roleta', detail: 'Mostra o nome do prêmio em cada fatia.' },
  { key: 'stockControlEnabled', label: 'Controle de estoque', detail: 'Remove automaticamente itens sem unidades.' },
  { key: 'weightedDrawEnabled', label: 'Sorteio ponderado', detail: 'Usa o campo Chance / Peso dos prêmios.' },
  { key: 'fullscreenButtonEnabled', label: 'Botão de tela cheia', detail: 'Exibe o atalho discreto na tela pública.' },
]

function SettingsEditor({ initial }: { initial: AppSettings }) {
  const [settings, setSettings] = useState(initial)
  const [busy, setBusy] = useState(false)
  const queryClient = useQueryClient()
  const save = async () => { setBusy(true); try { setSettings(await saveSettings(settings)); await queryClient.invalidateQueries({ queryKey: ['public-data'] }); toast.success('Configurações salvas.') } catch (error) { toast.error(error instanceof Error ? error.message : 'Não foi possível salvar.') } finally { setBusy(false) } }
  return <section className="panel settings-list"><header><div><h2>Comportamento da roleta</h2><p>Ative apenas os recursos necessários para o evento.</p></div></header>{options.map((option) => { const enabled = Boolean(settings[option.key]); return <label className="settings-row" key={option.key}><div><strong>{option.label}</strong><span>{option.detail}</span></div><input type="checkbox" checked={enabled} onChange={(event) => setSettings((current) => ({ ...current, [option.key]: event.target.checked }))} /><span className="toggle" aria-hidden="true"><i /></span></label> })}<footer><Button onClick={() => void save()} disabled={busy}><Check /> {busy ? 'Salvando…' : 'Salvar configurações'}</Button></footer></section>
}

export function SettingsPage() {
  const query = useQuery({ queryKey: ['app-settings'], queryFn: fetchSettings })
  return <div className="admin-page"><header className="page-header"><div><p className="page-kicker">Operação do evento</p><h1>Configurações</h1><p>Controle a experiência pública com opções simples.</p></div><Settings2 /></header>{query.isLoading ? <div className="skeleton-list" /> : query.data ? <SettingsEditor key={query.data.updatedAt} initial={query.data} /> : <div className="notice notice--error">Não foi possível carregar as configurações.</div>}</div>
}
