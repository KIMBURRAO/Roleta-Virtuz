import { type FormEvent, useMemo, useState } from 'react'
import { CheckCircle2, Gift, Loader2, ShieldCheck, Snowflake } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../../components/ui/Button'
import { Field, Input, Textarea } from '../../components/ui/Field'
import { BRAND_ASSETS } from '../../lib/brand'
import { submitRaffleLead } from '../../services/api'

const initialForm = { fullName: '', phone: '', email: '', address: '' }

export function RaffleLeadPage() {
  const [form, setForm] = useState(initialForm)
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const canSubmit = useMemo(() => Object.values(form).every((value) => value.trim().length > 0) && !busy, [busy, form])
  const set = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }))

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    try {
      await submitRaffleLead(form)
      setSent(true)
      setForm(initialForm)
      toast.success('Cadastro confirmado. Boa sorte!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível concluir o cadastro.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="lead-shell">
      <section className="lead-hero">
        <img className="lead-logo" src={BRAND_ASSETS.horizontalLight} alt="Virtuz" />
        <div className="lead-prize-card" aria-hidden="true">
          <Snowflake />
          <span>Sorteio especial</span>
          <strong>Ar-condicionado</strong>
        </div>
        <p className="eyebrow"><Gift size={16} /> Promoção Virtuz</p>
        <h1>Concorra a um ar-condicionado</h1>
        <p>Preencha seus dados para participar do sorteio. O cadastro é rápido e será usado pela equipe Virtuz para contato com o ganhador.</p>
        <div className="lead-trust"><ShieldCheck /> Seus dados ficam protegidos e acessíveis apenas pela equipe.</div>
      </section>

      <section className="lead-form-card">
        {sent ? (
          <div className="lead-success">
            <CheckCircle2 />
            <h2>Cadastro confirmado!</h2>
            <p>Você já está participando do sorteio do ar-condicionado. Boa sorte!</p>
            <Button onClick={() => setSent(false)}>Cadastrar outra pessoa</Button>
          </div>
        ) : (
          <form onSubmit={(event) => void submit(event)}>
            <header>
              <span>Participar do sorteio</span>
              <h2>Dados do cliente</h2>
            </header>
            <Field label="Nome completo">
              <Input autoComplete="name" value={form.fullName} onChange={(event) => set('fullName', event.target.value)} placeholder="Ex.: Maria Oliveira" required />
            </Field>
            <Field label="Telefone / WhatsApp">
              <Input autoComplete="tel" inputMode="tel" value={form.phone} onChange={(event) => set('phone', event.target.value)} placeholder="(00) 00000-0000" required />
            </Field>
            <Field label="E-mail">
              <Input autoComplete="email" inputMode="email" type="email" value={form.email} onChange={(event) => set('email', event.target.value)} placeholder="cliente@email.com" required />
            </Field>
            <Field label="Endereço">
              <Textarea autoComplete="street-address" value={form.address} onChange={(event) => set('address', event.target.value)} placeholder="Rua, número, bairro, cidade" required rows={4} />
            </Field>
            <Button className="lead-submit" disabled={!canSubmit} type="submit">
              {busy ? <><Loader2 className="spin-icon" /> Salvando…</> : 'Confirmar participação'}
            </Button>
            <small className="lead-disclaimer">Ao cadastrar, o participante autoriza contato da equipe Virtuz sobre este sorteio.</small>
          </form>
        )}
      </section>
    </main>
  )
}
