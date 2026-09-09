import { useEffect } from 'react'
import { Gift, RotateCcw, WifiOff } from 'lucide-react'
import type { AppSettings, SpinResult } from '../../../types/domain'

function playWinSound() {
  const AudioContextClass = window.AudioContext
  if (!AudioContextClass) return
  const context = new AudioContextClass()
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(523, context.currentTime)
  oscillator.frequency.exponentialRampToValueAtTime(784, context.currentTime + .18)
  gain.gain.setValueAtTime(.06, context.currentTime)
  gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + .42)
  oscillator.connect(gain).connect(context.destination)
  oscillator.start()
  oscillator.stop(context.currentTime + .42)
}

export function ResultDialog({ result, settings, onReset }: { result: SpinResult; settings: AppSettings; onReset: () => void }) {
  useEffect(() => {
    if (settings.confettiEnabled) {
      void import('canvas-confetti').then(({ default: confetti }) => confetti({ particleCount: 110, spread: 85, origin: { y: .62 }, colors: [settings.primaryColor, '#FFFFFF', '#C9FF5B'] }))
    }
    if (settings.soundEnabled) playWinSound()
  }, [result.spinId, settings])

  return (
    <div className="result-backdrop" role="presentation">
      <section className="result-card" role="dialog" aria-modal="true" aria-labelledby="result-title">
        <div className="result-icon"><Gift /></div>
        <p className="result-kicker">Parabéns!</p>
        <h2 id="result-title">Você ganhou</h2>
        {result.prizeImageUrl && <img className="result-image" src={result.prizeImageUrl} alt="" />}
        <strong className="result-prize">{result.prizeName}</strong>
        {result.source === 'offline' && <p className="result-offline"><WifiOff size={16} /> Será sincronizado quando a internet voltar.</p>}
        <button type="button" className="primary-action" onClick={onReset}><RotateCcw size={20} /> Novo sorteio</button>
      </section>
    </div>
  )
}
