import { useCallback, useMemo, useRef, useState } from 'react'
import type { AppSettings, Prize, SpinResult } from '../../../types/domain'
import { enqueueOfflineSpin } from '../../../services/cache'
import { isSupabaseConfigured } from '../../../lib/supabase'
import { offlineSpinFromPrize, spinOnline } from '../../../services/api'
import { getEligiblePrizes, getTargetRotation, pickPrize } from '../domain/wheel-domain'
import { SpinLock } from '../domain/spin-lock'
import { canReservePrize } from '../../offline/offline-policy'
import { visiblePrizesForPhase, type SpinPhase } from '../domain/wheel-session'

export function useSpinController(prizes: Prize[], settings: AppSettings, online: boolean) {
  const eligible = useMemo(() => getEligiblePrizes(prizes, settings.stockControlEnabled), [prizes, settings.stockControlEnabled])
  const lock = useRef(new SpinLock())
  const [phase, setPhase] = useState<SpinPhase>('idle')
  const [rotation, setRotation] = useState(0)
  const [result, setResult] = useState<SpinResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [spinSnapshot, setSpinSnapshot] = useState<Prize[]>([])

  const start = useCallback(async () => {
    if (!lock.current.tryAcquire() || eligible.length === 0) return
    setError(null)
    setPhase('requesting')
    const snapshot = eligible
    setSpinSnapshot(snapshot)
    const clientSpinId = crypto.randomUUID()

    try {
      let nextResult: SpinResult
      if (online && isSupabaseConfigured) {
        nextResult = await spinOnline(clientSpinId)
      } else {
        if (!canReservePrize(online, settings.stockControlEnabled)) {
          throw new Error('Sem conexão, o sorteio fica pausado para proteger o estoque.')
        }
        const selected = pickPrize(eligible, settings.weightedDrawEnabled, () => crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32)
        if (!selected) throw new Error('Não há prêmios disponíveis para sortear.')
        const offline = offlineSpinFromPrize(selected, clientSpinId)
        await enqueueOfflineSpin(offline)
        nextResult = {
          spinId: clientSpinId,
          clientSpinId,
          prizeId: selected.id,
          prizeName: selected.name,
          prizeImageUrl: selected.imageUrl,
          prizeColor: selected.color,
          stockAfterSpin: selected.currentStock,
          createdAt: offline.createdAt,
          source: 'offline',
          syncStatus: 'pending',
        }
      }

      const index = snapshot.findIndex((prize) => prize.id === nextResult.prizeId)
      if (index < 0) throw new Error('A lista de prêmios mudou. Toque novamente para sortear.')
      setResult(nextResult)
      setPhase('spinning')
      setRotation((current) => getTargetRotation({ currentRotation: current, prizeIndex: index, prizeCount: snapshot.length, turns: 7 }))
      window.setTimeout(() => setPhase('result'), 5200)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível concluir o sorteio.')
      setPhase('error')
      lock.current.release()
    }
  }, [eligible, online, settings.stockControlEnabled, settings.weightedDrawEnabled])

  const reset = useCallback(() => {
    setResult(null)
    setError(null)
    setPhase('idle')
    setSpinSnapshot([])
    lock.current.release()
  }, [])

  const wheelPrizes = visiblePrizesForPhase(eligible, spinSnapshot, phase)
  return { eligible, wheelPrizes, phase, rotation, result, error, start, reset }
}
