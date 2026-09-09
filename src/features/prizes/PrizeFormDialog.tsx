import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ImagePlus } from 'lucide-react'
import { Dialog } from '../../components/ui/Dialog'
import { Button } from '../../components/ui/Button'
import { Field, Input, Select, Textarea } from '../../components/ui/Field'
import type { Prize, PrizeInput } from '../../types/domain'
import { prizeInputSchema } from './prize-schema'
import { uploadAsset } from '../../services/storage'

export function PrizeFormDialog({ prize, onClose, onSave }: { prize?: Prize; onClose: () => void; onSave: (input: PrizeInput, existing?: Prize) => Promise<void> }) {
  const initialRuleMode = prize?.forcedAtSpin ? 'exact' : prize?.forcedEverySpins ? 'repeat' : 'normal'
  const [name, setName] = useState(prize?.name ?? '')
  const [description, setDescription] = useState(prize?.description ?? '')
  const [color, setColor] = useState(prize?.color ?? '#08C900')
  const [quantity, setQuantity] = useState(prize?.initialStock ?? 0)
  const [weight, setWeight] = useState(prize?.weight ?? 1)
  const [active, setActive] = useState(prize?.active ?? true)
  const [ruleMode, setRuleMode] = useState<'normal' | 'exact' | 'repeat'>(initialRuleMode)
  const [forcedAtSpin, setForcedAtSpin] = useState(prize?.forcedAtSpin ?? 1)
  const [forcedEverySpins, setForcedEverySpins] = useState(prize?.forcedEverySpins ?? 1)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState(prize?.imageUrl ?? '')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const objectUrl = useRef<string | null>(null)

  useEffect(() => () => { if (objectUrl.current) URL.revokeObjectURL(objectUrl.current) }, [])

  const selectFile = (nextFile: File | null) => {
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current)
    objectUrl.current = nextFile ? URL.createObjectURL(nextFile) : null
    setFile(nextFile)
    setPreview(objectUrl.current ?? prize?.imageUrl ?? '')
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const forcedRule = {
      forcedAtSpin: ruleMode === 'exact' ? forcedAtSpin : null,
      forcedEverySpins: ruleMode === 'repeat' ? forcedEverySpins : null,
    }
    const parsed = prizeInputSchema.safeParse({ name, description, color, quantity, weight, active, ...forcedRule })
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? 'Revise os campos.'); return }
    setBusy(true); setError('')
    try {
      const imageUrl = file ? await uploadAsset(file, 'prizes') : prize?.imageUrl ?? null
      await onSave({ ...parsed.data, description: parsed.data.description || null, imageUrl }, prize)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível salvar o prêmio.')
      setBusy(false)
    }
  }

  return (
    <Dialog title={prize ? 'Editar prêmio' : 'Adicionar prêmio'} onClose={onClose} wide>
      <form className="prize-form" onSubmit={(event) => void submit(event)}>
        <div className="image-picker">
          <div className="image-preview">{preview ? <img src={preview} alt="Prévia do prêmio" /> : <ImagePlus />}</div>
          <label className="button button--secondary">Escolher imagem<input hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => selectFile(event.target.files?.[0] ?? null)} /></label>
          <small>JPG, PNG ou WebP. Até 10 MB.</small>
        </div>
        <div className="form-grid">
          <Field label="Nome do prêmio"><Input value={name} onChange={(event) => setName(event.target.value)} maxLength={80} required /></Field>
          <Field label="Descrição opcional"><Textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={240} rows={3} /></Field>
          <div className="split-fields">
            <Field label="Cor da fatia"><div className="color-input"><input type="color" value={color} onChange={(event) => setColor(event.target.value)} /><Input value={color} onChange={(event) => setColor(event.target.value)} pattern="#[0-9A-Fa-f]{6}" /></div></Field>
            <Field label="Quantidade"><Input type="number" min={0} step={1} value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} /></Field>
          </div>
          <div className="split-fields">
            <Field label="Chance / Peso" hint="1 = normal; números maiores aparecem mais."><Input type="number" min={0.01} max={10000} step="0.01" value={weight} onChange={(event) => setWeight(Number(event.target.value))} /></Field>
            <Field label="Status"><label className="switch-row"><input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} /><span>Prêmio ativo</span></label></Field>
          </div>
          <Field label="Regra de queda" hint="Opcional. Use para garantir um prêmio em um giro específico.">
            <Select value={ruleMode} onChange={(event) => setRuleMode(event.target.value as 'normal' | 'exact' | 'repeat')}>
              <option value="normal">Normal — entra no sorteio por chance/peso</option>
              <option value="exact">Cair no giro número X</option>
              <option value="repeat">Cair a cada Y giros</option>
            </Select>
          </Field>
          {ruleMode === 'exact' && (
            <Field label="Cair no giro número"><Input type="number" min={1} step={1} value={forcedAtSpin} onChange={(event) => setForcedAtSpin(Number(event.target.value))} /></Field>
          )}
          {ruleMode === 'repeat' && (
            <Field label="Cair a cada quantos giros"><Input type="number" min={1} step={1} value={forcedEverySpins} onChange={(event) => setForcedEverySpins(Number(event.target.value))} /></Field>
          )}
          {prize && <p className="stock-note">Ao alterar a quantidade inicial, a diferença é aplicada ao estoque atual sem apagar o histórico.</p>}
          {error && <p className="form-error" role="alert">{error}</p>}
          <footer className="dialog-actions"><Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button><Button type="submit" disabled={busy}>{busy ? 'Salvando…' : 'Salvar'}</Button></footer>
        </div>
      </form>
    </Dialog>
  )
}
