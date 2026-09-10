import { z } from 'zod'

export const RAFFLE_CAMPAIGN = 'sorteio-ar-condicionado'

export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '')
}

export const leadSchema = z.object({
  fullName: z.string().trim().min(3, 'Informe o nome completo.').max(120, 'Use até 120 caracteres.'),
  phone: z.string().trim().refine((value) => {
    const digits = normalizePhone(value)
    return digits.length >= 10 && digits.length <= 13
  }, 'Informe um telefone/WhatsApp válido.'),
  email: z.email('Informe um e-mail válido.').trim().toLowerCase().max(160, 'Use até 160 caracteres.'),
  address: z.string().trim().min(5, 'Informe o endereço.').max(300, 'Use até 300 caracteres.'),
  campaign: z.string().trim().min(3).default(RAFFLE_CAMPAIGN),
})

export type LeadFormValues = z.infer<typeof leadSchema>
