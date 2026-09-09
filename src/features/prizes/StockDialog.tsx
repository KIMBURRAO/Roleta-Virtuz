import { useState, type FormEvent } from 'react'
import { Dialog } from '../../components/ui/Dialog'
import { Button } from '../../components/ui/Button'
import { Field, Input } from '../../components/ui/Field'
import type { Prize } from '../../types/domain'

export function StockDialog({ prize, onClose, onAdd }: { prize: Prize; onClose: () => void; onAdd: (quantity: number) => Promise<void> }) {
  const [quantity, setQuantity] = useState(1)
  const [busy, setBusy] = useState(false)
  const submit = async (event: FormEvent) => { event.preventDefault(); if (quantity <= 0) return; setBusy(true); await onAdd(quantity) }
  return <Dialog title="Adicionar estoque" onClose={onClose}><form className="simple-form" onSubmit={(event) => void submit(event)}><p>Estoque atual: <strong>{prize.currentStock}</strong></p><Field label="Adicionar"><Input type="number" min={1} step={1} value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} /></Field><p>Novo estoque: <strong>{prize.currentStock + quantity}</strong></p><footer className="dialog-actions"><Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button><Button type="submit" disabled={busy}>{busy ? 'Adicionando…' : 'Adicionar'}</Button></footer></form></Dialog>
}
