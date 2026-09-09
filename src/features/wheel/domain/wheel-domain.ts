import type { Prize } from '../../../types/domain'

export function sanitizeWeight(weight: number): number {
  return Number.isFinite(weight) && weight > 0 ? weight : 1
}

export function getEligiblePrizes(prizes: Prize[], stockControlEnabled: boolean): Prize[] {
  return prizes.filter((prize) => prize.active && (!stockControlEnabled || prize.currentStock > 0))
}

export function pickPrize(
  prizes: Prize[],
  weighted: boolean,
  random: () => number = Math.random,
): Prize | null {
  if (prizes.length === 0) return null

  const weights = prizes.map((prize) => (weighted ? sanitizeWeight(prize.weight) : 1))
  const total = weights.reduce((sum, weight) => sum + weight, 0)
  const ticket = Math.min(Math.max(random(), 0), 0.999999999999) * total
  let cursor = 0

  for (let index = 0; index < prizes.length; index += 1) {
    cursor += weights[index]
    if (ticket < cursor) return prizes[index]
  }

  return prizes.at(-1) ?? null
}

function normalizeDegrees(value: number): number {
  return ((value % 360) + 360) % 360
}

export function getTargetRotation({
  currentRotation,
  prizeIndex,
  prizeCount,
  turns = 6,
}: {
  currentRotation: number
  prizeIndex: number
  prizeCount: number
  turns?: number
}): number {
  if (prizeCount <= 0 || prizeIndex < 0 || prizeIndex >= prizeCount) return currentRotation

  const slice = 360 / prizeCount
  const center = -90 + slice * prizeIndex + slice / 2
  const targetNormalized = normalizeDegrees(-90 - center)
  const currentNormalized = normalizeDegrees(currentRotation)
  const alignmentDelta = normalizeDegrees(targetNormalized - currentNormalized)

  return currentRotation + Math.max(1, turns) * 360 + alignmentDelta
}
