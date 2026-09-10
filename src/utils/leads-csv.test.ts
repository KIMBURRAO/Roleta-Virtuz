import { describe, expect, it } from 'vitest'
import type { RaffleLead } from '../types/domain'
import { leadsToCsv } from './leads-csv'

describe('leadsToCsv', () => {
  it('gera CSV UTF-8 para os cadastros do sorteio', () => {
    const leads: RaffleLead[] = [{
      id: 'lead-1',
      fullName: 'Maria Oliveira',
      phone: '(11) 98888-7777',
      email: 'maria@example.com',
      address: 'Rua Verde, 123, Centro',
      campaign: 'sorteio-ar-condicionado',
      createdAt: '2026-09-10T12:30:00.000Z',
    }]

    expect(leadsToCsv(leads)).toContain('Nome,Telefone,E-mail,Endereço,Campanha,Data,Hora,ID')
    expect(leadsToCsv(leads)).toContain('"Rua Verde, 123, Centro"')
    expect(leadsToCsv(leads).charCodeAt(0)).toBe(0xFEFF)
  })
})
