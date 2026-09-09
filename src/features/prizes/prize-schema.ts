import { z } from 'zod'

export const prizeInputSchema = z.object({
  name: z.string().trim().min(2, 'Informe o nome do prêmio.').max(80, 'Use até 80 caracteres.'),
  description: z.string().trim().max(240, 'Use até 240 caracteres.').optional().default(''),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Escolha uma cor válida.'),
  quantity: z.coerce.number().int('Use um número inteiro.').min(0, 'A quantidade não pode ser negativa.'),
  weight: z.coerce.number().finite().positive('O peso deve ser maior que zero.').max(10000, 'Use um peso de até 10.000.'),
  active: z.coerce.boolean(),
  forcedAtSpin: z.coerce.number().int('Use um número inteiro.').positive('Use um giro maior que zero.').nullable().optional(),
  forcedEverySpins: z.coerce.number().int('Use um número inteiro.').positive('Use um intervalo maior que zero.').nullable().optional(),
}).refine((value) => !(value.forcedAtSpin && value.forcedEverySpins), {
  message: 'Escolha apenas um tipo de programação para o prêmio.',
  path: ['forcedAtSpin'],
})

export type PrizeFormValues = z.input<typeof prizeInputSchema>
