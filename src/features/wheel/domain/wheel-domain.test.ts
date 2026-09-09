import { describe, expect, it } from 'vitest'
import {
  getEligiblePrizes,
  getTargetRotation,
  pickPrize,
  sanitizeWeight,
} from './wheel-domain'
import type { Prize } from '../../../types/domain'

const prize = (overrides: Partial<Prize> = {}): Prize => ({
  id: 'a',
  name: 'Prêmio A',
  description: null,
  imageUrl: null,
  color: '#08C900',
  initialStock: 10,
  currentStock: 10,
  weight: 1,
  active: true,
  createdAt: '2026-09-08T12:00:00.000Z',
  updatedAt: '2026-09-08T12:00:00.000Z',
  ...overrides,
})

describe('getEligiblePrizes', () => {
  it('remove prêmios inativos', () => {
    expect(getEligiblePrizes([prize(), prize({ id: 'b', active: false })], true)).toHaveLength(1)
  })

  it('remove prêmios sem estoque quando o controle está ligado', () => {
    expect(getEligiblePrizes([prize({ currentStock: 0 })], true)).toEqual([])
  })

  it('mantém prêmio sem estoque quando o controle está desligado', () => {
    expect(getEligiblePrizes([prize({ currentStock: 0 })], false)).toHaveLength(1)
  })
})

describe('pickPrize', () => {
  it('faz sorteio uniforme quando pesos estão desligados', () => {
    const prizes = [prize({ id: 'a', weight: 100 }), prize({ id: 'b', weight: 1 })]
    expect(pickPrize(prizes, false, () => 0.74)?.id).toBe('b')
  })

  it('respeita os intervalos do sorteio ponderado', () => {
    const prizes = [prize({ id: 'a', weight: 3 }), prize({ id: 'b', weight: 1 })]
    expect(pickPrize(prizes, true, () => 0.74)?.id).toBe('a')
    expect(pickPrize(prizes, true, () => 0.76)?.id).toBe('b')
  })

  it('devolve o único prêmio elegível', () => {
    expect(pickPrize([prize({ id: 'last' })], true, () => 0.99)?.id).toBe('last')
  })

  it('devolve null quando não há prêmio', () => {
    expect(pickPrize([], true, () => 0.5)).toBeNull()
  })
})

describe('sanitizeWeight', () => {
  it.each([0, -2, Number.NaN, Number.POSITIVE_INFINITY])('normaliza peso inválido %s', (value) => {
    expect(sanitizeWeight(value)).toBe(1)
  })
})

describe('getTargetRotation', () => {
  it('para o centro da fatia sorteada sob o ponteiro', () => {
    expect(getTargetRotation({ currentRotation: 0, prizeIndex: 1, prizeCount: 4, turns: 5 })).toBe(2025)
  })

  it('sempre avança várias voltas a partir da posição atual', () => {
    expect(getTargetRotation({ currentRotation: 2025, prizeIndex: 0, prizeCount: 4, turns: 5 })).toBe(3915)
  })
})
