import { describe, expect, it } from 'vitest'
import { historyToCsv } from './csv'
import type { SpinHistoryItem } from '../types/domain'

describe('historyToCsv', () => {
  it('gera CSV UTF-8 com BOM e escapa vírgulas e aspas', () => {
    const row: SpinHistoryItem = {
      spinId: 'spin-1',
      clientSpinId: 'client-1',
      prizeId: 'prize-1',
      prizeName: 'Kit "Corrida", Verde',
      prizeImageUrl: null,
      prizeColor: '#00AA00',
      stockAfterSpin: 4,
      createdAt: '2026-09-08T15:30:00.000Z',
      source: 'online',
      syncStatus: 'confirmed',
      eventSessionId: 'event-1',
    }

    const csv = historyToCsv([row], 'pt-BR')

    expect(csv.startsWith('\uFEFF')).toBe(true)
    expect(csv).toContain('"Kit ""Corrida"", Verde"')
    expect(csv).toContain('spin-1')
  })
})
