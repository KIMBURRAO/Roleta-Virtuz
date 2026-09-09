import { describe, expect, it } from 'vitest'
import { SpinLock } from './spin-lock'

describe('SpinLock', () => {
  it('recusa um segundo giro enquanto o primeiro está ativo', () => {
    const lock = new SpinLock()

    expect(lock.tryAcquire()).toBe(true)
    expect(lock.tryAcquire()).toBe(false)
    lock.release()
    expect(lock.tryAcquire()).toBe(true)
  })
})
