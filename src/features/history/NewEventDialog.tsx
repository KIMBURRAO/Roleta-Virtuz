import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Dialog } from '../../components/ui/Dialog'
import { Button } from '../../components/ui/Button'

export function NewEventDialog({ onClose, onConfirm }: { onClose: () => void; onConfirm: (restore: boolean) => Promise<void> }) {
  const [restore, setRestore] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [busy, setBusy] = useState(false)
  return <Dialog title="Iniciar novo evento" onClose={onClose}><div className="danger-callout"><AlertTriangle /><p><strong>Essa ação irá iniciar uma nova sessão de evento.</strong><span>Os prêmios cadastrados nunca serão apagados.</span></p></div><div className="choice-list"><label><input type="radio" name="reset" checked={!restore} onChange={() => setRestore(false)} /><span><strong>Limpar apenas os sorteios</strong><small>Mantém os estoques atuais.</small></span></label><label><input type="radio" name="reset" checked={restore} onChange={() => setRestore(true)} /><span><strong>Limpar sorteios e restaurar estoques</strong><small>Volta cada item à quantidade inicial.</small></span></label></div><label className="confirm-check"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} /> Entendo que o histórico atual deixará de aparecer na nova sessão.</label><footer className="dialog-actions"><Button variant="ghost" onClick={onClose}>Cancelar</Button><Button variant="danger" disabled={!confirmed || busy} onClick={() => { setBusy(true); void onConfirm(restore) }}>{busy ? 'Iniciando…' : 'Iniciar novo evento'}</Button></footer></Dialog>
}
