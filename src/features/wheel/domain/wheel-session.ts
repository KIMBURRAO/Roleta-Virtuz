import type { Prize } from '../../../types/domain'

export type SpinPhase = 'idle' | 'requesting' | 'spinning' | 'result' | 'error'

export function visiblePrizesForPhase(current: Prize[], snapshot: Prize[], phase: SpinPhase): Prize[] {
  return phase === 'idle' || phase === 'error' ? current : snapshot
}
