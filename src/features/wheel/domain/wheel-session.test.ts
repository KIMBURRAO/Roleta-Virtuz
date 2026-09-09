import { describe, expect, it } from 'vitest'
import { visiblePrizesForPhase } from './wheel-session'
import type { Prize } from '../../../types/domain'

const item = (id: string): Prize => ({ id, name: id, description: null, imageUrl: null, color: '#08C900', initialStock: 1, currentStock: 1, weight: 1, active: true, forcedAtSpin: null, forcedEverySpins: null, createdAt: '', updatedAt: '' })

describe('visiblePrizesForPhase', () => {
  it('congela as fatias do início até o resultado mesmo se o estoque atualizar', () => {
    const snapshot = [item('a'), item('b')]
    const updated = [item('a')]
    expect(visiblePrizesForPhase(updated, snapshot, 'spinning')).toEqual(snapshot)
    expect(visiblePrizesForPhase(updated, snapshot, 'result')).toEqual(snapshot)
  })

  it('usa a lista atualizada quando a roda volta ao repouso', () => {
    expect(visiblePrizesForPhase([item('a')], [item('a'), item('b')], 'idle')).toEqual([item('a')])
  })
})
