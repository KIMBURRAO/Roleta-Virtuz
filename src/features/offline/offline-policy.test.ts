import { describe, expect, it } from 'vitest'
import { canReservePrize } from './offline-policy'

describe('canReservePrize', () => {
  it('permite giro com conexão independentemente do controle de estoque', () => {
    expect(canReservePrize(true, true)).toBe(true)
    expect(canReservePrize(true, false)).toBe(true)
  })

  it('pausa o giro offline quando o estoque precisa de reserva atômica', () => {
    expect(canReservePrize(false, true)).toBe(false)
  })

  it('permite giro offline quando o estoque está desligado', () => {
    expect(canReservePrize(false, false)).toBe(true)
  })
})
