import { describe, expect, it } from 'vitest'
import { leadSchema, normalizePhone } from './lead-schema'

describe('leadSchema', () => {
  it('normaliza telefone mantendo apenas dígitos', () => {
    expect(normalizePhone('(11) 98888-7777')).toBe('11988887777')
  })

  it('aceita um cadastro completo do sorteio', () => {
    const result = leadSchema.parse({
      fullName: 'Maria Oliveira',
      phone: '(11) 98888-7777',
      email: 'maria@example.com',
      address: 'Rua Verde, 123 - Centro',
    })

    expect(result).toEqual({
      fullName: 'Maria Oliveira',
      phone: '(11) 98888-7777',
      email: 'maria@example.com',
      address: 'Rua Verde, 123 - Centro',
      campaign: 'sorteio-ar-condicionado',
    })
  })

  it('rejeita telefone curto demais', () => {
    expect(() => leadSchema.parse({
      fullName: 'Maria Oliveira',
      phone: '12345',
      email: 'maria@example.com',
      address: 'Rua Verde, 123',
    })).toThrow(/telefone/i)
  })

  it('rejeita e-mail inválido', () => {
    expect(() => leadSchema.parse({
      fullName: 'Maria Oliveira',
      phone: '(11) 98888-7777',
      email: 'maria',
      address: 'Rua Verde, 123',
    })).toThrow(/e-mail/i)
  })
})
