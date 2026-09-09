import { describe, expect, it } from 'vitest'
import { prizeInputSchema } from './prize-schema'

describe('prizeInputSchema', () => {
  it('rejeita quantidade negativa e peso não positivo', () => {
    const result = prizeInputSchema.safeParse({
      name: 'Prêmio',
      description: '',
      color: '#08C900',
      quantity: -1,
      weight: 0,
      active: true,
    })

    expect(result.success).toBe(false)
  })

  it('aceita um prêmio real sem imagem', () => {
    const result = prizeInputSchema.safeParse({
      name: 'Medalha da prova',
      description: '',
      color: '#08C900',
      quantity: 10,
      weight: 2,
      active: true,
    })

    expect(result.success).toBe(true)
  })
})
